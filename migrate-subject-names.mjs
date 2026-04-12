/**
 * One-time migration: normalise subject names and backfill missing age fields
 * in the Cloud Bank (Firestore `questions` collection).
 *
 * Run: node migrate-subject-names.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// ── Firebase Admin init ──────────────────────────────────────────────────────
const serviceAccount = JSON.parse(
  readFileSync('./ks2-learning-engine-firebase-adminsdk-fbsvc-eaa288b64d.json', 'utf8')
);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── Normalisation maps ───────────────────────────────────────────────────────
const SUBJECT_ALIASES = {
  'physical education': 'PE',
  'design and technology': 'D&T',
  'art and design': 'Art',
  'design & technology': 'D&T',
};

const normalise = (s) => SUBJECT_ALIASES[s?.toLowerCase()] ?? s;

// ── Migration ────────────────────────────────────────────────────────────────
async function migrate() {
  const snapshot = await db.collection('questions').get();
  console.log(`📦 Fetched ${snapshot.size} questions`);

  let renamedSubject = 0;
  let backfilledAge = 0;
  let skipped = 0;
  const batch_size = 400;
  let ops = [];
  let batches = 0;

  const flush = async () => {
    if (ops.length === 0) return;
    const b = db.batch();
    ops.forEach(({ ref, data }) => b.update(ref, data));
    await b.commit();
    batches++;
    console.log(`  ✅ Committed batch ${batches} (${ops.length} writes)`);
    ops = [];
  };

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const update = {};

    // 1. Normalise subject name
    const canonical = normalise(data.subject);
    if (canonical !== data.subject) {
      update.subject = canonical;
      renamedSubject++;
    }

    // 2. Backfill age (default to 9 = mid-KS2) only when completely absent
    if (data.age === undefined || data.age === null) {
      update.age = 9;
      backfilledAge++;
    }

    if (Object.keys(update).length > 0) {
      ops.push({ ref: doc.ref, data: update });
      if (ops.length >= batch_size) await flush();
    } else {
      skipped++;
    }
  }

  await flush();

  console.log('\n📊 Migration complete:');
  console.log(`  Subject names normalised : ${renamedSubject}`);
  console.log(`  Age fields backfilled    : ${backfilledAge}`);
  console.log(`  Documents unchanged      : ${skipped}`);
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
