import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';

// Searches Firebase Auth users by email substring.
// Usage:
//   node scripts/auth-search.mjs <query>
// Example:
//   node scripts/auth-search.mjs live.co.uk

const query = process.argv[2];
if (!query) {
  console.error('Usage: node scripts/auth-search.mjs <query>');
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
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const q = query.toLowerCase();
const matches = [];

let pageToken = undefined;
try {
  // Limit scanning to keep this fast/safe.
  for (let page = 0; page < 20; page++) {
    const res = await admin.auth().listUsers(1000, pageToken);
    for (const u of res.users) {
      const email = (u.email || '').toLowerCase();
      if (email && email.includes(q)) {
        matches.push({
          uid: u.uid,
          email: u.email,
          emailVerified: u.emailVerified,
          disabled: u.disabled,
          providers: (u.providerData || []).map((p) => p.providerId),
          creationTime: u.metadata?.creationTime,
          lastSignInTime: u.metadata?.lastSignInTime,
        });
      }
    }

    pageToken = res.pageToken;
    if (!pageToken) break;
  }

  if (matches.length === 0) {
    console.log('No users matched query:', query);
    process.exit(0);
  }

  console.log(`Found ${matches.length} matching user(s):`);
  for (const m of matches) {
    console.log(m);
  }
} catch (err) {
  console.error('Search failed:', err?.message || err);
  process.exit(1);
}
