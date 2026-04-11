
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { allGeneratedQuestions } from '../data/questions/generated';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load Environment Variables manually (since we are in a script)
const envPath = path.resolve(__dirname, '../.env');
const envLocalPath = path.resolve(__dirname, '../.env.local');
let envConfig: any = {};

const loadEnv = (filePath: string) => {
  if (fs.existsSync(filePath)) {
    const envFile = fs.readFileSync(filePath, 'utf8');
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envConfig[key.trim()] = value.trim();
      }
    });
  }
};

loadEnv(envPath);
loadEnv(envLocalPath);

const firebaseConfig = {
  apiKey: envConfig.VITE_FIREBASE_API_KEY,
  authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envConfig.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envConfig.VITE_FIREBASE_APP_ID
};

if (!firebaseConfig.apiKey) {
  console.error('❌ Could not find Firebase config in .env file.');
  process.exit(1);
}

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function uploadQuestions() {
  console.log('🔑 Signing in anonymously...');
  await signInAnonymously(auth);
  console.log('✅ Signed in!');

  console.log(`🚀 Starting upload of ${allGeneratedQuestions.length} questions to Firebase...`);
  
  const batchSize = 400; // Firestore batch limit is 500
  let batch = writeBatch(db);
  let count = 0;
  let totalUploaded = 0;
  let skipped = 0;

  for (const question of allGeneratedQuestions) {
    const questionRef = doc(db, "questions", question.id);
    
    // Optional: Check if exists to avoid overwrites (slower)
    // For speed, we'll use setDoc with merge: true
    
    // Sanitize data to remove undefined values and nested arrays
    const sanitizedQuestion = JSON.parse(JSON.stringify(question));
    
    // Firestore doesn't support nested arrays. Check for any and flatten or remove.
    // Specifically looking for 'options' or 'ncObjectives' which might be nested if data is bad.
    
    // Fix nested arrays in options (e.g. [["1","9"], ["3","7"]] -> ["1, 9", "3, 7"])
    if (Array.isArray(sanitizedQuestion.options)) {
        sanitizedQuestion.options = sanitizedQuestion.options.map((opt: any) => 
            Array.isArray(opt) ? opt.join(', ') : opt
        );
    }

    // Fix correctAnswer if it's an array (e.g. ["4","6"] -> "4, 6")
    if (Array.isArray(sanitizedQuestion.correctAnswer)) {
        sanitizedQuestion.correctAnswer = sanitizedQuestion.correctAnswer.join(', ');
    }

    if (Array.isArray(sanitizedQuestion.ncObjectives)) {
        sanitizedQuestion.ncObjectives = sanitizedQuestion.ncObjectives.flat();
    }
    if (Array.isArray(sanitizedQuestion.ageGroup)) {
        sanitizedQuestion.ageGroup = sanitizedQuestion.ageGroup.flat();
    }

    batch.set(questionRef, {
      ...sanitizedQuestion,
      uploadedAt: new Date().toISOString(),
      source: 'generated-script'
    }, { merge: true });

    count++;

    if (count >= batchSize) {
      await batch.commit();
      totalUploaded += count;
      console.log(`   ✅ Committed batch of ${count} questions (Total: ${totalUploaded})`);
      batch = writeBatch(db);
      count = 0;
      // Small delay to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  if (count > 0) {
    await batch.commit();
    totalUploaded += count;
    console.log(`   ✅ Committed final batch of ${count} questions`);
  }

  console.log(`\n🎉 Upload Complete!`);
  console.log(`Total Questions Processed: ${totalUploaded}`);
}

uploadQuestions().catch(console.error);
