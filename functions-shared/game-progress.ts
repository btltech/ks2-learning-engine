export interface StoredGameProfile {
  userId: string;
  gamesRemaining: number;
  passesCount: number;
  processedQuizIds: string[];
  highScores: Record<string, number>;
  gamesPlayed: number;
  activeSessionId?: string;
  lastQuiz?: {
    correct: number;
    total: number;
    passed: boolean;
    at: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const REQUIRED_QUIZ_PERCENT = 70;
export const REQUIRED_PASSES = 3;
export const PLAYS_PER_UNLOCK = 2;
export const MAX_STORED_PLAYS = 6;

export function defaultGameProfile(userId: string, now = new Date().toISOString()): StoredGameProfile {
  return {
    userId,
    gamesRemaining: 0,
    passesCount: 0,
    processedQuizIds: [],
    highScores: {},
    gamesPlayed: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function safeScore(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 0;
}

/**
 * Converts quiz history already stored on the learner's server profile into
 * game credits. Quiz IDs are remembered so refreshing cannot award twice.
 */
export function syncQuizCredits(
  stored: StoredGameProfile,
  quizHistory: unknown,
  now = new Date().toISOString()
): { profile: StoredGameProfile; changed: boolean } {
  const history = Array.isArray(quizHistory) ? quizHistory.slice(-200) : [];
  const processed = new Set(Array.isArray(stored.processedQuizIds) ? stored.processedQuizIds : []);
  const unseen = history.filter((entry: any) => {
    const id = typeof entry?.id === 'string' ? entry.id : '';
    return id && !processed.has(id);
  });

  if (!unseen.length) return { profile: stored, changed: false };

  let passesCount = Math.max(0, Number(stored.passesCount) || 0);
  let gamesRemaining = Math.max(0, Number(stored.gamesRemaining) || 0);
  let lastQuiz = stored.lastQuiz;

  unseen.forEach((entry: any) => {
    const id = String(entry.id);
    const score = safeScore(entry.score);
    const total = Math.max(1, Number(entry.totalQuestions) || 10);
    const correct = Number.isFinite(Number(entry.correctAnswers))
      ? Math.max(0, Math.min(total, Number(entry.correctAnswers)))
      : Math.round((score / 100) * total);
    const passed = score >= REQUIRED_QUIZ_PERCENT;
    processed.add(id);
    if (passed) passesCount += 1;
    lastQuiz = {
      correct,
      total,
      passed,
      at: typeof entry.completedAt === 'string' ? entry.completedAt : now,
    };
  });

  const unlocks = Math.floor(passesCount / REQUIRED_PASSES);
  passesCount %= REQUIRED_PASSES;
  gamesRemaining = Math.min(MAX_STORED_PLAYS, gamesRemaining + unlocks * PLAYS_PER_UNLOCK);

  return {
    changed: true,
    profile: {
      ...stored,
      gamesRemaining,
      passesCount,
      processedQuizIds: Array.from(processed).slice(-200),
      lastQuiz,
      updatedAt: now,
    },
  };
}

export function publicGameStatus(profile: StoredGameProfile) {
  return {
    isUnlocked: profile.gamesRemaining > 0 || Boolean(profile.activeSessionId),
    gamesRemaining: Math.max(0, profile.gamesRemaining),
    passesCount: Math.max(0, profile.passesCount),
    requiredPasses: REQUIRED_PASSES,
    requiredCorrect: 7,
    totalQuestions: 10,
    highScores: profile.highScores || {},
    gamesPlayed: Math.max(0, profile.gamesPlayed || 0),
    activeSessionId: profile.activeSessionId || null,
    lastQuiz: profile.lastQuiz,
  };
}
