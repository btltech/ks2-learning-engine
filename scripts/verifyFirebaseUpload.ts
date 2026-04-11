import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getCountFromServer, query, getDocs, limit } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Env
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function verify() {
  try {
    console.log('🔑 Signing in anonymously...');
    await signInAnonymously(auth);
    console.log('✅ Signed in!');

    const coll = collection(db, "questions");
    
    // Get count
    console.log('📊 Checking document count...');
    const snapshot = await getCountFromServer(coll);
    const count = snapshot.data().count;
    console.log(`✅ Total questions in Firestore: ${count}`);

    if (count > 0) {
        // Get a sample
        const q = query(coll, limit(1));
        const docs = await getDocs(q);
        docs.forEach(d => {
            console.log('📝 Sample Document ID:', d.id);
            console.log('   Data:', JSON.stringify(d.data(), null, 2));
        });
    } else {
        console.log('⚠️ No questions found in the database.');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
  process.exit(0);
}

verify();
