/**
 * Question Performance Tracking Service
 * Tracks how well questions perform based on student answers
 * and provides filtering for poorly-performing questions
 * 
 * Now syncs to Firebase for centralized analytics!
 */

import { db } from './firebase';
import { doc, updateDoc, increment, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const STORAGE_KEY = 'ks2_question_performance';
const MIN_SAMPLES_FOR_SCORING = 3; // Minimum times shown before calculating effectiveness
const POOR_PERFORMANCE_THRESHOLD = 0.15; // Questions with < 15% correct rate are likely poorly worded
const HIGH_PERFORMANCE_THRESHOLD = 0.95; // Questions with > 95% correct are too easy

export interface QuestionPerformanceData {
  questionId: string;
  questionHash: string; // Hash of question text for deduplication
  timesShown: number;
  timesCorrect: number;
  averageTimeToAnswer?: number; // in seconds
  lastShownAt: number;
  subject: string;
  topic: string;
  difficulty: string;
}

interface PerformanceStore {
  [questionId: string]: QuestionPerformanceData;
}

// Simple hash function for question text similarity
const hashQuestion = (questionText: string): string => {
  const normalized = questionText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
};

// Calculate similarity between two question texts (0-1 scale)
export const calculateSimilarity = (text1: string, text2: string): number => {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const s1 = normalize(text1);
  const s2 = normalize(text2);
  
  if (s1 === s2) return 1;
  
  // Use Jaccard similarity on word sets
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
};

// Get all performance data
const getPerformanceStore = (): PerformanceStore => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading question performance data:', error);
    return {};
  }
};

// Save performance data
const savePerformanceStore = (store: PerformanceStore): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error('Error saving question performance data:', error);
  }
};

// Record a question being answered
export const recordQuestionAttempt = (
  questionId: string,
  questionText: string,
  isCorrect: boolean,
  timeToAnswer: number | null,
  subject: string,
  topic: string,
  difficulty: string
): void => {
  const store = getPerformanceStore();
  
  const existing = store[questionId];
  const questionHash = hashQuestion(questionText);
  
  if (existing) {
    existing.timesShown++;
    if (isCorrect) existing.timesCorrect++;
    if (timeToAnswer !== null && existing.averageTimeToAnswer !== undefined) {
      // Running average
      existing.averageTimeToAnswer = 
        (existing.averageTimeToAnswer * (existing.timesShown - 1) + timeToAnswer) / existing.timesShown;
    } else if (timeToAnswer !== null) {
      existing.averageTimeToAnswer = timeToAnswer;
    }
    existing.lastShownAt = Date.now();
  } else {
    store[questionId] = {
      questionId,
      questionHash,
      timesShown: 1,
      timesCorrect: isCorrect ? 1 : 0,
      averageTimeToAnswer: timeToAnswer ?? undefined,
      lastShownAt: Date.now(),
      subject,
      topic,
      difficulty
    };
  }
  
  savePerformanceStore(store);
  
  // Sync to Firebase for centralized analytics
  syncPerformanceToFirebase(questionId, isCorrect, timeToAnswer);
};

// Sync performance data to Firebase (non-blocking)
const syncPerformanceToFirebase = async (
  questionId: string,
  isCorrect: boolean,
  timeToAnswer: number | null
): Promise<void> => {
  try {
    // Update the question document with performance stats
    const questionRef = doc(db, 'questions', questionId);
    const questionDoc = await getDoc(questionRef);
    
    if (questionDoc.exists()) {
      // Atomic increment for existing questions
      await updateDoc(questionRef, {
        'performance.timesShown': increment(1),
        'performance.timesCorrect': increment(isCorrect ? 1 : 0),
        'performance.lastAttemptAt': new Date(),
        ...(timeToAnswer !== null && {
          'performance.totalTimeSpent': increment(timeToAnswer)
        })
      });
    } else {
      // Question doesn't exist in Firebase (might be from static bank)
      // We'll track these in a separate collection
      const perfRef = doc(db, 'questionPerformance', questionId);
      const perfDoc = await getDoc(perfRef);
      
      if (perfDoc.exists()) {
        await updateDoc(perfRef, {
          timesShown: increment(1),
          timesCorrect: increment(isCorrect ? 1 : 0),
          lastAttemptAt: new Date(),
          ...(timeToAnswer !== null && {
            totalTimeSpent: increment(timeToAnswer)
          })
        });
      } else {
        await setDoc(perfRef, {
          questionId,
          timesShown: 1,
          timesCorrect: isCorrect ? 1 : 0,
          totalTimeSpent: timeToAnswer ?? 0,
          lastAttemptAt: new Date(),
          createdAt: new Date()
        });
      }
    }
  } catch (error) {
    // Silently fail - localStorage is the backup
    console.debug('Firebase performance sync skipped:', (error as Error).message);
  }
};

