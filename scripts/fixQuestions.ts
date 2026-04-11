/**
 * Question Bank Fixer
 * Automatically fixes common issues in generated questions
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GENERATED_DIR = path.join(__dirname, '../data/questions/generated');

// Known correct answers for fill-in-blank questions based on explanations
const FILL_IN_BLANK_ANSWERS: Record<string, string> = {
  // Maths
  'root': 'root',
  'photosynthesis': 'photosynthesis',
  'carbon dioxide': 'carbon dioxide',
  'scale': 'scale',
  'compass': 'compass',
  'cells': 'cells',
  'metamorphosis': 'metamorphosis',
  'sublimation': 'sublimation',
  'concrete': 'concrete',
  'census': 'census',
  '793': '793',
  'Bosworth': 'Bosworth',
  'lion': 'lion',
  'rulers': 'rulers',
  'code': 'code',
  'Thames': 'Thames',
  'cultivate': 'cultivate',
  'fire': 'fire',
  'problem-solving': 'problem-solving',
  'IDE': 'IDE',
  'yellow': 'yellow',
  'mixing': 'mixing',
  'guitar': 'guitar',
  'recorder': 'recorder',
  'trumpet': 'trumpet',
  'rhythm': 'rhythm',
  'protein': 'protein',
  'aerobic': 'aerobic',
  'sad': 'sad',
  'kindness': 'kindness',
  'trust': 'trust',
  'prototype': 'prototype',
  'evaluation': 'evaluation',
  'cardboard': 'cardboard',
  'huit': 'huit',
  'Bonjour': 'Bonjour',
  'sept': 'sept',
};

interface FixResult {
  subject: string;
  fixed: number;
  removed: number;
  details: string[];
}

function extractAnswerFromExplanation(explanation: string, question: string): string | null {
  if (!explanation) return null;

  // Common patterns in explanations
  const patterns = [
    /(?:answer is|should be|is called|known as|refers to|means)\s+['"]?([A-Za-z0-9\s\-]+)['"]?/i,
    /['"]([A-Za-z0-9]+)['"](?:\s+is|\s+means|\s+refers)/i,
    /(?:the word|term)\s+['"]?([A-Za-z0-9]+)['"]?/i,
    /(?:filled with|blank is)\s+['"]?([A-Za-z0-9\s]+)['"]?/i,
  ];

  for (const pattern of patterns) {
    const match = explanation.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Check known answers
  const explanationLower = explanation.toLowerCase();
  const questionLower = question.toLowerCase();
  
  for (const [key, value] of Object.entries(FILL_IN_BLANK_ANSWERS)) {
    if (explanationLower.includes(key.toLowerCase()) || questionLower.includes(key.toLowerCase())) {
      return value;
    }
  }

  return null;
}

function fixQuestionFile(filePath: string, subject: string): FixResult {
  const result: FixResult = {
    subject,
    fixed: 0,
    removed: 0,
    details: []
  };

  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Fix 1: Replace null/undefined correctAnswer with extracted answer
  const nullAnswerRegex = /correctAnswer:\s*(null|undefined),/g;
  let match;
  
  while ((match = nullAnswerRegex.exec(content)) !== null) {
    // Find the surrounding question context
    const startIdx = content.lastIndexOf('{', match.index);
    const endIdx = content.indexOf('},', match.index) + 2;
    const questionBlock = content.substring(startIdx, endIdx);
    
    // Extract explanation
    const explanationMatch = questionBlock.match(/explanation:\s*["']([^"']+)["']/);
    const questionMatch = questionBlock.match(/question:\s*["']([^"']+)["']/);
    const idMatch = questionBlock.match(/id:\s*['"]([^'"]+)['"]/);
    
    if (explanationMatch && questionMatch) {
      const inferredAnswer = extractAnswerFromExplanation(
        explanationMatch[1], 
        questionMatch[1]
      );
      
      if (inferredAnswer) {
        // Replace null with the inferred answer
        const newBlock = questionBlock.replace(
          /correctAnswer:\s*(null|undefined),/,
          `correctAnswer: "${inferredAnswer}",`
        );
        content = content.substring(0, startIdx) + newBlock + content.substring(endIdx);
        result.fixed++;
        result.details.push(`Fixed ${idMatch?.[1]}: answer set to "${inferredAnswer}"`);
        modified = true;
      }
    }
  }

  // Fix 2: Replace empty string correctAnswer
  const emptyAnswerRegex = /correctAnswer:\s*["']["'],/g;
  content = content.replace(emptyAnswerRegex, (match, offset) => {
    // Find the surrounding question context
    const startIdx = content.lastIndexOf('{', offset);
    const endIdx = content.indexOf('},', offset) + 2;
    const questionBlock = content.substring(startIdx, endIdx);
    
    const explanationMatch = questionBlock.match(/explanation:\s*["']([^"']+)["']/);
    const questionMatch = questionBlock.match(/question:\s*["']([^"']+)["']/);
    
    if (explanationMatch && questionMatch) {
      const inferredAnswer = extractAnswerFromExplanation(
        explanationMatch[1], 
        questionMatch[1]
      );
      
      if (inferredAnswer) {
        result.fixed++;
        modified = true;
        return `correctAnswer: "${inferredAnswer}",`;
      }
    }
    
    return match;
  });

  // Fix 3: Fix True/False questions with wrong answer format
  content = content.replace(
    /correctAnswer:\s*["'](true|false)["'],/gi,
    (match, answer) => {
      modified = true;
      return `correctAnswer: "${answer.charAt(0).toUpperCase() + answer.slice(1).toLowerCase()}",`;
    }
  );

  // Fix 4: Remove questions that can't be fixed (have undefined/null and no way to infer)
  // Count remaining broken questions
  const remainingBroken = (content.match(/correctAnswer:\s*(null|undefined|["']["']),/g) || []).length;
  
  if (modified) {
    fs.writeFileSync(filePath, content);
  }

  return result;
}

function removeUnfixableQuestions(filePath: string, subject: string): number {
  let content = fs.readFileSync(filePath, 'utf-8');
  let removed = 0;

  // Find and remove question blocks with null/undefined/empty correctAnswer
  const questionPattern = /\s*\{[\s\S]*?correctAnswer:\s*(?:null|undefined|["']["'])[\s\S]*?\},?/g;
  
  const newContent = content.replace(questionPattern, (match) => {
    removed++;
    return '';
  });

  // Clean up any double commas or trailing commas before ]
  const cleanedContent = newContent
    .replace(/,\s*,/g, ',')
    .replace(/,\s*\]/g, '\n]');

  if (removed > 0) {
    fs.writeFileSync(filePath, cleanedContent);
  }

  return removed;
}

async function main() {
  console.log('🔧 Fixing Question Bank Issues...\n');

  const subjects = [
    'maths', 'english', 'science', 'history', 'geography',
    'computing', 'art', 'music', 'pe', 'pshe', 'dt', 'languages'
  ];

  let totalFixed = 0;
  let totalRemoved = 0;

  for (const subject of subjects) {
    const filePath = path.join(GENERATED_DIR, `${subject}.ts`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${subject}.ts (not found)`);
      continue;
    }

    console.log(`📁 Processing ${subject}...`);
    
    // First pass: try to fix questions
    const fixResult = fixQuestionFile(filePath, subject);
    totalFixed += fixResult.fixed;

    if (fixResult.fixed > 0) {
      console.log(`   ✅ Fixed ${fixResult.fixed} questions`);
    }

    // Second pass: remove unfixable questions
    const removed = removeUnfixableQuestions(filePath, subject);
    totalRemoved += removed;

    if (removed > 0) {
      console.log(`   🗑️  Removed ${removed} unfixable questions`);
    }

    if (fixResult.fixed === 0 && removed === 0) {
      console.log(`   ✨ No issues to fix`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 FIX SUMMARY:');
  console.log(`   ✅ Fixed: ${totalFixed} questions`);
  console.log(`   🗑️  Removed: ${totalRemoved} unfixable questions`);
  console.log('='.repeat(50));

  console.log('\n💡 Run validation again to verify: npx tsx scripts/validateQuestions.ts\n');
}

main().catch(console.error);
