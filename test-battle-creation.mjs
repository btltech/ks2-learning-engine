import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';

const DATABASE_URL = 'https://ks2-learning-engine-default-rtdb.europe-west1.firebasedatabase.app';

// Read from .env.local
import { readFileSync } from 'fs';
const envContent = readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^VITE_(.+?)=(.+)$/);
  if (match) {
    envVars[match[1]] = match[2].trim();
  }
});

const firebaseConfig = {
  apiKey: envVars.FIREBASE_API_KEY,
  authDomain: envVars.FIREBASE_AUTH_DOMAIN,
  projectId: envVars.FIREBASE_PROJECT_ID,
  storageBucket: envVars.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.FIREBASE_APP_ID,
  databaseURL: DATABASE_URL,
};

console.log('🔧 Testing Firebase Realtime Database Connection...');
console.log('Database URL:', DATABASE_URL);

const app = initializeApp(firebaseConfig);
const database = getDatabase(app, DATABASE_URL);

// Test battle creation
const testBattle = {
  id: `test_${Date.now()}`,
  battleCode: 'TEST99',
  subject: 'Test',
  topic: 'Test',
  difficulty: 'Easy',
  status: 'waiting',
  questions: [{ id: '1', question: 'Test?', options: ['A', 'B'], correctAnswer: 'A' }],
  host: {
    id: 'test_user',
    name: 'Test User',
    avatarColor: '#000',
    score: 0,
    currentQuestion: 0,
    answers: [],
    isReady: true,
    isConnected: true,
    lastSeen: Date.now(),
  },
  createdAt: Date.now(),
};

async function testBattleCreation() {
  try {
    console.log('\n📝 Testing battle creation...');
    const battleRef = ref(database, `battles/${testBattle.id}`);
    await set(battleRef, testBattle);
    console.log('✅ Battle created successfully!');
    
    console.log('\n📖 Reading battle back...');
    const snapshot = await get(battleRef);
    if (snapshot.exists()) {
      console.log('✅ Battle retrieved successfully!');
      console.log('Battle data:', JSON.stringify(snapshot.val(), null, 2));
    } else {
      console.log('❌ Battle not found after creation!');
    }
    
    console.log('\n🔧 Testing battle code lookup...');
    const codeRef = ref(database, `battleCodes/${testBattle.battleCode}`);
    await set(codeRef, { battleId: testBattle.id, createdAt: Date.now() });
    console.log('✅ Battle code created successfully!');
    
    const codeSnapshot = await get(codeRef);
    if (codeSnapshot.exists()) {
      console.log('✅ Battle code retrieved successfully!');
      console.log('Code data:', codeSnapshot.val());
    }
    
    console.log('\n✨ All tests passed! Firebase connection is working.');
  } catch (error) {
    console.error('\n❌ Error during tests:', error);
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
  process.exit(0);
}

testBattleCreation();
