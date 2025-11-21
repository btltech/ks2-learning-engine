import { useEffect, useState, useRef } from 'react';
import { 
  collection, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../services/firebaseAuthService';
import { UserProfile } from '../types';

/**
 * Custom hook for real-time monitoring of a child's profile
 * Automatically updates when child's data changes in Firestore
 * 
 * @param childId - The child's user ID to monitor
 * @returns Object with child data, loading state, and error
 */
export const useRealtimeChildProfile = (childId: string | null) => {
  const [childData, setChildData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!childId) {
      setChildData(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      doc(db, 'users', childId),
      (snapshot) => {
        if (snapshot.exists()) {
          setChildData(snapshot.data() as UserProfile);
          setLoading(false);
        } else {
          setError('Child profile not found');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to child profile:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup: unsubscribe when component unmounts or childId changes
    return () => unsubscribe();
  }, [childId]);

  return { childData, loading, error };
};

/**
 * Custom hook for real-time monitoring of all children for a parent
 * Automatically updates when any child's data changes
 * 
 * @param parentId - The parent's user ID
 * @returns Object with children data, loading state, and error
 */
export const useRealtimeChildrenProfiles = (parentId: string | null) => {
  const [children, setChildren] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parentId) {
      setChildren([]);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to real-time updates for all children
    const q = query(
      collection(db, 'users'),
      where('parentId', '==', parentId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const childProfiles = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as UserProfile));
        setChildren(childProfiles);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to children profiles:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup: unsubscribe when component unmounts or parentId changes
    return () => unsubscribe();
  }, [parentId]);

  return { children, loading, error };
};

/**
 * Custom hook for real-time monitoring of leaderboard (top students)
 * 
 * @param limit - Number of top students to show (default: 10)
 * @param minAge - Optional minimum age filter
 * @param maxAge - Optional maximum age filter
 * @returns Object with leaderboard data, loading state, and error
 */
export const useRealtimeLeaderboard = (limitNum = 10, minAge?: number, maxAge?: number) => {
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Subscribe to real-time top students
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      orderBy('totalPoints', 'desc'),
      limit(limitNum)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const students = snapshot.docs
          .map((doc) => doc.data() as UserProfile)
          .filter((student) => {
            if (minAge && student.age < minAge) return false;
            if (maxAge && student.age > maxAge) return false;
            return true;
          });
        setLeaderboard(students);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to leaderboard:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [limitNum, minAge, maxAge]);

  return { leaderboard, loading, error };
};

/**
 * Custom hook for real-time monitoring of a specific subject's progress
 * across all students
 * 
 * @param subject - Subject name (e.g., 'Maths', 'English')
 * @param minScore - Minimum mastery score (0-100)
 * @returns Object with progress data, loading state, and error
 */
export const useRealtimeSubjectProgress = (subject: string, minScore = 0) => {
  const [progressData, setProgressData] = useState<
    Array<{ id: string; name: string; score: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subject) return;

    setLoading(true);
    setError(null);

    // Subscribe to real-time progress for a subject
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => {
            const user = doc.data() as UserProfile;
            const subjectMastery = user.mastery[subject];
            if (!subjectMastery) return null;

            // Calculate average score across all topics
            const scores = Object.values(subjectMastery);
            const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;

            return avgScore >= minScore
              ? { id: doc.id, name: user.name, score: avgScore }
              : null;
          })
          .filter((item) => item !== null) as Array<{ id: string; name: string; score: number }>;

        setProgressData(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to subject progress:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [subject, minScore]);

  return { progressData, loading, error };
};

/**
 * Custom hook for real-time monitoring of quiz attempts
 * Useful for seeing when students complete quizzes
 * 
 * @param studentId - Student ID to monitor
 * @returns Object with activity data, loading state, and error
 */
export const useRealtimeStudentActivity = (studentId: string | null) => {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [pointsGained, setPointsGained] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousPointsRef = useRef<number>(0);

  useEffect(() => {
    if (!studentId) return;

    setLoading(true);

    const unsubscribe = onSnapshot(
      doc(db, 'users', studentId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data() as UserProfile;
          const currentPoints = userData.totalPoints || 0;

          // Calculate points gained
          if (previousPointsRef.current > 0) {
            const gained = currentPoints - previousPointsRef.current;
            if (gained > 0) {
              setPointsGained(gained);
              setLastUpdate(new Date().toLocaleTimeString());
            }
          }

          previousPointsRef.current = currentPoints;
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to student activity:', err);
        // More detailed error logging for debugging
        if (err.code === 'permission-denied') {
          console.warn('Permission denied - check that:', 
            '1) User is authenticated',
            '2) User is trying to read own data or child they own',
            '3) Child document has parentId field set'
          );
        }
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [studentId]);

  return { lastUpdate, pointsGained, loading, error };
};

export default {
  useRealtimeChildProfile,
  useRealtimeChildrenProfiles,
  useRealtimeLeaderboard,
  useRealtimeSubjectProgress,
  useRealtimeStudentActivity,
};
