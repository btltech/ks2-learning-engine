import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';

// Debug tool: checks Firebase Auth state for a given email.
// Usage:
//   node scripts/auth-debug.mjs <email>
//   SERVICE_ACCOUNT_KEY=/abs/path/key.json node scripts/auth-debug.mjs <email>

const email = process.argv[2];
const wantsVerificationLink = process.argv.includes('--verification-link');

if (!email || email.startsWith('--')) {
  console.error('Usage:');
  console.error('  node scripts/auth-debug.mjs <email>');
  console.error('  node scripts/auth-debug.mjs <email> --verification-link');
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
  console.error('Or place one of these files in the repo root:');
  console.error('  - ks2-learning-engine-firebase-adminsdk-fbsvc-eaa288b64d.json');
  console.error('  - demiwuraks2-firebase-adminsdk.json');
  console.error('  - serviceAccountKey.json');
  console.error('  - firebase-admin-key.json');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const formatProvider = (p) => ({
  providerId: p.providerId,
  uid: p.uid,
  email: p.email,
  displayName: p.displayName,
});

try {
  const user = await admin.auth().getUserByEmail(email);
  const claims = user.customClaims || {};

  console.log('--- Firebase Auth User ---');
  console.log({
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    disabled: user.disabled,
    providerData: (user.providerData || []).map(formatProvider),
    metadata: {
      creationTime: user.metadata?.creationTime,
      lastSignInTime: user.metadata?.lastSignInTime,
      lastRefreshTime: user.metadata?.lastRefreshTime,
    },
    customClaims: claims,
  });

  // Helpful interpretation for invalid-credential
  if (user.disabled) {
    console.log('\nNote: user is DISABLED → sign-in will fail.');
  }

  const providers = new Set((user.providerData || []).map((p) => p.providerId));
  if (providers.size === 0) {
    console.log('\nNote: no providerData entries were found (unusual).');
  }

  if (!providers.has('password')) {
    console.log('\nNote: user does NOT have the email/password provider attached.');
    console.log('If you created the account with Google/Apple/etc, password login will fail with invalid-credential.');
  }

  console.log('\nDone.');

  if (wantsVerificationLink) {
    try {
      const link = await admin.auth().generateEmailVerificationLink(email);
      console.log('\n--- Email Verification Link (manual fallback) ---');
      console.log(link);
      console.log('\nIf verification emails are not arriving, this confirms the project can generate links.');
    } catch (e) {
      console.error('\nFailed to generate email verification link:', e?.message || e);
      console.error('This often indicates Firebase Auth action URL settings are misconfigured.');
      process.exitCode = 2;
    }
  }
} catch (err) {
  const message = err?.message || String(err);
  console.error('Lookup failed:', message);
  if (message.includes('auth/user-not-found')) {
    console.error('That email does not exist in this Firebase project.');
    console.error('Double-check: correct project, correct environment variables, and you are looking at prod vs dev consistently.');
  }
  process.exit(1);
}
