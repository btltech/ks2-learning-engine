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

// Get all users
const usersSnapshot = await db.collection('users').get();

console.log('\n📊 CHILD SUBJECT PROGRESS REPORT\n');
console.log('='.repeat(60));

for (const doc of usersSnapshot.docs) {
  const userData = doc.data();
  
  if (userData.role === 'student' || userData.role === 'child') {
    const mastery = userData.mastery || {};
    const subjectsWithProgress = Object.keys(mastery);
    
    console.log(`\n👤 ${userData.name || 'Unnamed'} (${userData.email || doc.id})`);
    console.log(`   Role: ${userData.role}`);
    console.log(`   Subjects with progress: ${subjectsWithProgress.length}`);
    console.log(`   Subjects: ${subjectsWithProgress.join(', ') || 'None'}`);
    
    // Show topic counts per subject
    subjectsWithProgress.forEach(subject => {
      const topics = Object.keys(mastery[subject] || {});
      console.log(`     - ${subject}: ${topics.length} topics`);
    });
  }
}

console.log('\n' + '='.repeat(60));
process.exit(0);
