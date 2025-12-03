/**
 * Streak & Rewards Service
 * 
 * Manages daily login streaks, rewards, challenges, and achievements
 * Stores data in localStorage with sync to Firebase for persistence
 */

// Types
export interface DailyStreak {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string; // YYYY-MM-DD format
  totalDaysActive: number;
  streakFreezes: number; // Can protect streak once
}

export interface DailyReward {
  day: number;
  type: 'xp' | 'badge' | 'avatar_item' | 'streak_freeze';
  value: number | string;
  claimed: boolean;
  claimedAt?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  requirement: {
    action: 'complete_quizzes' | 'score_points' | 'perfect_scores' | 'study_time' | 'streak_days';
    count: number;
    subject?: string;
  };
  progress: number;
  reward: {
    type: 'xp' | 'badge' | 'avatar_item';
    value: number | string;
  };
  startDate: string;
  endDate: string;
  completed: boolean;
  claimed: boolean;
}

export interface RewardNotification {
  id: string;
  type: 'streak' | 'daily_reward' | 'challenge_complete' | 'achievement';
  title: string;
  message: string;
  reward?: {
    type: string;
    value: number | string;
  };
  timestamp: number;
  read: boolean;
}

// Daily reward calendar (7-day cycle)
const DAILY_REWARDS: DailyReward[] = [
  { day: 1, type: 'xp', value: 50, claimed: false },
  { day: 2, type: 'xp', value: 75, claimed: false },
  { day: 3, type: 'xp', value: 100, claimed: false },
  { day: 4, type: 'avatar_item', value: 'sparkle_effect', claimed: false },
  { day: 5, type: 'xp', value: 150, claimed: false },
  { day: 6, type: 'streak_freeze', value: 1, claimed: false },
  { day: 7, type: 'badge', value: 'weekly_warrior', claimed: false },
];

// Challenge templates
const DAILY_CHALLENGE_TEMPLATES = [
  { 
    title: 'Quick Learner', 
    description: 'Complete 3 quizzes today',
    requirement: { action: 'complete_quizzes', count: 3 },
    reward: { type: 'xp', value: 100 },
  },
  { 
    title: 'Maths Whiz', 
    description: 'Score 80% or higher on 2 Maths quizzes',
    requirement: { action: 'perfect_scores', count: 2, subject: 'Maths' },
    reward: { type: 'xp', value: 75 },
  },
  { 
    title: 'Science Explorer', 
    description: 'Complete a Science quiz on any topic',
    requirement: { action: 'complete_quizzes', count: 1, subject: 'Science' },
    reward: { type: 'xp', value: 50 },
  },
  { 
    title: 'Word Master', 
    description: 'Score 100 points in English quizzes',
    requirement: { action: 'score_points', count: 100, subject: 'English' },
    reward: { type: 'xp', value: 75 },
  },
  { 
    title: 'History Buff', 
    description: 'Complete 2 History quizzes',
    requirement: { action: 'complete_quizzes', count: 2, subject: 'History' },
    reward: { type: 'xp', value: 75 },
  },
];

const WEEKLY_CHALLENGE_TEMPLATES = [
  {
    title: 'Weekly Champion',
    description: 'Complete 15 quizzes this week',
    requirement: { action: 'complete_quizzes', count: 15 },
    reward: { type: 'badge', value: 'weekly_champion' },
  },
  {
    title: 'Perfect Week',
    description: 'Get 5 perfect scores this week',
    requirement: { action: 'perfect_scores', count: 5 },
    reward: { type: 'badge', value: 'perfection' },
  },
  {
    title: 'Streak Master',
    description: 'Maintain a 7-day streak',
    requirement: { action: 'streak_days', count: 7 },
    reward: { type: 'avatar_item', value: 'flame_aura' },
  },
];

class StreakRewardsService {
  private streak: DailyStreak;
  private rewards: DailyReward[];
  private challenges: Challenge[];
  private notifications: RewardNotification[];

