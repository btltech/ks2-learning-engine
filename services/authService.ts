import { UserProfile, ParentStats, StoreItem, Difficulty } from '../types';

// Mock user data
const MOCK_USER: UserProfile = {
  id: 'user-123',
  name: 'Alex',
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

export const authService = {
  // Simulate login
  login: async (name: string, role: 'student' | 'parent', age?: number): Promise<UserProfile> => {
    // In a real app, this would call an API
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          resolve(JSON.parse(stored));
          return;
        }

        const newUser = { ...MOCK_USER, name, role, age: age || 9 };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        resolve(newUser);
      }, 800); // Fake network delay
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

    return authService.updateUser({ avatarConfig: newAvatarConfig });
  },

  // Mock Parent Stats
  getParentStats: (): ParentStats => {
    return {
      totalTimeSpent: 145,
      quizzesTaken: 12,
      averageScore: 85,
      strongestSubject: 'Maths',
      weakestSubject: 'History',
      recentActivity: [
        { date: 'Today', activity: 'Completed Fractions Quiz', score: 90 },
        { date: 'Yesterday', activity: 'Read Ancient Egypt Lesson' },
        { date: '2 days ago', activity: 'Completed Grammar Quiz', score: 80 },
      ]
    };
  }
};
