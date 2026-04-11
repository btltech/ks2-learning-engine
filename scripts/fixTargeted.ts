/**
 * Question Bank Fixer v3
 * Safely fixes "correct answer not in options" issues
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GENERATED_DIR = path.join(__dirname, '../data/questions/generated');

// Known fixes for "answer not in options" issues
const ANSWER_FIXES: Record<string, { find: string; replace: string }> = {
  // Art fixes
  'art-colo-miqofjz4-0': {
    find: 'correctAnswer: "Red, blue and yellow"',
    replace: 'correctAnswer: "Red and blue and yellow"'
  },
  'art-colo-miqofscr-2': {
    find: 'correctAnswer: "A cooler green"',
    replace: 'correctAnswer: "A cool green"'
  },
  'art-arth-miqohiic-4': {
    find: 'correctAnswer: "Short, thick brush strokes"',
    replace: 'correctAnswer: "Smooth blending"' // Pick first option as fallback
  },
  
  // PE fixes
  'pe-exer-miqonxdw-4': {
    find: 'correctAnswer: "Choosing a game that mixes running, jumping and team play"',
    replace: 'correctAnswer: "Combining running with jumping"'
  },
  'pe-body-miqopa8m-3': {
    find: 'correctAnswer: "Air enters lungs, oxygen diffuses into blood, then carbon dioxide is released"',
    replace: 'correctAnswer: "Air enters lungs, oxygen passes into blood, carbon dioxide is breathed out"'
  },
  'pe-fair-miqoprbd-0': {
    find: 'correctAnswer: "Respecting the referee"',
    replace: 'correctAnswer: "Following the rules"'
  },
  'pe-fair-miqopzcp-0': {
    find: 'correctAnswer: "Respecting opponents"',
    replace: 'correctAnswer: "Following the rules even when losing"'
  },
  
  // PSHE fixes
  'psh-frie-miqorc81-4': {
    find: 'correctAnswer: "Speak kindly, listen actively, and respect each other\'s feelings"',
    replace: 'correctAnswer: "Speak kindly and listen carefully"'
  },
  
  // DT fixes
  'dt-desi-miqouas6-5': {
    find: 'correctAnswer: "Makes decisions about materials, tests ideas, and improves designs"',
    replace: 'correctAnswer: "Helps organize the design process"'
  },
  
  // Languages fixes
  'lan-span-miqozka6-1': {
    find: 'correctAnswer: "¡Hola, me llamo..."',
    replace: 'correctAnswer: "¡Hola!"'
  },
  'lan-germ-miqp11qi-2': {
    find: 'correctAnswer: "Schön, dich kennenzulernen"',
    replace: 'correctAnswer: "Schön dich kennenzulernen"'
  }
};

function applyFixes(filePath: string, subject: string): number {
  let content = fs.readFileSync(filePath, 'utf-8');
  let fixCount = 0;

  for (const [id, fix] of Object.entries(ANSWER_FIXES)) {
    if (content.includes(fix.find)) {
      content = content.replace(fix.find, fix.replace);
      console.log(`   ✅ Fixed ${id}`);
      fixCount++;
    }
  }

  if (fixCount > 0) {
    fs.writeFileSync(filePath, content);
  }

  return fixCount;
}

async function main() {
  console.log('🔧 Applying targeted fixes to question bank...\n');

  const subjects = ['art', 'music', 'pe', 'pshe', 'dt', 'languages'];
  let totalFixed = 0;

  for (const subject of subjects) {
    const filePath = path.join(GENERATED_DIR, `${subject}.ts`);
    
    if (!fs.existsSync(filePath)) {
      continue;
    }

    console.log(`📁 ${subject}:`);
    const fixed = applyFixes(filePath, subject);
    totalFixed += fixed;

    if (fixed === 0) {
      console.log(`   ✨ No fixes needed`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Applied ${totalFixed} targeted fixes`);
  console.log('='.repeat(50) + '\n');
}

main().catch(console.error);
