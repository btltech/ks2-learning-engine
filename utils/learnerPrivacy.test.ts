import { describe, expect, it } from 'vitest';
import { getSafeLearnerName } from './learnerPrivacy';

describe('learner leaderboard privacy', () => {
  it('uses the learner name only for their own highlighted row', () => {
    expect(getSafeLearnerName('Abigail Bolaji', 'student-1', true)).toBe('Abigail Bolaji');
  });

  it('creates a stable public alias that does not reveal the real name or id', () => {
    const first = getSafeLearnerName('Abigail Bolaji', 'student-secret-id');
    const second = getSafeLearnerName('Different Name', 'student-secret-id');

    expect(first).toBe(second);
    expect(first).not.toContain('Abigail');
    expect(first).not.toContain('student-secret-id');
  });
});
