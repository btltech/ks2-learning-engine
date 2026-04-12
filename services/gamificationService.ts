/**
 * Gamification Service
 * Handles daily missions, virtual pets, streaks, and rewards
 */

import { Subject } from '../types';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  requirement: number;
  progress: number;
  reward: {
    points: number;
    coins?: number;
    badge?: string;
  };
  type: 'quiz_count' | 'questions_correct' | 'subject_specific' | 'streak' | 'time_spent';
  subject?: string;
  completed: boolean;
}

export interface VirtualPet {
  id: string;
  name: string;
  type: 'dragon' | 'unicorn' | 'phoenix' | 'owl' | 'fox';
  level: number;
  happiness: number; // 0-100
  hunger: number; // 0-100
  energy: number; // 0-100
  lastFed: number;
  lastPlayed: number;
  accessories: string[];
  evolution: number; // 0-3 (egg, baby, teen, adult)
}

export interface StreakProtection {
  available: number;
  used: number;
  lastUsed: number | null;
}

const STORAGE_KEY_MISSIONS = 'ks2_daily_missions';
const STORAGE_KEY_PET = 'ks2_virtual_pet';
const STORAGE_KEY_STREAK = 'ks2_streak_protection';

class GamificationService {
  private missions: DailyMission[] = [];
  private pet: VirtualPet | null = null;
  private streakProtection: StreakProtection = { available: 2, used: 0, lastUsed: null };

  constructor() {
    this.loadData();
    this.initializeDailyMissions();
  }

  // ============ DAILY MISSIONS ============

  /**
   * Get all daily missions
   */
  getDailyMissions(): DailyMission[] {
    return this.missions;
  }

