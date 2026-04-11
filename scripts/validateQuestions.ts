/**
 * Question Bank Validator
 * Validates generated questions for DfE KS2 curriculum conformance
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ValidationIssue {
  id: string;
  subject: string;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  details?: string;
}

interface SubjectStats {
  total: number;
  valid: number;
  critical: number;
  warnings: number;
  byDifficulty: { Easy: number; Medium: number; Hard: number };
  byType: { MultipleChoice: number; TrueFalse: number; FillInBlank: number; Ordering: number };
}

interface ValidationReport {
  timestamp: string;
  totalQuestions: number;
  validQuestions: number;
  issues: ValidationIssue[];
  subjectStats: Record<string, SubjectStats>;
  qualityScore: number;
}

const GENERATED_DIR = path.join(__dirname, '../data/questions/generated');

// KS2 Curriculum topic validation
const KS2_CURRICULUM = {
  maths: {
    validTopics: [
      'Addition and Subtraction', 'Multiplication and Division', 'Fractions', 
      'Decimals', 'Place Value', 'Shapes and Geometry', 'Measurement',
      'Statistics', 'Algebra', 'Ratio and Proportion', 'Percentages'
    ],
    ageRange: [7, 11]
  },
  english: {
    validTopics: [
      'Spelling', 'Grammar', 'Punctuation', 'Vocabulary', 'Parts of Speech',
      'Synonyms and Antonyms', 'Reading Comprehension', 'Writing'
    ],
    ageRange: [7, 11]
  },
  science: {
    validTopics: [
      'Living Things', 'Plants', 'Animals', 'Human Body', 'Forces and Magnets',
      'States of Matter', 'Rocks', 'Light', 'Sound', 'Electricity', 'Earth and Space'
    ],
    ageRange: [7, 11]
  },
  history: {
    validTopics: [
      'Romans in Britain', 'Vikings', 'Ancient Egypt', 'Tudors', 'World War 2',
      'Stone Age to Iron Age', 'Ancient Greece', 'Local History'
    ],
    ageRange: [7, 11]
  },
  geography: {
    validTopics: [
      'Maps and Atlases', 'UK Regions', 'World Countries', 'Climate and Weather',
      'Rivers', 'Mountains', 'Settlements', 'Trade and Economy'
    ],
    ageRange: [7, 11]
  },
  computing: {
    validTopics: [
      'Algorithms', 'Programming', 'Internet Safety', 'Data and Information',
      'Digital Literacy', 'Networks', 'Debugging'
    ],
    ageRange: [7, 11]
  },
  art: {
    validTopics: ['Drawing', 'Painting', 'Sculpture', 'Artists', 'Techniques'],
    ageRange: [7, 11]
  },
  music: {
    validTopics: ['Rhythm', 'Melody', 'Instruments', 'Composers', 'Musical Elements'],
    ageRange: [7, 11]
  },
  pe: {
    validTopics: ['Team Sports', 'Athletics', 'Gymnastics', 'Health and Fitness', 'Dance'],
    ageRange: [7, 11]
  },
  pshe: {
    validTopics: ['Health', 'Relationships', 'Safety', 'Citizenship', 'Emotions'],
    ageRange: [7, 11]
  },
  dt: {
    validTopics: ['Design Process', 'Materials', 'Structures', 'Mechanisms', 'Food Technology'],
    ageRange: [7, 11]
  },
  languages: {
    validTopics: ['French: Greetings', 'French: Numbers', 'French: Colours', 
                  'Spanish: Greetings', 'Spanish: Numbers', 'German: Greetings'],
    ageRange: [7, 11]
  }
};

function validateQuestion(question: any, subject: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 1. Check for missing/null/undefined/empty correctAnswer
  if (question.correctAnswer === null || 
      question.correctAnswer === undefined || 
      question.correctAnswer === '') {
    issues.push({
      id: question.id,
      subject,
      issue: 'Missing or empty correctAnswer',
      severity: 'critical',
      details: `Question: "${question.question?.substring(0, 50)}..."`
    });
  }

  // 2. Check if correctAnswer is in options (for multiple choice)
  if (question.questionType === 'MultipleChoice' || 
      (question.options && question.options.length > 2)) {
    if (question.options && question.options.length > 0 && 
        question.correctAnswer && 
        !question.options.includes(question.correctAnswer)) {
      issues.push({
        id: question.id,
        subject,
        issue: 'Correct answer not in options',
        severity: 'critical',
        details: `Answer "${question.correctAnswer}" not found in [${question.options.join(', ')}]`
      });
    }
  }

  // 3. Check for empty options array when not fill-in-blank
  if (question.questionType !== 'FillInBlank' && 
      (!question.options || question.options.length === 0)) {
    issues.push({
      id: question.id,
      subject,
      issue: 'Missing options for non-fill-in-blank question',
      severity: 'critical',
      details: `Type: ${question.questionType}`
    });
  }

  // 4. Check for duplicate options
  if (question.options && question.options.length > 0) {
    const uniqueOptions = new Set(question.options);
    if (uniqueOptions.size !== question.options.length) {
      issues.push({
        id: question.id,
        subject,
        issue: 'Duplicate options found',
        severity: 'warning',
        details: `Options: [${question.options.join(', ')}]`
      });
    }
  }

  // 5. Check for missing explanation
  if (!question.explanation || question.explanation.trim() === '') {
    issues.push({
      id: question.id,
      subject,
      issue: 'Missing explanation',
      severity: 'warning'
    });
  }

  // 6. Check explanation doesn't contradict answer (basic check)
  if (question.explanation && question.correctAnswer) {
    const explanationLower = question.explanation.toLowerCase();
    if (question.correctAnswer === 'True' && explanationLower.includes('false')) {
      issues.push({
        id: question.id,
        subject,
        issue: 'Explanation may contradict True answer',
        severity: 'warning',
        details: question.explanation.substring(0, 100)
      });
    }
    if (question.correctAnswer === 'False' && 
        explanationLower.includes('correct') && 
        !explanationLower.includes('not correct') &&
        !explanationLower.includes('incorrect')) {
      issues.push({
        id: question.id,
        subject,
        issue: 'Explanation may contradict False answer',
        severity: 'warning',
        details: question.explanation.substring(0, 100)
      });
    }
  }

  // 7. Check age group validity
  if (question.ageGroup) {
    const validAges = [7, 8, 9, 10, 11];
    const invalidAges = question.ageGroup.filter((age: number) => !validAges.includes(age));
    if (invalidAges.length > 0) {
      issues.push({
        id: question.id,
        subject,
        issue: 'Invalid age group',
        severity: 'warning',
        details: `Ages ${invalidAges.join(', ')} not in KS2 range`
      });
    }
  }

  // 8. Check for very short questions
  if (question.question && question.question.length < 10) {
    issues.push({
      id: question.id,
      subject,
      issue: 'Question too short',
      severity: 'info',
      details: `"${question.question}"`
    });
  }

  // 9. Check for American spelling (should be British)
  const americanSpellings = ['color', 'favorite', 'honor', 'center', 'theater', 'analyze'];
  const questionText = (question.question + ' ' + question.explanation).toLowerCase();
  for (const spelling of americanSpellings) {
    if (questionText.includes(spelling)) {
      issues.push({
        id: question.id,
        subject,
        issue: 'Possible American spelling detected',
        severity: 'info',
        details: `Found "${spelling}" - should be British spelling`
      });
      break;
    }
  }

  return issues;
}

async function loadQuestionsFromFile(filePath: string): Promise<any[]> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract the array from the TypeScript file
    const arrayMatch = content.match(/export const \w+Questions: BankQuestion\[\] = \[([\s\S]*)\];/);
    if (!arrayMatch) {
      console.error(`Could not parse questions from ${filePath}`);
      return [];
    }

    // Parse the questions by evaluating the structure
    // This is a simplified parser - in production use proper AST parsing
    const questions: any[] = [];
    const questionBlocks = content.split(/\n  \{[\s\n]+id:/g).slice(1);
    
    for (const block of questionBlocks) {
      try {
        const idMatch = block.match(/['"]([^'"]+)['"]/);
        const questionMatch = block.match(/question:\s*["']([^"']+)["']/);
        const optionsMatch = block.match(/options:\s*\[([^\]]*)\]/);
        const correctAnswerMatch = block.match(/correctAnswer:\s*(?:["']([^"']*?)["']|(null|undefined))/);
        const explanationMatch = block.match(/explanation:\s*["']([^"']+)["']/);
        const questionTypeMatch = block.match(/questionType:\s*QuestionType\.(\w+)/);
        const difficultyMatch = block.match(/difficulty:\s*Difficulty\.(\w+)/);
        const ageGroupMatch = block.match(/ageGroup:\s*\[([^\]]+)\]/);

        if (idMatch) {
          const options = optionsMatch 
            ? optionsMatch[1].split(',').map(o => o.trim().replace(/^["']|["']$/g, '')).filter(o => o)
            : [];

          questions.push({
            id: idMatch[1],
            question: questionMatch?.[1] || '',
            options,
            correctAnswer: correctAnswerMatch?.[2] ? null : (correctAnswerMatch?.[1] ?? null),
            explanation: explanationMatch?.[1] || '',
            questionType: questionTypeMatch?.[1] || 'MultipleChoice',
            difficulty: difficultyMatch?.[1] || 'Medium',
            ageGroup: ageGroupMatch 
              ? ageGroupMatch[1].split(',').map(a => parseInt(a.trim())).filter(a => !isNaN(a))
              : []
          });
        }
      } catch (e) {
        // Skip malformed questions
      }
    }

    return questions;
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    return [];
  }
}

async function validateAllQuestions(): Promise<ValidationReport> {
  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    totalQuestions: 0,
    validQuestions: 0,
    issues: [],
    subjectStats: {},
    qualityScore: 0
  };

  const subjects = [
    'maths', 'english', 'science', 'history', 'geography', 
    'computing', 'art', 'music', 'pe', 'pshe', 'dt', 'languages'
  ];

  for (const subject of subjects) {
    const filePath = path.join(GENERATED_DIR, `${subject}.ts`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${subject}.ts`);
      continue;
    }

    const questions = await loadQuestionsFromFile(filePath);
    
    const stats: SubjectStats = {
      total: questions.length,
      valid: 0,
      critical: 0,
      warnings: 0,
      byDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
      byType: { MultipleChoice: 0, TrueFalse: 0, FillInBlank: 0, Ordering: 0 }
    };

    for (const question of questions) {
      const questionIssues = validateQuestion(question, subject);
      report.issues.push(...questionIssues);

      const hasCritical = questionIssues.some(i => i.severity === 'critical');
      const hasWarning = questionIssues.some(i => i.severity === 'warning');

      if (hasCritical) {
        stats.critical++;
      } else if (hasWarning) {
        stats.warnings++;
      }

      if (!hasCritical) {
        stats.valid++;
      }

      // Count by difficulty
      if (question.difficulty in stats.byDifficulty) {
        stats.byDifficulty[question.difficulty as keyof typeof stats.byDifficulty]++;
      }

      // Count by type
      if (question.questionType in stats.byType) {
        stats.byType[question.questionType as keyof typeof stats.byType]++;
      }
    }

    report.subjectStats[subject] = stats;
    report.totalQuestions += stats.total;
    report.validQuestions += stats.valid;
  }

  // Calculate quality score (0-100)
  report.qualityScore = report.totalQuestions > 0 
    ? Math.round((report.validQuestions / report.totalQuestions) * 100)
    : 0;

  return report;
}

function printReport(report: ValidationReport): void {
  console.log('\n' + '='.repeat(70));
  console.log('📊 QUESTION BANK VALIDATION REPORT');
  console.log('='.repeat(70));
  console.log(`📅 Generated: ${report.timestamp}`);
  console.log(`📝 Total Questions: ${report.totalQuestions}`);
  console.log(`✅ Valid Questions: ${report.validQuestions}`);
  console.log(`🎯 Quality Score: ${report.qualityScore}%`);
  console.log('='.repeat(70));

  // Subject breakdown
  console.log('\n📚 SUBJECT BREAKDOWN:');
  console.log('-'.repeat(70));
  console.log('Subject      | Total | Valid | Critical | Warnings | Easy | Med | Hard');
  console.log('-'.repeat(70));

  for (const [subject, stats] of Object.entries(report.subjectStats)) {
    const subjectPad = subject.padEnd(12);
    const totalPad = stats.total.toString().padStart(5);
    const validPad = stats.valid.toString().padStart(5);
    const criticalPad = stats.critical.toString().padStart(8);
    const warningsPad = stats.warnings.toString().padStart(8);
    const easyPad = stats.byDifficulty.Easy.toString().padStart(4);
    const medPad = stats.byDifficulty.Medium.toString().padStart(3);
    const hardPad = stats.byDifficulty.Hard.toString().padStart(4);
    
    const status = stats.critical > 0 ? '❌' : stats.warnings > 0 ? '⚠️' : '✅';
    console.log(`${status} ${subjectPad} |${totalPad} |${validPad} |${criticalPad} |${warningsPad} |${easyPad} |${medPad} |${hardPad}`);
  }

  // Critical issues
  const criticalIssues = report.issues.filter(i => i.severity === 'critical');
  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES (' + criticalIssues.length + '):');
    console.log('-'.repeat(70));
    
    // Group by subject
    const bySubject: Record<string, ValidationIssue[]> = {};
    for (const issue of criticalIssues) {
      if (!bySubject[issue.subject]) bySubject[issue.subject] = [];
      bySubject[issue.subject].push(issue);
    }

    for (const [subject, issues] of Object.entries(bySubject)) {
      console.log(`\n  📁 ${subject.toUpperCase()} (${issues.length} issues):`);
      for (const issue of issues.slice(0, 5)) { // Show first 5 per subject
        console.log(`     • ${issue.id}: ${issue.issue}`);
        if (issue.details) {
          console.log(`       ${issue.details.substring(0, 60)}...`);
        }
      }
      if (issues.length > 5) {
        console.log(`     ... and ${issues.length - 5} more`);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📋 SUMMARY:');
  
  const criticalCount = report.issues.filter(i => i.severity === 'critical').length;
  const warningCount = report.issues.filter(i => i.severity === 'warning').length;
  const infoCount = report.issues.filter(i => i.severity === 'info').length;

  console.log(`   🚨 Critical Issues: ${criticalCount}`);
  console.log(`   ⚠️  Warnings: ${warningCount}`);
  console.log(`   ℹ️  Info: ${infoCount}`);

  if (report.qualityScore >= 90) {
    console.log('\n✨ Excellent! Question bank is in great shape.');
  } else if (report.qualityScore >= 70) {
    console.log('\n👍 Good quality, but some issues need attention.');
  } else if (report.qualityScore >= 50) {
    console.log('\n⚠️  Fair quality. Please fix critical issues.');
  } else {
    console.log('\n❌ Poor quality. Many questions need fixing.');
  }

  console.log('='.repeat(70) + '\n');
}

// Save detailed report to JSON
function saveReportToJson(report: ValidationReport): void {
  const reportPath = path.join(__dirname, '../data/questions/validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Detailed report saved to: ${reportPath}`);
}

// Main execution
async function main() {
  console.log('🔍 Validating Question Bank...\n');
  
  const report = await validateAllQuestions();
  printReport(report);
  saveReportToJson(report);

  // Exit with error code if critical issues exist
  const criticalCount = report.issues.filter(i => i.severity === 'critical').length;
  if (criticalCount > 0) {
    console.log(`\n💡 Run: npx tsx scripts/fixQuestions.ts to auto-fix issues\n`);
  }
}

main().catch(console.error);
