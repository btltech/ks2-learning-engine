import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Difficulty, QuestionType } from '../types';

const { mockGenerateContent, mockGetUnitQuestions } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
  mockGetUnitQuestions: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: { uid: 'test-uid', getIdToken: vi.fn().mockResolvedValue('test-token') } })),
}));

vi.mock('./cloudQuestionRepository', () => ({
  getCanonicalQuestionsForCurriculumUnit: mockGetUnitQuestions,
}));

vi.mock('./offlineManager', () => ({
  offlineManager: { checkOnlineStatus: vi.fn().mockReturnValue(true) },
}));

vi.mock('./cacheService', () => ({
  createCacheKey: vi.fn().mockReturnValue('test-key'),
  getFromCache: vi.fn().mockReturnValue(null),
  setInCache: vi.fn(),
  TTL: { LESSON: 14 * 24 * 60 * 60 * 1000 },
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

import { generateLesson, generateQuiz, getTopicsForSubject } from './geminiService';

describe('geminiService curriculum boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUnitQuestions.mockResolvedValue([]);
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body || '{}'));
      const generated = await mockGenerateContent(request);
      return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: generated.text }] } }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }));
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

  it('generates a curriculum-grounded lesson with the complete six-section contract', async () => {
    mockGenerateContent.mockResolvedValue({
      text: `# Learning Objective
I can explain place value in numbers to 1,000.

# Key Vocabulary
Digit means one numeral. Place means position. Value means what a digit represents.

# Teach
Each digit belongs to a column. Its column tells us how much the digit is worth in the whole number.

# Modelled Example
In 472, the 4 is worth 400 because it is in the hundreds column. The 7 is worth 70 and the 2 is worth 2.

# Guided Practice
Find the value of 6 in 361. Hint: identify its column first.

# Independent Check
Write 805 as hundreds, tens and ones.`,
    });

    const lesson = await generateLesson('Maths', 'Place value to 1,000', Difficulty.Medium, 7);
    expect(lesson).toContain('# Independent Check');
    expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
      lessonContext: expect.objectContaining({
        subject: 'Maths',
        topic: 'Place value to 1,000',
        studentAge: 7,
      }),
    }));
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
    expect(mockGetUnitQuestions).toHaveBeenCalledWith('Maths', 'Algebra', 10, Difficulty.Easy, 10, [], []);
    expect(questions).toHaveLength(6);
    expect(questions[0].id).toBe('bank-1');
  });
});
