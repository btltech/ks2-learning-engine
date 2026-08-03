import { describe, expect, it } from 'vitest';
import { defaultGameProfile, publicGameStatus, syncQuizCredits } from './game-progress';

describe('game progress', () => {
  it('awards two plays after three new passing quizzes and never awards twice', () => {
    const initial = defaultGameProfile('learner-1', '2026-08-01T00:00:00.000Z');
    const history = [
      { id: 'q1', score: 70, completedAt: '2026-08-01T10:00:00.000Z' },
      { id: 'q2', score: 90, completedAt: '2026-08-01T11:00:00.000Z' },
      { id: 'q3', score: 100, completedAt: '2026-08-01T12:00:00.000Z' },
    ];
    const first = syncQuizCredits(initial, history);
    expect(publicGameStatus(first.profile)).toMatchObject({ gamesRemaining: 2, passesCount: 0, isUnlocked: true });
    const second = syncQuizCredits(first.profile, history);
    expect(second.changed).toBe(false);
    expect(second.profile.gamesRemaining).toBe(2);
  });

  it('keeps partial progress and ignores failing quizzes', () => {
    const result = syncQuizCredits(defaultGameProfile('learner-1'), [
      { id: 'q1', score: 69 },
      { id: 'q2', score: 70 },
    ]);
    expect(result.profile.passesCount).toBe(1);
    expect(result.profile.gamesRemaining).toBe(0);
  });

  it('keeps the games area available while the final play is active', () => {
    const profile = { ...defaultGameProfile('learner-1'), gamesRemaining: 0, activeSessionId: 'session-1' };
    expect(publicGameStatus(profile).isUnlocked).toBe(true);
  });
});
