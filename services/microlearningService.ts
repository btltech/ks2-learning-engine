/**
 * Microlearning Service
 * Provides focused 5-minute learning sessions
 */

import { Difficulty } from '../types';

export interface MicroSession {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  questionCount: number;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  estimatedPoints: number;
}

const MICRO_SESSION_DURATION = 5 * 60; // 5 minutes in seconds
const QUICK_QUESTIONS_COUNT = 5;
const STORAGE_KEY = 'ks2_micro_sessions';
const STREAK_KEY = 'ks2_micro_streak';

class MicrolearningService {
  private completedToday: Set<string> = new Set();
  private dailyGoal = 3; // 3 micro sessions per day
  private streakCount = 0;

  constructor() {
    this.loadProgress();
    this.loadStreak();
  }

  /**
   * Get available micro sessions
   */
  getAvailableSessions(subject?: string): MicroSession[] {
    const sessions: MicroSession[] = [
      {
        id: 'quick_maths',
        title: '5-Minute Maths Challenge',
        description: 'Quick mental maths practice',
        duration: MICRO_SESSION_DURATION,
        questionCount: QUICK_QUESTIONS_COUNT,
        subject: 'Maths',
        topic: 'Mixed',
        difficulty: Difficulty.Medium,
        estimatedPoints: 50,
      },
      {
        id: 'quick_english',
        title: 'Speed Spelling',
        description: 'Fast-paced spelling practice',
        duration: MICRO_SESSION_DURATION,
        questionCount: QUICK_QUESTIONS_COUNT,
        subject: 'English',
        topic: 'Spelling',
        difficulty: Difficulty.Medium,
        estimatedPoints: 50,
      },
      {
        id: 'quick_science',
        title: 'Science Facts Blitz',
        description: 'Quick science knowledge test',
        duration: MICRO_SESSION_DURATION,
        questionCount: QUICK_QUESTIONS_COUNT,
        subject: 'Science',
        topic: 'Mixed',
        difficulty: Difficulty.Medium,
        estimatedPoints: 50,
      },
      {
        id: 'morning_boost',
        title: 'Morning Brain Boost',
        description: 'Start your day with quick learning',
        duration: MICRO_SESSION_DURATION,
        questionCount: QUICK_QUESTIONS_COUNT,
        subject: 'Maths',
        topic: 'Mixed',
        difficulty: Difficulty.Easy,
        estimatedPoints: 40,
      },
      {
        id: 'bedtime_challenge',
        title: 'Bedtime Brain Teaser',
        description: 'Learn one thing before bed',
        duration: MICRO_SESSION_DURATION,
        questionCount: QUICK_QUESTIONS_COUNT,
        subject: 'English',
        topic: 'Vocabulary',
        difficulty: Difficulty.Easy,
        estimatedPoints: 40,
      },
    ];

    return subject ? sessions.filter(s => s.subject === subject) : sessions;
  }

  /**
   * Get daily challenge
   */
  getDailyChallenge(): MicroSession {
    const challenges = this.getAvailableSessions();
    const today = new Date().getDate();
    const index = today % challenges.length;
    return challenges[index];
  }

  /**
   * Mark session as completed
   */
  completeSession(sessionId: string): void {
    this.completedToday.add(sessionId);
    this.saveProgress();
    this.updateStreak();
  }

  /**
   * Get today's progress
   */
  getTodayProgress(): {
    completed: number;
    goal: number;
    percentage: number;
  } {
    const completed = this.completedToday.size;
    const percentage = Math.min(100, Math.round((completed / this.dailyGoal) * 100));
    
    return {
      completed,
      goal: this.dailyGoal,
      percentage,
    };
  }

  /**
   * Check if daily goal is achieved
   */
  isDailyGoalAchieved(): boolean {
    return this.completedToday.size >= this.dailyGoal;
  }

  /**
   * Get motivational message
   */
  getMotivationalMessage(): string {
    const progress = this.getTodayProgress();
    
    if (progress.completed === 0) {
      return "Start your first 5-minute challenge today! 🚀";
    } else if (progress.completed < progress.goal) {
      return `${progress.goal - progress.completed} more to reach your daily goal! 💪`;
    } else if (progress.completed === progress.goal) {
      return "Daily goal achieved! You're amazing! 🎉";
    } else {
      return "You're on fire! Bonus learning completed! 🔥";
    }
  }

  /**
   * Get recommended session based on time of day
   */
  getRecommendedSession(): MicroSession {
    const hour = new Date().getHours();
    const sessions = this.getAvailableSessions();

    // Morning (6am-11am) - Brain boost
    if (hour >= 6 && hour < 12) {
      return sessions.find(s => s.id === 'morning_boost') || sessions[0];
    }
    // Afternoon (12pm-5pm) - Random challenge
    else if (hour >= 12 && hour < 17) {
      return sessions[Math.floor(Math.random() * sessions.length)];
    }
    // Evening (5pm-9pm) - Bedtime
    else {
      return sessions.find(s => s.id === 'bedtime_challenge') || sessions[0];
    }
  }

  /**
   * Get streak — consecutive days with at least one completed session
   */
  getStreak(): number {
    return this.streakCount;
  }

  /**
   * Set daily goal
   */
  setDailyGoal(goal: number): void {
    this.dailyGoal = Math.max(1, Math.min(10, goal));
    this.saveProgress();
  }

  /**
   * Load progress from localStorage
   */
  private loadProgress(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const today = new Date().toDateString();
        
        // Reset if it's a new day
        if (data.date === today) {
          this.completedToday = new Set(data.completed || []);
          this.dailyGoal = data.dailyGoal || 3;
        } else {
          // New day - reset
          this.completedToday = new Set();
          this.saveProgress();
        }
      }
    } catch (error) {
      console.error('[Microlearning] Failed to load progress:', error);
    }
  }

  /**
   * Load streak from localStorage
   */
  private loadStreak(): void {
    try {
      const stored = localStorage.getItem(STREAK_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (data.lastActiveDate === today || data.lastActiveDate === yesterday) {
          this.streakCount = data.streak || 0;
        } else {
          // Gap in activity — streak broken
          this.streakCount = 0;
          this.saveStreak();
        }
      }
    } catch {
      this.streakCount = 0;
    }
  }

  /**
   * Update streak when a session is completed
   */
  private updateStreak(): void {
    try {
      const today = new Date().toDateString();
      const stored = localStorage.getItem(STREAK_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (data.lastActiveDate === today) {
          // Already counted today — no change
          return;
        } else if (data.lastActiveDate === yesterday) {
          // Consecutive day — extend streak
          this.streakCount = (data.streak || 0) + 1;
        } else {
          // Gap — restart streak
          this.streakCount = 1;
        }
      } else {
        this.streakCount = 1;
      }
      this.saveStreak();
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Save streak to localStorage
   */
  private saveStreak(): void {
    try {
      localStorage.setItem(STREAK_KEY, JSON.stringify({
        streak: this.streakCount,
        lastActiveDate: new Date().toDateString(),
      }));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Save progress to localStorage
   */
  private saveProgress(): void {
    try {
      const data = {
        date: new Date().toDateString(),
        completed: Array.from(this.completedToday),
        dailyGoal: this.dailyGoal,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[Microlearning] Failed to save progress:', error);
    }
  }
}

// Export singleton
export const microlearningService = new MicrolearningService();