// Get poorly performing questions from Firebase (for admin/teacher dashboard)
export const getPoorlyPerformingQuestionsFromFirebase = async (
  subject?: string,
  minAttempts: number = 10
): Promise<Array<{
  id: string;
  question: string;
  correctRate: number;
  timesShown: number;
  subject: string;
  topic: string;
}>> => {
  try {
    let q = query(
      collection(db, 'questions'),
      where('performance.timesShown', '>=', minAttempts),
      orderBy('performance.timesShown', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(q);
    const results: Array<{
      id: string;
      question: string;
      correctRate: number;
      timesShown: number;
      subject: string;
      topic: string;
    }> = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const perf = data.performance || {};
      const timesShown = perf.timesShown || 0;
      const timesCorrect = perf.timesCorrect || 0;
      const correctRate = timesShown > 0 ? timesCorrect / timesShown : 0;
      
      // Filter by subject if specified
      if (subject && data.subject !== subject) return;
      
      // Only include poorly performing questions (< 15% or > 95%)
      if (correctRate < POOR_PERFORMANCE_THRESHOLD || correctRate > HIGH_PERFORMANCE_THRESHOLD) {
        results.push({
          id: doc.id,
          question: data.question,
          correctRate,
          timesShown,
          subject: data.subject,
          topic: data.topic
        });
      }
    });
    
    // Sort by correctRate (worst performing first)
    return results.sort((a, b) => a.correctRate - b.correctRate);
  } catch (error) {
    console.error('Error fetching poorly performing questions:', error);
    return [];
  }
};

// Get overall question bank stats from Firebase
export const getQuestionBankStats = async (): Promise<{
  totalQuestions: number;
  questionsWithPerformanceData: number;
  averageCorrectRate: number;
  poorlyPerformingCount: number;
  wellPerformingCount: number;
}> => {
  try {
    const snapshot = await getDocs(collection(db, 'questions'));
    
    let total = 0;
    let withPerf = 0;
    let totalCorrectRate = 0;
    let poorCount = 0;
    let goodCount = 0;
    
    snapshot.forEach((doc) => {
      total++;
      const data = doc.data();
      const perf = data.performance;
      
      if (perf && perf.timesShown >= MIN_SAMPLES_FOR_SCORING) {
        withPerf++;
        const rate = perf.timesCorrect / perf.timesShown;
        totalCorrectRate += rate;
        
        if (rate < POOR_PERFORMANCE_THRESHOLD || rate > HIGH_PERFORMANCE_THRESHOLD) {
          poorCount++;
        } else if (rate >= 0.3 && rate <= 0.8) {
          goodCount++;
        }
      }
    });
    
    return {
      totalQuestions: total,
      questionsWithPerformanceData: withPerf,
      averageCorrectRate: withPerf > 0 ? totalCorrectRate / withPerf : 0,
      poorlyPerformingCount: poorCount,
      wellPerformingCount: goodCount
    };
  } catch (error) {
    console.error('Error fetching question bank stats:', error);
    return {
      totalQuestions: 0,
      questionsWithPerformanceData: 0,
      averageCorrectRate: 0,
      poorlyPerformingCount: 0,
      wellPerformingCount: 0
    };
  }
};

// Record multiple question attempts (from a quiz)
export const recordQuizAttempts = (
  results: Array<{
    id?: string;
    question: string;
    isCorrect: boolean;
    timeToAnswer?: number;
  }>,
  subject: string,
  topic: string,
  difficulty: string
): void => {
  results.forEach(result => {
    const questionId = result.id || hashQuestion(result.question);
    recordQuestionAttempt(
      questionId,
      result.question,
      result.isCorrect,
      result.timeToAnswer ?? null,
      subject,
      topic,
      difficulty
    );
  });
};

// Get effectiveness score for a question (null if not enough data)
export const getQuestionEffectiveness = (questionId: string): number | null => {
  const store = getPerformanceStore();
  const data = store[questionId];
  
  if (!data || data.timesShown < MIN_SAMPLES_FOR_SCORING) {
    return null; // Not enough data
  }
  
  return data.timesCorrect / data.timesShown;
};

// Check if a question is performing poorly
export const isQuestionPoorlyPerforming = (questionId: string): boolean => {
  const effectiveness = getQuestionEffectiveness(questionId);
  if (effectiveness === null) return false;
  
  // Too easy or too hard questions are both "poorly performing" for learning
  return effectiveness < POOR_PERFORMANCE_THRESHOLD || effectiveness > HIGH_PERFORMANCE_THRESHOLD;
};

