import { GameStatus, gameService } from './gameService';

const EMPTY_STATUS: GameStatus = {
  isUnlocked: false,
  gamesRemaining: 0,
  requiredCorrect: 7,
  totalQuestions: 10,
  passesCount: 0,
  requiredPasses: 3,
  highScores: {},
  gamesPlayed: 0,
  activeSessionId: null,
};

class GamesUnlockService {
  private status: GameStatus = EMPTY_STATUS;
  private listeners = new Set<() => void>();
  private refreshPromise: Promise<GameStatus> | null = null;
  private retryTimers: ReturnType<typeof setTimeout>[] = [];

  getStatus(): GameStatus {
    return this.status;
  }

  setStatus(status: GameStatus) {
    this.status = status;
    this.listeners.forEach((listener) => listener());
  }

  clear() {
    this.retryTimers.forEach(clearTimeout);
    this.retryTimers = [];
    this.status = EMPTY_STATUS;
    this.listeners.forEach((listener) => listener());
  }

  async refresh(): Promise<GameStatus> {
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = gameService.getState()
      .then(({ status }) => {
        this.setStatus(status);
        return status;
      })
      .finally(() => {
        this.refreshPromise = null;
      });
    return this.refreshPromise;
  }

  /**
   * Quiz history is persisted by UserContext. Show the latest result
   * immediately, then refresh the server-derived credit balance after that
   * profile write has had time to complete.
   */
  recordQuizResult(params: { correct: number; total: number }): void {
    const total = Math.max(1, Math.trunc(params.total));
    const correct = Math.max(0, Math.min(total, Math.trunc(params.correct)));
    const passed = correct / total >= 0.7;
    this.setStatus({
      ...this.status,
      lastQuiz: { correct, total, passed, at: new Date().toISOString() },
    });
    this.retryTimers.forEach(clearTimeout);
    this.retryTimers = [1200, 3500].map((delay) => setTimeout(() => {
      void this.refresh().catch(() => undefined);
    }, delay));
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const gamesUnlockService = new GamesUnlockService();
