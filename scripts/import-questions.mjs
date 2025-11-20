import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMPORTS_DIR = path.join(__dirname, '../data/imports');
const OUTPUT_FILE = path.join(__dirname, '../data/questions/imported.ts');

// Helper to capitalize first letter
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Map difficulty string to enum string
const mapDifficulty = (diff) => {
  if (!diff) return 'Difficulty.Medium';
  const d = diff.toLowerCase();
  if (d === 'easy') return 'Difficulty.Easy';
  if (d === 'hard') return 'Difficulty.Hard';
  return 'Difficulty.Medium';
};

// Main function
const processImports = () => {
  if (!fs.existsSync(IMPORTS_DIR)) {
    console.error(`Directory not found: ${IMPORTS_DIR}`);
    return;
  }

  let files = [];
  if (fs.existsSync(path.join(IMPORTS_DIR, 'master.json'))) {
    console.log('Found master.json - using as single source of truth.');
    files = ['master.json'];
  } else {
    files = fs.readdirSync(IMPORTS_DIR).filter(f => f.endsWith('.json'));
  }
  
  if (files.length === 0) {
    console.log('No JSON files found in data/imports');
    return;
  }

  let allQuestions = [];
  let questionCount = 0;

  files.forEach(file => {
    const filePath = path.join(IMPORTS_DIR, file);
    const subjectFromFilename = capitalize(path.basename(file, '.json'));
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          // Map Year Level to Age Group
          let ageGroup = [7, 8, 9, 10, 11];
          if (item.year_level === 3) ageGroup = [7, 8];
          if (item.year_level === 4) ageGroup = [8, 9];
          if (item.year_level === 5) ageGroup = [9, 10];
          if (item.year_level === 6) ageGroup = [10, 11];

          // Handle options: The input JSON seems to have 'correct' separate from 'options' (distractors)
          // We need to combine them.
          let allOptions = [];
          if (item.options && Array.isArray(item.options)) {
             allOptions = [...item.options];
          }
          
          // If 'correct' is not in options, add it
          if (item.correct && !allOptions.includes(item.correct)) {
             allOptions.push(item.correct);
          }
          
          // Shuffle options so the correct answer isn't always last
          allOptions.sort(() => Math.random() - 0.5);

          // Construct BankQuestion object
          const question = {
            id: item.id || `imp-${subjectFromFilename.toLowerCase()}-${Date.now()}-${index}`,
            subject: item.subject || subjectFromFilename,
            topic: item.topic || 'General',
            ageGroup: ageGroup,
            difficulty: item.difficulty || 'Medium', // Default to Medium if missing
            difficulty_score: item.difficulty_score,
            question: item.question,
            options: allOptions,
            correctAnswer: item.correct || item.correctAnswer, // Handle both keys
            explanation: item.explanation || undefined
          };
          
          // Validate essential fields
          if (!question.question || !question.correctAnswer || question.options.length < 2) {
             // console.warn(`Skipping invalid question in ${file} at index ${index}`);
             return;
          }
          
          allQuestions.push(question);
          questionCount++;
        });
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  });

  // Generate TypeScript content
  const tsContent = `import { BankQuestion, Difficulty } from '../../types';

export const importedQuestions: BankQuestion[] = [
${allQuestions.map(q => `  {
    id: ${JSON.stringify(q.id)},
    subject: ${JSON.stringify(q.subject)},
    topic: ${JSON.stringify(q.topic)},
    ageGroup: [${q.ageGroup.join(', ')}],
    difficulty: ${mapDifficulty(q.difficulty)},
    ${q.difficulty_score !== undefined ? `difficulty_score: ${q.difficulty_score},` : ''}
    question: ${JSON.stringify(q.question)},
    options: ${JSON.stringify(q.options)},
    correctAnswer: ${JSON.stringify(q.correctAnswer)},
    ${q.explanation ? `explanation: ${JSON.stringify(q.explanation)}` : ''}
  }`).join(',\n')}
];
`;

  fs.writeFileSync(OUTPUT_FILE, tsContent);
  console.log(`Successfully imported ${questionCount} questions from ${files.length} files.`);
  console.log(`Output written to: ${OUTPUT_FILE}`);
};

processImports();
