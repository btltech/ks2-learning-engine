import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Badge, Difficulty, QuizSession, WeeklyProgress } from '../types';
import { leaderboardService } from '../services/leaderboardService';

interface UserContextType {
  user: UserProfile | null;
  login: (name: string, role: UserProfile['role'], age?: number) => void;
  logout: () => void;
  setUser: (user: UserProfile) => void;
  updateAge: (age: number) => void;
  addPoints: (amount: number) => void;
  updateMastery: (subject: string, topic: string, score: number) => void;
  checkStreak: () => void;
  recordQuizSession: (session: QuizSession) => void;
  addTimeSpent: (subject: string, minutes: number) => void;
  updateWeeklyProgress: () => WeeklyProgress | null;
  getPerformanceTrends: (subject?: string) => { avgScore: number; trend: 'improving' | 'stable' | 'declining' };
  suggestNextDifficulty: (subject: string, topic: string) => Difficulty;
  settings: {
    aiFallbackEnabled: boolean;
    adaptiveChallengeEnabled: boolean;
  };
  updateSettings: (settings: Partial<{ aiFallbackEnabled: boolean; adaptiveChallengeEnabled: boolean }>) => void;
  // Multi-child support
  selectedChildId: string | null;
  currentChild: UserProfile | null;
  linkedChildren: UserProfile[];
  selectChild: (childId: string) => void;
  getChildData: (childId: string) => UserProfile | null;
  registerChild: (childProfile: UserProfile) => void;
  linkChildToParent: (parentCode: string, childId: string) => boolean;
  generateParentCode: () => string;
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
  mastery: {},
  timeSpentLearning: {},
  quizHistory: [],
  preferredDifficulty: Difficulty.Medium,
  weeklyGoal: 180, // 3 hours per week
  weeklyProgress: {
    week: new Date().toISOString().split('T')[0],
    minutesLearned: 0,
    quizzesTaken: 0,
    averageScore: 0,
    goalMet: false
  }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [linkedChildren, setLinkedChildren] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState({
    aiFallbackEnabled: true,
    adaptiveChallengeEnabled: true,
  });

  // Migrate legacy user data to include new fields
  const migrateUserData = (user: any): UserProfile => {
    return {
      ...user,
      badges: user.badges || [],
      timeSpentLearning: user.timeSpentLearning || {},
      quizHistory: user.quizHistory || [],
      preferredDifficulty: user.preferredDifficulty || Difficulty.Medium,
      weeklyGoal: user.weeklyGoal || 180,
      weeklyProgress: user.weeklyProgress || {
        week: new Date().toISOString().split('T')[0],
        minutesLearned: 0,
        quizzesTaken: 0,
        averageScore: 0,
        goalMet: false
      }
    };
  };

