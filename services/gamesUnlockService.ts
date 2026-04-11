/**
 * Games Unlock Service
 * 
 * Manages the unlock system for Mini Games - games are locked until
 * students complete a quiz with a good score.
 */

const GAMES_UNLOCK_KEY = 'ks2_games_unlock';
const STORAGE_VERSION = 2;
const REQUIRED_CORRECT = 7; // out of 10
const REQUIRED_TOTAL = 10;
const MAX_GAMES_PER_PASS = 2;

interface GamesUnlockDataV2 {
  version: 2;
  gamesRemaining: number;
  lastQuiz?: {
    correct: number;
    total: number;
    passed: boolean;
    at: string; // ISO
  };
}

class GamesUnlockService {
  private data: GamesUnlockDataV2;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): GamesUnlockDataV2 {
    try {
      const stored = localStorage.getItem(GAMES_UNLOCK_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.version === STORAGE_VERSION && typeof parsed?.gamesRemaining === 'number') {
          return parsed as GamesUnlockDataV2;
        }
      }
    } catch (e) {
      console.error('Error loading games unlock data:', e);
    }
    return { version: STORAGE_VERSION, gamesRemaining: 0 };
  }

  private saveData(): void {
    try {
      localStorage.setItem(GAMES_UNLOCK_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Error saving games unlock data:', e);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Record quiz completion (unlock games if the child passes).
   */
  recordQuizResult(params: { correct: number; total: number }): void {
    const total = Math.max(1, Math.trunc(params.total));
    const correct = Math.max(0, Math.trunc(params.correct));
    const passed = total === REQUIRED_TOTAL
      ? correct >= REQUIRED_CORRECT
      : (correct / total) >= (REQUIRED_CORRECT / REQUIRED_TOTAL);

    const now = new Date().toISOString();
    this.data.lastQuiz = { correct, total, passed, at: now };
    if (passed) {
      this.data.gamesRemaining = MAX_GAMES_PER_PASS;
    }
    this.saveData();
    this.notifyListeners();
  }

  /**
   * Get current unlock status
   */
  getStatus(): {
    requiredCorrect: number;
    totalQuestions: number;
    isUnlocked: boolean;
    gamesRemaining: number;
    lastQuiz?: GamesUnlockDataV2['lastQuiz'];
  } {
    const gamesRemaining = Math.max(0, this.data.gamesRemaining);
    return {
      requiredCorrect: REQUIRED_CORRECT,
      totalQuestions: REQUIRED_TOTAL,
      isUnlocked: gamesRemaining > 0,
      gamesRemaining,
      lastQuiz: this.data.lastQuiz,
    };
  }

  /**
   * Check if games are unlocked
   */
  isUnlocked(): boolean {
    return this.data.gamesRemaining > 0;
  }

  /**
   * Record a game play session
   */
  recordGamePlay(): void {
    if (this.data.gamesRemaining > 0) {
      this.data.gamesRemaining -= 1;
    }
    this.saveData();
    this.notifyListeners();
  }

  /**
   * Subscribe to unlock status changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Force unlock (for admin/testing)
   */
  forceUnlock(): void {
    this.data.gamesRemaining = MAX_GAMES_PER_PASS;
    this.saveData();
    this.notifyListeners();
  }

  /**
   * Reset for testing
   */
  reset(): void {
    this.data = { version: STORAGE_VERSION, gamesRemaining: 0 };
    this.saveData();
    this.notifyListeners();
  }

  /**
   * Get required correct answers constant
   */
  getRequiredAnswers(): { requiredCorrect: number; totalQuestions: number } {
    return { requiredCorrect: REQUIRED_CORRECT, totalQuestions: REQUIRED_TOTAL };
  }
}

export const gamesUnlockService = new GamesUnlockService();
