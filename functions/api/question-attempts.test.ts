import { describe, expect, it } from 'vitest';
import { allowAttemptBatch, sanitizeAttempts } from './question-attempts';

describe('question-attempts validation', () => {
  it('accepts a bounded quiz batch', () => {
    expect(sanitizeAttempts([{
      questionId: 'cloud-123', question: 'What is 2 + 2?', isCorrect: true, timeToAnswer: 12,
      subject: 'Maths', topic: 'Algebra', difficulty: 'Medium',
    }])).toHaveLength(1);
  });

  it('rejects unsafe ids and implausible timings', () => {
    expect(sanitizeAttempts([{
      questionId: '../question', question: 'Question?', isCorrect: true, timeToAnswer: 12,
      subject: 'Maths', topic: 'Algebra', difficulty: 'Medium',
    }])).toBeNull();
    expect(sanitizeAttempts([{
      questionId: 'question', question: 'Question?', isCorrect: false, timeToAnswer: 99999,
      subject: 'Maths', topic: 'Algebra', difficulty: 'Medium',
    }])).toBeNull();
  });

  it('rate limits repeated batches per signed-in user', () => {
    for (let index = 0; index < 12; index++) expect(allowAttemptBatch('rate-test', 1000)).toBe(true);
    expect(allowAttemptBatch('rate-test', 1000)).toBe(false);
    expect(allowAttemptBatch('rate-test', 62_000)).toBe(true);
  });
});
