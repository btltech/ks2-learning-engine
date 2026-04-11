import admin from 'firebase-admin';
import fs from 'node:fs';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  || './ks2-learning-engine-firebase-adminsdk-fbsvc-eaa288b64d.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Service account JSON not found at: ${serviceAccountPath}`);
  console.error('Set FIREBASE_SERVICE_ACCOUNT_JSON to the correct path and try again.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const DRY_RUN = (process.env.DRY_RUN || '').toLowerCase() === 'true';
const BATCH_SIZE = Number.parseInt(process.env.BATCH_SIZE || '400', 10);

if (!Number.isFinite(BATCH_SIZE) || BATCH_SIZE <= 0 || BATCH_SIZE > 450) {
  console.error('BATCH_SIZE must be between 1 and 450.');
  process.exit(1);
}

let deleted = 0;

while (true) {
  const snap = await db.collection('leaderboard').limit(BATCH_SIZE).get();
  if (snap.empty) break;

  if (DRY_RUN) {
    deleted += snap.size;
    console.log(`[DRY_RUN] Would delete ${snap.size} docs... (running total ${deleted})`);
    break;
  }

  const batch = db.batch();
  for (const doc of snap.docs) batch.delete(doc.ref);
  await batch.commit();

  deleted += snap.size;
  console.log(`Deleted ${snap.size} docs... (running total ${deleted})`);
}

console.log(DRY_RUN ? `Dry run complete. Would delete ${deleted} docs.` : `Done. Deleted ${deleted} leaderboard docs.`);

