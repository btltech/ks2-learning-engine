import type { Badge } from '../types';

/** Shared display metadata; earning conditions remain in UserContext. */
export const AVAILABLE_BADGES: Badge[] = [
  { id: 'first-steps', name: 'First Steps', description: 'Complete your first quiz', icon: '🏁' },
  { id: 'point-collector', name: 'Point Collector', description: 'Earn 100 points', icon: '💰' },
  { id: 'streak-master', name: 'Streak Master', description: 'Reach a 3-day streak', icon: '🔥' },
  { id: 'math-whiz', name: 'Math Whiz', description: 'Score over 80% in a Math topic', icon: '➗' },
  { id: 'language-learner', name: 'Polyglot', description: 'Complete a Language lesson', icon: '🌍' },
];
