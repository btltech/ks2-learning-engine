/**
 * Question Bank Fixer v2
 * Removes questions with null/undefined/empty correctAnswer
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GENERATED_DIR = path.join(__dirname, '../data/questions/generated');

function fixFile(filePath: string, subject: string): { fixed: number; removed: number } {
  let content = fs.readFileSync(filePath, 'utf-8');
  let fixed = 0;
  let removed = 0;

  // Split into lines for processing
  const lines = content.split('\n');
  const newLines: string[] = [];
  let inBrokenQuestion = false;
  let braceDepth = 0;
  let questionStartLine = -1;
  let skipLines: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line starts a question block
    if (line.includes("id: '") && !inBrokenQuestion) {
      questionStartLine = i;
    }

    // Check if this line has a broken correctAnswer
    if (line.match(/correctAnswer:\s*(null|undefined),/) || 
        line.match(/correctAnswer:\s*["']["'],/) ||
        line.match(/correctAnswer:\s*"",/)) {
      inBrokenQuestion = true;
      // Mark all lines from question start to find the end
    }

    // If we're in a broken question, find where it ends
    if (inBrokenQuestion) {
      if (line.includes('ageGroup:')) {
        // This is typically the last property, next line with }, ends the object
        const nextLine = lines[i + 1] || '';
        if (nextLine.trim().startsWith('},') || nextLine.trim() === '}') {
          // Mark lines for removal
          for (let j = questionStartLine; j <= i + 1; j++) {
            skipLines.push(j);
          }
          removed++;
          inBrokenQuestion = false;
        }
      }
    }
  }

  // Rebuild content without broken questions
  const filteredLines = lines.filter((_, idx) => !skipLines.includes(idx));
  
  // Clean up any double commas
  let newContent = filteredLines.join('\n');
  newContent = newContent.replace(/,\s*,/g, ',');
  newContent = newContent.replace(/\[\s*,/g, '[');

  // Update the total count in the header comment
  const totalMatch = newContent.match(/\/\/ Total: (\d+) questions/);
  if (totalMatch) {
    const originalTotal = parseInt(totalMatch[1]);
    const newTotal = originalTotal - removed;
    newContent = newContent.replace(
      /\/\/ Total: \d+ questions/,
      `// Total: ${newTotal} questions`
    );
  }

  if (removed > 0) {
    fs.writeFileSync(filePath, newContent);
  }

  return { fixed, removed };
}

async function main() {
  console.log('🔧 Fixing Question Bank (Removing Broken Questions)...\n');

  const subjects = [
    'maths', 'english', 'science', 'history', 'geography',
    'computing', 'art', 'music', 'pe', 'pshe', 'dt', 'languages'
  ];

  let totalRemoved = 0;

  for (const subject of subjects) {
    const filePath = path.join(GENERATED_DIR, `${subject}.ts`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${subject}.ts (not found)`);
      continue;
    }

    try {
      const { removed } = fixFile(filePath, subject);
      totalRemoved += removed;

      if (removed > 0) {
        console.log(`📁 ${subject}: 🗑️ Removed ${removed} broken questions`);
      } else {
        console.log(`📁 ${subject}: ✨ No broken questions`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${subject}:`, error);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY:');
  console.log(`   🗑️  Total Removed: ${totalRemoved} questions`);
  console.log('='.repeat(50));

  console.log('\n💡 Run validation: npx tsx scripts/validateQuestions.ts\n');
}

main().catch(console.error);
