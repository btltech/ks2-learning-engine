import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GENERATED_DIR = path.join(__dirname, '../data/questions/generated');

function verifyStandards() {
  console.log('🔍 Verifying DfE KS2 Standards Compliance...');
  
  const files = fs.readdirSync(GENERATED_DIR).filter(f => f.endsWith('.ts') && f !== 'index.ts');
  let totalQuestions = 0;
  let questionsWithObjectives = 0;
  let questionsWithoutObjectives = 0;
  
  const allQuestions = new Map<string, string>(); // Question text -> ID
  const duplicates: { text: string, id: string, file: string }[] = [];
  const unlinked: { id: string, file: string }[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(GENERATED_DIR, file), 'utf-8');
    
    // Regex to find question blocks
    // Improved regex to handle escaped quotes
    const blockRegex = /{\s*id:\s*'([^']+)'[\s\S]*?question:\s*"((?:[^"\\]|\\.)*)"[\s\S]*?ncObjectives:\s*(\[[^\]]*\])/g;
    
    const matches = content.matchAll(blockRegex);
    
    for (const match of matches) {
      totalQuestions++;
      const id = match[1];
      const questionText = match[2].toLowerCase().trim();
      const objectivesJson = match[3].replace(/'/g, '"');
      
      // Check duplicates
      if (allQuestions.has(questionText)) {
        duplicates.push({ text: questionText, id: id, file: file });
      } else {
        allQuestions.set(questionText, id);
      }
      
      // Check objectives
      try {
        const objectives = JSON.parse(objectivesJson);
        if (Array.isArray(objectives) && objectives.length > 0) {
          questionsWithObjectives++;
        } else {
          questionsWithoutObjectives++;
          unlinked.push({ id, file });
        }
      } catch (e) {
        questionsWithoutObjectives++;
        unlinked.push({ id, file });
      }
    }
  }

  console.log(`\n📊 Statistics:`);
  console.log(`  Total Questions: ${totalQuestions}`);
  console.log(`  Questions with DfE Objectives Linked: ${questionsWithObjectives} (${Math.round(questionsWithObjectives/totalQuestions*100)}%)`);
  console.log(`  Questions WITHOUT Objectives: ${questionsWithoutObjectives} (${Math.round(questionsWithoutObjectives/totalQuestions*100)}%)`);
  
  if (unlinked.length > 0) {
      console.log('\n⚠️ Unlinked Questions (Sample):');
      unlinked.slice(0, 5).forEach(u => console.log(`  - ${u.file}: ${u.id}`));
  }

  console.log(`\n🧹 Duplicates Check:`);
  if (duplicates.length > 0) {
    console.log(`  ⚠️ Found ${duplicates.length} duplicates.`);
    duplicates.forEach(d => console.log(`  - ${d.file}: ${d.id} ("${d.text.substring(0, 30)}...")`));
  } else {
    console.log(`  ✅ No duplicates found.`);
  }
  
  if (questionsWithObjectives === totalQuestions && duplicates.length === 0) {
      console.log(`\n✅ Verification Passed: 100% of questions are correctly linking to DfE statutory requirements.`);
  } else {
      console.log(`\n❌ Verification Failed.`);
  }
}

verifyStandards();
