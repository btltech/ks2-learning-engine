import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';

// Find service account key
const keyPaths = [
  './demiwuraks2-firebase-adminsdk.json',
  './serviceAccountKey.json',
  './firebase-admin-key.json'
];

let keyPath = keyPaths.find(p => existsSync(p));
if (!keyPath) {
  console.error('No service account key found. Please download from Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = process.argv[2] || 'info@btltech.co.uk';

try {
  const user = await admin.auth().getUserByEmail(email);
  console.log(`Found user: ${user.uid}`);
  await admin.auth().deleteUser(user.uid);
  console.log(`Deleted user: ${email}`);
  
  // Also delete Firestore profile if exists
  const db = admin.firestore();
  await db.collection('users').doc(user.uid).delete();
  console.log(`Deleted Firestore profile`);
} catch (err) {
  console.error('Error:', err.message);
}

process.exit(0);
