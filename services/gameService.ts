
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  orderBy 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { QuizQuestion } from '../types';

// Initialize Firebase (using existing config if available in window, or re-init)
// Note: In a real app, you might export 'db' from a central firebase.ts file.
// For now, we'll assume the app is initialized in main.tsx/App.tsx
const db = getFirestore();
const auth = getAuth();

export interface GameHighScore {
  gameId: string;
  score: number;
  level?: number;
  achievedAt: string;
}

export const gameService = {
  /**
   * Fetch random questions for a specific subject from Firestore
   */
  async getQuestionsForGame(subject: string, count: number = 10): Promise<QuizQuestion[]> {
    try {
      // In a real app with millions of questions, you'd use a more sophisticated random query.
      // For ~2000 questions, we can fetch a batch and shuffle locally or use a random ID offset.
      // Here we'll fetch a larger batch and shuffle.
      
      const questionsRef = collection(db, 'questions');
      const q = query(
        questionsRef, 
        where('subject', '==', subject),
        limit(50) // Fetch 50 to get a good random sample
      );
      
      const snapshot = await getDocs(q);
      const allQuestions: QuizQuestion[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        // Map Firestore data to QuizQuestion type
        allQuestions.push({
          id: doc.id,
          question: data.question,
          options: data.options,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation,
          type: data.questionType,
          difficulty: data.difficulty,
          subject: data.subject,
          topic: data.topic
        } as QuizQuestion);
      });

      // Shuffle and slice
      return allQuestions.sort(() => Math.random() - 0.5).slice(0, count);
    } catch (error) {
      console.error(`Error fetching questions for ${subject}:`, error);
      return [];
    }
  },

  /**
   * Save a high score for a user
   */
  async saveHighScore(gameId: string, score: number, level?: number): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;

    try {
      const scoreRef = doc(db, 'users', user.uid, 'gameScores', gameId);
      const scoreSnap = await getDoc(scoreRef);

      if (scoreSnap.exists()) {
        const currentHigh = scoreSnap.data().score || 0;
        if (score > currentHigh) {
          await updateDoc(scoreRef, {
            score,
            level: level || 1,
            achievedAt: new Date().toISOString()
          });
          return true; // New high score!
        }
      } else {
        await setDoc(scoreRef, {
          score,
          level: level || 1,
          achievedAt: new Date().toISOString()
        });
        return true; // First score!
      }
    } catch (error) {
      console.error("Error saving high score:", error);
    }
    return false;
  },

  /**
   * Get high scores for all games for the current user
   */
  async getUserHighScores(): Promise<Record<string, number>> {
    const user = auth.currentUser;
    if (!user) return {};

    try {
      const scoresRef = collection(db, 'users', user.uid, 'gameScores');
      const snapshot = await getDocs(scoresRef);
      
      const scores: Record<string, number> = {};
      snapshot.forEach(doc => {
        scores[doc.id] = doc.data().score;
      });
      
      return scores;
    } catch (error) {
      console.error("Error fetching high scores:", error);
      return {};
    }
  }
};
