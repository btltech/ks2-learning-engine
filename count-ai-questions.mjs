import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccountKey = JSON.parse(
  fs.readFileSync('./ks2-learning-engine-firebase-adminsdk-fbsvc-eaa288b64d.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  projectId: 'ks2-learning-engine'
});

const db = admin.firestore();

try {
  const snapshot = await db.collection('questions').get();
  const total = snapshot.size;
  
  console.log('\n📊 CLOUD BANK STATISTICS\n');
  console.log(`Total AI-generated questions saved: ${total}\n`);
  
  if (total > 0) {
    const bySubject = {};
    const byDifficulty = {};
    const byAge = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const subject = data.subject || 'Unknown';
      const difficulty = data.difficulty || 'Unknown';
      const age = data.age || 'Unknown';
      
      bySubject[subject] = (bySubject[subject] || 0) + 1;
      byDifficulty[difficulty] = (byDifficulty[difficulty] || 0) + 1;
      byAge[age] = (byAge[age] || 0) + 1;
    });
    
    console.log('By Subject:');
    Object.entries(bySubject)
      .sort((a, b) => b[1] - a[1])
      .forEach(([subject, count]) => {
        console.log(`  ${subject}: ${count}`);
      });
    
    console.log('\nBy Difficulty:');
    Object.entries(byDifficulty)
      .sort((a, b) => b[1] - a[1])
      .forEach(([difficulty, count]) => {
        console.log(`  ${difficulty}: ${count}`);
      });
    
    console.log('\nBy Age Group:');
    Object.entries(byAge)
      .sort((a, b) => a - b)
      .forEach(([age, count]) => {
        console.log(`  Age ${age}: ${count}`);
      });
  }
  
  process.exit(0);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
