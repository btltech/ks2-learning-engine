/**
 * Classroom Mode Service
 * 
 * Enables teachers to run synchronized quiz sessions with real-time leaderboards
 * Uses Firebase Realtime Database for live synchronization
 */

import { getApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  onValue,
  push,
  serverTimestamp,
  Unsubscribe
} from 'firebase/database';
import { Difficulty, QuizQuestion } from '../types';

// Database URL for europe-west1 region
const DATABASE_URL = 'https://ks2-learning-engine-default-rtdb.europe-west1.firebasedatabase.app';

let database: ReturnType<typeof getDatabase>;

const getDb = () => {
  if (!database) {
    const app = getApp();
    database = getDatabase(app, DATABASE_URL);
  }
  return database;
};

// Types
export type SessionStatus = 'waiting' | 'active' | 'paused' | 'reviewing' | 'completed';

export interface ClassroomStudent {
  id: string;
  name: string;
  avatarColor: string;
  score: number;
  currentQuestion: number;
  answers: { questionIndex: number; correct: boolean; timeMs: number }[];
  isConnected: boolean;
  lastSeen: number;
  joinedAt: number;
}

export interface ClassroomSession {
  id: string;
  sessionCode: string;
  teacherId: string;
  teacherName: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  status: SessionStatus;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  questionStartTime?: number;
  timePerQuestion: number; // seconds
  students: { [studentId: string]: ClassroomStudent };
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  settings: {
    showLeaderboardDuringQuiz: boolean;
    showCorrectAnswers: boolean;
    allowLateJoin: boolean;
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
  };
}

export interface SessionResults {
  sessionId: string;
  title: string;
  subject: string;
  topic: string;
  totalQuestions: number;
  completedAt: string;
  students: {
    id: string;
    name: string;
    score: number;
    correctAnswers: number;
    averageTime: number;
    rank: number;
  }[];
}

// Generate a 6-character session code
const generateSessionCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

class ClassroomService {
  private currentSessionId: string | null = null;
  private sessionListeners: Map<string, Unsubscribe> = new Map();

  /**
   * Create a new classroom session (Teacher)
   */
  async createSession(
    teacherId: string,
    teacherName: string,
    title: string,
    subject: string,
    topic: string,
    difficulty: Difficulty,
    questions: QuizQuestion[],
    settings?: Partial<ClassroomSession['settings']>
  ): Promise<ClassroomSession> {
    const db = getDb();
    const sessionCode = generateSessionCode();
    const sessionId = `session_${Date.now()}_${sessionCode}`;

    const session: ClassroomSession = {
      id: sessionId,
      sessionCode,
      teacherId,
      teacherName,
      title,
      subject,
      topic,
      difficulty,
      status: 'waiting',
      questions,
      currentQuestionIndex: -1,
      timePerQuestion: 30,
      students: {},
      createdAt: Date.now(),
      settings: {
        showLeaderboardDuringQuiz: true,
        showCorrectAnswers: true,
        allowLateJoin: true,
        randomizeQuestions: false,
        randomizeOptions: false,
        ...settings,
      },
    };

    // Save to Firebase
    const sessionRef = ref(db, `classrooms/${sessionId}`);
    await set(sessionRef, session);

    // Create code lookup
    const codeRef = ref(db, `classroomCodes/${sessionCode}`);
    await set(codeRef, { sessionId, createdAt: Date.now() });

    this.currentSessionId = sessionId;
    console.log(`[Classroom] Created session ${sessionCode}`);
    
    return session;
  }

  /**
   * Join a classroom session (Student)
   */
  async joinSession(
    sessionCode: string,
    studentId: string,
    studentName: string,
    avatarColor: string
  ): Promise<ClassroomSession | null> {
    const db = getDb();
    
    // Look up session by code
    const codeRef = ref(db, `classroomCodes/${sessionCode}`);
    const codeSnapshot = await get(codeRef);
    
    if (!codeSnapshot.exists()) {
      console.log(`[Classroom] Session code ${sessionCode} not found`);
      return null;
    }

    const { sessionId } = codeSnapshot.val();
    const sessionRef = ref(db, `classrooms/${sessionId}`);
    const sessionSnapshot = await get(sessionRef);

    if (!sessionSnapshot.exists()) {
      return null;
    }

    const session: ClassroomSession = sessionSnapshot.val();

    // Check if session allows joining
    if (session.status === 'completed') {
      console.log(`[Classroom] Session ${sessionCode} is already completed`);
      return null;
    }

    if (session.status !== 'waiting' && !session.settings.allowLateJoin) {
      console.log(`[Classroom] Session ${sessionCode} doesn't allow late joins`);
      return null;
    }

    // Add student
    const student: ClassroomStudent = {
      id: studentId,
      name: studentName,
      avatarColor,
      score: 0,
      currentQuestion: 0,
      answers: [],
      isConnected: true,
      lastSeen: Date.now(),
      joinedAt: Date.now(),
    };

    await update(ref(db, `classrooms/${sessionId}/students/${studentId}`), student);
    
    this.currentSessionId = sessionId;
    console.log(`[Classroom] ${studentName} joined session ${sessionCode}`);

    // Return updated session
    const updatedSnapshot = await get(sessionRef);
    return updatedSnapshot.val();
  }

  /**
   * Start the quiz session (Teacher)
   */
  async startSession(sessionId: string): Promise<void> {
    const db = getDb();
    const sessionRef = ref(db, `classrooms/${sessionId}`);
    
    await update(sessionRef, {
      status: 'active',
      currentQuestionIndex: 0,
      questionStartTime: Date.now(),
      startedAt: Date.now(),
    });

    console.log(`[Classroom] Started session ${sessionId}`);
  }

