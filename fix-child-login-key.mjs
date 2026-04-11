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

console.log('\n🔧 GENERATING NEW LOGIN KEY FOR ABIGAIL\n');
console.log('='.repeat(70));

const parentId = 'J534xFFJLYS2FbBWeYyzWoYnlYl1';
const childId = 'child_882482e0-2c0f-41c5-b1f2-ec88b4af42f2';

// Get parent and child data
const parentDoc = await db.collection('users').doc(parentId).get();
const childDoc = await db.collection('users').doc(childId).get();

const parentData = parentDoc.data();
const childData = childDoc.data();

console.log(`\n👤 Parent: ${parentData.name}`);
console.log(`   Parent Code: ${parentData.parentCode}`);

console.log(`\n👶 Child: ${childData.name}`);
console.log(`   Age: ${childData.age}`);

// Generate new login key hash
const name = childData.name.trim();
const age = childData.age;
const parentCode = parentData.parentCode;

// Create the login key string: "parentCode:name:age"
const loginKeyString = `${parentCode}:${name}:${age}`;

console.log(`\n🔑 Login Key String: "${loginKeyString}"`);

// Hash it (SHA-256)
async function sha256Hex(input) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const newLoginKeyHash = await sha256Hex(loginKeyString);

console.log(`\n🔐 New Login Key Hash: ${newLoginKeyHash}`);
console.log(`   Old Login Key Hash: ${childData.childLoginKeyHash || 'MISSING'}`);

if (childData.childLoginKeyHash === newLoginKeyHash) {
  console.log(`\n✅ Hashes match! The child should be able to log in with:`);
} else {
  console.log(`\n⚠️  Hashes DON'T match! Updating child profile...`);
  await db.collection('users').doc(childId).update({
    childLoginKeyHash: newLoginKeyHash,
    updatedAt: new Date()
  });
  console.log(`✅ Updated! The child should now be able to log in with:`);
}

console.log(`\n📝 LOGIN CREDENTIALS:`);
console.log(`   Parent Code: ${parentCode}`);
console.log(`   Name: ${name}`);
console.log(`   Age: ${age}`);
console.log(`   PIN: ${childData.childPinHash ? 'SET (required)' : 'NOT SET (not required)'}`);

console.log(`\n${'='.repeat(70)}`);
console.log(`\n✅ Done! Try logging in with the credentials above.`);
console.log(`\n⚠️  IMPORTANT: Name must be EXACT (including spaces and capitalization):`);
console.log(`   Correct: "${name}"`);
console.log(`   Wrong: "${name.toLowerCase()}", "${name.toUpperCase()}", etc.`);
console.log('\n');

process.exit(0);