  constructor() {
    this.streak = this.loadStreak();
    this.rewards = this.loadRewards();
    this.challenges = this.loadChallenges();
    this.notifications = this.loadNotifications();
  }

  // === Streak Management ===

  private loadStreak(): DailyStreak {
    const stored = localStorage.getItem('ks2_daily_streak');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastLoginDate: '',
      totalDaysActive: 0,
      streakFreezes: 0,
    };
  }

  private saveStreak(): void {
    localStorage.setItem('ks2_daily_streak', JSON.stringify(this.streak));
  }

  /**
   * Check and update streak on login
   * Returns streak status and any rewards earned
   */
  checkDailyLogin(): { 
    streakContinued: boolean; 
    newStreak: number;
    streakBroken: boolean;
    streakFreezeUsed: boolean;
    rewards: RewardNotification[];
  } {
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = this.streak.lastLoginDate;
    
    const result = {
      streakContinued: false,
      newStreak: this.streak.currentStreak,
      streakBroken: false,
      streakFreezeUsed: false,
      rewards: [] as RewardNotification[],
    };

    // Already logged in today
    if (lastLogin === today) {
      result.streakContinued = true;
      return result;
    }

    // Calculate days since last login
    const lastDate = lastLogin ? new Date(lastLogin) : null;
    const todayDate = new Date(today);
    const daysDiff = lastDate 
      ? Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysDiff === 1) {
      // Consecutive day - streak continues!
      this.streak.currentStreak += 1;
      this.streak.totalDaysActive += 1;
      result.streakContinued = true;
      result.newStreak = this.streak.currentStreak;

      // Check for streak milestones
      if (this.streak.currentStreak > this.streak.longestStreak) {
        this.streak.longestStreak = this.streak.currentStreak;
        const milestone = this.createMilestoneNotification(this.streak.currentStreak);
        if (milestone) {
          result.rewards.push(milestone);
          this.notifications.unshift(milestone);
        }
      }
    } else if (daysDiff === 2 && this.streak.streakFreezes > 0) {
      // Missed one day but have streak freeze
      this.streak.streakFreezes -= 1;
      this.streak.currentStreak += 1;
      this.streak.totalDaysActive += 1;
      result.streakContinued = true;
      result.streakFreezeUsed = true;
      result.newStreak = this.streak.currentStreak;

      const notification: RewardNotification = {
        id: `freeze_${Date.now()}`,
        type: 'streak',
        title: '❄️ Streak Freeze Used!',
        message: `Your streak was saved! You have ${this.streak.streakFreezes} freeze(s) left.`,
        timestamp: Date.now(),
        read: false,
      };
      result.rewards.push(notification);
      this.notifications.unshift(notification);
    } else if (daysDiff > 1) {
      // Streak broken
      if (this.streak.currentStreak > 0) {
        result.streakBroken = true;
        const notification: RewardNotification = {
          id: `broken_${Date.now()}`,
          type: 'streak',
          title: '💔 Streak Broken',
          message: `Your ${this.streak.currentStreak}-day streak has ended. Start a new one today!`,
          timestamp: Date.now(),
          read: false,
        };
        result.rewards.push(notification);
        this.notifications.unshift(notification);
      }
      this.streak.currentStreak = 1;
      this.streak.totalDaysActive += 1;
      result.newStreak = 1;
    } else {
      // First login
      this.streak.currentStreak = 1;
      this.streak.totalDaysActive = 1;
      result.newStreak = 1;
    }

    this.streak.lastLoginDate = today;
    this.saveStreak();
    this.saveNotifications();

    // Check daily reward
    const dailyReward = this.claimDailyReward();
    if (dailyReward) {
      result.rewards.push(dailyReward);
    }

    return result;
  }

  private createMilestoneNotification(days: number): RewardNotification | null {
    const milestones: { [key: number]: { title: string; reward: number } } = {
      7: { title: '🔥 Week Warrior!', reward: 100 },
      14: { title: '🌟 Two Week Champion!', reward: 200 },
      30: { title: '👑 Month Master!', reward: 500 },
      60: { title: '💎 Diamond Dedication!', reward: 1000 },
      100: { title: '🏆 Century Legend!', reward: 2000 },
    };

    const milestone = milestones[days];
    if (!milestone) return null;

    return {
      id: `milestone_${days}_${Date.now()}`,
      type: 'achievement',
      title: milestone.title,
      message: `Amazing! ${days} days in a row! Here's ${milestone.reward} bonus XP!`,
      reward: { type: 'xp', value: milestone.reward },
      timestamp: Date.now(),
      read: false,
    };
  }

  getStreak(): DailyStreak {
    return { ...this.streak };
  }

  // === Daily Rewards ===

  private loadRewards(): DailyReward[] {
    const stored = localStorage.getItem('ks2_daily_rewards');
    if (stored) {
      const saved = JSON.parse(stored);
      const today = new Date().toISOString().split('T')[0];
      
      // Reset if it's a new week (Sunday)
      if (new Date().getDay() === 0 && saved.lastReset !== today) {
        localStorage.setItem('ks2_daily_rewards', JSON.stringify({ 
          rewards: DAILY_REWARDS.map(r => ({ ...r, claimed: false })),
          lastReset: today,
        }));
        return DAILY_REWARDS.map(r => ({ ...r, claimed: false }));
      }
      
      return saved.rewards || DAILY_REWARDS;
    }
    return DAILY_REWARDS.map(r => ({ ...r, claimed: false }));
  }

  private saveRewards(): void {
    localStorage.setItem('ks2_daily_rewards', JSON.stringify({
      rewards: this.rewards,
      lastReset: new Date().toISOString().split('T')[0],
    }));
  }

  private claimDailyReward(): RewardNotification | null {
    const dayOfWeek = new Date().getDay() || 7; // 1-7 (Mon-Sun)
    const todayReward = this.rewards.find(r => r.day === dayOfWeek && !r.claimed);
    
    if (!todayReward) return null;

    todayReward.claimed = true;
    todayReward.claimedAt = new Date().toISOString();
    this.saveRewards();

    const notification: RewardNotification = {
      id: `daily_${Date.now()}`,
      type: 'daily_reward',
      title: '🎁 Daily Reward!',
      message: this.getRewardMessage(todayReward),
      reward: { type: todayReward.type, value: todayReward.value },
      timestamp: Date.now(),
      read: false,
    };

    this.notifications.unshift(notification);
    this.saveNotifications();

    return notification;
  }

  private getRewardMessage(reward: DailyReward): string {
    switch (reward.type) {
      case 'xp': return `You earned ${reward.value} XP!`;
      case 'badge': return `You unlocked the "${reward.value}" badge!`;
      case 'avatar_item': return `You unlocked a new avatar item!`;
      case 'streak_freeze': return `You got a Streak Freeze! Use it to protect your streak.`;
      default: return 'You got a reward!';
    }
  }

  getDailyRewards(): DailyReward[] {
    return [...this.rewards];
  }

  // === Challenges ===

  private loadChallenges(): Challenge[] {
    const stored = localStorage.getItem('ks2_challenges');
    if (stored) {
      const parsed = JSON.parse(stored);
      const today = new Date().toISOString().split('T')[0];
      
      // Check if we need to refresh daily challenges
      if (parsed.lastDailyReset !== today) {
        return this.generateDailyChallenges();
      }
      
      return parsed.challenges || [];
    }
    return this.generateDailyChallenges();
  }

  private saveChallenges(): void {
    localStorage.setItem('ks2_challenges', JSON.stringify({
      challenges: this.challenges,
      lastDailyReset: new Date().toISOString().split('T')[0],
    }));
  }

  private generateDailyChallenges(): Challenge[] {
    const today = new Date();
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Pick 2 random daily challenges
    const shuffled = [...DAILY_CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
    const dailyChallenges: Challenge[] = shuffled.slice(0, 2).map((template, i) => ({
      id: `daily_${today.toISOString().split('T')[0]}_${i}`,
      title: template.title,
      description: template.description,
      type: 'daily',
      requirement: template.requirement as Challenge['requirement'],
      progress: 0,
      reward: template.reward as Challenge['reward'],
      startDate: today.toISOString(),
      endDate: endOfDay.toISOString(),
      completed: false,
      claimed: false,
    }));

    // Keep active weekly challenges or generate new ones
    // Use empty array if this.challenges is not yet initialized
    const existingChallenges = this.challenges || [];
    const existingWeekly = existingChallenges.filter(c => 
      c.type === 'weekly' && new Date(c.endDate) > today && !c.claimed
    );

    if (existingWeekly.length === 0) {
      // Generate weekly challenge
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
      weekEnd.setHours(23, 59, 59, 999);

      const weeklyTemplate = WEEKLY_CHALLENGE_TEMPLATES[
        Math.floor(Math.random() * WEEKLY_CHALLENGE_TEMPLATES.length)
      ];

      const weeklyChallenge: Challenge = {
        id: `weekly_${today.toISOString().split('T')[0]}`,
        title: weeklyTemplate.title,
        description: weeklyTemplate.description,
        type: 'weekly',
        requirement: weeklyTemplate.requirement as Challenge['requirement'],
        progress: 0,
        reward: weeklyTemplate.reward as Challenge['reward'],
        startDate: today.toISOString(),
        endDate: weekEnd.toISOString(),
        completed: false,
        claimed: false,
      };

      existingWeekly.push(weeklyChallenge);
    }

    this.challenges = [...dailyChallenges, ...existingWeekly];
    this.saveChallenges();
    
    return this.challenges;
  }

  getChallenges(): Challenge[] {
    // Filter out expired challenges
    const now = new Date();
    return this.challenges.filter(c => 
      new Date(c.endDate) > now || !c.claimed
    );
  }

  /**
   * Update challenge progress based on an action
   */
  updateChallengeProgress(
    action: Challenge['requirement']['action'],
    count: number = 1,
    subject?: string
  ): RewardNotification[] {
    const notifications: RewardNotification[] = [];

    this.challenges.forEach(challenge => {
      if (challenge.completed || challenge.claimed) return;
      if (challenge.requirement.action !== action) return;
      if (challenge.requirement.subject && challenge.requirement.subject !== subject) return;

      challenge.progress = Math.min(challenge.progress + count, challenge.requirement.count);

      if (challenge.progress >= challenge.requirement.count) {
        challenge.completed = true;

        const notification: RewardNotification = {
          id: `challenge_${challenge.id}_${Date.now()}`,
          type: 'challenge_complete',
          title: '🎯 Challenge Complete!',
          message: `You completed "${challenge.title}"! Claim your reward!`,
          reward: challenge.reward,
          timestamp: Date.now(),
          read: false,
        };

        notifications.push(notification);
        this.notifications.unshift(notification);
      }
    });

    this.saveChallenges();
    if (notifications.length > 0) {
      this.saveNotifications();
    }

    return notifications;
  }

  /**
   * Claim a completed challenge reward
   */
  claimChallenge(challengeId: string): Challenge | null {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (!challenge || !challenge.completed || challenge.claimed) {
      return null;
    }

    challenge.claimed = true;
    this.saveChallenges();
    
    return challenge;
  }

  // === Notifications ===

  private loadNotifications(): RewardNotification[] {
    const stored = localStorage.getItem('ks2_reward_notifications');
    if (stored) {
      // Keep only last 50 notifications
      const parsed = JSON.parse(stored);
      return parsed.slice(0, 50);
    }
    return [];
  }

  private saveNotifications(): void {
    localStorage.setItem('ks2_reward_notifications', JSON.stringify(
      this.notifications.slice(0, 50)
    ));
  }

  getNotifications(): RewardNotification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }
}

export const streakRewardsService = new StreakRewardsService();
