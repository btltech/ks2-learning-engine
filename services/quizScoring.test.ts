import { describe, expect, it } from 'vitest';
import { QuestionType, type QuizQuestion } from '../types';
import { buildQuizResults, scoreQuizAnswer } from './quizScoring';

const question = (overrides: Partial<QuizQuestion>): QuizQuestion => ({
  question: 'Test question with enough detail?',
  options: ['A', 'B', 'C'],
  correctAnswer: 'A',
  ...overrides,
});
describe('quiz scoring', () => {
  it('resolves answer text, zero-based indexes and letters consistently', () => {
    expect(scoreQuizAnswer(question({ correctAnswer: 'B' }), 'B').isCorrect).toBe(true);
    expect(scoreQuizAnswer(question({ correctAnswer: '1' }), 'B').isCorrect).toBe(true);
    expect(scoreQuizAnswer(question({ correctAnswer: 'C.' }), 'C').isCorrect).toBe(true);
  });

  it('keeps creative drawing completion out of the knowledge percentage', () => {
    expect(scoreQuizAnswer(question({ questionType: QuestionType.Drawing }), 'data:image/png;base64,test')).toEqual({
      isCorrect: false,
      isScored: false,
    });
  });

  it('checks drag/drop zones rather than only counting placements', () => {
    const dragQuestion = question({
      questionType: QuestionType.DragAndDrop,
      dragItems: ['solid', 'gas'],
      dropZones: ['matter', 'state'],
    });
    expect(scoreQuizAnswer(dragQuestion, JSON.stringify({ 'item-0': 'state', 'item-1': 'matter' })).isCorrect).toBe(false);
    expect(scoreQuizAnswer(dragQuestion, JSON.stringify({ 'item-0': 'matter', 'item-1': 'state' })).isCorrect).toBe(true);
  });

  it('scores ordering and preserves complete question metadata in results', () => {
    const ordering = question({ questionType: QuestionType.Ordering, options: ['third', 'first', 'second'], correctOrder: [1, 2, 0] as unknown as string[] });
    const [result] = buildQuizResults([ordering], [JSON.stringify(['first', 'second', 'third'])]);
    expect(result.isCorrect).toBe(true);
    expect(result.questionType).toBe(QuestionType.Ordering);
  });
});
