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

console.log('\n🔍 COMPLETE USER DATABASE DUMP\n');
console.log('='.repeat(70));

// Get all users
const usersSnapshot = await db.collection('users').get();

console.log(`\n📊 Total users in database: ${usersSnapshot.size}\n`);

const usersByRole = {
  parent: [],
  student: [],
  teacher: [],
  admin: [],
  other: []
};

usersSnapshot.forEach(doc => {
  const data = doc.data();
  const role = data.role || 'other';
  const category = ['parent', 'student', 'teacher', 'admin'].includes(role) ? role : 'other';
  
  usersByRole[category].push({
    id: doc.id,
    name: data.name,
    email: data.email,
    role: data.role,
    parentId: data.parentId,
    parentCode: data.parentCode,
    age: data.age,
    totalPoints: data.totalPoints,
    createdAt: data.createdAt?.toDate?.(),
    lastLoginDate: data.lastLoginDate
  });
});

// Display by role
for (const [role, users] of Object.entries(usersByRole)) {
  if (users.length === 0) continue;
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📁 ${role.toUpperCase()} (${users.length})`);
  console.log('='.repeat(70));
  
  users.forEach((user, idx) => {
    console.log(`\n${idx + 1}. ${user.name || 'Unnamed'}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email || 'N/A'}`);
    console.log(`   Role: ${user.role || 'N/A'}`);
    if (user.age) console.log(`   Age: ${user.age}`);
    if (user.parentId) console.log(`   Parent ID: ${user.parentId}`);
    if (user.parentCode) console.log(`   Parent Code: ${user.parentCode}`);
    if (user.totalPoints !== undefined) console.log(`   Total Points: ${user.totalPoints}`);
    console.log(`   Created: ${user.createdAt || 'N/A'}`);
    console.log(`   Last Login: ${user.lastLoginDate || 'N/A'}`);
  });
}

// Show parent-child relationships
console.log(`\n${'='.repeat(70)}`);
console.log('👪 PARENT-CHILD RELATIONSHIPS');
console.log('='.repeat(70));

for (const parent of usersByRole.parent) {
  const children = usersByRole.student.filter(s => s.parentId === parent.id);
  
  console.log(`\n👤 ${parent.name} (${parent.email})`);
  console.log(`   Parent Code: ${parent.parentCode}`);
  console.log(`   Children: ${children.length}`);
  
  if (children.length > 0) {
    children.forEach((child, idx) => {
      console.log(`      ${idx + 1}. ${child.name} (age ${child.age}, ${child.totalPoints} points)`);
    });
  } else {
    console.log(`      (no children linked)`);
  }
}

console.log('\n' + '='.repeat(70));
console.log('\n');
process.exit(0);