  /**
   * Initialize daily missions (reset at midnight)
   */
  private initializeDailyMissions(): void {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(STORAGE_KEY_MISSIONS);
    
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) {
        this.missions = data.missions;
        return;
      }
    }

    // Generate new daily missions
    this.missions = [
      {
        id: 'daily_quiz_3',
        title: 'Quiz Master',
        description: 'Complete 3 quizzes today',
        requirement: 3,
        progress: 0,
        reward: { points: 50, coins: 10 },
        type: 'quiz_count',
        completed: false,
      },
      {
        id: 'daily_correct_20',
        title: 'Accuracy Champion',
        description: 'Answer 20 questions correctly',
        requirement: 20,
        progress: 0,
        reward: { points: 100, coins: 20, badge: '🎯' },
        type: 'questions_correct',
        completed: false,
      },
      {
        id: 'daily_maths',
        title: 'Maths Whiz',
        description: 'Complete a Maths quiz with 80%+',
        requirement: 80,
        progress: 0,
        reward: { points: 75, coins: 15 },
        type: 'subject_specific',
        subject: 'Maths',
        completed: false,
      },
      {
        id: 'daily_streak',
        title: 'Consistency King',
        description: 'Maintain your learning streak',
        requirement: 1,
        progress: 0,
        reward: { points: 30, coins: 5 },
        type: 'streak',
        completed: false,
      },
      {
        id: 'daily_time_30',
        title: 'Time Investment',
        description: 'Spend 30 minutes learning',
        requirement: 30,
        progress: 0,
        reward: { points: 60, coins: 12 },
        type: 'time_spent',
        completed: false,
      },
    ];

    this.saveMissions();
  }

  /**
   * Update mission progress
   */
  updateMissionProgress(
    type: DailyMission['type'],
    amount: number,
    subject?: string,
    score?: number
  ): DailyMission[] {
    const completedMissions: DailyMission[] = [];

    this.missions.forEach((mission) => {
      if (mission.completed) return;

      if (mission.type === type) {
        if (mission.subject && mission.subject !== subject) return;

        if (type === 'subject_specific' && score !== undefined) {
          mission.progress = Math.max(mission.progress, score);
        } else {
          mission.progress += amount;
        }

        if (mission.progress >= mission.requirement && !mission.completed) {
          mission.completed = true;
          completedMissions.push(mission);
        }
      }
    });

    this.saveMissions();
    return completedMissions;
  }

  /**
   * Get missions completion summary
   */
  getMissionsSummary(): { completed: number; total: number; percentage: number } {
    const completed = this.missions.filter((m) => m.completed).length;
    const total = this.missions.length;
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  }

  // ============ VIRTUAL PET ============

  /**
   * Create or get virtual pet
   */
  getPet(): VirtualPet {
    if (!this.pet) {
      this.pet = {
        id: `pet_${Date.now()}`,
        name: 'Buddy',
        type: 'dragon',
        level: 1,
        happiness: 80,
        hunger: 50,
        energy: 100,
        lastFed: Date.now(),
        lastPlayed: Date.now(),
        accessories: [],
        evolution: 0,
      };
      this.savePet();
    }

    // Update pet stats based on time passed
    this.updatePetStats();
    return this.pet;
  }

  /**
   * Feed the pet
   */
  feedPet(): void {
    if (!this.pet) return;

    this.pet.hunger = Math.max(0, this.pet.hunger - 30);
    this.pet.happiness = Math.min(100, this.pet.happiness + 10);
    this.pet.lastFed = Date.now();

    this.savePet();
  }

  /**
   * Play with the pet
   */
  playWithPet(): void {
    if (!this.pet) return;

    this.pet.happiness = Math.min(100, this.pet.happiness + 20);
    this.pet.energy = Math.max(0, this.pet.energy - 15);
    this.pet.lastPlayed = Date.now();

    this.savePet();
  }

  /**
   * Level up pet (after completing missions/quizzes)
   */
  levelUpPet(points: number): { leveledUp: boolean; evolved: boolean } {
    if (!this.pet) return { leveledUp: false, evolved: false };

    const oldLevel = this.pet.level;
    const oldEvolution = this.pet.evolution;

    // Every 100 points = 1 level
    const levelsGained = Math.floor(points / 100);
    this.pet.level += levelsGained;

    // Evolution thresholds: 5, 15, 30
    if (this.pet.level >= 30 && this.pet.evolution < 3) {
      this.pet.evolution = 3;
    } else if (this.pet.level >= 15 && this.pet.evolution < 2) {
      this.pet.evolution = 2;
    } else if (this.pet.level >= 5 && this.pet.evolution < 1) {
      this.pet.evolution = 1;
    }

    this.savePet();

    return {
      leveledUp: this.pet.level > oldLevel,
      evolved: this.pet.evolution > oldEvolution,
    };
  }

  /**
   * Update pet stats based on time
   */
  private updatePetStats(): void {
    if (!this.pet) return;

    const now = Date.now();
    const hoursSinceLastFed = (now - this.pet.lastFed) / (1000 * 60 * 60);
    const hoursSinceLastPlayed = (now - this.pet.lastPlayed) / (1000 * 60 * 60);

    // Hunger increases 10 points per hour
    this.pet.hunger = Math.min(100, this.pet.hunger + hoursSinceLastFed * 10);

    // Happiness decreases 5 points per hour if not played with
    this.pet.happiness = Math.max(0, this.pet.happiness - hoursSinceLastPlayed * 5);

    // Energy regenerates 20 points per hour
    this.pet.energy = Math.min(100, this.pet.energy + hoursSinceLastFed * 20);

    this.savePet();
  }

  /**
   * Get pet status message
   */
  getPetStatus(): string {
    if (!this.pet) return 'No pet yet!';

    if (this.pet.hunger > 80) {
      return `${this.pet.name} is very hungry! 🍽️`;
    } else if (this.pet.happiness < 30) {
      return `${this.pet.name} is sad. Play with them! 😢`;
    } else if (this.pet.energy < 20) {
      return `${this.pet.name} is tired. Let them rest! 😴`;
    } else if (this.pet.happiness > 80 && this.pet.hunger < 30) {
      return `${this.pet.name} is very happy! 🌟`;
    } else {
      return `${this.pet.name} is doing well! ✨`;
    }
  }

  // ============ STREAK PROTECTION ============

  /**
   * Get streak protection status
   */
  getStreakProtection(): StreakProtection {
    return { ...this.streakProtection };
  }

  /**
   * Use a streak protection
   */
  useStreakProtection(): boolean {
    if (this.streakProtection.available <= 0) return false;

    this.streakProtection.available--;
    this.streakProtection.used++;
    this.streakProtection.lastUsed = Date.now();

    this.saveStreakProtection();
    return true;
  }

  /**
   * Earn streak protection (reward for achievements)
   */
  earnStreakProtection(): void {
    this.streakProtection.available = Math.min(5, this.streakProtection.available + 1);
    this.saveStreakProtection();
  }

  // ============ STORAGE ============

  private loadData(): void {
    try {
      const missionsData = localStorage.getItem(STORAGE_KEY_MISSIONS);
      if (missionsData) {
        const data = JSON.parse(missionsData);
        if (data.date === new Date().toDateString()) {
          this.missions = data.missions;
        }
      }

      const petData = localStorage.getItem(STORAGE_KEY_PET);
      if (petData) {
        this.pet = JSON.parse(petData);
      }

      const streakData = localStorage.getItem(STORAGE_KEY_STREAK);
      if (streakData) {
        this.streakProtection = JSON.parse(streakData);
      }
    } catch (error) {
      console.error('[Gamification] Failed to load data:', error);
    }
  }

  private saveMissions(): void {
    try {
      const data = {
        date: new Date().toDateString(),
        missions: this.missions,
      };
      localStorage.setItem(STORAGE_KEY_MISSIONS, JSON.stringify(data));
    } catch (error) {
      console.error('[Gamification] Failed to save missions:', error);
    }
  }

  private savePet(): void {
    try {
      if (this.pet) {
        localStorage.setItem(STORAGE_KEY_PET, JSON.stringify(this.pet));
      }
    } catch (error) {
      console.error('[Gamification] Failed to save pet:', error);
    }
  }

  private saveStreakProtection(): void {
    try {
      localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(this.streakProtection));
    } catch (error) {
      console.error('[Gamification] Failed to save streak protection:', error);
    }
  }
}

// Export singleton
export const gamificationService = new GamificationService();
