import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDocs, addDoc } from 'firebase/firestore';
import { Difficulty } from '../types';

// Mock environment
vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');

// Mock GoogleGenAI
const { mockGenerateContent } = vi.hoisted(() => {
  return { mockGenerateContent: vi.fn() };
});

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      constructor(_config: any) {}
      get models() {
        return {
          generateContent: mockGenerateContent
        };
      }
    },
    Type: {
      OBJECT: 'OBJECT',
      ARRAY: 'ARRAY',
      STRING: 'STRING'
    }
  };
});

// Mock Firebase
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
  Timestamp: {
    now: vi.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
    fromDate: vi.fn((date: Date) => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 })),
  },
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: { uid: 'test-uid' },
  })),
}));

// Mock offlineManager
vi.mock('./offlineManager', () => ({
  offlineManager: {
    checkOnlineStatus: vi.fn().mockReturnValue(true)
  }
}));

// Mock cacheService
vi.mock('./cacheService', () => ({
  createCacheKey: vi.fn().mockReturnValue('test-key'),
  getFromCache: vi.fn().mockReturnValue(null),
  setInCache: vi.fn()
}));

// Mock contentMonitor
vi.mock('./contentMonitor', () => ({
  contentMonitor: {
    logValidationIssue: vi.fn()
  }
}));

// Mock questionTracker
vi.mock('./questionTracker', () => ({
  getUsedQuestions: vi.fn().mockReturnValue([]),
  markQuestionsAsUsed: vi.fn(),
  resetUsedQuestions: vi.fn()
}));

import { getTopicsForSubject, generateQuiz } from './geminiService';

// Mock questionBank
vi.mock('../data/questionBank', () => ({
  getRandomQuestions: vi.fn().mockResolvedValue([])
}));

// Mock offlineManager
vi.mock('./offlineManager', () => ({
  offlineManager: {
    checkOnlineStatus: vi.fn().mockReturnValue(true)
  }
}));

// Mock cacheService
vi.mock('./cacheService', () => ({
  createCacheKey: vi.fn().mockReturnValue('test-key'),
  getFromCache: vi.fn().mockReturnValue(null),
  setInCache: vi.fn()
}));

// Mock contentMonitor
vi.mock('./contentMonitor', () => ({
  contentMonitor: {
    logValidationIssue: vi.fn()
  }
}));

// Mock questionTracker
vi.mock('./questionTracker', () => ({
  getUsedQuestions: vi.fn().mockReturnValue([]),
  markQuestionsAsUsed: vi.fn(),
  resetUsedQuestions: vi.fn()
}));

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTopicsForSubject', () => {
    it('should return a list of topics when AI returns valid JSON', async () => {
      const mockTopics = ['Addition and Subtraction', 'Multiplication and Division'];
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({ topics: mockTopics })
      });

      const topics = await getTopicsForSubject('Math', 10);
      
      expect(topics).toEqual(mockTopics);
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should return empty array on error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('AI Error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        const topics = await getTopicsForSubject('Math', 10);
        
        expect(topics).toEqual([]);
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe('generateQuiz', () => {
    it('should fetch questions from Firebase first', async () => {
      // Mock Firebase response
      const mockFirebaseQuestions = [
        {
          id: '1',
          data: () => ({
            question: 'Q1',
            options: ['A', 'B'],
            correctAnswer: 'A',
            explanation: 'Exp 1',
            subject: 'Math',
            topic: 'Algebra',
            difficulty: 'Easy',
            age: 10
          })
        }
      ];
      
      (getDocs as any).mockResolvedValue({
        forEach: (callback: any) => mockFirebaseQuestions.forEach(callback),
        empty: false
      });

      // Mock AI response with distinct questions to avoid similarity filtering
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          quiz: [
            {
              question: "What is 2 + 2?",
              options: ["4", "5"],
              correctAnswer: "4",
              explanation: "2 plus 2 equals 4"
            },
            {
              question: "What is the capital of France?",
              options: ["Paris", "London"],
              correctAnswer: "Paris",
              explanation: "Paris is the capital"
            },
            {
              question: "Which planet is red?",
              options: ["Mars", "Venus"],
              correctAnswer: "Mars",
              explanation: "Mars is the red planet"
            },
            {
              question: "How many legs does a spider have?",
              options: ["8", "6"],
              correctAnswer: "8",
              explanation: "Spiders have 8 legs"
            },
            {
              question: "What color is the sky?",
              options: ["Blue", "Green"],
              correctAnswer: "Blue",
              explanation: "The sky is blue"
            }
          ]
        })
      });

      // Mock duplicate check for saving
      (getDocs as any).mockResolvedValueOnce({ // First call is for fetching questions
        forEach: (callback: any) => mockFirebaseQuestions.forEach(callback),
        empty: false
      }).mockResolvedValue({ // Subsequent calls are for duplicate checks
        empty: true 
      });

      const questions = await generateQuiz('Math', 'Algebra', Difficulty.Easy, 10);

      // We expect 1 from Firebase + 5 from AI = 6 total
      expect(questions.length).toBe(6);
      expect(questions[0].question).toBe('Q1'); // Firebase first
      expect(questions[1].question).toBe('What is 2 + 2?'); // AI second
      
      // Verify Firebase was queried
      expect(getDocs).toHaveBeenCalled();
      
      // Verify new question was saved to Firebase
      expect(addDoc).toHaveBeenCalled();
    });
  });
});
