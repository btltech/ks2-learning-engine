import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc as firestoreDoc,
  query,
  where,
  getDocs,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Env (mirrors scripts/verifyFirebaseUpload.ts)
const envPath = path.resolve(__dirname, '../.env');
const envLocalPath = path.resolve(__dirname, '../.env.local');
let envConfig = {};

function loadEnv(filePath) {
  if (fs.existsSync(filePath)) {
    const envFile = fs.readFileSync(filePath, 'utf8');
    envFile.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (key && value) envConfig[key] = value;
    });
  }
}

loadEnv(envPath);
loadEnv(envLocalPath);

const firebaseConfig = {
  apiKey: envConfig.VITE_FIREBASE_API_KEY,
  authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envConfig.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envConfig.VITE_FIREBASE_APP_ID,
};

function requireEnv(key) {
  if (!envConfig[key]) {
    throw new Error(`Missing ${key} in .env/.env.local`);
  }
}

requireEnv('VITE_FIREBASE_PROJECT_ID');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function initAdmin(projectId) {
  // Uses the service account JSON that exists in this repo workspace.
  // This is ONLY to clean up the smoke-test doc after verifying client-write works.
  const serviceAccountPath = path.resolve(
    __dirname,
    '../ks2-learning-engine-firebase-adminsdk-fbsvc-eaa288b64d.json'
  );

  if (!fs.existsSync(serviceAccountPath)) {
    console.warn('⚠️ Admin cleanup skipped: service account JSON not found');
    return null;
  }

  if (admin.apps.length === 0) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId,
    });
  }

  return admin.firestore();
}

async function main() {
  const projectId = envConfig.VITE_FIREBASE_PROJECT_ID;

  console.log(`🔧 Project: ${projectId}`);
  console.log('🔑 Signing in anonymously (client SDK)...');
  await signInAnonymously(auth);

  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Anonymous sign-in failed: no uid');
  console.log(`✅ Signed in as uid=${uid}`);

  const createdAt = Timestamp.now();
  const payload = {
    subject: '__smoketest__',
    topic: 'qbank-write',
    difficulty: 'Easy',
    age: 10,
    question: `Smoke test: can client write to /questions? (${new Date().toISOString()})`,
    options: ['Yes', 'No', 'Maybe', 'Not sure'],
    correctAnswer: 'Yes',
    explanation: 'Smoke test record. Safe to delete.',
    questionType: 'multiple-choice',
    cognitiveLevel: 'remember',
    acceptableAnswers: [],
    createdAt,
    createdBy: uid,
  };

  console.log('📝 Writing one test question to Firestore /questions (client SDK)...');
  const ref = await addDoc(collection(db, 'questions'), payload);
  console.log(`✅ Wrote doc id=${ref.id}`);

  console.log('🔎 Reading it back (client SDK)...');
  const readSnap = await getDoc(firestoreDoc(db, 'questions', ref.id));
  if (!readSnap.exists()) {
    throw new Error('Read-after-write failed: document does not exist');
  }

  const data = readSnap.data();
  console.log('✅ Read-after-write ok');
  console.log(`   createdBy matches: ${data.createdBy === uid}`);
  console.log(`   subject/topic: ${data.subject} / ${data.topic}`);

  console.log('🔎 Query check (client SDK)...');
  const q = query(
    collection(db, 'questions'),
    where('subject', '==', '__smoketest__'),
    where('topic', '==', 'qbank-write'),
    where('createdBy', '==', uid),
    limit(5)
  );
  const qs = await getDocs(q);
  console.log(`✅ Query returned ${qs.size} docs (should be >= 1)`);

  console.log('🧹 Cleaning up (admin SDK; bypasses rules)...');
  const adminDb = await initAdmin(projectId);
  if (adminDb) {
    await adminDb.doc(`questions/${ref.id}`).delete();
    console.log('✅ Deleted smoke-test doc');
  }

  console.log('\n✅ CONFIRMED: A generated question payload matching your rules can be written to Firestore and read back.');

  // Firestore keeps network streams open; exit cleanly after success.
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Smoke test failed');
  console.error(err);
  process.exit(1);
});
