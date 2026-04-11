
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Environment Variables
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
    const userCredential = await signInAnonymously(auth);
    console.log('User ID:', userCredential.user.uid);
    
    const docId = 'mat-alge-miri7i8z-3';
    const docRef = doc(db, 'questions', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log(`✅ Document ${docId} exists!`);
        console.log('Data:', JSON.stringify(docSnap.data(), null, 2));
    } else {
        console.log(`❌ Document ${docId} does not exist.`);
    }
    process.exit(0);
}

verify().catch(console.error);
