import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Difficulty, QuestionType } from '../types';

vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');

const { mockGenerateContent, mockGetUnitQuestions } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
  mockGetUnitQuestions: vi.fn(),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    get models() { return { generateContent: mockGenerateContent }; }
  },
  Type: { OBJECT: 'OBJECT', ARRAY: 'ARRAY', STRING: 'STRING' },
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: { uid: 'test-uid', getIdToken: vi.fn() } })),
}));

vi.mock('../data/questionBank', () => ({
  getQuestionsForCurriculumUnit: mockGetUnitQuestions,
}));

vi.mock('./offlineManager', () => ({
  offlineManager: { checkOnlineStatus: vi.fn().mockReturnValue(true) },
}));

vi.mock('./cacheService', () => ({
  createCacheKey: vi.fn().mockReturnValue('test-key'),
  getFromCache: vi.fn().mockReturnValue(null),
  setInCache: vi.fn(),
}));

vi.mock('./contentMonitor', () => ({ contentMonitor: { logValidationIssue: vi.fn() } }));
vi.mock('./questionTracker', () => ({
  getUsedQuestions: vi.fn().mockReturnValue([]),
  markQuestionsAsUsed: vi.fn(),
  resetUsedQuestions: vi.fn(),
}));
vi.mock('./questionPerformance', () => ({
  filterPoorlyPerformingQuestions: vi.fn((questions) => questions),
  filterSimilarQuestions: vi.fn((questions) => questions),
  getAdaptedDifficulty: vi.fn((difficulty) => difficulty),
}));

import { generateQuiz, getTopicsForSubject } from './geminiService';

describe('geminiService curriculum boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUnitQuestions.mockResolvedValue([]);
  });

  it('returns the fixed ordered Year 6 Maths sequence without asking AI for topics', async () => {
    const topics = await getTopicsForSubject('Maths', 10);
    expect(topics).toEqual([
      'Place value to 10,000,000',
      'Four-operation fluency',
      'Fractions, decimals and percentages',
      'Ratio and proportion',
      'Algebra',
      'Geometry and measures',
      'Statistics and averages',
    ]);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('returns reviewed PSHE questions without invoking AI', async () => {
    const questions = await generateQuiz('PSHE', 'Friendship and respect', Difficulty.Medium, 7);
    expect(questions).toHaveLength(3);
    expect(questions.every((question) => question.questionType === QuestionType.MultipleChoice)).toBe(true);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('uses only the exact curriculum bank topic before filling a sparse quiz with AI', async () => {
    mockGetUnitQuestions.mockResolvedValue([{
      id: 'bank-1', subject: 'Maths', topic: 'Algebra', ageGroup: [10], difficulty: Difficulty.Easy,
      question: 'Which expression represents five more than n?',
      options: ['n + 5', '5n', 'n - 5'], correctAnswer: 'n + 5',
      questionType: QuestionType.MultipleChoice,
    }]);
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({ quiz: Array.from({ length: 5 }, (_, index) => ({
        question: `Algebra reasoning question number ${index + 1} for this published unit?`,
        options: [`Correct ${index}`, `Misconception ${index}`, `Other ${index}`],
        correctAnswer: `Correct ${index}`,
        explanation: 'Substitute the value and check both sides of the equation.',
        questionType: 'multiple-choice',
        cognitiveLevel: 'apply',
      })) }),
    });

    const questions = await generateQuiz('Maths', 'Algebra', Difficulty.Easy, 10);
    expect(mockGetUnitQuestions).toHaveBeenCalledWith('Maths', 'Algebra', 10, Difficulty.Easy, 10, []);
    expect(questions).toHaveLength(6);
    expect(questions[0].id).toBe('bank-1');
  });
});
