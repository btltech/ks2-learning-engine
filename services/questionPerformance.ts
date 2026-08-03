/**
 * Question Performance Tracking Service
 * Tracks how well questions perform based on student answers
 * and provides filtering for poorly-performing questions
 * 
 * Now syncs to Firebase for centralized analytics!
 */

import { db } from './firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { normalizeCloudQuestion } from './cloudQuestionRepository';
import { getCloudSubjectAliases, getCloudTopicAliases } from '../data/questionTopicAliases';
import { CURATED_LANGUAGES, getCurriculumUnits } from '../data/curriculumSequences';

const STORAGE_KEY = 'ks2_question_performance';
const MIN_SAMPLES_FOR_SCORING = 3; // Minimum times shown before calculating effectiveness
const POOR_PERFORMANCE_THRESHOLD = 0.15; // Questions with < 15% correct rate are likely poorly worded
const HIGH_PERFORMANCE_THRESHOLD = 0.95; // Questions with > 95% correct are too easy
const ADMIN_STATS_CACHE_KEY = 'ks2_admin_question_bank_stats_v2';
const ADMIN_STATS_CACHE_MS = 6 * 60 * 60 * 1000;

interface QuestionBankStats {
  totalQuestions: number;
  displayableQuestions: number;
  publishedQuestions: number;
  questionsWithPerformanceData: number;
  questionsAttempted: number;
  totalAttempts: number;
  averageCorrectRate: number;
  poorlyPerformingCount: number;
  wellPerformingCount: number;
}

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
};

// Shared analytics are written through a trusted server endpoint. Firestore
// rules intentionally deny direct browser writes to the aggregate collection.
const syncQuizAttemptsToBackend = async (
  results: Array<{ id?: string; question: string; isCorrect: boolean; timeToAnswer?: number }>,
  subject: string,
  topic: string,
  difficulty: string,
): Promise<void> => {
  try {
    const user = getAuth().currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    const response = await fetch('/api/question-attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ attempts: results.slice(0, 20).map((result) => ({
        questionId: result.id || hashQuestion(result.question),
        question: result.question,
        isCorrect: result.isCorrect,
        timeToAnswer: result.timeToAnswer ?? null,
        subject,
        topic,
        difficulty,
      })) }),
    });
    if (!response.ok) throw new Error(`Question analytics endpoint returned ${response.status}`);
  } catch (error) {
    // Local analytics were already saved, so this never blocks a learner.
    console.warn('Unable to sync question performance:', error);
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
    const liveQuery = query(
      collection(db, 'questions'),
      where('performance.timesShown', '>=', minAttempts),
      orderBy('performance.timesShown', 'desc'),
      limit(100)
    );
    const aggregateQuery = query(
      collection(db, 'questionPerformance'),
      where('timesShown', '>=', minAttempts),
      orderBy('timesShown', 'desc'),
      limit(100)
    );
    const [snapshot, aggregateSnapshot] = await Promise.all([getDocs(liveQuery), getDocs(aggregateQuery)]);
    const combined = new Map<string, {
      id: string;
      question: string;
      timesShown: number;
      timesCorrect: number;
      subject: string;
      topic: string;
    }>();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const perf = data.performance || {};
      if (subject && data.subject !== subject) return;
      combined.set(doc.id, {
        id: doc.id,
        question: data.question || `Question ${doc.id}`,
        timesShown: Number(perf.timesShown) || 0,
        timesCorrect: Number(perf.timesCorrect) || 0,
        subject: data.subject || 'Unknown',
        topic: data.topic || 'Unknown',
      });
    });

    aggregateSnapshot.forEach((doc) => {
      const data = doc.data();
      if (subject && data.subject !== subject) return;
      const existing = combined.get(doc.id);
      combined.set(doc.id, {
        id: doc.id,
        question: data.question || existing?.question || `Question ${doc.id}`,
        timesShown: (Number(data.timesShown) || 0) + (existing?.timesShown || 0),
        timesCorrect: (Number(data.timesCorrect) || 0) + (existing?.timesCorrect || 0),
        subject: data.subject || existing?.subject || 'Unknown',
        topic: data.topic || existing?.topic || 'Unknown',
      });
    });
    
    return [...combined.values()]
      .map((entry) => ({
        id: entry.id,
        question: entry.question,
        correctRate: entry.timesShown > 0 ? entry.timesCorrect / entry.timesShown : 0,
        timesShown: entry.timesShown,
        subject: entry.subject,
        topic: entry.topic,
      }))
      .filter((entry) => entry.correctRate < POOR_PERFORMANCE_THRESHOLD || entry.correctRate > HIGH_PERFORMANCE_THRESHOLD)
      .sort((a, b) => a.correctRate - b.correctRate);
  } catch (error) {
    console.error('Error fetching poorly performing questions:', error);
    return [];
  }
};

