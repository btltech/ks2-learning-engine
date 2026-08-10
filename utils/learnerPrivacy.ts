const ADJECTIVES = ['Bright', 'Brave', 'Calm', 'Clever', 'Creative', 'Curious', 'Focused', 'Kind'];
const ANIMALS = ['Dolphin', 'Fox', 'Lion', 'Otter', 'Owl', 'Panda', 'Robin', 'Tiger'];

const stableNumber = (value: string): number => Array.from(value).reduce(
  (hash, character) => ((hash * 31) + (character.codePointAt(0) || 0)) >>> 0,
  2166136261,
);

/** Keeps children's real names off shared leaderboards while giving each learner a stable label. */
export const getSafeLearnerName = (
  realName: string | undefined,
  learnerId: string,
  isCurrentLearner = false,
): string => {
  if (isCurrentLearner) return realName?.trim() || 'You';
  const hash = stableNumber(learnerId || 'learner');
  const adjective = ADJECTIVES[hash % ADJECTIVES.length];
  const animal = ANIMALS[Math.floor(hash / ADJECTIVES.length) % ANIMALS.length];
  const suffix = 10 + (hash % 90);
  return `${adjective} ${animal} ${suffix}`;
};