  // Load from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ks2_user');
    const savedSettings = localStorage.getItem('ks2_settings');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Migration: Ensure all fields exist for legacy users
      setUser(migrateUserData(parsedUser));
    } 
    // Removed auto-login for default user to ensure Login page is shown
    
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
      // Sync to global leaderboard
      leaderboardService.submitScore(user);
      
      // Load linked children for parent users
      if (user.role === 'parent' && user.childrenIds && user.childrenIds.length > 0) {
        const children: UserProfile[] = [];
        user.childrenIds.forEach(childId => {
          const childData = localStorage.getItem(`ks2_child_${childId}`);
          if (childData) {
            children.push(JSON.parse(childData));
          }
        });
        setLinkedChildren(children);
        // Auto-select first child if none selected
        if (!selectedChildId && children.length > 0) {
          setSelectedChildId(children[0].id);
        }
      } else {
        setLinkedChildren([]);
      }
    }
  }, [user]);

  // Compute current child from selectedChildId
  const currentChild = linkedChildren.find(c => c.id === selectedChildId) || null;

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
      // Let's do a weighted average: 50% old, 50% new to make progress feel faster
      const oldScore = currentSubjectMastery[topic] || 0;
      const newMasteryScore = oldScore === 0 ? score : Math.round((oldScore * 0.5) + (score * 0.5));

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

  // Record quiz session for learning analytics
  const recordQuizSession = (session: QuizSession) => {
    if (!user || !user.quizHistory) return;
    
    setUser(prev => {
      if (!prev || !prev.quizHistory) return prev;
      
      const updatedHistory = [...prev.quizHistory, session];
      
      // Auto-adjust difficulty based on performance
      let newDifficulty = prev.preferredDifficulty || Difficulty.Medium;
      if (session.score < 50) {
        newDifficulty = Difficulty.Easy;
      } else if (session.score >= 85) {
        newDifficulty = Difficulty.Hard;
      }
      
      return {
        ...prev,
        quizHistory: updatedHistory,
        preferredDifficulty: newDifficulty
      };
    });
  };

  // Track time spent learning per subject
  const addTimeSpent = (subject: string, minutes: number) => {
    if (!user || !user.timeSpentLearning) return;
    
    setUser(prev => {
      if (!prev || !prev.timeSpentLearning) return prev;
      
      const currentTime = prev.timeSpentLearning[subject] || 0;
      
      return {
        ...prev,
        timeSpentLearning: {
          ...prev.timeSpentLearning,
          [subject]: currentTime + minutes
        }
      };
    });
  };

  // Calculate weekly progress
  const updateWeeklyProgress = (): WeeklyProgress | null => {
    if (!user || !user.quizHistory) return null;
    
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    
    const weekQuizzes = user.quizHistory.filter(quiz => {
      const quizDate = new Date(quiz.completedAt);
      return quizDate >= weekStart;
    });
    
    const weekMinutes = weekQuizzes.reduce((sum, q) => sum + (q.timeSpent / 60), 0);
    const avgScore = weekQuizzes.length > 0
      ? Math.round(weekQuizzes.reduce((sum, q) => sum + q.score, 0) / weekQuizzes.length)
      : 0;
    
    const goal = user.weeklyGoal || 180;
    const goalMet = weekMinutes >= goal;
    
    const weekProgress: WeeklyProgress = {
      week: weekStart.toISOString().split('T')[0],
      minutesLearned: Math.round(weekMinutes),
      quizzesTaken: weekQuizzes.length,
      averageScore: avgScore,
      goalMet
    };
    
    setUser(prev => prev ? { ...prev, weeklyProgress: weekProgress } : null);
    
    return weekProgress;
  };

  // Get performance trends
  const getPerformanceTrends = (subject?: string) => {
    if (!user || !user.quizHistory) {
      return { avgScore: 0, trend: 'stable' as const };
    }
    
    const relevantQuizzes = subject
      ? user.quizHistory.filter(q => q.subject === subject)
      : user.quizHistory;
    
    if (relevantQuizzes.length === 0) {
      return { avgScore: 0, trend: 'stable' as const };
    }
    
    // Calculate trend from last 3 quizzes
    const recentQuizzes = relevantQuizzes.slice(-3);
    const olderQuizzes = relevantQuizzes.slice(-6, -3);
    
    const recentAvg = recentQuizzes.reduce((sum, q) => sum + q.score, 0) / recentQuizzes.length;
    const olderAvg = olderQuizzes.length > 0
      ? olderQuizzes.reduce((sum, q) => sum + q.score, 0) / olderQuizzes.length
      : recentAvg;
    
    const avgScore = Math.round(recentAvg);
    const diff = recentAvg - olderAvg;
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (diff > 5) trend = 'improving';
    if (diff < -5) trend = 'declining';
    
    return { avgScore, trend };
  };

  // Suggest next difficulty based on recent performance
  const suggestNextDifficulty = (subject: string, topic: string): Difficulty => {
    if (!user || !user.quizHistory) return Difficulty.Medium;
    
    const recentQuizzes = user.quizHistory
      .filter(q => q.subject === subject && q.topic === topic)
      .slice(-3);
    
    if (recentQuizzes.length === 0) return user.preferredDifficulty;
    
    const avgScore = recentQuizzes.reduce((sum, q) => sum + q.score, 0) / recentQuizzes.length;
    
    if (avgScore >= 85) return Difficulty.Hard;
    if (avgScore < 50) return Difficulty.Easy;
    return Difficulty.Medium;
  };

  // Multi-child support functions
  const generateParentCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const selectChild = (childId: string) => {
    if (user?.role === 'parent' && user.childrenIds?.includes(childId)) {
      setSelectedChildId(childId);
      // Load the child's data if needed
      const childData = localStorage.getItem(`ks2_child_${childId}`);
      if (childData) {
        // In a real app, we'd load the child's data for monitoring
      }
    }
  };

  const getChildData = (childId: string): UserProfile | null => {
    const childData = localStorage.getItem(`ks2_child_${childId}`);
    return childData ? JSON.parse(childData) : null;
  };

  const registerChild = (childProfile: UserProfile) => {
    if (user?.role === 'parent') {
      // Save child profile to local storage
      localStorage.setItem(`ks2_child_${childProfile.id}`, JSON.stringify(childProfile));
      
      // Link to parent
      setUser(prev => {
        if (!prev) return null;
        const currentChildren = prev.childrenIds || [];
        if (!currentChildren.includes(childProfile.id)) {
          return {
            ...prev,
            childrenIds: [...currentChildren, childProfile.id]
          };
        }
        return prev;
      });
    }
  };

  const linkChildToParent = (parentCode: string, childId: string): boolean => {
    // In a real app, this would validate the parent code
    // For now, we'll just check if it's a valid format
    if (!parentCode || parentCode.length < 4) return false;

    const childData = getChildData(childId);
    if (!childData) return false;

    // Link child to parent
    if (user?.role === 'parent') {
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          childrenIds: [...(prev.childrenIds || []), childId],
          parentCode: prev.parentCode || generateParentCode()
        };
      });

      // Update child profile with parent link
      const updatedChildData = {
        ...childData,
        parentId: user.id
      };
      localStorage.setItem(`ks2_child_${childId}`, JSON.stringify(updatedChildData));
      
      return true;
    }
    return false;
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      login, 
      logout, 
      setUser: setUserProfile, 
      updateAge, 
      addPoints, 
      updateMastery, 
      checkStreak,
      recordQuizSession,
      addTimeSpent,
      updateWeeklyProgress,
      getPerformanceTrends,
      suggestNextDifficulty,
      settings, 
      updateSettings,
      // Multi-child functions
      selectedChildId,
      currentChild,
      linkedChildren,
      selectChild,
      getChildData,
      registerChild,
      linkChildToParent,
      generateParentCode
    }}>
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
