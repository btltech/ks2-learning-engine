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

console.log('\n🔧 PARENT-CHILD SYNC REPAIR SCRIPT\n');
console.log('='.repeat(70));

// Get all users
const usersSnapshot = await db.collection('users').get();
const allUsers = [];

usersSnapshot.forEach(doc => {
  allUsers.push({ id: doc.id, ...doc.data() });
});

// Find all parents
const parents = allUsers.filter(u => u.role === 'parent');

console.log(`\n📊 Processing ${parents.length} parent(s)...\n`);

for (const parent of parents) {
  console.log(`\n👤 Parent: ${parent.name} (${parent.id})`);
  
  // Find all children with this parentId
  const children = allUsers.filter(u => u.parentId === parent.id);
  
  console.log(`   Found ${children.length} child(ren) in database`);
  
  if (children.length === 0) {
    console.log('   ✓ No children to sync');
    continue;
  }
  
  // Get current subcollection
  const subcollectionSnapshot = await db
    .collection('users')
    .doc(parent.id)
    .collection('children')
    .get();
  
  const existingSubcollectionIds = subcollectionSnapshot.docs.map(d => d.id);
  
  console.log(`   Current subcollection has ${existingSubcollectionIds.length} doc(s)`);
  
  // Sync each child to subcollection
  for (const child of children) {
    const childLinkRef = db
      .collection('users')
      .doc(parent.id)
      .collection('children')
      .doc(child.id);
    
    const childLinkData = {
      childId: child.id,
      displayName: child.name || 'Child',
      age: child.age || 9,
      linkedAt: child.createdAt || new Date(),
      lastActiveAt: child.lastLoginDate ? new Date(child.lastLoginDate) : new Date(),
      updatedAt: new Date(),
    };
    
    // Check if link already exists
    const existingLink = await childLinkRef.get();
    
    if (existingLink.exists) {
      const existingData = existingLink.data();
      // Check if data needs updating
      if (existingData.displayName !== child.name || existingData.age !== child.age) {
        console.log(`   🔄 Updating subcollection link for ${child.name} (${child.id})`);
        console.log(`      Old: name="${existingData.displayName}", age=${existingData.age}`);
        console.log(`      New: name="${child.name}", age=${child.age}`);
        await childLinkRef.update(childLinkData);
        console.log(`   ✅ Updated`);
      } else {
        console.log(`   ✓ ${child.name} already synced correctly`);
      }
    } else {
      console.log(`   ➕ Creating missing subcollection link for ${child.name} (${child.id})`);
      await childLinkRef.set(childLinkData);
      console.log(`   ✅ Created`);
    }
  }
  
  // Update parent's childrenIds array (legacy support)
  const childIds = children.map(c => c.id);
  const currentChildrenIds = parent.childrenIds || [];
  
  if (JSON.stringify(currentChildrenIds.sort()) !== JSON.stringify(childIds.sort())) {
    console.log(`   🔄 Updating parent's childrenIds array`);
    console.log(`      Old: [${currentChildrenIds.join(', ')}]`);
    console.log(`      New: [${childIds.join(', ')}]`);
    await db.collection('users').doc(parent.id).update({
      childrenIds: childIds,
      updatedAt: new Date(),
    });
    console.log(`   ✅ Updated`);
  } else {
    console.log(`   ✓ childrenIds array already correct`);
  }
  
  // Remove orphaned subcollection docs
  for (const subcollectionDoc of subcollectionSnapshot.docs) {
    if (!childIds.includes(subcollectionDoc.id)) {
      console.log(`   🗑️  Removing orphaned subcollection doc: ${subcollectionDoc.id}`);
      await subcollectionDoc.ref.delete();
      console.log(`   ✅ Removed`);
    }
  }
}

console.log('\n' + '='.repeat(70));
console.log('\n✅ Sync complete! All parent-child relationships are now consistent.\n');

// Re-run diagnostic
console.log('Running diagnostic to verify fixes...\n');

for (const parent of parents) {
  const children = allUsers.filter(u => u.parentId === parent.id);
  const subcollectionSnapshot = await db
    .collection('users')
    .doc(parent.id)
    .collection('children')
    .get();
  
  console.log(`👤 ${parent.name}: ${children.length} child(ren), ${subcollectionSnapshot.size} subcollection doc(s)`);
  children.forEach(child => {
    console.log(`   - ${child.name} (${child.id})`);
  });
}

console.log('\n');
process.exit(0);
