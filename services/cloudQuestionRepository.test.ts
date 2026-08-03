import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Difficulty, QuestionType, type BankQuestion } from '../types';

const { mockGetDocs } = vi.hoisted(() => ({ mockGetDocs: vi.fn() }));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'questions-collection'),
  getDocs: mockGetDocs,
  query: vi.fn((...parts) => parts),
  where: vi.fn((...parts) => parts),
}));

vi.mock('./firebase', () => ({ db: {} }));
vi.mock('../data/questionBank', () => ({ getQuestionsForCurriculumUnit: vi.fn().mockResolvedValue([]) }));

import {
  clearCloudQuestionCacheForTests,
  loadCloudQuestionsForCurriculumUnit,
  normalizeCloudQuestion,
  selectCanonicalQuestions,
} from './cloudQuestionRepository';

describe('cloudQuestionRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCloudQuestionCacheForTests();
    localStorage.clear();
  });

  it('adapts a legacy age and letter answer without changing the stored shape', () => {
    const source = {
      subject: 'Maths', topic: 'Algebra', age: 10, difficulty: 'hard',
      question: 'Which expression means five more than n?',
      options: ['5n', 'n + 5', 'n - 5'], correctAnswer: 'B',
    };
    const normalized = normalizeCloudQuestion('cloud-1', source, 'Maths', 'Algebra');

    expect(normalized).toMatchObject({
      id: 'cloud-1', ageGroup: [10], difficulty: Difficulty.Hard,
      questionType: QuestionType.MultipleChoice, correctAnswer: 'n + 5',
    });
    expect(source).not.toHaveProperty('ageGroup');
    expect(source.correctAnswer).toBe('B');
  });

  it('accepts fill-in questions with no options and unscored drawing tasks', () => {
    expect(normalizeCloudQuestion('fill-1', {
      question: 'The capital of France is ___.', questionType: 'fill-in-blank',
      correctAnswer: 'Paris', options: [], ageGroup: [8], difficulty: 'Easy',
    }, 'French', 'French: Vocabulary')).toMatchObject({
      options: [], correctAnswer: 'Paris', questionType: QuestionType.FillInBlank,
    });

    expect(normalizeCloudQuestion('draw-1', {
      question: 'Draw a repeating pattern.', questionType: 'drawing',
      ageGroup: [7], difficulty: 'Medium',
    }, 'Art', 'Creativity and Ideas')).toMatchObject({
      correctAnswer: 'Creative response', questionType: QuestionType.Drawing,
    });
  });

  it('rejects only records that cannot be displayed or scored reliably', () => {
    expect(normalizeCloudQuestion('missing-question', {
      options: ['A', 'B'], correctAnswer: 'A',
    }, 'Maths', 'Algebra')).toBeNull();
    expect(normalizeCloudQuestion('unresolvable', {
      question: 'Choose one.', options: ['A', 'B'], correctAnswer: 'C',
    }, 'Maths', 'Algebra')).toBeNull();
  });

  it('keeps reviewed priority order while deduplicating live and offline records', () => {
    const makeQuestion = (id: string, question: string, ageGroup: number[], difficulty: Difficulty): BankQuestion => ({
      id, subject: 'Maths', topic: 'Algebra', ageGroup, difficulty, question,
      options: ['Yes', 'No'], correctAnswer: 'Yes', questionType: QuestionType.MultipleChoice,
    });
    const selected = selectCanonicalQuestions([
      makeQuestion('one', 'Question one?', [7], Difficulty.Medium),
      makeQuestion('duplicate', '  QUESTION   ONE? ', [7], Difficulty.Medium),
      makeQuestion('two', 'Question two?', [10], Difficulty.Hard),
    ], 7, Difficulty.Medium, 10);

    expect(selected.map((question) => question.id)).toEqual(['one', 'two']);
  });

  it('queries exact legacy topic aliases and filters out other subjects', async () => {
    mockGetDocs.mockResolvedValue({
      forEach: (callback: (document: { id: string; data: () => Record<string, unknown> }) => void) => {
        callback({ id: 'maths-1', data: () => ({
          subject: 'Maths', topic: 'Place Value Power!', age: 9, difficulty: 'Medium',
          question: 'What is the value of 5 in 5,000?', options: ['5', '50', '500', '5,000'], correctAnswer: '5,000',
        }) });
        callback({ id: 'science-1', data: () => ({
          subject: 'Science', topic: 'Place Value Power!', age: 9, difficulty: 'Medium',
          question: 'Not a maths record', options: ['A', 'B'], correctAnswer: 'A',
        }) });
      },
    });

    const questions = await loadCloudQuestionsForCurriculumUnit('Maths', 'Number - number and place value');
    expect(questions.map((question) => question.id)).toEqual(['maths-1']);
  });

  it('persists a topic result so a new page session does not reread Firestore', async () => {
    mockGetDocs.mockResolvedValue({
      forEach: (callback: (document: { id: string; data: () => Record<string, unknown> }) => void) => {
        callback({ id: 'cached-1', data: () => ({
          subject: 'Maths', topic: 'Place Value Power!', age: 9, difficulty: 'Medium',
          question: 'What is 5 + 5?', options: ['10', '11'], correctAnswer: '10',
        }) });
      },
    });

    const first = await loadCloudQuestionsForCurriculumUnit('Maths', 'Number - number and place value');
    clearCloudQuestionCacheForTests();
    const second = await loadCloudQuestionsForCurriculumUnit('Maths', 'Number - number and place value');

    expect(first).toHaveLength(1);
    expect(second).toEqual(first);
    expect(mockGetDocs).toHaveBeenCalledTimes(1);
  });
});
