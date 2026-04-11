import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';

// Admin-only tool: requires a Firebase service account key JSON.
// Place one of these files in the repo root (same as delete-user.mjs), or set SERVICE_ACCOUNT_KEY.
const keyPaths = [
  process.env.SERVICE_ACCOUNT_KEY,
  './demiwuraks2-firebase-adminsdk.json',
  './serviceAccountKey.json',
  './firebase-admin-key.json',
].filter(Boolean);

const keyPath = keyPaths.find((p) => p && existsSync(p));
if (!keyPath) {
  console.error('No service account key found. Download one from Firebase Console → Project Settings → Service Accounts.');
  console.error('Expected one of: demiwuraks2-firebase-adminsdk.json | serviceAccountKey.json | firebase-admin-key.json');
  console.error('Or set env SERVICE_ACCOUNT_KEY=/absolute/path/to/key.json');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const email = process.argv[2];
const rolesCsv = process.argv[3];

if (!email || !rolesCsv) {
  console.error('Usage: node set-user-roles.mjs <email> <rolesCsv>');
  console.error("Example: node set-user-roles.mjs info@btltech.co.uk 'admin,teacher'");
  process.exit(1);
}

const roles = rolesCsv
  .split(',')
  .map((r) => r.trim())
  .filter(Boolean);

const allowedRoles = new Set(['student', 'parent', 'teacher', 'admin']);
for (const r of roles) {
  if (!allowedRoles.has(r)) {
    console.error(`Invalid role: ${r}. Allowed: student,parent,teacher,admin`);
    process.exit(1);
  }
}

// Choose a primary role for legacy/UI routing.
const primaryRole = roles.includes('admin')
  ? 'admin'
  : roles.includes('teacher')
    ? 'teacher'
    : roles.includes('parent')
      ? 'parent'
      : 'student';

const claims = {
  admin: roles.includes('admin') || undefined,
  teacher: roles.includes('teacher') || undefined,
};

try {
  const user = await admin.auth().getUserByEmail(email);
  console.log(`Found user: ${user.uid} (${email})`);

  // 1) Set custom claims
  await admin.auth().setCustomUserClaims(user.uid, claims);
  console.log('Custom claims updated:', claims);

  // 2) Update Firestore profile (if it exists)
  const db = admin.firestore();
  const ref = db.collection('users').doc(user.uid);
  const snap = await ref.get();

  if (!snap.exists) {
    console.warn('Firestore user profile not found. (User may not have logged in yet.)');
    console.warn('Claims are set; once the user logs in and profile is created, you can re-run this script to sync roles.');
    process.exit(0);
  }

  await ref.set(
    {
      role: primaryRole,
      roles: Array.from(new Set(roles)),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log('Firestore roles updated:', { role: primaryRole, roles });
  console.log('Done. User must sign out/in to refresh token claims.');
} catch (err) {
  console.error('Error:', err?.message || err);
  process.exit(1);
}
