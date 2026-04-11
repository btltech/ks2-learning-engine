import '@testing-library/jest-dom';
import { vi } from 'vitest';

if (typeof globalThis.localStorage?.clear !== 'function') {
  const storage = new Map<string, string>();

  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => storage.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      storage.set(key, String(value));
    }),
    removeItem: vi.fn((key: string) => {
      storage.delete(key);
    }),
    clear: vi.fn(() => {
      storage.clear();
    }),
    key: vi.fn((index: number) => Array.from(storage.keys())[index] ?? null),
    get length() {
      return storage.size;
    },
  });
}

// Mock Firebase
vi.mock('firebase/app', () => ({
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(async () => ({
    exists: () => false,
    data: () => undefined,
  })),
  setDoc: vi.fn(async () => undefined),
  query: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
}));
