/**
 * Cloud Bank Service
 * Monitors and reports on AI-generated questions saved to Firebase
 */

import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface CloudBankStats {
  totalQuestions: number;
  bySubject: Record<string, number>;
  byDifficulty: Record<string, number>;
  byAgeGroup: Record<number, number>;
  oldestQuestion: Date | null;
  newestQuestion: Date | null;
  averagePerDay: number;
}

const CLOUD_BANK_STATS_CACHE_KEY = 'ks2_cloud_bank_stats_v2';
// This is an admin-only, full-collection report. Keep it cached for a day so
// opening the dashboard does not repeatedly consume the free Firestore quota.
const CLOUD_BANK_STATS_CACHE_MS = 24 * 60 * 60 * 1000;

/**
 * Get statistics about the Cloud Bank (AI-generated questions in Firestore)
 */
export const getCloudBankStats = async (): Promise<CloudBankStats> => {
  try {
    const cached = typeof localStorage === 'undefined' ? null : localStorage.getItem(CLOUD_BANK_STATS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as { expiresAt?: number; stats?: Omit<CloudBankStats, 'oldestQuestion' | 'newestQuestion'> & { oldestQuestion: string | null; newestQuestion: string | null } };
      if (parsed.stats && Number(parsed.expiresAt) > Date.now()) {
        return {
          ...parsed.stats,
          oldestQuestion: parsed.stats.oldestQuestion ? new Date(parsed.stats.oldestQuestion) : null,
          newestQuestion: parsed.stats.newestQuestion ? new Date(parsed.stats.newestQuestion) : null,
        };
      }
    }
  } catch {
    // Continue with a fresh read if browser storage is unavailable.
  }

  try {
    const snapshot = await getDocs(collection(db, 'questions'));
    
    const stats: CloudBankStats = {
      totalQuestions: snapshot.size,
      bySubject: {},
      byDifficulty: {},
      byAgeGroup: {},
      oldestQuestion: null,
      newestQuestion: null,
      averagePerDay: 0
    };

    let oldestTime = Date.now();
    let newestTime = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Count by subject
      const subject = data.subject || 'Unknown';
      stats.bySubject[subject] = (stats.bySubject[subject] || 0) + 1;

      // Count by difficulty
      const difficulty = data.difficulty || 'Unknown';
      stats.byDifficulty[difficulty] = (stats.byDifficulty[difficulty] || 0) + 1;

      // Count both current `ageGroup: number[]` and legacy `age: number` records.
      const ages = Array.isArray(data.ageGroup) && data.ageGroup.length > 0
        ? data.ageGroup
        : [data.age].filter((age) => Number.isFinite(Number(age)));
      ages.forEach((rawAge) => {
        const age = Number(rawAge);
        stats.byAgeGroup[age] = (stats.byAgeGroup[age] || 0) + 1;
      });

      // Track oldest/newest
      if (data.createdAt) {
        const timestamp = data.createdAt.toMillis ? data.createdAt.toMillis() : new Date(data.createdAt).getTime();
        oldestTime = Math.min(oldestTime, timestamp);
        newestTime = Math.max(newestTime, timestamp);
      }
    });

    // Calculate oldest/newest
    if (oldestTime < Date.now()) {
      stats.oldestQuestion = new Date(oldestTime);
    }
    if (newestTime > 0) {
      stats.newestQuestion = new Date(newestTime);
    }

    // Calculate average per day
    if (stats.oldestQuestion && stats.newestQuestion && stats.totalQuestions > 0) {
      const daysDiff = (stats.newestQuestion.getTime() - stats.oldestQuestion.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 0) {
        stats.averagePerDay = stats.totalQuestions / daysDiff;
      } else {
        stats.averagePerDay = stats.totalQuestions; // All created same day
      }
    }

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CLOUD_BANK_STATS_CACHE_KEY, JSON.stringify({
          expiresAt: Date.now() + CLOUD_BANK_STATS_CACHE_MS,
          stats,
        }));
      }
    } catch {
      // Stats still render when browser storage is unavailable.
    }
    return stats;
  } catch (error) {
    console.error('Error fetching Cloud Bank stats:', error);
    return {
      totalQuestions: 0,
      bySubject: {},
      byDifficulty: {},
      byAgeGroup: {},
      oldestQuestion: null,
      newestQuestion: null,
      averagePerDay: 0
    };
  }
};
