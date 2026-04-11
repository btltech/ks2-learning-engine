import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAKrLd63tlbpP94oFbc7DlPlZROmlaOe9Y",
  authDomain: "ks2-learning-engine.firebaseapp.com",
  projectId: "ks2-learning-engine",
  storageBucket: "ks2-learning-engine.firebasestorage.app",
  messagingSenderId: "777042053992",
  appId: "1:777042053992:web:0569209d972ad40139a4dd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userId = '8yQXvOBQWMP64u9y5XKIXoq9IJc2';
const profile = {
  id: userId,
  name: 'Teacher',
  email: 'info@btltech.co.uk',
  role: 'teacher',
  age: 30,
  avatarConfig: { color: '#10B981' },
  totalPoints: 0,
  unlockedItems: [],
  badges: [],
  streak: 0,
  lastLoginDate: new Date().toISOString(),
  mastery: {},
  timeSpentLearning: {},
  quizHistory: [],
  preferredDifficulty: 'medium',
  childCode: 'TEACH1',
  emailVerified: true,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

try {
  await setDoc(doc(db, 'users', userId), profile);
  console.log('✅ Profile created for info@btltech.co.uk as TEACHER');
  process.exit(0);
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
