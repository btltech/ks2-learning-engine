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

console.log('\n🔍 COMPREHENSIVE BUG SCAN\n');
console.log('='.repeat(70));

const issues = [];
const warnings = [];

// Get all users
const usersSnapshot = await db.collection('users').get();
const allUsers = [];

usersSnapshot.forEach(doc => {
  allUsers.push({ id: doc.id, ...doc.data() });
});

console.log(`\n📊 Scanning ${allUsers.size} users...\n`);

// 1. Check for orphaned children (students without valid parent)
const parents = allUsers.filter(u => u.role === 'parent');
const students = allUsers.filter(u => u.role === 'student');
const parentIds = new Set(parents.map(p => p.id));

console.log('1️⃣  Checking for orphaned children...');
const orphanedChildren = students.filter(s => s.parentId && !parentIds.has(s.parentId));
if (orphanedChildren.length > 0) {
  issues.push(`❌ ${orphanedChildren.length} orphaned child(ren) found (parent doesn't exist)`);
  orphanedChildren.forEach(child => {
    console.log(`   ⚠️  ${child.name} (${child.id}) -> parent ${child.parentId} not found`);
  });
} else {
  console.log('   ✅ No orphaned children');
}

// 2. Check for children without parentId
console.log('\n2️⃣  Checking for children without parentId...');
const childrenWithoutParent = students.filter(s => !s.parentId);
if (childrenWithoutParent.length > 0) {
  warnings.push(`⚠️  ${childrenWithoutParent.length} child(ren) without parentId`);
  childrenWithoutParent.forEach(child => {
    console.log(`   ⚠️  ${child.name} (${child.id}) - no parentId set`);
  });
} else {
  console.log('   ✅ All children have parentId');
}

// 3. Check parent-child linking consistency
console.log('\n3️⃣  Checking parent-child linking consistency...');
for (const parent of parents) {
  const actualChildren = students.filter(s => s.parentId === parent.id);
  const subcollectionSnapshot = await db
    .collection('users')
    .doc(parent.id)
    .collection('children')
    .get();
  
  const subcollectionIds = new Set(subcollectionSnapshot.docs.map(d => d.id));
  const actualChildIds = actualChildren.map(c => c.id);
  const legacyChildIds = parent.childrenIds || [];
  
  // Check for mismatches
  const missingInSubcollection = actualChildIds.filter(id => !subcollectionIds.has(id));
  const orphanedInSubcollection = Array.from(subcollectionIds).filter(id => !actualChildIds.includes(id));
  const missingInLegacy = actualChildIds.filter(id => !legacyChildIds.includes(id));
  
  if (missingInSubcollection.length > 0) {
    issues.push(`❌ Parent "${parent.name}": ${missingInSubcollection.length} child(ren) missing from subcollection`);
    console.log(`   ❌ ${parent.name}: ${missingInSubcollection.length} child(ren) missing from subcollection`);
  }
  
  if (orphanedInSubcollection.length > 0) {
    warnings.push(`⚠️  Parent "${parent.name}": ${orphanedInSubcollection.length} orphaned subcollection doc(s)`);
    console.log(`   ⚠️  ${parent.name}: ${orphanedInSubcollection.length} orphaned subcollection doc(s)`);
  }
  
  if (missingInLegacy.length > 0) {
    warnings.push(`⚠️  Parent "${parent.name}": ${missingInLegacy.length} child(ren) missing from childrenIds array`);
    console.log(`   ⚠️  ${parent.name}: ${missingInLegacy.length} child(ren) missing from childrenIds array`);
  }
  
  // Check subcollection data consistency
  for (const doc of subcollectionSnapshot.docs) {
    const linkData = doc.data();
    const actualChild = actualChildren.find(c => c.id === doc.id);
    
    if (actualChild) {
      if (linkData.displayName !== actualChild.name) {
        warnings.push(`⚠️  Subcollection name mismatch: "${linkData.displayName}" vs "${actualChild.name}"`);
        console.log(`   ⚠️  ${parent.name}'s child: name mismatch in subcollection`);
        console.log(`      Subcollection: "${linkData.displayName}" | Actual: "${actualChild.name}"`);
      }
      if (linkData.age !== actualChild.age) {
        warnings.push(`⚠️  Subcollection age mismatch: ${linkData.age} vs ${actualChild.age}`);
        console.log(`   ⚠️  ${parent.name}'s child: age mismatch in subcollection`);
        console.log(`      Subcollection: ${linkData.age} | Actual: ${actualChild.age}`);
      }
    }
  }
}

if (issues.length === 0 && warnings.length === 0) {
  console.log('   ✅ All parent-child links are consistent');
}

