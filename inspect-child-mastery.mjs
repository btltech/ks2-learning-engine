import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const childId = process.argv[2];
if (!childId) {
  console.error('Usage: node inspect-child-mastery.mjs <childId>');
  process.exit(1);
}

const serviceAccount = JSON.parse(
  readFileSync('./ks2-learning-engine-firebase-adminsdk-fbsvc-eaa288b64d.json', 'utf8')
);

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();
const snap = await db.collection('users').doc(childId).get();

if (!snap.exists) {
  console.error('No such user:', childId);
  process.exit(2);
}

const data = snap.data() || {};
const mastery = data.mastery || {};

console.log('Child:', data.name, '| id:', childId);
console.log('role:', data.role);
console.log('mastery keys:', Object.keys(mastery).length);

for (const [subject, value] of Object.entries(mastery)) {
  const type = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  const keys = value && typeof value === 'object' ? Object.keys(value).length : 0;
  const sample = value && typeof value === 'object'
    ? Object.entries(value).slice(0, 3)
    : [];

  console.log(`- ${subject}: type=${type} keys=${keys} sample=${JSON.stringify(sample)}`);
}