// Get overall question bank stats from Firebase
export const getQuestionBankStats = async (): Promise<QuestionBankStats> => {
  try {
    const cached = typeof localStorage === 'undefined' ? null : localStorage.getItem(ADMIN_STATS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as { expiresAt?: number; stats?: QuestionBankStats };
      if (parsed.stats && Number(parsed.expiresAt) > Date.now()) return parsed.stats;
    }
  } catch {
    // A blocked/full browser store should not prevent fresh stats.
  }

  try {
    const [snapshot, staticPerformanceSnapshot] = await Promise.all([
      getDocs(collection(db, 'questions')),
      getDocs(collection(db, 'questionPerformance')),
    ]);

    const publishedLocations = [
      'Maths', 'English', 'Science', 'History', 'Geography', 'Art', 'Computing',
      'Music', 'PE', 'PSHE', 'D&T', 'Religious Education', ...CURATED_LANGUAGES,
    ].flatMap((subject) => [7, 8, 9, 10, 11].flatMap((age) =>
      getCurriculumUnits(subject, age).map((unit) => ({
        subject,
        bankTopic: unit.bankTopic,
        subjects: new Set(getCloudSubjectAliases(subject)),
        topics: new Set(getCloudTopicAliases(subject, unit.bankTopic)),
      })),
    ));
    
    let total = 0;
    let displayable = 0;
    let published = 0;
    const performanceByQuestion = new Map<string, { timesShown: number; timesCorrect: number }>();
    
    snapshot.forEach((doc) => {
      total++;
      const data = doc.data();
      const perf = data.performance;
      const rawSubject = String(data.subject || '').trim();
      const rawTopic = String(data.topic || '').trim();
      const location = publishedLocations.find((candidate) =>
        candidate.subjects.has(rawSubject) && candidate.topics.has(rawTopic)
      );
      if (normalizeCloudQuestion(doc.id, data, location?.subject || rawSubject, location?.bankTopic || rawTopic)) {
        displayable++;
        if (location) published++;
      }

      const timesShown = Number(perf?.timesShown) || 0;
      const timesCorrect = Number(perf?.timesCorrect) || 0;
      if (timesShown > 0) {
        performanceByQuestion.set(doc.id, { timesShown, timesCorrect });
      }
    });

    staticPerformanceSnapshot.forEach((performanceDoc) => {
      const data = performanceDoc.data();
      const timesShown = Number(data.timesShown) || 0;
      const timesCorrect = Number(data.timesCorrect) || 0;
      if (timesShown <= 0) return;
      const existing = performanceByQuestion.get(performanceDoc.id);
      performanceByQuestion.set(performanceDoc.id, {
        timesShown: timesShown + (existing?.timesShown || 0),
        timesCorrect: timesCorrect + (existing?.timesCorrect || 0),
      });
    });

    let withPerf = 0;
    let totalAttempts = 0;
    let totalCorrect = 0;
    let poorCount = 0;
    let goodCount = 0;
    performanceByQuestion.forEach(({ timesShown, timesCorrect }) => {
      totalAttempts += timesShown;
      totalCorrect += timesCorrect;
      if (timesShown < MIN_SAMPLES_FOR_SCORING) return;
      withPerf++;
      const rate = timesCorrect / timesShown;
      if (rate < POOR_PERFORMANCE_THRESHOLD || rate > HIGH_PERFORMANCE_THRESHOLD) poorCount++;
      else if (rate >= 0.3 && rate <= 0.8) goodCount++;
    });
    
    const stats: QuestionBankStats = {
      totalQuestions: total,
      displayableQuestions: displayable,
      publishedQuestions: published,
      questionsWithPerformanceData: withPerf,
      questionsAttempted: performanceByQuestion.size,
      totalAttempts,
      averageCorrectRate: totalAttempts > 0 ? totalCorrect / totalAttempts : 0,
      poorlyPerformingCount: poorCount,
      wellPerformingCount: goodCount
    };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(ADMIN_STATS_CACHE_KEY, JSON.stringify({
          expiresAt: Date.now() + ADMIN_STATS_CACHE_MS,
          stats,
        }));
      }
    } catch {
      // Stats still render when browser storage is unavailable.
    }
    return stats;
  } catch (error) {
    console.error('Error fetching question bank stats:', error);
    return {
      totalQuestions: 0,
      displayableQuestions: 0,
      publishedQuestions: 0,
      questionsWithPerformanceData: 0,
      questionsAttempted: 0,
      totalAttempts: 0,
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
  void syncQuizAttemptsToBackend(results, subject, topic, difficulty);
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
