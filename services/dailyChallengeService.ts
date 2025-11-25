/**
 * Daily Challenge Service
 * 
 * Manages daily challenges, streak milestones, and special rewards
 */

import { Difficulty } from '../types';

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  subject: string;
  topic: string;
  difficulty: Difficulty;
  targetScore: number; // Percentage needed to complete
  bonusPoints: number;
  timeLimit?: number; // Optional time limit in seconds
  isCompleted: boolean;
  completedAt?: string;
  scoreAchieved?: number;
}

export interface StreakMilestone {
  days: number;
  name: string;
  icon: string;
  bonusPoints: number;
  unlockedItem?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'challenge' | 'mastery' | 'speed' | 'explorer';
  requirement: number;
  currentProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  bonusPoints: number;
}

const STORAGE_KEY = 'ks2_daily_challenges';
const ACHIEVEMENTS_KEY = 'ks2_achievements';

// Predefined streak milestones
export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, name: 'Getting Started', icon: '🌱', bonusPoints: 50 },
  { days: 7, name: 'Week Warrior', icon: '🔥', bonusPoints: 100 },
  { days: 14, name: 'Fortnight Champion', icon: '⚡', bonusPoints: 200 },
  { days: 30, name: 'Monthly Master', icon: '🏆', bonusPoints: 500 },
  { days: 60, name: 'Diamond Dedication', icon: '💎', bonusPoints: 1000 },
  { days: 100, name: 'Century Legend', icon: '👑', bonusPoints: 2000, unlockedItem: 'crown' },
  { days: 365, name: 'Year of Learning', icon: '🎓', bonusPoints: 10000 },
];

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'currentProgress' | 'isUnlocked' | 'unlockedAt'>[] = [
  // Streak achievements
  { id: 'streak-3', name: 'Consistent Learner', description: 'Maintain a 3-day streak', icon: '🌱', category: 'streak', requirement: 3, bonusPoints: 50 },
  { id: 'streak-7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', category: 'streak', requirement: 7, bonusPoints: 100 },
  { id: 'streak-30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🏆', category: 'streak', requirement: 30, bonusPoints: 500 },
  
  // Challenge achievements
  { id: 'challenges-5', name: 'Challenge Accepted', description: 'Complete 5 daily challenges', icon: '🎯', category: 'challenge', requirement: 5, bonusPoints: 75 },
  { id: 'challenges-25', name: 'Challenge Champion', description: 'Complete 25 daily challenges', icon: '🏅', category: 'challenge', requirement: 25, bonusPoints: 250 },
  { id: 'challenges-100', name: 'Challenge Legend', description: 'Complete 100 daily challenges', icon: '🌟', category: 'challenge', requirement: 100, bonusPoints: 1000 },
  
  // Mastery achievements
  { id: 'perfect-quiz', name: 'Perfect Score', description: 'Get 100% on any quiz', icon: '💯', category: 'mastery', requirement: 1, bonusPoints: 100 },
  { id: 'perfect-5', name: 'Perfection Streak', description: 'Get 5 perfect scores', icon: '✨', category: 'mastery', requirement: 5, bonusPoints: 300 },
  { id: 'master-topic', name: 'Topic Master', description: 'Reach 100% mastery in any topic', icon: '🎓', category: 'mastery', requirement: 1, bonusPoints: 200 },
  
  // Speed achievements
  { id: 'speed-demon', name: 'Speed Demon', description: 'Complete a speed challenge', icon: '⚡', category: 'speed', requirement: 1, bonusPoints: 50 },
  { id: 'lightning-10', name: 'Lightning Fast', description: 'Complete 10 speed challenges', icon: '🚀', category: 'speed', requirement: 10, bonusPoints: 200 },
  
  // Explorer achievements
  { id: 'explorer-3', name: 'Curious Mind', description: 'Study 3 different subjects', icon: '🔍', category: 'explorer', requirement: 3, bonusPoints: 75 },
  { id: 'explorer-all', name: 'Renaissance Learner', description: 'Study all subjects', icon: '🌈', category: 'explorer', requirement: 12, bonusPoints: 500 },
  { id: 'polyglot-start', name: 'Polyglot Beginner', description: 'Learn vocabulary in 2 languages', icon: '🌍', category: 'explorer', requirement: 2, bonusPoints: 100 },
];

// Subjects for daily challenges
const CHALLENGE_SUBJECTS = ['Maths', 'Science', 'English', 'History', 'Geography'];

class DailyChallengeService {
  private challenges: Map<string, DailyChallenge> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private completedChallengesCount: number = 0;

  constructor() {
    this.loadFromStorage();
    this.initializeAchievements();
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.challenges = new Map(Object.entries(parsed.challenges || {}));
        this.completedChallengesCount = parsed.completedCount || 0;
      }

