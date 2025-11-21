import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  Query,
  QueryConstraint,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, Activity, BadgeInfo, ActivityType } from '../types';

// ============================================================================
// HOOK 1: useRealtimeChildProfile - Watch a single child's profile
// ============================================================================
export function useRealtimeChildProfile(childId: string) {
  const [child, setChild] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!childId) {
      setError('childId is required');
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, 'users'), where('id', '==', childId)),
      (snapshot) => {
        if (snapshot.empty) {
          setChild(null);
          setError('Child not found');
        } else {
          setChild(snapshot.docs[0].data() as UserProfile);
          setError(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to child profile:', err);
        setError(`Permission error: Check if you're authenticated and linked to this child`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [childId]);

  return { child, loading, error };
}

// ============================================================================
// HOOK 2: useRealtimeChildrenProfiles - Watch all of a parent's children
// ============================================================================
export function useRealtimeChildrenProfiles(parentId: string) {
  const [children, setChildren] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parentId) {
      setError('parentId is required');
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, 'users'), where('parentId', '==', parentId)),
      (snapshot) => {
        const childProfiles = snapshot.docs.map((doc) => doc.data() as UserProfile);
        setChildren(childProfiles);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to children profiles:', err);
        setError('Permission error: Check if you have children linked');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [parentId]);

  return { children, loading, error };
}

// ============================================================================
// HOOK 3: useRealtimeLeaderboard - Watch global leaderboard with age filtering
// ============================================================================
export function useRealtimeLeaderboard(userAge?: number) {
  const [leaderboard, setLeaderboard] = useState<(UserProfile & { rank: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'leaderboard'),
        orderBy('score', 'desc'),
        limit(100)
      ),
      (snapshot) => {
        const entries = snapshot.docs.map((doc) => ({
          ...doc.data(),
          rank: snapshot.docs.indexOf(doc) + 1,
        })) as (UserProfile & { rank: number })[];

        // Filter by age group (±2 years) if userAge provided
        if (userAge) {
          const filtered = entries.filter(
            (entry) => entry.age && Math.abs(entry.age - userAge) <= 2
          );
          setLeaderboard(filtered);
        } else {
          setLeaderboard(entries);
        }

        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to leaderboard:', err);
        setError('Failed to load leaderboard');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userAge]);

  return { leaderboard, loading, error };
}

// ============================================================================
// HOOK 4: useRealtimeSubjectProgress - Watch subject mastery levels
// ============================================================================
export function useRealtimeSubjectProgress(userId: string) {
  const [subjects, setSubjects] = useState<
    { name: string; mastery: number; lastUpdated: Date }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError('userId is required');
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, `users/${userId}/subjectProgress`)),
      (snapshot) => {
        const subjectData = snapshot.docs.map((doc) => ({
          name: doc.id,
          ...doc.data(),
        })) as { name: string; mastery: number; lastUpdated: Date }[];

        setSubjects(subjectData);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to subject progress:', err);
        if (err.code === 'permission-denied') {
          console.warn(
            'Permission denied for subject progress. Debug info:',
            `\n- Is user authenticated? Check auth state\n- Does user document have role field?\n- For parents: Is parentId field set?\n- For students: Is this your own userId?`
          );
        }
        setError('Failed to load subject progress');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { subjects, loading, error };
}

// ============================================================================
// HOOK 5: useRealtimeStudentActivity - Watch activity with error handling
// ============================================================================
export function useRealtimeStudentActivity(studentId: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setError('studentId is required');
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query(
        collection(db, `users/${studentId}/activity`),
        orderBy('timestamp', 'desc'),
        limit(50)
      ),
      (snapshot) => {
        const acts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Activity[];

        setActivities(acts);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('useRealtimeListeners.ts:265 Error listening to student activity:', err);
        
        if (err.code === 'permission-denied') {
          console.warn(
            '🔒 FIRESTORE PERMISSION DENIED - Debug Checklist:\n' +
            '1. Authentication:\n' +
            '   - Are you logged in? Check auth.currentUser\n' +
            '   - Do you have a user document in /users/{uid}?\n' +
            '2. Data Structure:\n' +
            '   - Does student document have "parentId" field?\n' +
            '   - Does parent document have "role: parent"?\n' +
            '   - Is activity subcollection under users/{studentId}/activity?\n' +
            '3. Parent-Child Link:\n' +
            '   - Are you the parent of this student?\n' +
            '   - Does student.parentId match your uid?\n' +
            '4. For Testing:\n' +
            '   - Try logging in as the student directly\n' +
            '   - Or create a test parent-student link first'
          );
        }

        setError(`Failed to load activity: ${err.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [studentId]);

  return { activities, loading, error };
}

// ============================================================================
// HOOK 6: useRealtimeNotifications - Watch user notifications
// ============================================================================
export function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError('userId is required');
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query(
        collection(db, `notifications/${userId}/messages`),
        orderBy('timestamp', 'desc'),
        limit(20)
      ),
      (snapshot) => {
        const notifs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];

        setNotifications(notifs);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to notifications:', err);
        setError('Failed to load notifications');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { notifications, loading, error };
}

// ============================================================================
// HOOK 7: useRealtimeBadges - Watch earned badges
// ============================================================================
export function useRealtimeBadges(userId: string) {
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError('userId is required');
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, `users/${userId}/badges`)),
      (snapshot) => {
        const badgeList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BadgeInfo[];

        setBadges(badgeList);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to badges:', err);
        setError('Failed to load badges');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { badges, loading, error };
}
