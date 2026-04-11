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

console.log('\n👪 PARENT-CHILD RELATIONSHIP DIAGNOSTICS\n');
console.log('='.repeat(70));

// Get all users
const usersSnapshot = await db.collection('users').get();
const allUsers = [];

usersSnapshot.forEach(doc => {
  allUsers.push({ id: doc.id, ...doc.data() });
});

// Find all parents
const parents = allUsers.filter(u => u.role === 'parent');

console.log(`\n📊 Found ${parents.length} parent(s) in the system\n`);

for (const parent of parents) {
  console.log('\n' + '-'.repeat(70));
  console.log(`👤 Parent: ${parent.name || 'Unnamed'} (ID: ${parent.id})`);
  console.log(`   Email: ${parent.email || 'N/A'}`);
  console.log(`   Parent Code: ${parent.parentCode || 'N/A'}`);
  
  // Check legacy childrenIds array
  const legacyChildrenIds = parent.childrenIds || [];
  console.log(`\n   📝 Legacy childrenIds array: ${legacyChildrenIds.length} child(ren)`);
  if (legacyChildrenIds.length > 0) {
    console.log(`      IDs: ${legacyChildrenIds.join(', ')}`);
  }
  
  // Check subcollection
  const childrenSubcollection = await db.collection('users').doc(parent.id).collection('children').get();
  console.log(`\n   📁 Subcollection /users/${parent.id}/children: ${childrenSubcollection.size} document(s)`);
  
  if (childrenSubcollection.size > 0) {
    childrenSubcollection.forEach(doc => {
      const data = doc.data();
      console.log(`      - Child ID: ${doc.id}`);
      console.log(`        Display Name: ${data.displayName || 'N/A'}`);
      console.log(`        Age: ${data.age || 'N/A'}`);
      console.log(`        Linked At: ${data.linkedAt?.toDate?.() || 'N/A'}`);
    });
  }
  
  // Find all children with this parentId
  const childrenByParentId = allUsers.filter(u => u.parentId === parent.id);
  console.log(`\n   👶 Children with parentId="${parent.id}": ${childrenByParentId.length} child(ren)`);
  
  if (childrenByParentId.length > 0) {
    childrenByParentId.forEach((child, idx) => {
      console.log(`      ${idx + 1}. ${child.name || 'Unnamed'} (ID: ${child.id})`);
      console.log(`         Role: ${child.role || 'N/A'}`);
      console.log(`         Age: ${child.age || 'N/A'}`);
      console.log(`         Created: ${child.createdAt?.toDate?.() || 'N/A'}`);
      console.log(`         Total Points: ${child.totalPoints || 0}`);
    });
  }
  
  // Show discrepancies
  const subcollectionIds = childrenSubcollection.docs.map(d => d.id);
  const actualChildIds = childrenByParentId.map(c => c.id);
  
  console.log(`\n   🔍 DIAGNOSTIC:`);
  console.log(`      - Legacy array IDs: ${legacyChildrenIds.length}`);
  console.log(`      - Subcollection docs: ${subcollectionIds.length}`);
  console.log(`      - Actual children (by parentId): ${actualChildIds.length}`);
  
  // Check for missing subcollection links
  const missingInSubcollection = actualChildIds.filter(id => !subcollectionIds.includes(id));
  if (missingInSubcollection.length > 0) {
    console.log(`\n   ⚠️  WARNING: ${missingInSubcollection.length} child(ren) missing from subcollection:`);
    missingInSubcollection.forEach(id => {
      const child = childrenByParentId.find(c => c.id === id);
      console.log(`      - ${child?.name || 'Unnamed'} (${id})`);
    });
  }
  
  // Check for orphaned subcollection docs
  const orphanedSubcollectionDocs = subcollectionIds.filter(id => !actualChildIds.includes(id));
  if (orphanedSubcollectionDocs.length > 0) {
    console.log(`\n   ⚠️  WARNING: ${orphanedSubcollectionDocs.length} orphaned subcollection doc(s):`);
    orphanedSubcollectionDocs.forEach(id => {
      console.log(`      - ${id} (child profile may have been deleted)`);
    });
  }
}

// Check for children without parents
const orphanedChildren = allUsers.filter(u => 
  (u.role === 'student' || u.role === 'child') && 
  u.parentId && 
  !parents.some(p => p.id === u.parentId)
);

if (orphanedChildren.length > 0) {
  console.log('\n' + '='.repeat(70));
  console.log(`\n⚠️  Found ${orphanedChildren.length} orphaned child(ren) (parentId points to non-existent parent):\n`);
  orphanedChildren.forEach(child => {
    console.log(`   - ${child.name || 'Unnamed'} (${child.id})`);
    console.log(`     Parent ID: ${child.parentId} (NOT FOUND)`);
  });
}

console.log('\n' + '='.repeat(70));
console.log('\n✅ Diagnostic complete!\n');
process.exit(0);