      const achievementsSaved = localStorage.getItem(ACHIEVEMENTS_KEY);
      if (achievementsSaved) {
        const parsed = JSON.parse(achievementsSaved);
        this.achievements = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Error loading daily challenge data:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        challenges: Object.fromEntries(this.challenges),
        completedCount: this.completedChallengesCount,
      }));
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(Object.fromEntries(this.achievements)));
    } catch (error) {
      console.error('Error saving daily challenge data:', error);
    }
  }

  private initializeAchievements(): void {
    ACHIEVEMENT_DEFINITIONS.forEach((def) => {
      if (!this.achievements.has(def.id)) {
        this.achievements.set(def.id, {
          ...def,
          currentProgress: 0,
          isUnlocked: false,
        });
      }
    });
    this.saveToStorage();
  }

  /**
   * Generate today's challenge
   */
  generateTodaysChallenge(studentAge: number): DailyChallenge {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already have today's challenge
    const existing = this.challenges.get(today);
    if (existing) {
      return existing;
    }

    // Generate a new challenge based on day of week for variety
    const dayOfWeek = new Date().getDay();
    const subjectIndex = dayOfWeek % CHALLENGE_SUBJECTS.length;
    const subject = CHALLENGE_SUBJECTS[subjectIndex];

    // Vary difficulty based on day
    const difficulties = [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard];
    const difficulty = difficulties[dayOfWeek % 3];

    // Topics vary by subject and are seeded by date for consistency
    const topics = this.getTopicsForSubject(subject, studentAge);
    const topicIndex = parseInt(today.replace(/-/g, ''), 10) % Math.max(topics.length, 1);
    const topic = topics[topicIndex] || 'General Knowledge';

    const challenge: DailyChallenge = {
      id: `challenge_${today}`,
      date: today,
      subject,
      topic,
      difficulty,
      targetScore: difficulty === Difficulty.Easy ? 60 : difficulty === Difficulty.Medium ? 70 : 80,
      bonusPoints: difficulty === Difficulty.Easy ? 25 : difficulty === Difficulty.Medium ? 50 : 100,
      timeLimit: difficulty === Difficulty.Hard ? 300 : undefined, // 5 min for hard
      isCompleted: false,
    };

    this.challenges.set(today, challenge);
    this.saveToStorage();
    return challenge;
  }

  private getTopicsForSubject(subject: string, _studentAge: number): string[] {
    // These are sample topics - in production, these would come from the curriculum
    const topicMap: Record<string, string[]> = {
      Maths: ['Fractions', 'Multiplication', 'Division', 'Decimals', 'Percentages', 'Geometry', 'Algebra'],
      Science: ['Forces', 'Light', 'Sound', 'Living Things', 'Materials', 'Earth and Space'],
      English: ['Grammar', 'Punctuation', 'Spelling', 'Reading Comprehension', 'Creative Writing'],
      History: ['Romans', 'Vikings', 'World War II', 'Ancient Egypt', 'Tudors'],
      Geography: ['Rivers', 'Mountains', 'Weather', 'Maps', 'Countries'],
    };
    return topicMap[subject] || ['General'];
  }

  /**
   * Complete today's challenge
   */
  completeChallenge(score: number): { success: boolean; bonusPoints: number; newAchievements: Achievement[] } {
    const today = new Date().toISOString().split('T')[0];
    const challenge = this.challenges.get(today);

    if (!challenge || challenge.isCompleted) {
      return { success: false, bonusPoints: 0, newAchievements: [] };
    }

    const success = score >= challenge.targetScore;
    
    if (success) {
      challenge.isCompleted = true;
      challenge.completedAt = new Date().toISOString();
      challenge.scoreAchieved = score;
      this.completedChallengesCount += 1;
      
      this.challenges.set(today, challenge);
      this.saveToStorage();

      // Check for new achievements
      const newAchievements = this.checkAchievements('challenge', this.completedChallengesCount);

      return {
        success: true,
        bonusPoints: challenge.bonusPoints,
        newAchievements,
      };
    }

    return { success: false, bonusPoints: 0, newAchievements: [] };
  }

  /**
   * Check and unlock achievements
   */
  checkAchievements(category: Achievement['category'], currentValue: number): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    this.achievements.forEach((achievement, id) => {
      if (achievement.category === category && !achievement.isUnlocked) {
        achievement.currentProgress = currentValue;
        
        if (currentValue >= achievement.requirement) {
          achievement.isUnlocked = true;
          achievement.unlockedAt = new Date().toISOString();
          newlyUnlocked.push(achievement);
        }
        
        this.achievements.set(id, achievement);
      }
    });

    if (newlyUnlocked.length > 0) {
      this.saveToStorage();
    }

    return newlyUnlocked;
  }

  /**
   * Update streak-based achievements
   */
  updateStreakAchievements(currentStreak: number): Achievement[] {
    return this.checkAchievements('streak', currentStreak);
  }

  /**
   * Get streak milestone if reached
   */
  getStreakMilestone(streak: number): StreakMilestone | null {
    return STREAK_MILESTONES.find((m) => m.days === streak) || null;
  }

  /**
   * Get next streak milestone
   */
  getNextStreakMilestone(currentStreak: number): StreakMilestone | null {
    return STREAK_MILESTONES.find((m) => m.days > currentStreak) || null;
  }

  /**
   * Get today's challenge
   */
  getTodaysChallenge(): DailyChallenge | null {
    const today = new Date().toISOString().split('T')[0];
    return this.challenges.get(today) || null;
  }

  /**
   * Get all achievements
   */
  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).filter((a) => a.isUnlocked);
  }

  /**
   * Get achievement progress
   */
  getAchievementProgress(achievementId: string): Achievement | null {
    return this.achievements.get(achievementId) || null;
  }

  /**
   * Get completed challenges count
   */
  getCompletedChallengesCount(): number {
    return this.completedChallengesCount;
  }

  /**
   * Get challenge history
   */
  getChallengeHistory(limit: number = 30): DailyChallenge[] {
    return Array.from(this.challenges.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }
}

export const dailyChallengeService = new DailyChallengeService();
