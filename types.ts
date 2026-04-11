// Fix: Import React types to resolve 'React' and 'JSX' namespace errors.
import type * as React from 'react';

export interface Subject {
  name: string;
  // Fix: Changed return type from JSX.Element to React.ReactElement to avoid relying on a global JSX namespace.
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  color: string;
  bgColor: string;
}

// Question types for variety
export enum QuestionType {
  MultipleChoice = 'multiple-choice',
  TrueFalse = 'true-false',
  FillInBlank = 'fill-in-blank',
  Ordering = 'ordering',
  Drawing = 'drawing',
  Matching = 'matching',
  DragAndDrop = 'drag-and-drop',
}

// Bloom's Taxonomy cognitive levels
export enum CognitiveLevel {
  Remember = 'remember',      // Recall facts
  Understand = 'understand',  // Explain ideas
  Apply = 'apply',            // Use in new situations
  Analyze = 'analyze',        // Draw connections
}

// Matching pair for matching questions
export interface MatchingPair {
  left: string;
  right: string;
}

// Drag and drop item
export interface DragDropItem {
  id: string;
  content: string;
  correctZoneId: string;
}

// Drag and drop zone
export interface DragDropZone {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string; // Optional pre-written explanation
  questionType?: QuestionType; // Type of question (defaults to multiple-choice)
  cognitiveLevel?: CognitiveLevel; // Bloom's taxonomy level
  // For fill-in-blank questions
  blankPosition?: number; // Index where blank should appear
  acceptableAnswers?: string[]; // Alternative correct answers
  // For ordering questions
  correctOrder?: string[]; // Correct sequence of items
  // For matching questions
  matchingPairs?: MatchingPair[]; // Pairs to match
  // For drag-and-drop questions
  dragItems?: string[]; // Items to drag
  dropZones?: string[]; // Target zones with correct answers
}

// Year groups in KS2
export enum YearGroup {
  Year3 = 3,
  Year4 = 4,
  Year5 = 5,
  Year6 = 6,
}

// National Curriculum objective reference
export interface NCObjective {
  code: string;           // e.g., "MA3-NPV-1" (Maths Year 3 Number Place Value objective 1)
  description: string;    // Full objective text from DfE
  strand: string;         // e.g., "Number - Place Value"
  subject: string;        // e.g., "Maths"
  yearGroup: YearGroup;   // Which year this objective belongs to
  isStatutory: boolean;   // Whether this is a statutory requirement
}

// SATs question metadata
export interface SATsMetadata {
  paperType: 'arithmetic' | 'reasoning1' | 'reasoning2' | 'reading' | 'spag';
  marks: number;          // Marks available for this question
  sampleYear?: number;    // If from a past paper, which year
  questionStyle: 'standard' | 'multi-step' | 'explain' | 'show-working';
}

export interface BankQuestion extends QuizQuestion {
  id: string;
  subject: string;
  topic: string;
  ageGroup: number[]; // e.g., [7, 8] or [9, 10, 11]
  difficulty: Difficulty;
  difficulty_score?: number;
  // NEW: Year group and NC objective alignment
  yearGroup?: YearGroup;           // Specific year group (3, 4, 5, 6)
  ncObjectives?: string[];         // Array of NC objective codes this question covers
  ncObjectiveRefs?: NCObjective[]; // Full objective references (populated at runtime)
  // NEW: SATs-specific metadata
  satsMetadata?: SATsMetadata;     // For Year 6 SATs practice questions
  isSATsStyle?: boolean;           // Whether this follows SATs format
  // Performance tracking
  timesShown?: number;
  timesCorrect?: number;
  effectivenessScore?: number; // Calculated: correct/shown ratio
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
  role: 'student' | 'parent' | 'teacher' | 'admin';
  /**
   * Multi-role support (RBAC). When absent, treat `role` as the single role.
   * Keep `role` for backward compatibility and as the primary role.
   */
  roles?: Array<'student' | 'parent' | 'teacher' | 'admin'>;
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
  // Optional analytics fields
  totalQuestions?: number;
  correctAnswers?: number;
  xpEarned?: number;
  date?: string; // ISO date string for analytics
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

// Curriculum coverage tracking
export interface CurriculumCoverage {
  subject: string;
  yearGroup: YearGroup;
  strand: string;
  totalObjectives: number;
  coveredObjectives: number;
  masteredObjectives: number;  // Student has achieved 80%+ on related questions
  objectiveDetails: {
    code: string;
    description: string;
    status: 'not-started' | 'in-progress' | 'mastered';
    questionsAvailable: number;
    questionsAttempted: number;
    accuracy: number;
  }[];
}

// SATs practice session
export interface SATsSession {
  id: string;
  paperType: 'arithmetic' | 'reasoning1' | 'reasoning2' | 'reading' | 'spag';
  startedAt: string;
  completedAt?: string;
  timeAllowed: number;      // in minutes
  timeUsed: number;         // in seconds
  questions: BankQuestion[];
  answers: { questionId: string; answer: string; isCorrect: boolean; marksAwarded: number }[];
  totalMarks: number;
  marksAchieved: number;
  scaledScore?: number;     // If we have threshold data
  grade?: 'working-towards' | 'expected' | 'greater-depth';
}

// Parent/Teacher dashboard data
export interface DashboardData {
  student: {
    id: string;
    name: string;
    yearGroup: YearGroup;
    age: number;
  };
  overallProgress: {
    curriculumCoverage: number;  // Percentage of NC objectives touched
    masteryLevel: number;       // Percentage of objectives mastered
    averageScore: number;
    totalTimeSpent: number;     // in minutes
    streak: number;
  };
  subjectBreakdown: {
    subject: string;
    coverage: number;
    mastery: number;
    recentScore: number;
    trend: 'improving' | 'stable' | 'declining';
  }[];
  recentActivity: Activity[];
  satsReadiness?: {
    predictedGrade: 'working-towards' | 'expected' | 'greater-depth';
    arithmeticScore: number;
    reasoningScore: number;
    readingScore: number;
    spagScore: number;
    areasToImprove: string[];
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    subject: string;
    topic: string;
    reason: string;
  }[];
}