  /**
   * Move to next question (Teacher)
   */
  async nextQuestion(sessionId: string): Promise<boolean> {
    const db = getDb();
    const sessionRef = ref(db, `classrooms/${sessionId}`);
    const snapshot = await get(sessionRef);
    
    if (!snapshot.exists()) return false;
    
    const session: ClassroomSession = snapshot.val();
    const nextIndex = session.currentQuestionIndex + 1;

    if (nextIndex >= session.questions.length) {
      // Quiz complete
      await update(sessionRef, {
        status: 'completed',
        completedAt: Date.now(),
      });
      return false;
    }

    await update(sessionRef, {
      currentQuestionIndex: nextIndex,
      questionStartTime: Date.now(),
    });

    return true;
  }

  /**
   * Pause/Resume session (Teacher)
   */
  async togglePause(sessionId: string): Promise<void> {
    const db = getDb();
    const sessionRef = ref(db, `classrooms/${sessionId}`);
    const snapshot = await get(sessionRef);
    
    if (!snapshot.exists()) return;
    
    const session: ClassroomSession = snapshot.val();
    const newStatus = session.status === 'paused' ? 'active' : 'paused';
    
    await update(sessionRef, { status: newStatus });
  }

  /**
   * Submit an answer (Student)
   */
  async submitAnswer(
    sessionId: string,
    studentId: string,
    questionIndex: number,
    isCorrect: boolean,
    timeMs: number
  ): Promise<void> {
    const db = getDb();
    const studentRef = ref(db, `classrooms/${sessionId}/students/${studentId}`);
    const snapshot = await get(studentRef);
    
    if (!snapshot.exists()) return;
    
    const student: ClassroomStudent = snapshot.val();
    
    // Calculate points (base + speed bonus)
    const speedBonus = isCorrect ? Math.max(0, Math.floor((30000 - timeMs) / 1000)) : 0;
    const pointsEarned = isCorrect ? 10 + speedBonus : 0;

    const newAnswers = [...(student.answers || []), { questionIndex, correct: isCorrect, timeMs }];
    
    await update(studentRef, {
      answers: newAnswers,
      score: student.score + pointsEarned,
      currentQuestion: questionIndex + 1,
      lastSeen: Date.now(),
    });
  }

  /**
   * Subscribe to session updates
   */
  subscribeToSession(sessionId: string, callback: (session: ClassroomSession | null) => void): Unsubscribe {
    const db = getDb();
    const sessionRef = ref(db, `classrooms/${sessionId}`);
    
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    });

    this.sessionListeners.set(sessionId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Get session leaderboard
   */
  getLeaderboard(session: ClassroomSession): ClassroomStudent[] {
    const students = Object.values(session.students || {});
    return students.sort((a, b) => {
      // Sort by score, then by average time
      if (b.score !== a.score) return b.score - a.score;
      const aAvgTime = a.answers.length > 0 
        ? a.answers.reduce((sum, ans) => sum + ans.timeMs, 0) / a.answers.length 
        : Infinity;
      const bAvgTime = b.answers.length > 0 
        ? b.answers.reduce((sum, ans) => sum + ans.timeMs, 0) / b.answers.length 
        : Infinity;
      return aAvgTime - bAvgTime;
    });
  }

  /**
   * Get session results
   */
  async getSessionResults(sessionId: string): Promise<SessionResults | null> {
    const db = getDb();
    const sessionRef = ref(db, `classrooms/${sessionId}`);
    const snapshot = await get(sessionRef);
    
    if (!snapshot.exists()) return null;
    
    const session: ClassroomSession = snapshot.val();
    const leaderboard = this.getLeaderboard(session);
    
    return {
      sessionId,
      title: session.title,
      subject: session.subject,
      topic: session.topic,
      totalQuestions: session.questions.length,
      completedAt: session.completedAt ? new Date(session.completedAt).toISOString() : new Date().toISOString(),
      students: leaderboard.map((student, index) => ({
        id: student.id,
        name: student.name,
        score: student.score,
        correctAnswers: student.answers.filter(a => a.correct).length,
        averageTime: student.answers.length > 0 
          ? Math.round(student.answers.reduce((sum, a) => sum + a.timeMs, 0) / student.answers.length)
          : 0,
        rank: index + 1,
      })),
    };
  }

  /**
   * End session and cleanup (Teacher)
   */
  async endSession(sessionId: string): Promise<void> {
    const db = getDb();
    const sessionRef = ref(db, `classrooms/${sessionId}`);
    const snapshot = await get(sessionRef);
    
    if (snapshot.exists()) {
      const session: ClassroomSession = snapshot.val();
      
      await update(sessionRef, {
        status: 'completed',
        completedAt: Date.now(),
      });

      // Remove code lookup
      await remove(ref(db, `classroomCodes/${session.sessionCode}`));
    }

    // Cleanup listener
    const listener = this.sessionListeners.get(sessionId);
    if (listener) {
      listener();
      this.sessionListeners.delete(sessionId);
    }

    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null;
    }
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * Leave session (Student)
   */
  async leaveSession(sessionId: string, studentId: string): Promise<void> {
    const db = getDb();
    await update(ref(db, `classrooms/${sessionId}/students/${studentId}`), {
      isConnected: false,
      lastSeen: Date.now(),
    });

    const listener = this.sessionListeners.get(sessionId);
    if (listener) {
      listener();
      this.sessionListeners.delete(sessionId);
    }

    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null;
    }
  }
}

export const classroomService = new ClassroomService();
