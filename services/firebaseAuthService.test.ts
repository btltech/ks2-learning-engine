import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';

// Mock Firebase modules before importing the service
vi.mock('firebase/app', () => ({
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    onAuthStateChanged: vi.fn((callback) => {
      // Simulate async behavior and return unsubscribe function
      setTimeout(() => callback(null), 0);
      return vi.fn(); // unsubscribe function
    }),
    currentUser: null,
  })),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithCustomToken: vi.fn(),
  signOut: vi.fn(),
  sendEmailVerification: vi.fn(() => Promise.resolve()),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
  setPersistence: vi.fn(() => Promise.resolve()),
  browserLocalPersistence: {},
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(() => Promise.resolve()),
  getDoc: vi.fn(),
  updateDoc: vi.fn(() => Promise.resolve()),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ seconds: Date.now() / 1000 })),
  },
}));

import { firebaseAuthService } from './firebaseAuthService';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { getDoc, setDoc } from 'firebase/firestore';

describe('FirebaseAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockFirebaseUser = (uid: string) => ({
    uid,
    getIdToken: vi.fn(() => Promise.resolve('test-token')),
  });

  describe('register', () => {
    it('should create a new parent account with email and password', async () => {
      const mockUserCredential = {
        user: mockFirebaseUser('test-uid-123')
      };
      
      (createUserWithEmailAndPassword as Mock).mockResolvedValue(mockUserCredential);
      (setDoc as Mock).mockResolvedValue(undefined);

      const result = await firebaseAuthService.register(
        'test@example.com',
        'password123',
        'Test User',
        'parent',
        9
      );

      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
      expect(setDoc).toHaveBeenCalled();
      expect(sendEmailVerification).toHaveBeenCalled();
      expect(result.id).toBe('test-uid-123');
      expect(result.name).toBe('Test User');
      expect(result.role).toBe('parent');
      expect(result.age).toBe(9);
    });

    it('rejects public registration for privileged or child roles', async () => {
      await expect(
        firebaseAuthService.register('test@example.com', 'password123', 'Test User', 'teacher')
      ).rejects.toThrow(/parent accounts only/i);
      expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('should create a parent user correctly', async () => {
      const mockUserCredential = {
        user: mockFirebaseUser('parent-uid-456')
      };
      
      (createUserWithEmailAndPassword as Mock).mockResolvedValue(mockUserCredential);
      (setDoc as Mock).mockResolvedValue(undefined);

      const result = await firebaseAuthService.register(
        'parent@example.com',
        'password123',
        'Parent User',
        'parent'
      );

      expect(result.role).toBe('parent');
      expect(result.parentCode).toBeDefined();
      expect(result.childrenIds).toEqual([]);
    });

    it('should throw error when registration fails', async () => {
      (createUserWithEmailAndPassword as Mock).mockRejectedValue(
        new Error('Firebase: Error (auth/email-already-in-use).')
      );

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await expect(
          firebaseAuthService.register('test@example.com', 'password', 'Test', 'parent')
        ).rejects.toThrow();
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe('login', () => {
    it('should login user and return profile', async () => {
      const mockUserCredential = {
        user: mockFirebaseUser('test-uid-123')
      };
      
      const mockUserProfile = {
        id: 'test-uid-123',
        name: 'Test User',
        role: 'student',
        age: 9,
        totalPoints: 100,
      };

      (signInWithEmailAndPassword as Mock).mockResolvedValue(mockUserCredential);
      (getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockUserProfile,
      });

      const result = await firebaseAuthService.login('test@example.com', 'password123');

      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(mockUserCredential.user.getIdToken).toHaveBeenCalledWith();
      expect(result.id).toBe('test-uid-123');
      expect(result.name).toBe('Test User');
    });

    it('should create a basic profile when user profile not found', async () => {
      const mockUserCredential = {
        user: mockFirebaseUser('test-uid-123')
      };

      (signInWithEmailAndPassword as Mock).mockResolvedValue(mockUserCredential);
      (getDoc as Mock).mockResolvedValue({
        exists: () => false,
      });

      (setDoc as Mock).mockResolvedValue(undefined);

      const result = await firebaseAuthService.login('test@example.com', 'password123');

      expect(setDoc).toHaveBeenCalled();
      expect(result.id).toBe('test-uid-123');
      expect(result.role).toBe('student');
    });

    it('should throw error for wrong credentials', async () => {
      (signInWithEmailAndPassword as Mock).mockRejectedValue(
        new Error('Firebase: Error (auth/wrong-password).')
      );

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await expect(
          firebaseAuthService.login('test@example.com', 'wrongpassword')
        ).rejects.toThrow();
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe('logout', () => {
    it('should call signOut', async () => {
      (signOut as Mock).mockResolvedValue(undefined);

      await firebaseAuthService.logout();

      expect(signOut).toHaveBeenCalled();
    });
  });

  describe('sendPasswordReset', () => {
    it('uses the Firebase-hosted reset handler without a custom continuation URL', async () => {
      await firebaseAuthService.sendPasswordReset('  info@btltech.co.uk  ');

      expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'info@btltech.co.uk'
      );
    });

    it('shows a useful message when the network is unavailable', async () => {
      (sendPasswordResetEmail as Mock).mockRejectedValueOnce({
        code: 'auth/network-request-failed',
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        await expect(
          firebaseAuthService.sendPasswordReset('info@btltech.co.uk')
        ).rejects.toThrow(/check your connection/i);
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is logged in', async () => {
      const result = await firebaseAuthService.getCurrentUser();
      expect(result).toBeNull();
    });
  });
});
