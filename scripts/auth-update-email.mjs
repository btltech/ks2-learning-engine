import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';

// Updates a Firebase Auth user's email, and (if present) syncs Firestore /users/{uid}.email.
// Usage:
//   node scripts/auth-update-email.mjs <oldEmail> <newEmail>
// Example:
//   node scripts/auth-update-email.mjs joanajo190@yahoo.com joanajo190@yahoo.co.uk

const oldEmail = process.argv[2];
const newEmail = process.argv[3];

if (!oldEmail || !newEmail) {
  console.error('Usage: node scripts/auth-update-email.mjs <oldEmail> <newEmail>');
  process.exit(1);
}

const keyPaths = [
  process.env.SERVICE_ACCOUNT_KEY,
  './ks2-learning-engine-firebase-adminsdk-fbsvc-eaa288b64d.json',
  './demiwuraks2-firebase-adminsdk.json',
  './serviceAccountKey.json',
  './firebase-admin-key.json',
].filter(Boolean);

const keyPath = keyPaths.find((p) => p && existsSync(p));
if (!keyPath) {
  console.error('No service account key found.');
  console.error('Set env SERVICE_ACCOUNT_KEY=/absolute/path/to/key.json');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

try {
  const user = await admin.auth().getUserByEmail(oldEmail);

  // Ensure the new email is not already taken.
  try {
    await admin.auth().getUserByEmail(newEmail);
    console.error(`Target email already exists in Auth: ${newEmail}`);
    process.exit(2);
  } catch (e) {
    const msg = e?.message || String(e);
    if (!msg.includes('no user record') && !msg.includes('auth/user-not-found')) {
      throw e;
    }
  }

  await admin.auth().updateUser(user.uid, {
    email: newEmail,
    // Force re-verification for the new address.
    emailVerified: false,
  });

  console.log('Auth email updated:', { uid: user.uid, from: oldEmail, to: newEmail, emailVerified: false });

  // Sync Firestore user profile (if it exists)
  const db = admin.firestore();
  const ref = db.collection('users').doc(user.uid);
  const snap = await ref.get();

  if (snap.exists) {
    await ref.set(
      {
        email: newEmail,
        emailVerified: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log('Firestore profile updated: users/' + user.uid);
  } else {
    console.warn('Firestore profile not found: users/' + user.uid);
  }

  // Provide a manual verification link as a fallback.
  const link = await admin.auth().generateEmailVerificationLink(newEmail);
  console.log('\nManual verification link (fallback):');
  console.log(link);
  console.log('\nDone. User should now log in with the NEW email.');
} catch (err) {
  console.error('Update failed:', err?.message || err);
  process.exit(1);
}
