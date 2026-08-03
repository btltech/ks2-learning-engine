import { getAuth } from 'firebase/auth';

export type GameId =
  | 'maths_mission'
  | 'times_table_sprint'
  | 'spelling_workshop'
  | 'science_lab'
  | 'history_detective';

export interface GameStatus {
  isUnlocked: boolean;
  gamesRemaining: number;
  requiredCorrect: number;
  totalQuestions: number;
  passesCount: number;
  requiredPasses: number;
  highScores: Record<string, number>;
  gamesPlayed: number;
  activeSessionId: string | null;
  lastQuiz?: { correct: number; total: number; passed: boolean; at: string };
}

export interface GameQuestion {
  id: string;
  kind: 'choice' | 'text';
  prompt: string;
  context?: string;
  hint?: string;
  speak?: string;
  options?: string[];
}

export interface GameSession {
  sessionId: string;
  gameId: GameId;
  config: { yearGroup?: '3-4' | '5-6'; table?: number | 'mixed' };
  status: 'active' | 'complete' | 'abandoned' | 'expired';
  currentIndex: number;
  totalQuestions: number;
  correctAnswers: number;
  question: GameQuestion | null;
  startedAt: string;
  expiresAt: string;
  result?: GameResult;
}

export interface GameResult {
  correct: number;
  total: number;
  accuracy: number;
  score: number;
  speedBonus: number;
  xpEarned: number;
  stars: number;
  durationSeconds: number;
}

export interface GameStateResponse {
  status: GameStatus;
  activeSession: GameSession | null;
}

async function request<T>(init?: RequestInit): Promise<T> {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Please sign in again.');
  const token = await user.getIdToken();
  const response = await fetch('/api/games', {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error || 'The games service is unavailable.') as Error & { data?: unknown; status?: number };
    error.data = data;
    error.status = response.status;
    throw error;
  }
  return data as T;
}

export const gameService = {
  getState(): Promise<GameStateResponse> {
    return request<GameStateResponse>();
  },

  async startGame(
    gameId: GameId,
    config: { yearGroup?: '3-4' | '5-6'; table?: number | 'mixed' }
  ): Promise<{ session: GameSession; status: GameStatus }> {
    return request({
      method: 'POST',
      body: JSON.stringify({ action: 'start', gameId, config }),
    });
  },

  async answerQuestion(
    sessionId: string,
    questionId: string,
    answer: string
  ): Promise<{
    correct: boolean;
    correctAnswer: string;
    explanation: string;
    completed: boolean;
    session: GameSession;
    result?: GameResult;
    status: GameStatus;
  }> {
    return request({
      method: 'POST',
      body: JSON.stringify({ action: 'answer', sessionId, questionId, answer }),
    });
  },

  async abandonGame(sessionId: string): Promise<{ status: GameStatus }> {
    return request({
      method: 'POST',
      body: JSON.stringify({ action: 'abandon', sessionId }),
    });
  },
};
