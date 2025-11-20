import { QuizQuestion, Difficulty } from '../types';
import { mathsQuestions } from './questions/maths';
import { englishQuestions } from './questions/english';
import { scienceQuestions } from './questions/science';
import { historyQuestions } from './questions/history';
import { geographyQuestions } from './questions/geography';
import { artQuestions } from './questions/art';
import { computingQuestions } from './questions/computing';
import { languagesQuestions } from './questions/languages';
import { musicQuestions } from './questions/music';
import { peQuestions } from './questions/pe';
import { psheQuestions } from './questions/pshe';
import { dtQuestions } from './questions/dt';
import { customQuestions } from './questions/custom';
import { importedQuestions } from './questions/imported';

export interface BankQuestion extends QuizQuestion {
  id: string;
  subject: string;
  topic: string;
  ageGroup: number[]; // e.g., [7, 8] or [9, 10, 11]
  difficulty: Difficulty;
  difficulty_score?: number;
}

// Normalise subject labels from imported data so they align with
// the subjects exposed in the UI (and with existing handwritten banks).
const normaliseSubject = (raw: string): string => {
  const s = raw.trim();
  switch (s) {
    case 'DT':
    case 'D T':
      return 'D&T';
    case 'RE':
    case 'RE_Ethics':
      return 'Religious Education';
    case 'Reading':
      return 'English';
    case 'PE_Skills':
      return 'PE';
    case 'German':
    case 'Spanish':
      // These are handled via the Languages flow; keep subject as Languages
      return 'Languages';
    default:
      return s;
  }
};

// Comprehensive question bank organized by subject and topic
export const questionBank: BankQuestion[] = [
  ...mathsQuestions,
  ...englishQuestions,
  ...scienceQuestions,
  ...historyQuestions,
  ...geographyQuestions,
  ...artQuestions,
  ...computingQuestions,
  ...languagesQuestions,
  ...musicQuestions,
  ...peQuestions,
  ...psheQuestions,
  ...dtQuestions,
  ...customQuestions,
  // Apply subject normalisation to imported questions so that
  // subjects like RE, RE_Ethics, DT, Reading, PE_Skills map onto
  // the main UI subjects.
  ...importedQuestions.map(q => ({
    ...q,
    subject: normaliseSubject(q.subject),
  })),
];

// Helper function to get questions by filters
export const getQuestionsByFilters = (
  subject: string,
  topic: string,
  age: number,
  difficulty: Difficulty,
  excludeIds: string[] = []
): BankQuestion[] => {
  return questionBank.filter(q => 
    q.subject === subject &&
    (topic === '' || q.topic === topic) &&
    q.ageGroup.includes(age) &&
    q.difficulty === difficulty &&
    !excludeIds.includes(q.id)
  );
};

// Get random questions without repetition
export const getRandomQuestions = (
  subject: string,
  topic: string,
  age: number,
  difficulty: Difficulty,
  count: number,
  excludeIds: string[] = []
): BankQuestion[] => {
  const available = getQuestionsByFilters(subject, topic, age, difficulty, excludeIds);

  // If we have difficulty scores, bias selection around the target band
  // Easy:   0.25–0.45, Medium: 0.45–0.7, Hard: 0.7–1.0
  const scored = available.filter(q => typeof q.difficulty_score === 'number');
  let pool: BankQuestion[] = available;

  if (scored.length > 0) {
    let min = 0.25;
    let max = 1.0;
    if (difficulty === Difficulty.Easy) {
      min = 0.25;
      max = 0.45;
    } else if (difficulty === Difficulty.Medium) {
      min = 0.45;
      max = 0.7;
    } else if (difficulty === Difficulty.Hard) {
      min = 0.7;
      max = 1.0;
    }

    const inBand = scored.filter(q => (q.difficulty_score as number) >= min && (q.difficulty_score as number) <= max);
    // If band is too small, fall back to all scored
    pool = inBand.length >= count ? inBand : scored;
  }
  
  // Shuffle and take the required count
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  // IMPORTANT: Shuffle the options for each question so correct answer isn't always in the same position
  return selected.map(question => ({
    ...question,
    options: [...question.options].sort(() => Math.random() - 0.5)
  }));
};
