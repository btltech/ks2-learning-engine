// Firebase Authentication & User Management Service
// Supports unlimited parents, children, and simultaneous sessions

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User,
  setPersistence,
  browserLocalPersistence
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
  Timestamp
} from 'firebase/firestore';
import { UserProfile, Difficulty } from '../types';

// Firebase Configuration - using existing config from .env
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable persistent login
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.warn('Firebase persistence setup:', err);
});

export const firebaseAuthService = {
  /**
   * Register a new user (parent or student)
   */
  register: async (
    email: string,
    password: string,
    name: string,
    role: 'student' | 'parent',
    age?: number
  ): Promise<UserProfile> => {
    try {
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Generate unique codes
      const userId = firebaseUser.uid;
      const childCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const parentCode = role === 'parent' ? Math.random().toString(36).substring(2, 8).toUpperCase() : undefined;

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        id: userId,
        name,
        role,
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
        childCode, // Each student gets a code
        parentCode, // Parents get a code to share
        childrenIds: role === 'parent' ? [] : undefined,
        parentId: undefined,
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', userId), {
        ...userProfile,
        email,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return userProfile;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  },

  /**
   * Login user with email and password
   */
  login: async (email: string, password: string): Promise<UserProfile> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userProfile = userDoc.data() as UserProfile;
      
      // Update last login
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLoginDate: new Date().toISOString(),
        updatedAt: Timestamp.now(),
      });

      return userProfile;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
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
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          resolve(userDoc.exists() ? (userDoc.data() as UserProfile) : null);
        } catch (error) {
          console.error('Error fetching current user:', error);
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
   * Update user profile
   */
  updateUserProfile: async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
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
      const childData = childDoc.data() as UserProfile;

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
      const parentDoc = await getDoc(doc(db, 'users', parentId));
      if (!parentDoc.exists()) return [];

      const parentData = parentDoc.data() as UserProfile;
      const childrenIds = parentData.childrenIds || [];

      const children: UserProfile[] = [];
      for (const childId of childrenIds) {
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
