/**
 * Regenerate Broken Question Files
 * Regenerates only the subjects that were corrupted
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local LLM settings
const LLM_HOST = '192.168.0.165';
const LLM_PORT = 1234;
const MODEL = 'openai/gpt-oss-20b';

const OUTPUT_DIR = path.join(__dirname, '../data/questions/generated');

// Only regenerate broken subjects
const BROKEN_SUBJECTS: Record<string, { topics: string[] }> = {
  maths: {
    topics: [
      'Addition and Subtraction', 'Multiplication and Division', 'Fractions',
      'Decimals', 'Place Value', 'Shapes and Geometry'
    ]
  },
  english: {
    topics: [
      'Spelling', 'Grammar', 'Punctuation', 'Vocabulary', 
      'Parts of Speech', 'Synonyms and Antonyms'
    ]
  },
  history: {
    topics: [
      'Romans in Britain', 'Vikings', 'Ancient Egypt', 
      'Tudors', 'World War 2', 'Stone Age to Iron Age'
    ]
  },
  geography: {
    topics: [
      'Maps and Atlases', 'UK Geography', 'World Continents', 
      'Weather and Climate', 'Rivers', 'Environmental Issues'
    ]
  },
  computing: {
    topics: [
      'Algorithms', 'Coding Basics', 'Internet Safety',
      'Computer Hardware', 'Digital Literacy'
    ]
  },
  art: {
    topics: [
      'Colour Theory', 'Famous Artists', 'Drawing Techniques', 
      'Art History', 'Patterns and Textures'
    ]
  },
  pe: {
    topics: [
      'Healthy Eating', 'Exercise and Fitness', 'Sports Rules',
      'Body Systems', 'Fair Play'
    ]
  },
  pshe: {
    topics: [
      'Emotions and Feelings', 'Friendships', 'Online Safety',
      'Healthy Lifestyles', 'Rights and Responsibilities'
    ]
  },
  dt: {
    topics: [
      'Design Process', 'Materials', 'Structures', 
      'Food Technology', 'Sustainability'
    ]
  },
  languages: {
    topics: [
      'French: Greetings', 'French: Numbers', 'French: Colours', 
      'Spanish: Greetings', 'Spanish: Numbers', 'German: Greetings'
    ]
  }
};

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
}

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
const AGE_GROUPS = {
  Easy: [7, 8],
  Medium: [8, 9, 10],
  Hard: [9, 10, 11]
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
      timeout: 120000
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

    req.on('error', (e) => reject(e));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

function generateQuestionId(subject: string, topic: string, index: number): string {
  const subPrefix = subject.substring(0, 3).toLowerCase();
  const topicPrefix = topic.replace(/[^a-zA-Z]/g, '').substring(0, 4).toLowerCase();
  const timestamp = Date.now().toString(36);
  return `${subPrefix}-${topicPrefix}-${timestamp}-${index}`;
}

function parseQuestions(response: string): GeneratedQuestion[] {
  try {
    let content = response.trim();
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse questions:', error);
    return [];
  }
}

async function generateQuestionsForTopic(
  subject: string,
  topic: string,
  difficulty: string
): Promise<GeneratedQuestion[]> {
  const prompt = `Generate 3 quiz questions for UK KS2 students about ${topic} in ${subject}.
Difficulty: ${difficulty} (age ${AGE_GROUPS[difficulty as keyof typeof AGE_GROUPS].join('-')})

Mix of question types:
- 1 multiple-choice (4 options)
- 1 true-false
- 1 fill-in-blank (use ___ for blank)

Return JSON array with format:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "Encouraging explanation for a child",
    "questionType": "multiple-choice|true-false|fill-in-blank",
    "cognitiveLevel": "remember|understand|apply|analyze"
  }
]

IMPORTANT:
- Use British English spelling
- correctAnswer MUST exactly match one option
- Age-appropriate vocabulary
- Encouraging, supportive explanations`;

  try {
    const response = await callLLM(prompt);
    const questions = parseQuestions(response);
    
    return questions.map((q, idx) => ({
      ...q,
      id: generateQuestionId(subject, topic, idx),
      topic,
      subject: subject.charAt(0).toUpperCase() + subject.slice(1),
      difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
      ageGroup: AGE_GROUPS[difficulty as keyof typeof AGE_GROUPS],
      options: q.questionType === 'true-false' ? ['True', 'False'] : q.options
    }));
  } catch (error) {
    console.error(`Error generating ${subject}/${topic}/${difficulty}:`, error);
    return [];
  }
}

function questionToTypeScript(q: GeneratedQuestion): string {
  const qtMap: Record<string, string> = {
    'multiple-choice': 'QuestionType.MultipleChoice',
    'true-false': 'QuestionType.TrueFalse',
    'fill-in-blank': 'QuestionType.FillInBlank'
  };
  
  const clMap: Record<string, string> = {
    'remember': 'CognitiveLevel.Remember',
    'understand': 'CognitiveLevel.Understand',
    'apply': 'CognitiveLevel.Apply',
    'analyze': 'CognitiveLevel.Analyze'
  };
  
  const diffMap: Record<string, string> = {
    'Easy': 'Difficulty.Easy',
    'Medium': 'Difficulty.Medium',
    'Hard': 'Difficulty.Hard'
  };

  return `  {
    id: '${q.id}',
    question: ${JSON.stringify(q.question)},
    options: ${JSON.stringify(q.options)},
    correctAnswer: ${JSON.stringify(q.correctAnswer)},
    explanation: ${JSON.stringify(q.explanation)},
    questionType: ${qtMap[q.questionType] || 'QuestionType.MultipleChoice'},
    cognitiveLevel: ${clMap[q.cognitiveLevel] || 'CognitiveLevel.Remember'},
    subject: '${q.subject}',
    topic: ${JSON.stringify(q.topic)},
    difficulty: ${diffMap[q.difficulty]},
    ageGroup: [${q.ageGroup.join(',')}],
  }`;
}

function writeSubjectFile(subject: string, questions: GeneratedQuestion[]) {
  const varName = `${subject}Questions`;
  const content = `// Auto-generated ${subject.charAt(0).toUpperCase() + subject.slice(1)} questions - ${new Date().toISOString()}
// Total: ${questions.length} questions

import { Difficulty, QuestionType, CognitiveLevel } from '../../types';
import type { BankQuestion } from '../questionBank';

export const ${varName}: BankQuestion[] = [
${questions.map(q => questionToTypeScript(q)).join(',\n')}
];
`;
  
  const filePath = path.join(OUTPUT_DIR, `${subject}.ts`);
  fs.writeFileSync(filePath, content);
  console.log(`   💾 Wrote ${questions.length} questions to ${subject}.ts`);
}

async function main() {
  console.log('🔄 Regenerating broken subject files...\n');
  
  const subjects = Object.keys(BROKEN_SUBJECTS);
  console.log(`📋 Subjects to regenerate: ${subjects.join(', ')}\n`);
  
  for (const subject of subjects) {
    console.log(`\n📚 ${subject.toUpperCase()}`);
    console.log('='.repeat(40));
    
    const allQuestions: GeneratedQuestion[] = [];
    const config = BROKEN_SUBJECTS[subject];
    
    for (const topic of config.topics) {
      for (const difficulty of DIFFICULTIES) {
        process.stdout.write(`   ${topic} (${difficulty})...`);
        
        const questions = await generateQuestionsForTopic(subject, topic, difficulty);
        allQuestions.push(...questions);
        
        console.log(` ✅ ${questions.length} questions`);
        
        // Small delay between requests
        await new Promise(r => setTimeout(r, 500));
      }
    }
    
    writeSubjectFile(subject, allQuestions);
    console.log(`   ✅ ${subject}: ${allQuestions.length} total questions`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Regeneration complete!');
  console.log('Run: npx tsx scripts/validateQuestions.ts');
}

main().catch(console.error);