// 4. Check for missing authentication fields
console.log('\n4️⃣  Checking authentication fields for children...');
const childrenMissingAuth = students.filter(s => s.parentId && !s.childLoginKeyHash);
if (childrenMissingAuth.length > 0) {
  issues.push(`❌ ${childrenMissingAuth.length} child(ren) missing login key hash`);
  childrenMissingAuth.forEach(child => {
    console.log(`   ❌ ${child.name} (${child.id}) - cannot log in without childLoginKeyHash`);
  });
} else {
  console.log('   ✅ All linked children have authentication fields');
}

// 5. Check for duplicate parent codes
console.log('\n5️⃣  Checking for duplicate parent codes...');
const parentCodes = parents.map(p => p.parentCode).filter(Boolean);
const duplicateCodes = parentCodes.filter((code, index) => parentCodes.indexOf(code) !== index);
if (duplicateCodes.length > 0) {
  issues.push(`❌ Duplicate parent codes found: ${duplicateCodes.join(', ')}`);
  console.log(`   ❌ Duplicate codes: ${duplicateCodes.join(', ')}`);
} else {
  console.log('   ✅ All parent codes are unique');
}

// 6. Check for missing required fields
console.log('\n6️⃣  Checking for missing required fields...');
allUsers.forEach(user => {
  const requiredFields = ['id', 'name', 'role'];
  const missingFields = requiredFields.filter(field => !user[field]);
  
  if (missingFields.length > 0) {
    issues.push(`❌ User ${user.id} missing fields: ${missingFields.join(', ')}`);
    console.log(`   ❌ ${user.name || 'Unnamed'} (${user.id}): missing ${missingFields.join(', ')}`);
  }
  
  // Check parent-specific fields
  if (user.role === 'parent' && !user.parentCode) {
    warnings.push(`⚠️  Parent "${user.name}" missing parentCode`);
    console.log(`   ⚠️  ${user.name}: missing parentCode`);
  }
});

if (issues.length === 0) {
  console.log('   ✅ All users have required fields');
}

// 7. Check for data type issues
console.log('\n7️⃣  Checking for data type issues...');
allUsers.forEach(user => {
  if (user.totalPoints !== undefined && typeof user.totalPoints !== 'number') {
    warnings.push(`⚠️  ${user.name}: totalPoints is not a number (${typeof user.totalPoints})`);
    console.log(`   ⚠️  ${user.name}: totalPoints should be number, got ${typeof user.totalPoints}`);
  }
  
  if (user.age !== undefined && typeof user.age !== 'number') {
    warnings.push(`⚠️  ${user.name}: age is not a number (${typeof user.age})`);
    console.log(`   ⚠️  ${user.name}: age should be number, got ${typeof user.age}`);
  }
  
  if (user.mastery !== undefined && typeof user.mastery !== 'object') {
    issues.push(`❌ ${user.name}: mastery should be object, got ${typeof user.mastery}`);
    console.log(`   ❌ ${user.name}: mastery should be object`);
  }
});

if (issues.length === 0 && warnings.length === 0) {
  console.log('   ✅ All data types are correct');
}

// 8. Check for role consistency
console.log('\n8️⃣  Checking role consistency...');
allUsers.forEach(user => {
  if (user.role && user.roles) {
    if (!user.roles.includes(user.role)) {
      issues.push(`❌ ${user.name}: role "${user.role}" not in roles array [${user.roles.join(', ')}]`);
      console.log(`   ❌ ${user.name}: role mismatch`);
    }
  } else if (user.role && !user.roles) {
    warnings.push(`⚠️  ${user.name}: has role but missing roles array (legacy format)`);
    console.log(`   ⚠️  ${user.name}: missing roles array (should be migrated)`);
  }
});

if (issues.length === 0 && warnings.length === 0) {
  console.log('   ✅ All roles are consistent');
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('\n📊 SCAN SUMMARY\n');
console.log(`Total Users: ${allUsers.length}`);
console.log(`  Parents: ${parents.length}`);
console.log(`  Students: ${students.length}`);
console.log(`  Others: ${allUsers.length - parents.length - students.length}`);

console.log(`\n❌ Critical Issues: ${issues.length}`);
if (issues.length > 0) {
  issues.forEach(issue => console.log(`   ${issue}`));
}

console.log(`\n⚠️  Warnings: ${warnings.length}`);
if (warnings.length > 0) {
  warnings.forEach(warning => console.log(`   ${warning}`));
}

if (issues.length === 0 && warnings.length === 0) {
  console.log('\n✅ No issues found! Database is in good shape.');
} else {
  console.log(`\n💡 Run "node fix-all-issues.mjs" to automatically fix these issues.`);
}

console.log('\n' + '='.repeat(70));
console.log('\n');

process.exit(0);
