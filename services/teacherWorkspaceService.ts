import { getAuth } from 'firebase/auth';
import { Difficulty, QuizResult } from '../types';

export interface SharedStudentSummary {
  studentId: string;
  studentName: string;
  age: number;
  points: number;
  streak: number;
  lastActive: string | null;
  totalQuizzes: number;
  averageScore: number;
  timeSpent: number;
  subjectMastery: Record<string, number>;
}

export interface SharedClass {
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  grade: string;
  joinCode: string;
  studentIds: string[];
  students?: SharedStudentSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface SharedHomeworkSubmission {
  submissionId: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  reviewed: boolean;
  feedback?: string;
}

export interface SharedHomework {
  homeworkId: string;
  teacherId: string;
  title: string;
  description: string;
  subject: string;
  topics: string[];
  difficulty: Difficulty;
  questionCount: number;
  dueDate: string;
  assignedClassIds: string[];
  createdAt: string;
  updatedAt: string;
  submissions: SharedHomeworkSubmission[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Please sign in again.');
  const token = await user.getIdToken();
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'The shared classroom service is unavailable.');
  return data as T;
}

export const teacherWorkspaceService = {
  async getClasses(): Promise<SharedClass[]> {
    const data = await request<{ classes: SharedClass[] }>('/api/classes');
    return data.classes;
  },

  async createClass(className: string, grade: string): Promise<SharedClass> {
    const data = await request<{ class: SharedClass }>('/api/classes', {
      method: 'POST',
      body: JSON.stringify({ action: 'create', className, grade }),
    });
    return data.class;
  },

  async joinClass(joinCode: string): Promise<SharedClass> {
    const data = await request<{ class: SharedClass }>('/api/classes', {
      method: 'POST',
      body: JSON.stringify({ action: 'join', joinCode }),
    });
    return data.class;
  },

  async removeStudent(classId: string, studentId: string): Promise<void> {
    await request('/api/classes', {
      method: 'POST',
      body: JSON.stringify({ action: 'removeStudent', classId, studentId }),
    });
  },

  async getHomework(): Promise<SharedHomework[]> {
    const data = await request<{ homework: SharedHomework[] }>('/api/homework');
    return data.homework;
  },

  async createHomework(input: {
    title: string;
    description: string;
    subject: string;
    topic: string;
    difficulty: Difficulty;
    questionCount: number;
    dueDate: string;
    assignedClassIds: string[];
  }): Promise<SharedHomework> {
    const data = await request<{ homework: SharedHomework }>('/api/homework', {
      method: 'POST',
      body: JSON.stringify({ action: 'create', ...input }),
    });
    return data.homework;
  },

  async submitHomework(homeworkId: string, results: QuizResult[], timeSpent: number): Promise<SharedHomeworkSubmission> {
    const data = await request<{ submission: SharedHomeworkSubmission }>('/api/homework', {
      method: 'POST',
      body: JSON.stringify({
        action: 'submit',
        homeworkId,
        timeSpent: Math.round(timeSpent / 1000),
        answers: results.map((result) => ({
          question: result.question,
          studentAnswer: result.userAnswer,
          correctAnswer: result.correctAnswer,
          isCorrect: result.isCorrect,
        })),
      }),
    });
    return data.submission;
  },
};

export function homeworkStats(homework: SharedHomework, assignedStudents: number) {
  const submissions = homework.submissions || [];
  const submitted = submissions.length;
  return {
    totalAssigned: assignedStudents,
    submitted,
    pending: Math.max(0, assignedStudents - submitted),
    averageScore: submitted
      ? Math.round(submissions.reduce((sum, submission) => sum + submission.score, 0) / submitted)
      : 0,
  };
}
