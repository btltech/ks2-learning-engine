// Fix: Import React types to resolve 'React' and 'JSX' namespace errors.
import type * as React from 'react';

export interface Subject {
  name: string;
  // Fix: Changed return type from JSX.Element to React.ReactElement to avoid relying on a global JSX namespace.
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  color: string;
  bgColor: string;
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string; // Optional pre-written explanation
}

export interface BankQuestion extends QuizQuestion {
  id: string;
  subject: string;
  topic: string;
  ageGroup: number[]; // e.g., [7, 8] or [9, 10, 11]
  difficulty: Difficulty;
  difficulty_score?: number;
}

export interface QuizResult extends QuizQuestion {
    userAnswer: string;
    isCorrect: boolean;
}

export interface Explanation {
    question: string;
    explanation: string;
}

export interface ChatMessage {
  id: string;
  sender: 'student' | 'mira';
  message: string;
  timestamp: number;
}

export type ProgressData = {
  [subjectName: string]: string[]; // e.g., { "Maths": ["Fractions", "Addition"] }
};

export enum ViewState {
  SUBJECT_SELECTION,
  TOPIC_SELECTION,
  LESSON,
  QUIZ,
  FEEDBACK,
}

export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

// --- Phase 2 & 3 Types ---

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon name
  earnedAt?: string; // ISO date string
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'student' | 'parent' | 'teacher';
  age: number; // Student age for content adaptation
  avatarConfig: AvatarConfig;
  totalPoints: number;
  unlockedItems: string[]; // IDs of unlocked items
  badges: Badge[];
  streak: number;
  lastLoginDate: string; // ISO date string
  mastery: {
    [subject: string]: {
      [topic: string]: number; // 0-100 score
    }
  };
  // New fields for enhanced learning
  timeSpentLearning: {
    [subject: string]: number; // Total minutes per subject
  };
  quizHistory: QuizSession[]; // Track quiz performance over time
  preferredDifficulty: Difficulty; // Auto-adjust difficulty based on performance
  weeklyGoal?: number; // Target minutes per week
  weeklyProgress?: WeeklyProgress; // Track weekly learning
  // Parent-specific fields
  parentId?: string; // Link child to parent
  childrenIds?: string[]; // Parent's children
  parentCode?: string; // Unique code for linking children
  childCode?: string; // Each student gets a code for parent linking
}

export interface QuizSession {
  id: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  score: number; // Percentage
  completedAt: string; // ISO date string
  timeSpent: number; // in seconds
}

export interface WeeklyProgress {
  week: string; // ISO week date
  minutesLearned: number;
  quizzesTaken: number;
  averageScore: number;
  goalMet: boolean;
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  parentId: string;
  createdAt: string;
  lastActive: string;
}

export interface AvatarConfig {
  color: string;
  accessory?: string; // e.g., 'hat-cowboy', 'glasses-cool'
}

export interface StoreItem {
  id: string;
  name: string;
  type: 'color' | 'accessory' | 'background' | 'title' | 'effect';
  cost: number;
  value: string; // The actual CSS class or color code
  icon: string; // Emoji or icon name
  description?: string; // Item description
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  requiresAchievement?: string; // Achievement ID required to unlock
  isLimited?: boolean; // Limited time item
  previewColor?: string; // Actual hex color for preview
}

export interface ParentStats {
  totalTimeSpent: number; // in minutes
  quizzesTaken: number;
  averageScore: number;
  strongestSubject: string;
  weakestSubject: string;
  recentActivity: {
    date: string;
    activity: string;
    score?: number;
  }[];
}

export type ActivityType = 'quiz_completed' | 'lesson_started' | 'badge_earned' | 'streak_updated' | 'topic_mastered';

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  subject?: string;
  topic?: string;
  score?: number;
  description: string;
  timestamp: Date;
  points?: number;
}

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}
