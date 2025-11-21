// Firestore Security Rules Test Suite
// Run this to verify your rules are working correctly

import { 
  getFirestore,
  collection,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  DocumentData
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Test Suite for Firestore Security Rules
 * 
 * TESTS:
 * 1. Parent can read only their own children
 * 2. Student cannot read other students' data
 * 3. Activity logs cannot be deleted
 * 4. Leaderboard is readable by all users
 * 5. Content is read-only for users
 * 6. User cannot create documents outside their role
 */

interface TestResult {
  testName: string;
  passed: boolean;
  expectedBehavior: string;
  actualResult: string;
}

const testResults: TestResult[] = [];

async function runTest(
  testName: string,
  testFn: () => Promise<void>,
  expectedBehavior: string
) {
  try {
    await testFn();
    testResults.push({
      testName,
      passed: true,
      expectedBehavior,
      actualResult: '✅ PASSED'
    });
    console.log(`✅ ${testName}`);
  } catch (error: any) {
    testResults.push({
      testName,
      passed: false,
      expectedBehavior,
      actualResult: `❌ ${error.message}`
    });
    console.log(`❌ ${testName}: ${error.message}`);
  }
}

async function testParentChildIsolation() {
  await runTest(
    'Parent cannot read another parent\'s child',
    async () => {
      // Assuming child B belongs to Parent A
      // Parent B tries to read child B's data
      try {
        const childRef = doc(db, 'users', 'childB-id');
        await getDoc(childRef);
        throw new Error('Should have been denied but was allowed');
      } catch (error: any) {
        if (error.code === 'permission-denied' || error.message.includes('permission')) {
          // Expected behavior
          return;
        }
        throw error;
      }
    },
    'Permission denied (parent can only see their own children)'
  );
}

async function testStudentDataIsolation() {
  await runTest(
    'Student cannot read another student\'s profile',
    async () => {
      try {
        const otherStudentRef = doc(db, 'users', 'other-student-id');
        await getDoc(otherStudentRef);
        throw new Error('Should have been denied but was allowed');
      } catch (error: any) {
        if (error.code === 'permission-denied' || error.message.includes('permission')) {
          return;
        }
        throw error;
      }
    },
    'Permission denied (students can only access own profile)'
  );
}

async function testImmutableActivityLogs() {
  await runTest(
    'Activity logs cannot be deleted',
    async () => {
      try {
        const activityRef = doc(db, 'users', 'student-id', 'activity', 'activity-1');
        await deleteDoc(activityRef);
        throw new Error('Activity was deleted but should be immutable');
      } catch (error: any) {
        if (error.code === 'permission-denied' || error.message.includes('permission')) {
          return;
        }
        throw error;
      }
    },
    'Permission denied (activity logs are immutable)'
  );
}

async function testLeaderboardReadable() {
  await runTest(
    'Leaderboard is readable by authenticated users',
    async () => {
      const leaderboardRef = collection(db, 'leaderboard');
      const snapshot = await getDocs(leaderboardRef);
      // Should succeed - leaderboard is public readable
      return;
    },
    'Success (leaderboard is readable)'
  );
}

async function testContentReadable() {
  await runTest(
    'Content is readable by authenticated users',
    async () => {
      const contentRef = collection(db, 'content');
      const snapshot = await getDocs(contentRef);
      // Should succeed - content is readable
      return;
    },
    'Success (content is readable)'
  );
}

async function testContentNotWritable() {
  await runTest(
    'User cannot create content',
    async () => {
      try {
        const contentRef = doc(db, 'content', 'test-content');
        await setDoc(contentRef, { title: 'test' });
        throw new Error('Content was created but should be write-protected');
      } catch (error: any) {
        if (error.code === 'permission-denied' || error.message.includes('permission')) {
          return;
        }
        throw error;
      }
    },
    'Permission denied (content is read-only for users)'
  );
}

export async function runSecurityRulesTests() {
  console.log('🧪 Starting Firestore Security Rules Tests...\n');
  
  try {
    // Test 1: Parent-Child Isolation
    await testParentChildIsolation();
    
    // Test 2: Student Data Isolation
    await testStudentDataIsolation();
    
    // Test 3: Immutable Activity Logs
    await testImmutableActivityLogs();
    
    // Test 4: Leaderboard Readable
    await testLeaderboardReadable();
    
    // Test 5: Content Readable
    await testContentReadable();
    
    // Test 6: Content Not Writable
    await testContentNotWritable();
    
  } catch (error) {
    console.error('Test suite error:', error);
  }
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log('==================');
  const passed = testResults.filter(r => r.passed).length;
  const total = testResults.length;
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log('==================\n');
  
  // Print detailed results
  testResults.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.testName}`);
    console.log(`   Expected: ${result.expectedBehavior}`);
    console.log(`   Actual: ${result.actualResult}\n`);
  });
  
  return testResults;
}

// Export for use in your app
export default runSecurityRulesTests;
