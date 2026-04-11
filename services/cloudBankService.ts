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

/**
 * Get statistics about the Cloud Bank (AI-generated questions in Firestore)
 */
export const getCloudBankStats = async (): Promise<CloudBankStats> => {
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

      // Count by age group
      const age = data.age || 0;
      stats.byAgeGroup[age] = (stats.byAgeGroup[age] || 0) + 1;

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
