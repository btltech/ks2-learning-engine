import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

try {
  const snapshot = await getDocs(collection(db, 'questions'));
  const total = snapshot.size;
  
  console.log('\n📊 CLOUD BANK STATISTICS\n');
  console.log(`Total questions saved: ${total}\n`);
  
  if (total > 0) {
    const bySubject = {};
    const byDifficulty = {};
    const byAge = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const subject = data.subject || 'Unknown';
      const difficulty = data.difficulty || 'Unknown';
      const age = data.age || 'Unknown';
      
      bySubject[subject] = (bySubject[subject] || 0) + 1;
      byDifficulty[difficulty] = (byDifficulty[difficulty] || 0) + 1;
      byAge[age] = (byAge[age] || 0) + 1;
    });
    
    console.log('By Subject:');
    Object.entries(bySubject).sort((a, b) => b[1] - a[1]).forEach(([subject, count]) => {
      console.log(`  ${subject}: ${count}`);
    });
    
    console.log('\nBy Difficulty:');
    Object.entries(byDifficulty).sort((a, b) => b[1] - a[1]).forEach(([difficulty, count]) => {
      console.log(`  ${difficulty}: ${count}`);
    });
    
    console.log('\nBy Age Group:');
    Object.entries(byAge).sort((a, b) => a - b).forEach(([age, count]) => {
      console.log(`  Age ${age}: ${count}`);
    });
  }
  
  process.exit(0);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
