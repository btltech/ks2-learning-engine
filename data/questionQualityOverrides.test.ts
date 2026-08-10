import { describe, expect, it } from 'vitest';
import { Difficulty, QuestionType, type BankQuestion } from '../types';
import { applyQuestionQualityControls, getQuestionQuarantineReason } from './questionQualityOverrides';

const baseQuestion: BankQuestion = {
  id: 'question-1',
  subject: 'Geography',
  topic: 'Place Knowledge',
  ageGroup: [7, 8],
  difficulty: Difficulty.Easy,
  question: 'Which river flows through London?',
  options: ['The Thames', 'The Tyne', 'The Severn'],
  correctAnswer: 'The Thames',
  explanation: 'The River Thames flows through London.',
  questionType: QuestionType.MultipleChoice,
};

describe('question quality controls', () => {
  it('applies an auditable correction without mutating the original question', () => {
    const original: BankQuestion = {
      ...baseQuestion,
      id: 'geo-plac-mirgtd6f-1',
      question: 'Old ambiguous wording',
      options: ['True', 'False'],
      correctAnswer: 'True',
      questionType: QuestionType.TrueFalse,
    };
    const corrected = applyQuestionQualityControls(original);
    expect(corrected?.question).toContain('entirely within England');
    expect(corrected?.explanation).toContain('River Severn');
    expect(original.question).toBe('Old ambiguous wording');
  });

  it('quarantines questions that rely on missing local context', () => {
    const question = { ...baseQuestion, question: 'What happened first in our county?' };
    expect(getQuestionQuarantineReason(question)).toContain('local context');
    expect(applyQuestionQualityControls(question)).toBeNull();
  });

  it('quarantines duplicate options and unresolvable answers', () => {
    expect(applyQuestionQualityControls({
      ...baseQuestion,
      options: ['London', 'London'],
      correctAnswer: 'London',
    })).toBeNull();
    expect(applyQuestionQualityControls({ ...baseQuestion, correctAnswer: 'Manchester' })).toBeNull();
  });

  it('keeps valid drawing activities outside percentage scoring', () => {
    const drawing = applyQuestionQualityControls({
      ...baseQuestion,
      questionType: QuestionType.Drawing,
      options: [],
      correctAnswer: 'Creative response',
    });
    expect(drawing).not.toBeNull();
  });
});
