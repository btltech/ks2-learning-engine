/**
 * Question Bank Generator Script
 * Uses local LLM (LM Studio) to generate questions for all subjects
 * Run with: npx tsx scripts/generateQuestions.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as http from 'http';
import { nationalCurriculumObjectives } from '../data/nationalCurriculum';
import { NCObjective, YearGroup } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local LLM settings
const LLM_HOST = '192.168.1.51';
const LLM_PORT = 1234;
const MODEL = 'openai/gpt-oss-20b';

interface GeneratedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  questionType: 'multiple-choice' | 'true-false' | 'fill-in-blank';
  cognitiveLevel: 'remember' | 'understand' | 'apply' | 'analyze';
  topic: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ageGroup: number[];
  ncObjective?: string; // Link to specific objective code
}

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
const AGE_GROUPS = {
  Easy: [7, 8],
  Medium: [8, 9, 10],
  Hard: [9, 10, 11]
};

// Group objectives by Subject -> Strand
const getCurriculumStructure = () => {
  const structure: Record<string, Record<string, NCObjective[]>> = {};
  
  nationalCurriculumObjectives.forEach(obj => {
    if (!structure[obj.subject]) {
      structure[obj.subject] = {};
    }
    if (!structure[obj.subject][obj.strand]) {
      structure[obj.subject][obj.strand] = [];
    }
    structure[obj.subject][obj.strand].push(obj);
  });
  
  return structure;
};

async function callLLM(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert UK KS2 curriculum question writer. Generate educational quiz questions for children aged 7-11. 
Always respond with ONLY valid JSON, no markdown, no explanation.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const options = {
      hostname: LLM_HOST,
      port: LLM_PORT,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 120000 // 2 minute timeout
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.choices[0].message.content);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.write(postData);
    req.end();
  });
}

function generatePrompt(subject: string, topic: string, difficulty: string, count: number, objectives: NCObjective[]): string {
  const objectiveDescriptions = objectives.map(o => `- [${o.code}] ${o.description} (Year ${o.yearGroup})`).join('\n');
  
  return `Generate ${count} quiz questions for UK Key Stage 2 students.

Subject: ${subject}
Topic: ${topic}  
Difficulty: ${difficulty}
Age Group: ${difficulty === 'Easy' ? '7-8 years' : difficulty === 'Medium' ? '8-10 years' : '9-11 years'}

The questions MUST test the following UK National Curriculum objectives:
${objectiveDescriptions}

Requirements:
- Mix question types: 60% multiple-choice, 25% true-false, 15% fill-in-blank
- Include variety of cognitive levels (remember, understand, apply, analyze)
- All content must be age-appropriate and aligned with UK National Curriculum
- For multiple-choice: 4 options with exactly one correct answer
- For true-false: options must be ["True", "False"]
- For fill-in-blank: include _____ in question, no options needed
- Each question needs a brief, encouraging explanation
- IMPORTANT: You MUST include the exact objective code (e.g., MA3-AS-1) in the "ncObjective" field for each question.

Return ONLY a JSON array with this exact structure (no markdown, no code blocks):
[
  {
    "question": "What is 5 + 3?",
    "options": ["6", "7", "8", "9"],
    "correctAnswer": "8",
    "explanation": "When we add 5 and 3 together, we get 8. Great counting!",
    "questionType": "multiple-choice",
    "cognitiveLevel": "remember",
    "ncObjective": "MA3-AS-1" 
  }
]

Generate exactly ${count} questions now:`;
}

function generateQuestionId(subject: string, topic: string, index: number): string {
  const subjectCode = subject.substring(0, 3).toLowerCase();
  const topicCode = topic.replace(/[^a-zA-Z]/g, '').substring(0, 4).toLowerCase();
  return `${subjectCode}-${topicCode}-${Date.now().toString(36)}-${index}`;
}

async function generateQuestionsForTopic(
  subject: string, 
  topic: string, 
  difficulty: string,
  count: number,
  objectives: NCObjective[]
): Promise<GeneratedQuestion[]> {
  console.log(`  Generating ${count} ${difficulty} questions for ${subject} - ${topic}...`);
  
  const prompt = generatePrompt(subject, topic, difficulty, count, objectives);
  
  try {
    const response = await callLLM(prompt);
    
    // Clean up response - remove markdown code blocks if present
    let cleanJson = response.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
    }
    
    const questions = JSON.parse(cleanJson);
    
    if (!Array.isArray(questions)) {
      console.error(`    Invalid response format for ${topic}`);
      return [];
    }
    
    return questions.map((q: any, index: number) => ({
      id: generateQuestionId(subject, topic, index),
      question: q.question,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      questionType: q.questionType || 'multiple-choice',
      cognitiveLevel: q.cognitiveLevel || 'remember',
      topic: topic,
      subject: subject,
      difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
      ageGroup: AGE_GROUPS[difficulty as keyof typeof AGE_GROUPS],
      ncObjective: q.ncObjective
    }));
  } catch (error) {
    console.error(`    Error generating questions for ${topic}:`, error);
    return [];
  }
}

async function generateAllQuestionsForSubject(subject: string, strands: Record<string, NCObjective[]>): Promise<GeneratedQuestion[]> {
  const allQuestions: GeneratedQuestion[] = [];
  
  const strandNames = Object.keys(strands);
  
  for (const strand of strandNames) {
    const objectives = strands[strand];
    
    // Generate 20 questions total per strand (6 Easy, 8 Medium, 6 Hard)
    const difficultyCounts = {
      'Easy': 6,
      'Medium': 8,
      'Hard': 6
    };
    
    for (const difficulty of DIFFICULTIES) {
      const count = difficultyCounts[difficulty];
      
      const questions = await generateQuestionsForTopic(subject, strand, difficulty, count, objectives);
      allQuestions.push(...questions);
      
      // Small delay to avoid overwhelming the LLM
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  return allQuestions;
}

function formatQuestionsAsTypeScript(questions: GeneratedQuestion[], subject: string): string {
  const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
  const importStatement = `import { Difficulty, QuestionType, CognitiveLevel } from '../../../types';`;

  const questionsArray = questions.map(q => {
    const optionsStr = q.options.length > 0 
      ? `options: ${JSON.stringify(q.options)},` 
      : `options: [],`;
    
    return `  {
    id: '${q.id}',
    question: ${JSON.stringify(q.question)},
    ${optionsStr}
    correctAnswer: ${JSON.stringify(q.correctAnswer)},
    explanation: ${JSON.stringify(q.explanation)},
    questionType: QuestionType.${q.questionType === 'multiple-choice' ? 'MultipleChoice' : q.questionType === 'true-false' ? 'TrueFalse' : 'FillInBlank'},
    cognitiveLevel: CognitiveLevel.${q.cognitiveLevel.charAt(0).toUpperCase() + q.cognitiveLevel.slice(1)},
    subject: '${q.subject}',
    topic: ${JSON.stringify(q.topic)},
    difficulty: Difficulty.${q.difficulty},
    ageGroup: ${JSON.stringify(q.ageGroup)},
    ncObjectives: ${q.ncObjective ? `['${q.ncObjective}']` : '[]'},
  }`;
  }).join(',\n');

  return `// Auto-generated ${subjectName} questions - ${new Date().toISOString()}
// Total: ${questions.length} questions

${importStatement}
import type { BankQuestion } from '../../questionBank';

export const ${subject.replace(/\s+/g, '')}Questions: BankQuestion[] = [
${questionsArray}
];
`;
}

async function main() {
  console.log('🎓 KS2 Question Bank Generator (Curriculum Aligned)');
  console.log('=================================================');
  console.log(`Using LLM at: http://${LLM_HOST}:${LLM_PORT}`);
  console.log('');

  // Test LLM connection first
  console.log('Testing LLM connection...');
  try {
    const testResponse = await callLLM('Respond with just the word "OK"');
    console.log('✅ LLM connected successfully:', testResponse.trim());
    console.log('');
  } catch (error) {
    console.error('❌ Failed to connect to LLM. Make sure LM Studio is running.');
    console.error(error);
    process.exit(1);
  }

  const curriculum = getCurriculumStructure();
  const subjects = Object.keys(curriculum);
  const outputDir = path.join(__dirname, '..', 'data', 'questions', 'generated');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const summary: { [key: string]: number } = {};

  for (const subject of subjects) {
    console.log(`\n📚 Generating questions for ${subject.toUpperCase()}...`);
    
    const questions = await generateAllQuestionsForSubject(subject, curriculum[subject]);
    summary[subject] = questions.length;
    
    if (questions.length > 0) {
      const safeSubjectName = subject.replace(/\s+/g, '');
      const outputPath = path.join(outputDir, `${safeSubjectName}.ts`);
      
      let existingQuestions: GeneratedQuestion[] = [];
      
      // Read existing questions if file exists
      if (fs.existsSync(outputPath)) {
        try {
          const content = fs.readFileSync(outputPath, 'utf-8');
          // Extract existing questions using regex to avoid importing TS files
          const matches = content.matchAll(/{\s*id:\s*'([^']+)',[\s\S]*?question:\s*"([^"]+)",[\s\S]*?subject:\s*'([^']+)',[\s\S]*?topic:\s*"([^"]+)",[\s\S]*?difficulty:\s*Difficulty\.([A-Za-z]+),[\s\S]*?ncObjectives:\s*(\[[^\]]*\])/g);
          
          for (const match of matches) {
             // We don't need to fully parse them to append, but we need to know the count or just append.
             // Actually, the easiest way to append is to read the file, find the closing bracket, and insert.
             // But we need to format the NEW questions as TS.
          }
          console.log(`    Found existing file for ${subject}, appending new questions...`);
          
          // Append logic
          const lastBracketIndex = content.lastIndexOf('];');
          if (lastBracketIndex !== -1) {
             const newQuestionsTs = formatQuestionsAsTypeScript(questions, subject);
             // formatQuestionsAsTypeScript returns a full file content. We need just the array items.
             // Let's refactor formatQuestionsAsTypeScript to return just the items string if needed, or just extract it here.
             
             // Actually, let's just use a helper to format the array items
             const itemsOnly = questions.map(q => {
                const optionsStr = q.options.length > 0 ? `options: ${JSON.stringify(q.options)},` : `options: [],`;
                return `  {
    id: '${q.id}',
    question: ${JSON.stringify(q.question)},
    ${optionsStr}
    correctAnswer: ${JSON.stringify(q.correctAnswer)},
    explanation: ${JSON.stringify(q.explanation)},
    questionType: QuestionType.${q.questionType === 'multiple-choice' ? 'MultipleChoice' : q.questionType === 'true-false' ? 'TrueFalse' : 'FillInBlank'},
    cognitiveLevel: CognitiveLevel.${q.cognitiveLevel.charAt(0).toUpperCase() + q.cognitiveLevel.slice(1)},
    subject: '${q.subject}',
    topic: ${JSON.stringify(q.topic)},
    difficulty: Difficulty.${q.difficulty},
    ageGroup: ${JSON.stringify(q.ageGroup)},
    ncObjectives: ${q.ncObjective ? `['${q.ncObjective}']` : '[]'},
  }`;
             }).join(',\n');
             
             const newContent = content.slice(0, lastBracketIndex) + 
                (content.slice(0, lastBracketIndex).trim().endsWith('[') ? '' : ',\n') +
                itemsOnly + 
                '\n];\n';
             
             fs.writeFileSync(outputPath, newContent);
             console.log(`✅ Appended ${questions.length} questions to ${outputPath}`);
             continue; // Skip the writeFileSync below
          }
        } catch (e) {
          console.error(`Error reading existing file for ${subject}, overwriting...`);
        }
      }
      
      // If no existing file or append failed, write new
      const tsContent = formatQuestionsAsTypeScript(questions, subject);
      fs.writeFileSync(outputPath, tsContent);
      console.log(`✅ Saved ${questions.length} questions to ${outputPath}`);
    } else {
      console.log(`⚠️ No questions generated for ${subject}`);
    }
  }

  // Generate index file
  const safeSubjects = subjects.map(s => s.replace(/\s+/g, ''));
  const indexContent = `// Auto-generated index for generated questions
${safeSubjects.map(s => `export { ${s}Questions } from './${s}';`).join('\n')}

// Combined export
import { ${safeSubjects.map(s => `${s}Questions`).join(', ')} } from './';
export const allGeneratedQuestions = [
  ${safeSubjects.map(s => `...${s}Questions`).join(',\n  ')}
];
`;
  fs.writeFileSync(path.join(outputDir, 'index.ts'), indexContent);

  console.log('\n================================');
  console.log('📊 Generation Summary:');
  Object.entries(summary).forEach(([subject, count]) => {
    console.log(`  ${subject}: ${count} questions`);
  });
  console.log(`  TOTAL: ${Object.values(summary).reduce((a, b) => a + b, 0)} questions`);
  console.log('================================');
  console.log('✅ Done! Questions saved to data/questions/generated/');
}

main().catch(console.error);

