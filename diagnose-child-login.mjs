import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync('./ks2-learning-engine-firebase-adminsdk-fbsvc-eaa288b64d.json', 'utf8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

console.log('\n🔍 CHILD LOGIN DIAGNOSTIC\n');
console.log('='.repeat(70));

const childId = 'child_882482e0-2c0f-41c5-b1f2-ec88b4af42f2'; // Abigail

const childDoc = await db.collection('users').doc(childId).get();

if (!childDoc.exists) {
  console.log('❌ Child profile not found!');
  process.exit(1);
}

const childData = childDoc.data();

console.log(`\n👶 Child Profile: ${childData.name}`);
console.log(`   ID: ${childId}`);
console.log(`\n📋 Required Fields for Login:`);
console.log(`   ✓ name: ${childData.name || 'MISSING'}`);
console.log(`   ✓ age: ${childData.age || 'MISSING'}`);
console.log(`   ✓ parentId: ${childData.parentId || 'MISSING'}`);
console.log(`   ✓ role: ${childData.role || 'MISSING'}`);

console.log(`\n🔐 Authentication Fields:`);
console.log(`   childLoginKeyHash: ${childData.childLoginKeyHash || 'MISSING (required for login)'}`);
console.log(`   childPinHash: ${childData.childPinHash || 'NOT SET (optional)'}`);
console.log(`   childCode: ${childData.childCode || 'MISSING'}`);

console.log(`\n📊 Profile Status:`);
console.log(`   Total Points: ${childData.totalPoints || 0}`);
console.log(`   Last Login: ${childData.lastLoginDate || 'Never'}`);
console.log(`   Created: ${childData.createdAt?.toDate?.() || 'Unknown'}`);

// Check parent
if (childData.parentId) {
  const parentDoc = await db.collection('users').doc(childData.parentId).get();
  if (parentDoc.exists) {
    const parentData = parentDoc.data();
    console.log(`\n👤 Parent Info:`);
    console.log(`   Name: ${parentData.name}`);
    console.log(`   Parent Code: ${parentData.parentCode || 'MISSING'}`);
    console.log(`   Email: ${parentData.email || 'N/A'}`);
  }
}

console.log(`\n${'='.repeat(70)}`);

// Diagnose the issue
if (!childData.childLoginKeyHash) {
  console.log(`\n❌ ISSUE FOUND: Missing childLoginKeyHash!`);
  console.log(`\nThis child was likely created through an old method that didn't`);
  console.log(`generate a login key. The child cannot log in without this hash.`);
  console.log(`\n🔧 SOLUTION: The child needs to be re-created through the parent`);
  console.log(`   code login flow, OR we can generate a login key for them.`);
  console.log(`\n📝 To fix: The parent should:`);
  console.log(`   1. Go to parent dashboard`);
  console.log(`   2. Delete this child profile (optional - to clean up)`);
  console.log(`   3. Have the child log in again using:`);
  console.log(`      - Parent Code: ${childData.parentId ? (await db.collection('users').doc(childData.parentId).get()).data()?.parentCode || 'UNKNOWN' : 'UNKNOWN'}`);
  console.log(`      - Name: ${childData.name}`);
  console.log(`      - Age: ${childData.age}`);
  console.log(`\n   OR run the fix script to generate a login key for this child.`);
} else {
  console.log(`\n✅ All required fields present. Child should be able to log in.`);
  console.log(`\nIf login still fails, check:`);
  console.log(`   - Parent code is correct`);
  console.log(`   - Name and age match exactly`);
  console.log(`   - PIN is correct (if set)`);
  console.log(`   - Network/Cloudflare issues`);
}

console.log('\n');
process.exit(0);
