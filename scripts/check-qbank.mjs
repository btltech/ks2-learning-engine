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

const snap = await db.collection('questions').orderBy('createdAt', 'desc').limit(10).get();

if (snap.empty) {
  console.log('No documents found in collection: questions');
  process.exit(0);
}

console.log('Latest 10 QBank docs in Firestore collection: questions');
for (const d of snap.docs) {
  const x = d.data();
  const createdAt = x.createdAt?.toDate?.()?.toISOString?.() ?? x.createdAt ?? null;
  console.log(
    JSON.stringify(
      {
        id: d.id,
        subject: x.subject ?? null,
        topic: x.topic ?? null,
        age: x.age ?? null,
        difficulty: x.difficulty ?? null,
        createdAt,
        createdBy: x.createdBy ?? null,
      },
      null,
      2
    )
  );
}

