import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../types';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  avatar: string;
  streak: number;
  updatedAt: string;
}

const LEADERBOARD_COLLECTION = 'leaderboard';

export const leaderboardService = {
  /**
   * Submit or update a user's score to the global leaderboard
   */
  submitScore: async (user: UserProfile): Promise<void> => {
    if (!user || !user.id) return;

    try {
      const entry: LeaderboardEntry = {
        userId: user.id,
        name: user.name,
        points: user.totalPoints,
        avatar: user.avatarConfig?.color || 'blue', // Simplified avatar for now
        streak: user.streak,
        updatedAt: new Date().toISOString()
      };

      // Use setDoc with merge to update existing entry or create new one
      await setDoc(doc(db, LEADERBOARD_COLLECTION, user.id), {
        ...entry,
        serverTimestamp: Timestamp.now()
      }, { merge: true });

    } catch (error) {
      console.error('Error submitting score to leaderboard:', error);
      // Log specific Firebase permission errors to help debugging
      if (error instanceof Error && error.message.includes('permission')) {
        console.warn('⚠️ Leaderboard sync failed: Firebase permissions not configured. See FIREBASE_PERMISSIONS_FIX.md');
      }
      // Fail silently so we don't disrupt the user experience
    }
  },

  /**
   * Get the top global players
   */
  getGlobalLeaderboard: async (limitCount = 50): Promise<LeaderboardEntry[]> => {
    try {
      const q = query(
        collection(db, LEADERBOARD_COLLECTION),
        orderBy('points', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as LeaderboardEntry);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
};