// Filter out poorly performing questions from a list
export const filterPoorlyPerformingQuestions = <T extends { id?: string; question: string }>(
  questions: T[]
): T[] => {
  return questions.filter(q => {
    const questionId = q.id || hashQuestion(q.question);
    return !isQuestionPoorlyPerforming(questionId);
  });
};

// Check if a question is similar to any in a list (for deduplication)
export const isSimilarToAny = (
  questionText: string,
  existingQuestions: string[],
  threshold: number = 0.7 // 70% similarity threshold
): boolean => {
  return existingQuestions.some(existing => 
    calculateSimilarity(questionText, existing) >= threshold
  );
};

// Filter questions that are too similar to existing ones
export const filterSimilarQuestions = <T extends { question: string }>(
  newQuestions: T[],
  existingQuestions: string[],
  threshold: number = 0.7
): T[] => {
  const filtered: T[] = [];
  const usedTexts = [...existingQuestions];
  
  for (const q of newQuestions) {
    if (!isSimilarToAny(q.question, usedTexts, threshold)) {
      filtered.push(q);
      usedTexts.push(q.question);
    }
  }
  
  return filtered;
};

// Get performance statistics for a subject/topic
export const getPerformanceStats = (
  subject?: string,
  topic?: string
): {
  totalQuestions: number;
  averageEffectiveness: number;
  poorlyPerformingCount: number;
  wellPerformingCount: number;
} => {
  const store = getPerformanceStore();
  const questions = Object.values(store).filter(q => 
    (!subject || q.subject === subject) &&
    (!topic || q.topic === topic)
  );
  
  const scoredQuestions = questions.filter(q => q.timesShown >= MIN_SAMPLES_FOR_SCORING);
  
  const avgEffectiveness = scoredQuestions.length > 0
    ? scoredQuestions.reduce((sum, q) => sum + (q.timesCorrect / q.timesShown), 0) / scoredQuestions.length
    : 0;
  
  const poorlyPerforming = scoredQuestions.filter(q => {
    const effectiveness = q.timesCorrect / q.timesShown;
    return effectiveness < POOR_PERFORMANCE_THRESHOLD || effectiveness > HIGH_PERFORMANCE_THRESHOLD;
  });
  
  const wellPerforming = scoredQuestions.filter(q => {
    const effectiveness = q.timesCorrect / q.timesShown;
    return effectiveness >= 0.3 && effectiveness <= 0.8; // Sweet spot
  });
  
  return {
    totalQuestions: questions.length,
    averageEffectiveness: avgEffectiveness,
    poorlyPerformingCount: poorlyPerforming.length,
    wellPerformingCount: wellPerforming.length
  };
};

// Clear all performance data (for testing/reset)
export const clearPerformanceData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Adaptive difficulty suggestion based on recent performance
export const suggestDifficultyAdjustment = (
  recentQuizScores: number[], // Last N quiz scores (0-100)
  currentDifficulty: string
): 'easier' | 'same' | 'harder' => {
  if (recentQuizScores.length < 3) return 'same';
  
  const recentAvg = recentQuizScores.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, recentQuizScores.length);
  
  // If consistently scoring > 85%, suggest harder
  if (recentAvg > 85) return 'harder';
  
  // If consistently scoring < 40%, suggest easier
  if (recentAvg < 40) return 'easier';
  
  return 'same';
};

// Get adjusted difficulty based on student history
export const getAdaptedDifficulty = (
  requestedDifficulty: string,
  studentQuizHistory: Array<{ score: number; difficulty: string }>
): string => {
  const recentScores = studentQuizHistory
    .filter(h => h.difficulty === requestedDifficulty)
    .slice(-5)
    .map(h => h.score);
  
  const suggestion = suggestDifficultyAdjustment(recentScores, requestedDifficulty);
  
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const currentIndex = difficulties.indexOf(requestedDifficulty);
  
  if (suggestion === 'harder' && currentIndex < difficulties.length - 1) {
    console.log(`Adapting difficulty: ${requestedDifficulty} → ${difficulties[currentIndex + 1]} (student performing well)`);
    return difficulties[currentIndex + 1];
  }
  
  if (suggestion === 'easier' && currentIndex > 0) {
    console.log(`Adapting difficulty: ${requestedDifficulty} → ${difficulties[currentIndex - 1]} (student needs support)`);
    return difficulties[currentIndex - 1];
  }
  
  return requestedDifficulty;
};
