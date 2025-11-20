import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Badge } from '../types';

interface UserContextType {
  user: UserProfile | null;
  login: (name: string, role: UserProfile['role'], age?: number) => void;
  logout: () => void;
  setUser: (user: UserProfile) => void;
  updateAge: (age: number) => void;
  addPoints: (amount: number) => void;
  updateMastery: (subject: string, topic: string, score: number) => void;
  checkStreak: () => void;
  settings: {
    aiFallbackEnabled: boolean;
    adaptiveChallengeEnabled: boolean;
  };
  updateSettings: (settings: Partial<{ aiFallbackEnabled: boolean; adaptiveChallengeEnabled: boolean }>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const AVAILABLE_BADGES: Badge[] = [
  { id: 'first-steps', name: 'First Steps', description: 'Complete your first quiz', icon: '🏁' },
  { id: 'point-collector', name: 'Point Collector', description: 'Earn 100 points', icon: '💰' },
  { id: 'streak-master', name: 'Streak Master', description: 'Reach a 3-day streak', icon: '🔥' },
  { id: 'math-whiz', name: 'Math Whiz', description: 'Score over 80% in a Math topic', icon: '➗' },
  { id: 'language-learner', name: 'Polyglot', description: 'Complete a Language lesson', icon: '🌍' },
];

const INITIAL_USER: UserProfile = {
  id: 'user-1',
  name: 'Student',
  role: 'student',
  age: 9, // Default age
  avatarConfig: { color: '#4F46E5' },
  totalPoints: 0,
  unlockedItems: [],
  badges: [],
  streak: 0,
  lastLoginDate: new Date().toISOString(),
  mastery: {}
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState({
    aiFallbackEnabled: true,
    adaptiveChallengeEnabled: true,
  });

  // Load from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ks2_user');
    const savedSettings = localStorage.getItem('ks2_settings');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Migration: Ensure badges array exists for legacy users
      if (!parsedUser.badges) {
        parsedUser.badges = [];
      }
      setUser(parsedUser);
    } else {
      // For demo purposes, auto-login a default user if none exists
      // In a real app, we'd start with null and show a login screen
      setUser(INITIAL_USER);
    }

    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      } catch {
        // ignore settings parse errors
      }
    }
  }, []);

  // Save to local storage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('ks2_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ks2_settings', JSON.stringify(settings));
  }, [settings]);

  const login = (name: string, role: UserProfile['role'], age: number = 9) => {
    const newUser: UserProfile = {
      ...INITIAL_USER,
      name,
      role,
      age,
      lastLoginDate: new Date().toISOString()
    };
    setUser(newUser);
  };

  const setUserProfile = (userProfile: UserProfile) => {
    setUser(userProfile);
  };

  const updateAge = (age: number) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, age } : null);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ks2_user');
  };

  const addPoints = (amount: number) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, totalPoints: prev.totalPoints + amount } : null);
  };

  const updateMastery = (subject: string, topic: string, score: number) => {
    if (!user) return;
    
    setUser(prev => {
      if (!prev) return null;
      
      const currentSubjectMastery = prev.mastery[subject] || {};
      // Simple moving average for mastery or just replace? 
      // Let's do a weighted average: 70% old, 30% new to smooth it out
      const oldScore = currentSubjectMastery[topic] || 0;
      const newMasteryScore = oldScore === 0 ? score : Math.round((oldScore * 0.7) + (score * 0.3));

      return {
        ...prev,
        mastery: {
          ...prev.mastery,
          [subject]: {
            ...currentSubjectMastery,
            [topic]: newMasteryScore
          }
        }
      };
    });
  };

  const checkStreak = () => {
    if (!user) return;

    const today = new Date();
    const lastLogin = new Date(user.lastLoginDate);
    
    // Reset time part to compare dates only
    today.setHours(0, 0, 0, 0);
    lastLogin.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      setUser(prev => prev ? { 
        ...prev, 
        streak: prev.streak + 1, 
        lastLoginDate: new Date().toISOString() 
      } : null);
    } else if (diffDays > 1) {
      // Missed a day (or more), reset streak
      setUser(prev => prev ? { 
        ...prev, 
        streak: 1, // Reset to 1 for today
        lastLoginDate: new Date().toISOString() 
      } : null);
    } else {
      // Same day, just update login time
      setUser(prev => prev ? { 
        ...prev, 
        lastLoginDate: new Date().toISOString() 
      } : null);
    }
  };

  const checkForNewBadges = (currentUser: UserProfile) => {
    const newBadges: Badge[] = [];
    // Ensure badges array exists
    const currentBadges = currentUser.badges || [];
    const earnedBadgeIds = new Set(currentBadges.map(b => b.id));

    // Helper to find badge
    const getBadge = (id: string) => AVAILABLE_BADGES.find(b => b.id === id)!;

    // 1. First Steps: Complete first quiz (totalPoints > 0)
    if (!earnedBadgeIds.has('first-steps') && currentUser.totalPoints > 0) {
       newBadges.push({ ...getBadge('first-steps'), earnedAt: new Date().toISOString() });
    }

    // 2. Point Collector: Earn 100 points
    if (!earnedBadgeIds.has('point-collector') && currentUser.totalPoints >= 100) {
       newBadges.push({ ...getBadge('point-collector'), earnedAt: new Date().toISOString() });
    }

    // 3. Streak Master: 3-day streak
    if (!earnedBadgeIds.has('streak-master') && currentUser.streak >= 3) {
       newBadges.push({ ...getBadge('streak-master'), earnedAt: new Date().toISOString() });
    }

    // 4. Math Whiz: Score > 80 in Math
    if (!earnedBadgeIds.has('math-whiz')) {
        const mathMastery = currentUser.mastery['Maths'];
        if (mathMastery && Object.values(mathMastery).some(score => score >= 80)) {
            newBadges.push({ ...getBadge('math-whiz'), earnedAt: new Date().toISOString() });
        }
    }

    // 5. Polyglot: Complete a language lesson
    if (!earnedBadgeIds.has('language-learner')) {
         const languages = ['French', 'Spanish', 'German', 'Japanese', 'Romanian', 'Yoruba'];
         const hasLanguageMastery = languages.some(lang => currentUser.mastery[lang]);
         if (hasLanguageMastery) {
             newBadges.push({ ...getBadge('language-learner'), earnedAt: new Date().toISOString() });
         }
    }

    if (newBadges.length > 0) {
      setUser(prev => prev ? { ...prev, badges: [...(prev.badges || []), ...newBadges] } : null);
      // Ideally, we would trigger a notification here
      alert(`🎉 You earned new badges: ${newBadges.map(b => b.name).join(', ')}!`);
    }
  };

  // Wrap state updates to check for badges
  useEffect(() => {
    if (user) {
      checkForNewBadges(user);
    }
  }, [user?.totalPoints, user?.streak, JSON.stringify(user?.mastery)]);

  const updateSettings = (partial: Partial<{ aiFallbackEnabled: boolean; adaptiveChallengeEnabled: boolean }>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  return (
    <UserContext.Provider value={{ user, login, logout, setUser: setUserProfile, updateAge, addPoints, updateMastery, checkStreak, settings, updateSettings }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
