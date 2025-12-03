import { UserProfile, ParentStats, StoreItem, Difficulty } from '../types';
import { avatarCustomizationService } from './avatarCustomizationService';

// Default user template for new account creation
const DEFAULT_USER_TEMPLATE: UserProfile = {
  id: 'user-123',
  name: '',
  role: 'student',
  age: 9,
  totalPoints: 0,
  avatarConfig: {
    color: 'bg-blue-500',
  },
  unlockedItems: ['color-blue'],
  badges: [],
  streak: 0,
  lastLoginDate: new Date().toISOString(),
  mastery: {},
  timeSpentLearning: {},
  quizHistory: [],
  preferredDifficulty: Difficulty.Medium
};

const STORAGE_KEY = 'ks2_user'; // Match UserContext storage key

// Map store item IDs to avatar item IDs
const mapStoreToAvatarId = (storeItemId: string): string | null => {
  const mapping: Record<string, string> = {
    // Colors
    'color-blue': 'color_blue',
    'color-green': 'color_green',
    'color-purple': 'color_purple',
    'color-orange': 'color_orange',
    'color-pink': 'color_pink',
    'color-gold': 'color_gold',
    'color-rainbow': 'color_rainbow',
    // Accessories
    'acc-glasses': 'acc_glasses',
    'acc-sunglasses': 'acc_sunglasses',
    'acc-monocle': 'acc_monocle',
    'acc-bow': 'acc_bowtie',
    'acc-crown': 'hat_crown',
    'acc-wizard-hat': 'hat_wizard',
    'acc-party-hat': 'hat_party',
    'acc-viking': 'hat_viking',
    'acc-trophy': 'acc_trophy',
    'acc-medal': 'acc_medal',
    // Effects
    'effect-sparkle': 'effect_sparkle',
    'effect-fire': 'effect_fire',
    'effect-lightning': 'effect_lightning',
    'effect-rainbow-trail': 'effect_confetti',
    // Backgrounds
    'bg-stars': 'bg_stars',
    'bg-forest': 'bg_forest',
    'bg-ocean': 'bg_ocean',
    'bg-space': 'bg_space',
    'bg-rainbow': 'bg_rainbow',
    'bg-galaxy': 'bg_galaxy',
  };
  return mapping[storeItemId] || null;
};

export const authService = {
  // Create new user account
  login: async (name: string, role: 'student' | 'parent', age?: number): Promise<UserProfile> => {
    // In a real app, this would call an API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a new user profile
        const newUser = { 
          ...DEFAULT_USER_TEMPLATE, 
          id: `user-${Date.now()}`, // Generate unique ID
          name, 
          role, 
          age: age || 9,
          lastLoginDate: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        resolve(newUser);
      }, 500); // Short delay for UX
    });
  },

  // Get current user
  getCurrentUser: (): UserProfile | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Update user profile (e.g. after buying items)
  updateUser: (updates: Partial<UserProfile>): UserProfile => {
    const current = authService.getCurrentUser();
    if (!current) throw new Error('No user logged in');

    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Logout
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  purchaseItem: async (userId: string, item: StoreItem): Promise<UserProfile> => {
    const user = authService.getCurrentUser();
    if (!user || user.id !== userId) throw new Error('User not found');
    
    if (user.totalPoints < item.cost) throw new Error('Not enough points');
    if (user.unlockedItems.includes(item.id)) throw new Error('Item already owned');

    const updates: Partial<UserProfile> = {
      totalPoints: user.totalPoints - item.cost,
      unlockedItems: [...user.unlockedItems, item.id]
    };

    // Also sync to avatar customization service
    avatarCustomizationService.syncWithStorePurchases([...user.unlockedItems, item.id]);

    return authService.updateUser(updates);
  },

  equipItem: async (userId: string, item: StoreItem): Promise<UserProfile> => {
    const user = authService.getCurrentUser();
    if (!user || user.id !== userId) throw new Error('User not found');

    const newAvatarConfig = { ...user.avatarConfig };
    if (item.type === 'color') {
      newAvatarConfig.color = item.value;
    } else if (item.type === 'accessory') {
      newAvatarConfig.accessory = item.value;
    }

    // Also equip in avatar customization service for proper MiRa display
    // Map store item types to avatar categories
    const avatarItemId = mapStoreToAvatarId(item.id);
    if (avatarItemId) {
      avatarCustomizationService.equipItem(avatarItemId);
    }

    return authService.updateUser({ avatarConfig: newAvatarConfig });
  },

  // Get real parent stats from stored user data
  getParentStats: (): ParentStats => {
    const user = authService.getCurrentUser();
    if (!user) {
      return {
        totalTimeSpent: 0,
        quizzesTaken: 0,
        averageScore: 0,
        strongestSubject: '',
        weakestSubject: '',
        recentActivity: []
      };
    }

    // Calculate stats from real user data
    const quizHistory = user.quizHistory || [];
    const totalTimeSpent = Object.values(user.timeSpentLearning || {}).reduce((sum, time) => sum + time, 0);
    const quizzesTaken = quizHistory.length;
    const averageScore = quizzesTaken > 0 
      ? Math.round(quizHistory.reduce((sum, q) => sum + q.score, 0) / quizzesTaken)
      : 0;
    
    // Find strongest and weakest subjects from mastery
    const mastery = user.mastery || {};
    const subjects = Object.entries(mastery);
    let strongestSubject = '';
    let weakestSubject = '';
    
    if (subjects.length > 0) {
      const sorted = subjects.sort((a, b) => {
        const avgA = Object.values(a[1] || {}).reduce((s, v) => s + v, 0) / Math.max(Object.keys(a[1] || {}).length, 1);
        const avgB = Object.values(b[1] || {}).reduce((s, v) => s + v, 0) / Math.max(Object.keys(b[1] || {}).length, 1);
        return avgB - avgA;
      });
      strongestSubject = sorted[0]?.[0] || '';
      weakestSubject = sorted[sorted.length - 1]?.[0] || '';
    }

    // Format recent activity from quiz history
    const recentActivity = quizHistory.slice(-5).reverse().map((quiz) => {
      const date = new Date(quiz.completedAt);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      const dateStr = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
      
      return {
        date: dateStr,
        activity: `Completed ${quiz.topic} Quiz`,
        score: quiz.score
      };
    });

    return {
      totalTimeSpent,
      quizzesTaken,
      averageScore,
      strongestSubject,
      weakestSubject,
      recentActivity
    };
  }
};
