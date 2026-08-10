import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DailyChallengeCard } from './DailyChallenge';

const { getTodaysChallenge, generateTodaysChallenge } = vi.hoisted(() => ({
  getTodaysChallenge: vi.fn(),
  generateTodaysChallenge: vi.fn(),
}));

vi.mock('../services/dailyChallengeService', () => ({
  dailyChallengeService: { getTodaysChallenge, generateTodaysChallenge },
}));

vi.mock('../context/UserContext', () => ({
  useUser: () => ({ currentChild: { id: 'child-1', age: 8 } }),
}));

const challenge = {
  id: 'daily-1',
  date: '2026-08-05',
  subject: 'Maths',
  topic: 'Fractions',
  difficulty: 'Medium',
  targetScore: 70,
  bonusPoints: 25,
  isCompleted: false,
  scoreAchieved: 0,
};

describe('DailyChallengeCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTodaysChallenge.mockReturnValue(challenge);
  });

  it('collapses a completed challenge into a compact non-actionable status', () => {
    getTodaysChallenge.mockReturnValue({ ...challenge, isCompleted: true, scoreAchieved: 90 });
    render(<DailyChallengeCard onStartChallenge={vi.fn()} />);

    expect(screen.getByRole('status', { name: /daily challenge complete/i })).toBeInTheDocument();
    expect(screen.getByText('90% · +25 points')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /start challenge/i })).not.toBeInTheDocument();
  });

  it('keeps the start action for an incomplete challenge', () => {
    const onStart = vi.fn();
    render(<DailyChallengeCard onStartChallenge={onStart} />);
    fireEvent.click(screen.getByRole('button', { name: /start challenge/i }));
    expect(onStart).toHaveBeenCalledWith(challenge);
  });
});
