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

console.log('\n🔐 RESET CHILD PIN (Make Login PIN Optional)\n');
console.log('='.repeat(70));

const childId = 'child_882482e0-2c0f-41c5-b1f2-ec88b4af42f2'; // Abigail

const childDoc = await db.collection('users').doc(childId).get();
const childData = childDoc.data();

console.log(`\n👶 Child: ${childData.name}`);
console.log(`   Current PIN Status: ${childData.childPinHash ? 'SET (required for login)' : 'NOT SET'}`);

if (childData.childPinHash) {
  console.log(`\n🔄 Removing PIN requirement...`);
  
  await db.collection('users').doc(childId).update({
    childPinHash: null,
    updatedAt: new Date()
  });
  
  console.log(`✅ PIN removed!`);
  console.log(`\n📝 The child can now log in WITHOUT a PIN using:`);
  console.log(`   Parent Code: HKHV39`);
  console.log(`   Name: ${childData.name}`);
  console.log(`   Age: ${childData.age}`);
  console.log(`   PIN: (leave blank)`);
} else {
  console.log(`\n✅ PIN is already not set. Child can log in without PIN.`);
}

console.log(`\n${'='.repeat(70)}`);
console.log(`\n✅ Done!\n`);

process.exit(0);
