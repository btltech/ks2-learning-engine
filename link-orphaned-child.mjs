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

console.log('\n🔧 LINKING ORPHANED CHILD TO PARENT\n');
console.log('='.repeat(70));

const parentId = 'J534xFFJLYS2FbBWeYyzWoYnlYl1'; // bolaji
const childId = 'child_882482e0-2c0f-41c5-b1f2-ec88b4af42f2'; // Abigail bolaji

console.log(`\n👤 Parent: bolaji (${parentId})`);
console.log(`👶 Child: Abigail bolaji (${childId})`);

// Get child data
const childDoc = await db.collection('users').doc(childId).get();
const childData = childDoc.data();

console.log(`\n📋 Child current data:`);
console.log(`   Name: ${childData.name}`);
console.log(`   Age: ${childData.age}`);
console.log(`   Points: ${childData.totalPoints}`);
console.log(`   Parent ID: ${childData.parentId || 'MISSING'}`);

// Update child to add parentId
console.log(`\n🔄 Adding parentId to child profile...`);
await db.collection('users').doc(childId).update({
  parentId: parentId,
  updatedAt: new Date()
});
console.log(`✅ Child profile updated`);

// Create subcollection link
console.log(`\n🔄 Creating subcollection link...`);
const childLinkRef = db
  .collection('users')
  .doc(parentId)
  .collection('children')
  .doc(childId);

await childLinkRef.set({
  childId: childId,
  displayName: childData.name || 'Abigail',
  age: childData.age || 8,
  linkedAt: childData.createdAt || new Date(),
  lastActiveAt: childData.lastLoginDate ? new Date(childData.lastLoginDate) : new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
});
console.log(`✅ Subcollection link created`);

// Update parent's childrenIds array
console.log(`\n🔄 Updating parent's childrenIds array...`);
const parentDoc = await db.collection('users').doc(parentId).get();
const parentData = parentDoc.data();
const currentChildrenIds = parentData.childrenIds || [];
const updatedChildrenIds = [...new Set([...currentChildrenIds, childId])]; // Remove duplicates

await db.collection('users').doc(parentId).update({
  childrenIds: updatedChildrenIds,
  updatedAt: new Date()
});
console.log(`✅ Parent profile updated`);
console.log(`   Old childrenIds: [${currentChildrenIds.join(', ')}]`);
console.log(`   New childrenIds: [${updatedChildrenIds.join(', ')}]`);

// Verify the fix
console.log(`\n${'='.repeat(70)}`);
console.log(`\n✅ Fix complete! Verifying...\n`);

const verifyChildDoc = await db.collection('users').doc(childId).get();
const verifyChildData = verifyChildDoc.data();

const verifySubcollection = await db
  .collection('users')
  .doc(parentId)
  .collection('children')
  .get();

const verifyParentDoc = await db.collection('users').doc(parentId).get();
const verifyParentData = verifyParentDoc.data();

console.log(`👶 Child profile:`);
console.log(`   Name: ${verifyChildData.name}`);
console.log(`   Parent ID: ${verifyChildData.parentId}`);

console.log(`\n👤 Parent profile:`);
console.log(`   childrenIds: [${(verifyParentData.childrenIds || []).join(', ')}]`);

console.log(`\n📁 Subcollection:`);
console.log(`   Total documents: ${verifySubcollection.size}`);
verifySubcollection.forEach(doc => {
  const data = doc.data();
  console.log(`   - ${data.displayName} (${doc.id})`);
});

console.log(`\n${'='.repeat(70)}`);
console.log(`\n✅ DONE! You should now see both children in the app.\n`);
console.log(`🔄 Please refresh your app to see the changes.\n`);

process.exit(0);
