import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTopicsForSubject, generateQuiz } from './geminiService';
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
  query: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
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

// Mock questionBank
vi.mock('../data/questionBank', () => ({
  getRandomQuestions: vi.fn().mockReturnValue([])
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

// Mock questionBank
vi.mock('../data/questionBank', () => ({
  getRandomQuestions: vi.fn().mockReturnValue([])
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

      const topics = await getTopicsForSubject('Math', 10);
      
      expect(topics).toEqual([]);
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

      // Mock AI response (should not be called if we have enough questions, but here we only have 1 from firebase)
      // So AI will be called to fill the rest
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          quiz: Array(5).fill(null).map((_, i) => ({
            question: `What is the result of calculation number ${i + 1}?`,
            options: ['Option C', 'Option D'],
            correctAnswer: 'Option C',
            explanation: `This is a valid explanation for question ${i + 1}`
          }))
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
      expect(questions[1].question).toBe('What is the result of calculation number 1?'); // AI second
      
      // Verify Firebase was queried
      expect(getDocs).toHaveBeenCalled();
      
      // Verify new question was saved to Firebase
      expect(addDoc).toHaveBeenCalled();
    });
  });
});
