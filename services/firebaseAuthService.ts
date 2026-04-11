// Firebase Authentication & User Management Service
// Supports unlimited parents, children, and simultaneous sessions

import { getApps, getApp, initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
  setPersistence,
  browserLocalPersistence,
  signInWithCustomToken
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
  increment
} from 'firebase/firestore';
import { UserProfile, Difficulty } from '../types';

const stripZeroWidth = (value: string) => value.replace(/[\u200B-\u200D\uFEFF]/g, '');
const normalizeEmail = (email: string) => stripZeroWidth(email).trim();
// Don't trim passwords (spaces can be valid). Do remove zero-width chars from autofill.
const normalizePassword = (password: string) => stripZeroWidth(password);

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Firebase Configuration - using existing config from .env
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase (use existing app if already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Enable persistent login
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.warn('Firebase persistence setup:', err);
});

export const firebaseAuthService = {
  /**
   * Register a new user (parent, student, teacher, or admin)
   */
  register: async (
    email: string,
    password: string,
    name: string,
    role: 'student' | 'parent' | 'teacher' | 'admin',
    age?: number
  ): Promise<UserProfile> => {
    let firebaseUser: User | null = null;
    try {
      const normalizedEmail = normalizeEmail(email);
      const normalizedPassword = normalizePassword(password);
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
      firebaseUser = userCredential.user;
      // Ensure we have a fresh token before hitting Firestore rules.
      await firebaseUser.getIdToken(true);

      // Generate unique codes
      const userId = firebaseUser.uid;
      const childCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      let parentCode = role === 'parent'
        ? Math.random().toString(36).substring(2, 8).toUpperCase()
        : undefined;

      // Create user profile in Firestore - only include defined fields
      const userProfile: UserProfile = {
        id: userId,
        name,
        role,
        roles: [role],
        age: age || 9,
        avatarConfig: { color: '#4F46E5' },
        totalPoints: 0,
        unlockedItems: [],
        badges: [],
        streak: 0,
        lastLoginDate: new Date().toISOString(),
        mastery: {},
        timeSpentLearning: {},
        quizHistory: [],
        preferredDifficulty: Difficulty.Medium,
        childCode,
        ...(role === 'parent'
          ? {
              parentCode,
              childrenIds: [],
            }
          : {}),
      };

      // Build Firestore document - explicitly include only defined values
      const firestoreDoc: Record<string, any> = {
        id: userId,
        name,
        role,
        roles: [role],
        age: age || 9,
        avatarConfig: { color: '#4F46E5' },
        totalPoints: 0,
        unlockedItems: [],
        badges: [],
        streak: 0,
        lastLoginDate: new Date().toISOString(),
        mastery: {},
        timeSpentLearning: {},
        quizHistory: [],
        preferredDifficulty: Difficulty.Medium,
        childCode,
        email: normalizedEmail,
        emailVerified: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Only add parent-specific fields for parents
      if (role === 'parent') {
        firestoreDoc.parentCode = parentCode;
        firestoreDoc.childrenIds = [];
      }

      await setDoc(doc(db, 'users', userId), firestoreDoc);

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Reserve a guaranteed-unique parent code via server (best-effort).
      const isTestEnv =
        typeof process !== 'undefined' &&
        typeof (process as any).env === 'object' &&
        (Boolean((process as any).env.VITEST) || (process as any).env.NODE_ENV === 'test');

      if (role === 'parent' && typeof window !== 'undefined' && !isTestEnv) {
        try {
          const token = await firebaseUser.getIdToken();
          const url = new URL('/api/parent-code', window.location.origin).toString();
          const resp = await fetch(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await resp.json().catch(() => ({}));
          if (resp.ok && typeof data?.parentCode === 'string') {
            parentCode = data.parentCode;
            userProfile.parentCode = parentCode;
          } else if (!resp.ok) {
            console.warn('Parent code reservation failed:', data?.error || resp.statusText);
          }
        } catch (e) {
          console.warn('Parent code reservation failed:', e);
        }
      }

      return userProfile;
    } catch (error: any) {
      console.error('Registration error:', error);
      // If Firestore profile creation fails, avoid leaving the app in a signed-in state.
      try {
        await signOut(auth);
      } catch {
        // ignore
      }
      throw new Error(
        (error?.code ? `${error.code}: ` : '') + (error?.message || 'Registration failed')
      );
    }
  },

  /**
   * Regenerate a guaranteed-unique parent code (parent accounts only).
   */
  regenerateParentCode: async (): Promise<string> => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error('You must be logged in.');

    const token = await firebaseUser.getIdToken();
    const resp = await fetch('/api/parent-code', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      throw new Error(data?.error || 'Failed to regenerate parent code.');
    }
    const parentCode = typeof data?.parentCode === 'string' ? data.parentCode : '';
    if (!parentCode) throw new Error('Response missing parent code.');
    return parentCode;
  },

  /**
   * Unlink a child from the currently signed-in parent (server-side).
   */
  unlinkChild: async (childId: string): Promise<void> => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error('You must be logged in.');
    const token = await firebaseUser.getIdToken();

    const resp = await fetch('/api/parent/unlink-child', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ childId }),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      throw new Error(data?.error || 'Failed to unlink child.');
    }
  },

  /**
   * Delete a child profile (server-side).
   */
  deleteChild: async (childId: string): Promise<void> => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error('You must be logged in.');
    const token = await firebaseUser.getIdToken();

    const resp = await fetch('/api/parent/delete-child', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ childId }),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      throw new Error(data?.error || 'Failed to delete child.');
    }
  },

  /**
   * Set/reset a child's PIN by storing a one-way hash on the child profile.
   * Parents can do this for their own children (rules allow).
   */
  setChildPin: async (childId: string, pin: string): Promise<void> => {
    const normalizedPin = stripZeroWidth(pin).trim();
    if (!/^[0-9]{4,6}$/.test(normalizedPin)) {
      throw new Error('PIN must be 4 to 6 digits.');
    }

    // Hash ties the PIN to the childId so it can't be reused to locate other children.
    const childPinHash = await sha256Hex(`pin:${childId}:${normalizedPin}`);
    await updateDoc(doc(db, 'users', childId), {
      childPinHash,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Login user with email and password
   */
  login: async (email: string, password: string): Promise<UserProfile> => {
    let firebaseUser: User | null = null;
    try {
      const normalizedEmail = normalizeEmail(email);
      const normalizedPassword = normalizePassword(password);

      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
      firebaseUser = userCredential.user;
      // Ensure token/claims are current before Firestore reads/writes.
      await firebaseUser.getIdToken(true);

      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Profile doesn't exist (orphaned auth account) - create a basic one
        // User can update their details later
        const childCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newProfile: UserProfile = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || email.split('@')[0],
          role: 'student', // Default role - user can contact support to change
          roles: ['student'],
          age: 9,
          avatarConfig: { color: '#4F46E5' },
          totalPoints: 0,
          unlockedItems: [],
          badges: [],
          streak: 0,
          lastLoginDate: new Date().toISOString(),
          mastery: {},
          timeSpentLearning: {},
          quizHistory: [],
          preferredDifficulty: Difficulty.Medium,
          childCode,
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...newProfile,
          email: normalizedEmail,
          emailVerified: firebaseUser.emailVerified,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        
        return newProfile;
      }

      const userProfile = userDoc.data() as UserProfile;

      // ---- Role migration / bootstrap ----
      // 1) If `roles` is missing, set it to the existing single role.
      //    Security rules will only allow this exact migration.
      if (!(userProfile as any).roles) {
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            roles: [userProfile.role],
            updatedAt: Timestamp.now(),
          });
          (userProfile as any).roles = [userProfile.role];
        } catch (e) {
          // Non-fatal: continue with legacy single-role behavior
          console.warn('Unable to migrate roles field:', e);
        }
      }
      
      // Update last login
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLoginDate: new Date().toISOString(),
        updatedAt: Timestamp.now(),
      });

      return userProfile;
    } catch (error: any) {
      console.error('Login error:', error);
      // If Auth succeeded but Firestore failed, keep state consistent by signing out.
      try {
        await signOut(auth);
      } catch {
        // ignore
      }
      throw new Error((error?.code ? `${error.code}: ` : '') + (error?.message || 'Login failed'));
    }
  },

  /**
   * Child quick login with parent code + name + age (no email/password).
   * This calls a server-side endpoint that validates the parent code,
   * creates a linked child profile, and returns a Firebase custom token.
   */
  loginChildWithParentCode: async (params: {
    parentCode: string;
    name: string;
    age: number;
    pin?: string;
    turnstileToken?: string;
  }): Promise<UserProfile> => {
    const parentCode = stripZeroWidth(params.parentCode).trim().toUpperCase();
    const name = stripZeroWidth(params.name).trim();
    const age = params.age;
    const pin = typeof params.pin === 'string' ? stripZeroWidth(params.pin).trim() : '';
    const turnstileToken =
      typeof params.turnstileToken === 'string' ? stripZeroWidth(params.turnstileToken).trim() : '';

    if (!parentCode || parentCode.length !== 6) {
      throw new Error('Parent code must be exactly 6 characters.');
    }
    if (!name) {
      throw new Error('Please enter your name.');
    }
    if (!Number.isFinite(age) || age < 5 || age > 18) {
      throw new Error('Please choose a valid age.');
    }
    if (pin && !/^[0-9]{4,6}$/.test(pin)) {
      throw new Error('PIN must be 4 to 6 digits.');
    }

    const response = await fetch('/api/child-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentCode, name, age, pin, turnstileToken }),
    });

    if (!response.ok) {
      let message = 'Unable to start child session. Please try again.';
      try {
        const error = await response.json();
        message = error?.error || message;
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    const data = (await response.json()) as { customToken?: string };
    if (!data.customToken) {
      throw new Error('Child session response missing token.');
    }

    const userCredential = await signInWithCustomToken(auth, data.customToken);
    const firebaseUser = userCredential.user;
    await firebaseUser.getIdToken(true);

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) {
      try {
        await signOut(auth);
      } catch {
        // ignore
      }
      throw new Error('Child profile not found. Please try again.');
    }

    const userProfile = userDoc.data() as UserProfile;

    // Update last login date for the child profile (allowed by rules)
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLoginDate: new Date().toISOString(),
        updatedAt: Timestamp.now(),
      });
    } catch (e) {
      console.warn('Unable to update child lastLoginDate:', e);
    }

    return userProfile;
  },

  /**
   * Get currently authenticated user
   */
  getCurrentUser: async (): Promise<UserProfile | null> => {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        unsubscribe();
        if (!firebaseUser) {
          resolve(null);
          return;
        }

        try {
          await firebaseUser.getIdToken(true);
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (!userDoc.exists()) {
            resolve(null);
            return;
          }

          const userProfile = userDoc.data() as UserProfile;

          // Migrate legacy users to `roles: [role]` (safe migration enforced by rules)
          if (!(userProfile as any).roles) {
            try {
              await updateDoc(doc(db, 'users', firebaseUser.uid), {
                roles: [userProfile.role],
                updatedAt: Timestamp.now(),
              });
              (userProfile as any).roles = [userProfile.role];
            } catch (e) {
              console.warn('Unable to migrate roles field (getCurrentUser):', e);
            }
          }

          resolve(userProfile);
        } catch (error) {
          console.error('Error fetching current user:', error);
          // Avoid getting stuck in a state where Auth is present but profile reads fail.
          try {
            await signOut(auth);
          } catch {
            // ignore
          }
          resolve(null);
        }
      });
    });
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  /**
   * Check if current user's email is verified
   */
  isEmailVerified: (): boolean => {
    const user = auth.currentUser;
    if (!user) return false;
    // Child profiles created via custom token won't have an email; skip verification banner.
    if (!user.email) return true;
    return user.emailVerified;
  },

  /**
   * Resend email verification
   */
  resendVerificationEmail: async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    if (!user.email) {
      throw new Error('No email address on this account');
    }
    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }
    try {
      await sendEmailVerification(user);
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please wait a few minutes and try again.');
      }
      throw new Error('Failed to send verification email. Please try again.');
    }
  },

  /**
   * Refresh user auth state (to check if email was verified)
   */
  refreshAuthState: async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) return false;
    await user.reload();
    return user.emailVerified;
  },

  /**
   * Send password reset email
   */
  sendPasswordReset: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, normalizeEmail(email));
    } catch (error: any) {
      console.error('Password reset error:', error);
      // Provide user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please try again later.');
      }
      throw new Error('Failed to send reset email. Please try again.');
    }
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Increment user's points safely (atomic server-side increment).
   */
  incrementUserPoints: async (userId: string, amount: number): Promise<void> => {
    const delta = Math.trunc(amount);
    if (!Number.isFinite(delta) || delta === 0) return;
    await updateDoc(doc(db, 'users', userId), {
      totalPoints: increment(delta),
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Link child to parent using child code
   */
  linkChildToParent: async (parentId: string, childCode: string): Promise<boolean> => {
    try {
      // Find child by code
      const childQuery = query(
        collection(db, 'users'),
        where('childCode', '==', childCode)
      );
      const childDocs = await getDocs(childQuery);

      if (childDocs.empty) {
        throw new Error('Invalid child code');
      }

      const childDoc = childDocs.docs[0];
      const childId = childDoc.id;

      // Update parent's childrenIds
      const parentDocRef = doc(db, 'users', parentId);
      const parentDoc = await getDoc(parentDocRef);
      const parentData = parentDoc.data() as UserProfile;

      const updatedChildrenIds = [...(parentData.childrenIds || []), childId];
      await updateDoc(parentDocRef, {
        childrenIds: updatedChildrenIds,
        updatedAt: Timestamp.now(),
      });

      // Update child's parentId
      await updateDoc(doc(db, 'users', childId), {
        parentId,
        updatedAt: Timestamp.now(),
      });

      return true;
    } catch (error) {
      console.error('Error linking child to parent:', error);
      return false;
    }
  },

  /**
   * Get all children for a parent
   */
  getParentChildren: async (parentId: string): Promise<UserProfile[]> => {
    try {
      const childIdSet = new Set<string>();

      // Preferred model: users/{parentId}/children/{childId}
      try {
        const linksSnap = await getDocs(collection(db, 'users', parentId, 'children'));
        linksSnap.docs.forEach((d) => {
          if (d.id) childIdSet.add(d.id);
        });
      } catch (e) {
        console.warn('Unable to read children subcollection:', e);
      }

      // Legacy model: parent document `childrenIds` array (merged for backwards compatibility)
      const parentDoc = await getDoc(doc(db, 'users', parentId));
      if (parentDoc.exists()) {
        const parentData = parentDoc.data() as UserProfile;
        (parentData.childrenIds || []).forEach((id) => {
          if (id) childIdSet.add(id);
        });
      }

      if (childIdSet.size === 0) return [];

      const children: UserProfile[] = [];
      for (const childId of Array.from(childIdSet)) {
        const childDoc = await getDoc(doc(db, 'users', childId));
        if (childDoc.exists()) {
          children.push(childDoc.data() as UserProfile);
        }
      }

      return children;
    } catch (error) {
      console.error('Error fetching parent children:', error);
      return [];
    }
  },

  /**
   * Get child data (for parent monitoring)
   */
  getChildProfile: async (childId: string): Promise<UserProfile | null> => {
    try {
      const childDoc = await getDoc(doc(db, 'users', childId));
      return childDoc.exists() ? (childDoc.data() as UserProfile) : null;
    } catch (error) {
      console.error('Error fetching child profile:', error);
      return null;
    }
  },

  /**
   * Update child's learning data (parent can update)
   */
  updateChildProgress: async (
    childId: string,
    updates: {
      totalPoints?: number;
      badges?: any[];
      streak?: number;
      mastery?: UserProfile['mastery'];
    }
  ): Promise<void> => {
    await updateDoc(doc(db, 'users', childId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Reset child's profile (parent action)
   */
  resetChildProfile: async (childId: string): Promise<void> => {
    await updateDoc(doc(db, 'users', childId), {
      totalPoints: 0,
      badges: [],
      streak: 0,
      mastery: {},
      unlockedItems: [],
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Get all active sessions for a user (for multi-device support)
   */
  getActiveSession: async (): Promise<User | null> => {
    return auth.currentUser;
  },

  /**
   * List all users (admin only - filtered query)
   */
  searchUsers: async (searchTerm: string): Promise<UserProfile[]> => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff')
      );
      const docs = await getDocs(usersQuery);
      return docs.docs.map(d => d.data() as UserProfile);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },
};

export { auth, db };
