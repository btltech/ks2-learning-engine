import { beforeEach, describe, expect, it, vi } from 'vitest';

const getIdToken = vi.fn(async () => 'firebase-token');
vi.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser: { getIdToken } }),
}));

import { gameService } from './gameService';

describe('gameService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads shared state with Firebase authentication', async () => {
    const status = { gamesRemaining: 2 };
    vi.stubGlobal('fetch', vi.fn(async (_path, init) => {
      expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer firebase-token');
      return new Response(JSON.stringify({ status, activeSession: null }), { status: 200 });
    }));
    await expect(gameService.getState()).resolves.toEqual({ status, activeSession: null });
  });

  it('spends a play only through an explicit start request', async () => {
    const fetchMock = vi.fn(async (_path, init) => {
      expect(JSON.parse(String(init?.body))).toEqual({
        action: 'start',
        gameId: 'maths_mission',
        config: { yearGroup: '3-4' },
      });
      return new Response(JSON.stringify({ session: { sessionId: 'session-1' }, status: { gamesRemaining: 1 } }), { status: 201 });
    });
    vi.stubGlobal('fetch', fetchMock);
    await gameService.startGame('maths_mission', { yearGroup: '3-4' });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('submits only the learner answer and lets the server grade it', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_path, init) => {
      expect(JSON.parse(String(init?.body))).toEqual({
        action: 'answer', sessionId: 'session-1', questionId: 'q1', answer: '42',
      });
      return new Response(JSON.stringify({ correct: true, completed: false }), { status: 200 });
    }));
    await expect(gameService.answerQuestion('session-1', 'q1', '42')).resolves.toMatchObject({ correct: true });
  });
});
