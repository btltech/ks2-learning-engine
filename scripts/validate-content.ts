import { loadQuestionsForSubject } from '../data/questionBank';
import { Difficulty } from '../types';

const SUBJECTS = [
  'Maths', 'English', 'Science', 'History', 'Geography', 
  'Art', 'Computing', 'Languages', 'Music', 'PE', 'PSHE', 'D&T'
];

async function validateContent() {
  console.log('🔍 Starting Content Validation...');
  let totalQuestions = 0;
  let issues = 0;

  for (const subject of SUBJECTS) {
    process.stdout.write(`Checking ${subject}... `);
    try {
      const questions = await loadQuestionsForSubject(subject);
      totalQuestions += questions.length;
      
      if (questions.length === 0) {
        console.log(`⚠️  No questions found`);
        continue;
      }

      let subjectIssues = 0;
      questions.forEach(q => {
        const missingFields = [];
        if (!q.id) missingFields.push('id');
        if (!q.question) missingFields.push('question');
        if (!q.correctAnswer) missingFields.push('correctAnswer');
        if (!q.options || q.options.length === 0) missingFields.push('options');
        
        if (missingFields.length > 0) {
          console.error(`\n❌ [${subject}] Question missing fields: ${missingFields.join(', ')} (ID: ${q.id || 'unknown'})`);
          subjectIssues++;
          issues++;
        }

        if (!Object.values(Difficulty).includes(q.difficulty)) {
          console.warn(`\n⚠️  [${subject}] Invalid difficulty: ${q.difficulty} (ID: ${q.id})`);
          subjectIssues++;
          issues++;
        }

        if (!q.ageGroup || q.ageGroup.length === 0) {
          console.warn(`\n⚠️  [${subject}] No age group specified (ID: ${q.id})`);
          subjectIssues++;
          issues++;
        }
      });

      if (subjectIssues === 0) {
        console.log(`✅ ${questions.length} OK`);
      } else {
        console.log(`\n❌ Found ${subjectIssues} issues in ${questions.length} questions.`);
      }

    } catch (e) {
      console.error(`\n❌ Failed to load ${subject}:`, e);
      issues++;
    }
  }

  console.log('\n----------------------------------------');
  console.log(`Validation Complete.`);
  console.log(`Total Questions: ${totalQuestions}`);
  console.log(`Total Issues: ${issues}`);
  
  if (issues > 0) {
    process.exit(1);
  }
}

validateContent();
