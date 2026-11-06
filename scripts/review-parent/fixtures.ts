// Synthetic review data only. This module replaces service/context imports in
// the isolated review Vite config; it is never imported by the application.
import { useSyncExternalStore } from 'react';
const now = new Date('2026-11-06T10:00:00Z');
export const children = ['Sample Learner', 'Demo Learner'].map((name, i) => ({
  id: `review-child-${i}`, name, age: 9 + i, role: 'student', totalPoints: 420 - i * 100, streak: 4,
  lastLoginDate: now.toISOString(), weeklyGoal: 180,
  weeklyProgress: { minutesLearned: 95, quizzesTaken: 3, averageScore: 78, goalMet: false },
  timeSpentLearning: { Maths: 75, English: 40, Science: 30 },
  mastery: { Maths: { Addition: 90, Fractions: 45, Geometry: 70 }, English: { Reading: 85, Spelling: 75 }, Science: { Plants: 80 } },
  badges: [{ id: 'review-badge', name: 'First Steps', description: 'Complete your first quiz', icon: '✓', earnedAt: now.toISOString() }],
  quizHistory: [90, 70, 85, 65].map((score, j) => ({ id: `review-quiz-${i}-${j}`, subject: j % 2 ? 'English' : 'Maths', topic: j % 2 ? 'Reading' : 'Fractions', score, totalQuestions: 10, correctAnswers: score / 10, completedAt: new Date(now.getTime() - j * 86400000).toISOString(), timeSpent: 4, difficulty: 'Medium', results: [] })),
}));
export const parent = { id: 'review-parent', role: 'parent', name: 'Sample Parent', parentCode: 'DEMO-ONLY', totalPoints: 0, badges: [], quizHistory: [] };
let selectedId = children[0].id;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const noop = () => {};
const record = (name: string) => { ((window as any).__reviewCalls ||= []).push(name); };
export const useUser = () => {
  const id = useSyncExternalStore(subscribe, () => selectedId);
  const empty = new URLSearchParams(location.search).has('empty');
  return { user: parent, currentChild: empty ? null : children.find(c => c.id === id), linkedChildren: empty ? [] : children, selectedChildId: empty ? null : id,
    selectChild: (next: string) => { selectedId = next; listeners.forEach(listener => listener()); }, setUser: noop, refreshLinkedChildren: async () => {}, };
};
export const authService = { getParentStats: () => ({ totalTimeSpent: 145, quizzesTaken: 4, averageScore: 78, strongestSubject: 'English', weakestSubject: 'Maths', recentActivity: [{ activity: 'Completed Fractions Quiz', date: 'Review sample', score: 90 }, { activity: 'Completed Reading Quiz', date: 'Review sample', score: 70 }] }) };
export const firebaseAuthService = { regenerateParentCode: async () => 'DEMO-ONLY', updateUserProfile: async () => {}, setChildPin: async () => {}, createChild: async () => children[0], unlinkChild: async () => {}, deleteChild: async () => { record('deleteChild'); }, resetChildProfile: async () => { record('resetChildProfile'); }, updateChildProgress: async () => {} };
export const generateProgressReport = async () => 'Synthetic progress report. Maths: 68% mastery. English: 80% mastery. Practise fractions in short sessions.';
export const generateLearningInsights = async () => 'Synthetic recommendations. Review one fractions lesson, then try a short quiz.';
export const useRealtimeStudentActivity = () => ({ lastUpdate: now.toISOString() });
export const useRealtimeChildProfile = () => ({ childData: children[0], loading: false });
export const useRealtimeLeaderboard = () => ({ leaderboard: children.map((c, i) => ({ id: c.id, displayName: `Demo learner ${i + 1}`, publicAlias: `Demo learner ${i + 1}`, points: c.totalPoints, age: c.age, streak: c.streak })), loading: false, error: null });
export const useGameSounds = () => ({ soundEnabled: false, playClick: noop });
