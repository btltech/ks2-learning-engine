/**
 * Remove Broken Questions
 * Removes questions where correctAnswer is not in options
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GENERATED_DIR = path.join(__dirname, '../data/questions/generated');

// IDs of broken questions to remove
const BROKEN_IDS = [
  // Maths
  'mat-plac-miqpgvxf-1',
  'mat-plac-miqpgvxf-2',
  // English
  'eng-gram-miqpjjva-2',
  'eng-gram-miqpjsok-2',
  'eng-punc-miqpk1ex-1',
  'eng-punc-miqpkeng-4',
  'eng-punc-miqpknh0-1',
  // History
  'his-worl-miqpwdqz-1',
  'his-ston-miqpwoi1-4',
  // Geography
  'geo-maps-miqpy48y-1',
  'geo-maps-miqpyjee-1',
  'geo-ukge-miqpzdt8-4',
  // Computing
  'com-algo-miqq31te-2',
  'com-codi-miqq4iqm-0',
  'com-digi-miqq6u2y-0',
  'com-digi-miqq77cb-2',
  // Art
  'art-colo-miqofjz4-0',
  // PE
  'pe-exer-miqonxdw-4',
  'pe-body-miqopa8m-3',
  'pe-fair-miqoprbd-0',
  'pe-fair-miqopzcp-0',
  // PSHE
  'psh-frie-miqorc81-4',
  // DT
  'dt-desi-miqouas6-5',
  // Languages
  'lan-span-miqozka6-1',
  'lan-germ-miqp11qi-2',
];

function removeQuestionsFromFile(filePath: string): number {
  let content = fs.readFileSync(filePath, 'utf-8');
  let removed = 0;

  for (const id of BROKEN_IDS) {
    // Match the entire question object
    const pattern = new RegExp(
      `\\s*\\{[\\s\\S]*?id:\\s*['"]${id}['"][\\s\\S]*?\\},?`,
      'g'
    );
    
    const newContent = content.replace(pattern, '');
    if (newContent !== content) {
      content = newContent;
      removed++;
      console.log(`   🗑️  Removed: ${id}`);
    }
  }

  if (removed > 0) {
    // Clean up double commas and trailing commas
    content = content.replace(/,(\s*),/g, ',');
    content = content.replace(/,(\s*)\]/g, '\n]');
    content = content.replace(/\[\s*,/g, '[');
    
    // Update total count in header
    const totalMatch = content.match(/\/\/ Total: (\d+) questions/);
    if (totalMatch) {
      const originalTotal = parseInt(totalMatch[1]);
      const newTotal = originalTotal - removed;
      content = content.replace(
        /\/\/ Total: \d+ questions/,
        `// Total: ${newTotal} questions`
      );
    }
    
    fs.writeFileSync(filePath, content);
  }

  return removed;
}

async function main() {
  console.log('🗑️  Removing broken questions...\n');

  const subjects = [
    'maths', 'english', 'science', 'history', 'geography',
    'computing', 'art', 'music', 'pe', 'pshe', 'dt', 'languages'
  ];

  let totalRemoved = 0;

  for (const subject of subjects) {
    const filePath = path.join(GENERATED_DIR, `${subject}.ts`);
    
    if (!fs.existsSync(filePath)) {
      continue;
    }

    console.log(`📁 ${subject}:`);
    const removed = removeQuestionsFromFile(filePath);
    totalRemoved += removed;

    if (removed === 0) {
      console.log(`   ✅ No broken questions`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Total Removed: ${totalRemoved} questions`);
  console.log('='.repeat(50));
  console.log('\n✅ Question bank cleaned! Run validation to verify.\n');
}

main().catch(console.error);
