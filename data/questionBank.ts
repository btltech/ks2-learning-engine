import { QuizQuestion, Difficulty, QuestionType, CognitiveLevel, BankQuestion } from '../types';

export type { BankQuestion };

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

// Cache for loaded questions to prevent redundant imports
const questionCache = new Map<string, BankQuestion[]>();

// Dynamic loader for questions by subject
export const loadQuestionsForSubject = async (subject: string): Promise<BankQuestion[]> => {
  const s = normaliseSubject(subject);
  
  // Return cached questions if available
  if (questionCache.has(s)) {
    return questionCache.get(s)!;
  }

  let questions: BankQuestion[] = [];

  try {
    switch (s) {
      case 'Maths':
      case 'Math':
        const { mathsQuestions } = await import('./questions/maths');
        const { statisticsQuestions } = await import('./questions/statistics');
        const { algebraQuestions } = await import('./questions/algebra');
        const { MathsQuestions } = await import('./questions/generated/Maths');
        questions = [...mathsQuestions, ...statisticsQuestions, ...algebraQuestions, ...MathsQuestions];
        break;
      case 'English':
        const { englishQuestions } = await import('./questions/english');
        const { EnglishQuestions } = await import('./questions/generated/English');
        questions = [...englishQuestions, ...EnglishQuestions];
        break;
      case 'Science':
        const { scienceQuestions } = await import('./questions/science');
        const { ScienceQuestions } = await import('./questions/generated/Science');
        questions = [...scienceQuestions, ...ScienceQuestions];
        break;
      case 'History':
        const { historyQuestions } = await import('./questions/history');
        const { HistoryQuestions } = await import('./questions/generated/History');
        questions = [...historyQuestions, ...HistoryQuestions];
        break;
      case 'Geography':
        const { geographyQuestions } = await import('./questions/geography');
        const { GeographyQuestions } = await import('./questions/generated/Geography');
        questions = [...geographyQuestions, ...GeographyQuestions];
        break;
      case 'Art':
      case 'Art & Design':
        const { artQuestions } = await import('./questions/art');
        const { ArtandDesignQuestions } = await import('./questions/generated/ArtandDesign');
        questions = [...artQuestions, ...ArtandDesignQuestions];
        break;
      case 'Computing':
        const { computingQuestions } = await import('./questions/computing');
        const { ComputingQuestions } = await import('./questions/generated/Computing');
        questions = [...computingQuestions, ...ComputingQuestions];
        break;
      case 'Languages':
        const { languagesQuestions } = await import('./questions/languages');
        const { LanguagesQuestions } = await import('./questions/generated/Languages');
        questions = [...languagesQuestions, ...LanguagesQuestions];
        break;
      case 'Music':
        const { musicQuestions } = await import('./questions/music');
        const { MusicQuestions } = await import('./questions/generated/Music');
        questions = [...musicQuestions, ...MusicQuestions];
        break;
      case 'PE':
        const { peQuestions } = await import('./questions/pe');
        const { PhysicalEducationQuestions } = await import('./questions/generated/PhysicalEducation');
        questions = [...peQuestions, ...PhysicalEducationQuestions];
        break;
      case 'PSHE':
        const { psheQuestions } = await import('./questions/pshe');
        questions = [...psheQuestions];
        break;
      case 'D&T':
      case 'Design & Technology':
        const { dtQuestions } = await import('./questions/dt');
        const { DesignandTechnologyQuestions } = await import('./questions/generated/DesignandTechnology');
        questions = [...dtQuestions, ...DesignandTechnologyQuestions];
        break;
    }
  } catch (e) {
    console.warn(`Failed to load questions for ${s}:`, e);
  }

  // Load custom and imported questions
  try {
    const { customQuestions } = await import('./questions/custom');
    const { importedQuestions } = await import('./questions/imported');
    
    const extra = [
      ...customQuestions,
      ...importedQuestions.map(q => ({
        ...q,
        subject: normaliseSubject(q.subject),
      }))
    ].filter(q => q.subject === s || (s === 'Languages' && ['French', 'Spanish', 'German'].includes(q.subject)));
    
    questions = [...questions, ...extra];
  } catch (e) {
    console.warn('Failed to load custom/imported questions:', e);
  }

  // Cache the loaded questions
  if (questions.length > 0) {
    // Filter out invalid questions (missing text, options, or correct answer)
    const validQuestions = questions.filter(q => 
      q.question && 
      q.options && 
      q.options.length > 0 && 
      q.correctAnswer
    );
    
    if (questions.length !== validQuestions.length) {
      console.warn(`Filtered out ${questions.length - validQuestions.length} invalid questions for ${s}`);
    }
    
    questionCache.set(s, validQuestions);
    return validQuestions;
  }

  return questions;
};

// Helper function to get questions by filters
export const getQuestionsByFilters = async (
  subject: string,
  topic: string,
  age: number,
  difficulty: Difficulty,
  excludeIds: string[] = []
): Promise<BankQuestion[]> => {
  const questions = await loadQuestionsForSubject(subject);
  
  return questions.filter(q => 
    (q.subject === subject || (subject === 'Languages' && ['French', 'Spanish', 'German'].includes(q.subject))) &&
    (topic === '' || q.topic === topic) &&
    q.ageGroup.includes(age) &&
    q.difficulty === difficulty &&
    !excludeIds.includes(q.id)
  );
};

// Get random questions without repetition
export const getRandomQuestions = async (
  subject: string,
  topic: string,
  age: number,
  difficulty: Difficulty,
  count: number,
  excludeIds: string[] = []
): Promise<BankQuestion[]> => {
  const available = await getQuestionsByFilters(subject, topic, age, difficulty, excludeIds);

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
