import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameStatus } from '../services/gameService';

const { getState, startGame } = vi.hoisted(() => ({
  getState: vi.fn(),
  startGame: vi.fn(),
}));

vi.mock('../services/gameService', async () => {
  const actual = await vi.importActual('../services/gameService');
  return {
    ...actual,
    gameService: {
      getState,
      startGame,
      answerQuestion: vi.fn(),
      abandonGame: vi.fn(),
    },
  };
});

vi.mock('../services/gamesUnlockService', () => ({
  gamesUnlockService: { setStatus: vi.fn() },
}));

vi.mock('../hooks/useGameSounds', () => ({
  useGameSounds: () => ({
    playCorrect: vi.fn(), playIncorrect: vi.fn(), playClick: vi.fn(),
    soundEnabled: true, toggleSound: vi.fn(),
  }),
}));

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

import MiniGames from './MiniGames';

const unlocked: GameStatus = {
  isUnlocked: true,
  gamesRemaining: 2,
  requiredCorrect: 7,
  totalQuestions: 10,
  passesCount: 0,
  requiredPasses: 3,
  highScores: {},
  gamesPlayed: 0,
  activeSessionId: null,
};

describe('MiniGames', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getState.mockResolvedValue({ status: unlocked, activeSession: null });
    startGame.mockResolvedValue({
      status: { ...unlocked, gamesRemaining: 1 },
      session: {
        sessionId: 'session-1', gameId: 'maths_mission', config: { yearGroup: '3-4' },
        status: 'active', currentIndex: 0, totalQuestions: 10, correctAnswers: 0,
        question: { id: 'q1', kind: 'choice', prompt: '2 + 2?', options: ['3', '4'] },
        startedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString(),
      },
    });
  });

  it('does not spend a play when a learner merely opens a game card', async () => {
    render(<MiniGames onClose={vi.fn()} status={unlocked} />);
    fireEvent.click(await screen.findByRole('button', { name: /Maths Mission, Maths/i }));
    expect(startGame).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Start game · 2 plays left/i }));
    expect(startGame).toHaveBeenCalledWith('maths_mission', { yearGroup: '3-4', table: undefined });
    expect(await screen.findByRole('heading', { name: '2 + 2?' })).toBeVisible();
  });

  it('lets locked learners inspect games but disables starting them', async () => {
    const locked = { ...unlocked, isUnlocked: false, gamesRemaining: 0, passesCount: 1 };
    getState.mockResolvedValue({ status: locked, activeSession: null });
    render(<MiniGames onClose={vi.fn()} status={locked} />);
    fireEvent.click(await screen.findByRole('button', { name: /History Detective, History/i }));
    expect(screen.getByRole('button', { name: 'Games locked' })).toBeDisabled();
    expect(screen.getByText(/Pass three quizzes with at least 70%/i)).toBeVisible();
  });
});
