import { collection, getDocs, query, where, type DocumentData } from 'firebase/firestore';
import { getQuestionsForCurriculumUnit } from '../data/questionBank';
import { getCloudSubjectAliases, getCloudTopicAliases } from '../data/questionTopicAliases';
import { applyQuestionQualityControls } from '../data/questionQualityOverrides';
import { BankQuestion, CognitiveLevel, Difficulty, QuestionType } from '../types';
import { db } from './firebase';

const QUERY_CHUNK_SIZE = 30;
const CLOUD_TOPIC_CACHE_PREFIX = 'ks2_cloud_topic_questions_v2:';
const CLOUD_TOPIC_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cloudTopicCache = new Map<string, Promise<BankQuestion[]>>();

const normalizeText = (value: unknown): string => String(value ?? '').replace(/\s+/g, ' ').trim();
const comparisonText = (value: unknown): string => normalizeText(value).toLocaleLowerCase();

const normalizeDifficulty = (value: unknown): Difficulty => {
  const normalized = comparisonText(value);
  if (normalized === 'easy') return Difficulty.Easy;
  if (normalized === 'hard') return Difficulty.Hard;
  return Difficulty.Medium;
};

const normalizeQuestionType = (value: unknown): QuestionType => {
  const normalized = comparisonText(value).replace(/_/g, '-');
  return Object.values(QuestionType).includes(normalized as QuestionType)
    ? normalized as QuestionType
    : QuestionType.MultipleChoice;
};

const normalizeCognitiveLevel = (value: unknown): CognitiveLevel | undefined => {
  const normalized = comparisonText(value);
  return Object.values(CognitiveLevel).includes(normalized as CognitiveLevel)
    ? normalized as CognitiveLevel
    : undefined;
};

const resolveAnswer = (answer: string, options: string[]): string | null => {
  const exact = options.find((option) => comparisonText(option) === comparisonText(answer));
  if (exact) return exact;

  const numeric = Number(answer);
  if (Number.isInteger(numeric)) return options[numeric] ?? options[numeric - 1] ?? null;

  const letter = answer.match(/^([a-f])(?:[.)\s:]|$)/i);
  return letter ? options[letter[1].toLowerCase().charCodeAt(0) - 97] ?? null : null;
};

/**
 * Adapts old and new Firestore records for the current quiz UI. This function
 * is read-only: it never writes changes back to the stored question.
 */
export const normalizeCloudQuestion = (
  id: string,
  data: DocumentData,
  publishedSubject: string,
  publishedTopic: string,
): BankQuestion | null => {
  const question = normalizeText(data.question);
  if (!question) return null;

  const questionType = normalizeQuestionType(data.questionType);
  const rawOptions = Array.isArray(data.options) ? data.options.map(normalizeText).filter(Boolean) : [];
  const options = [...new Map(rawOptions.map((option) => [comparisonText(option), option])).values()];
  let correctAnswer = normalizeText(data.correctAnswer);

  if (questionType === QuestionType.TrueFalse) {
    if (!correctAnswer || !['true', 'false'].includes(comparisonText(correctAnswer))) return null;
    correctAnswer = comparisonText(correctAnswer) === 'true' ? 'True' : 'False';
    options.splice(0, options.length, 'True', 'False');
  } else if (questionType === QuestionType.FillInBlank) {
    if (!correctAnswer) return null;
  } else if (questionType === QuestionType.Drawing) {
    // Creative questions are completed in the drawing canvas and excluded from percentages.
    correctAnswer = correctAnswer || 'Creative response';
  } else if (questionType === QuestionType.MultipleChoice) {
    if (options.length < 2 || !correctAnswer) return null;
    const resolved = resolveAnswer(correctAnswer, options);
    if (!resolved) return null;
    correctAnswer = resolved;
  } else if (questionType === QuestionType.Ordering) {
    if (options.length < 2 || !Array.isArray(data.correctOrder)) return null;
  } else if (questionType === QuestionType.Matching) {
    if (!Array.isArray(data.matchingPairs) || data.matchingPairs.length < 2) return null;
  } else if (questionType === QuestionType.DragAndDrop) {
    if (!Array.isArray(data.dragItems) || !Array.isArray(data.dropZones)) return null;
  }

  const explicitAges = Array.isArray(data.ageGroup)
    ? data.ageGroup.map(Number).filter((age: number) => Number.isInteger(age) && age >= 7 && age <= 11)
    : [];
  const legacyAge = Number(data.age);
  const ageGroup = explicitAges.length > 0
    ? [...new Set(explicitAges)]
    : Number.isInteger(legacyAge) && legacyAge >= 7 && legacyAge <= 11
      ? [legacyAge]
      : [7, 8, 9, 10, 11];

  return applyQuestionQualityControls({
    id,
    subject: publishedSubject,
    topic: publishedTopic,
    ageGroup,
    difficulty: normalizeDifficulty(data.difficulty),
    difficulty_score: typeof data.difficulty_score === 'number' ? data.difficulty_score : undefined,
    question,
    options,
    correctAnswer,
    explanation: normalizeText(data.explanation) || undefined,
    acceptableAnswers: Array.isArray(data.acceptableAnswers)
      ? data.acceptableAnswers.map(normalizeText).filter(Boolean)
      : undefined,
    questionType,
    cognitiveLevel: normalizeCognitiveLevel(data.cognitiveLevel),
    correctOrder: Array.isArray(data.correctOrder) ? data.correctOrder.map(String) : undefined,
    matchingPairs: Array.isArray(data.matchingPairs) ? data.matchingPairs : undefined,
    dragItems: Array.isArray(data.dragItems) ? data.dragItems.map(String) : undefined,
    dropZones: Array.isArray(data.dropZones) ? data.dropZones.map(String) : undefined,
    timesShown: Number(data.performance?.timesShown ?? data.timesShown) || undefined,
    timesCorrect: Number(data.performance?.timesCorrect ?? data.timesCorrect) || undefined,
  });
};

const chunk = <T,>(values: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) chunks.push(values.slice(index, index + size));
  return chunks;
};

function cloudTopicStorageKey(subject: string, bankTopic: string): string {
  return `${CLOUD_TOPIC_CACHE_PREFIX}${encodeURIComponent(`${subject}::${bankTopic}`)}`;
}

function readPersistedCloudQuestions(subject: string, bankTopic: string): {
  questions: BankQuestion[];
  fresh: boolean;
} | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(cloudTopicStorageKey(subject, bankTopic));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { expiresAt?: number; questions?: BankQuestion[] };
    if (!Array.isArray(parsed.questions)) return null;
    return {
      questions: parsed.questions,
      fresh: Number(parsed.expiresAt) > Date.now(),
    };
  } catch {
    return null;
  }
}

function persistCloudQuestions(subject: string, bankTopic: string, questions: BankQuestion[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(cloudTopicStorageKey(subject, bankTopic), JSON.stringify({
      expiresAt: Date.now() + CLOUD_TOPIC_CACHE_TTL_MS,
      questions,
    }));
  } catch {
    // The in-memory cache still protects the current session when storage is full.
  }
}

const fetchCloudQuestionsForTopic = async (subject: string, bankTopic: string): Promise<BankQuestion[]> => {
  const persisted = readPersistedCloudQuestions(subject, bankTopic);
  if (persisted?.fresh) return persisted.questions;

  const aliases = getCloudTopicAliases(subject, bankTopic);
  const allowedSubjects = new Set(getCloudSubjectAliases(subject));
  try {
    const snapshots = await Promise.all(
      chunk(aliases, QUERY_CHUNK_SIZE).map((topicChunk) =>
        getDocs(query(collection(db, 'questions'), where('topic', 'in', topicChunk))),
      ),
    );

    const questions: BankQuestion[] = [];
    for (const snapshot of snapshots) {
      snapshot.forEach((document) => {
        const data = document.data();
        if (!allowedSubjects.has(normalizeText(data.subject))) return;
        const normalized = normalizeCloudQuestion(document.id, data, subject, bankTopic);
        if (normalized) questions.push(normalized);
      });
    }
    persistCloudQuestions(subject, bankTopic, questions);
    return questions;
  } catch (error) {
    // A stale cache is preferable to draining the remaining quota or blanking
    // an otherwise playable lesson when Firestore is temporarily unavailable.
    if (persisted?.questions) return persisted.questions;
    throw error;
  }
};

export const loadCloudQuestionsForCurriculumUnit = (
  subject: string,
  bankTopic: string,
): Promise<BankQuestion[]> => {
  const cacheKey = `${subject}::${bankTopic}`;
  const cached = cloudTopicCache.get(cacheKey);
  if (cached) return cached;

  const request = fetchCloudQuestionsForTopic(subject, bankTopic).catch((error) => {
    cloudTopicCache.delete(cacheKey);
    console.warn(`Cloud question bank unavailable for ${subject} / ${bankTopic}; using offline bank.`, error);
    return [];
  });
  cloudTopicCache.set(cacheKey, request);
  return request;
};

const shuffleOptions = (question: BankQuestion): BankQuestion => {
  if (
    question.questionType === QuestionType.TrueFalse
    || question.questionType === QuestionType.FillInBlank
    || question.questionType === QuestionType.Drawing
    || question.questionType === QuestionType.Ordering
  ) return question;
  return { ...question, options: [...question.options].sort(() => Math.random() - 0.5) };
};

export const selectCanonicalQuestions = (
  questions: BankQuestion[],
  age: number,
  difficulty: Difficulty,
  count: number,
  excludeIds: string[] = [],
): BankQuestion[] => {
  const excluded = new Set(excludeIds);
  const adjacentAges = [age - 1, age + 1];
  const uniqueQuestions = questions.filter((question, index) => {
    if (excluded.has(question.id)) return false;
    const normalizedQuestionText = comparisonText(question.question);
    return questions.findIndex((candidate) => comparisonText(candidate.question) === normalizedQuestionText) === index;
  });
  const ranked = uniqueQuestions
    .map((question, originalIndex) => {
      const exactAge = question.ageGroup.includes(age);
      const adjacentAge = question.ageGroup.some((candidateAge) => adjacentAges.includes(candidateAge));
      const exactDifficulty = question.difficulty === difficulty;
      const rank = exactAge && exactDifficulty ? 0
        : exactAge ? 1
        : adjacentAge && exactDifficulty ? 2
        : exactDifficulty ? 3
        : adjacentAge ? 4
        : 5;
      return { question, rank, originalIndex, random: Math.random() };
    })
    .sort((a, b) => a.rank - b.rank || a.random - b.random || a.originalIndex - b.originalIndex);

  const selected: BankQuestion[] = [];
  const seenIds = new Set<string>();
  const seenText = new Set<string>();
  for (const { question } of ranked) {
    const normalizedQuestionText = comparisonText(question.question);
    if (seenIds.has(question.id) || seenText.has(normalizedQuestionText)) continue;
    seenIds.add(question.id);
    seenText.add(normalizedQuestionText);
    selected.push(shuffleOptions(question));
    if (selected.length >= count) break;
  }
  return selected;
};

/**
 * Canonical question source: priority reviewed content, then the user's live
 * Firestore bank, then the bundled offline bank. No source records are mutated.
 */
export const getCanonicalQuestionsForCurriculumUnit = async (
  subject: string,
  bankTopic: string,
  age: number,
  difficulty: Difficulty,
  count: number,
  excludeIds: string[] = [],
  priorityQuestions: BankQuestion[] = [],
): Promise<BankQuestion[]> => {
  const [cloudQuestions, offlineQuestions] = await Promise.all([
    loadCloudQuestionsForCurriculumUnit(subject, bankTopic),
    getQuestionsForCurriculumUnit(subject, bankTopic, age, difficulty, Math.max(count * 3, 30), excludeIds),
  ]);
  const priority = selectCanonicalQuestions(priorityQuestions, age, difficulty, count, excludeIds);
  if (priority.length >= count) return priority;

  const selected = selectCanonicalQuestions(
    [...cloudQuestions, ...offlineQuestions],
    age,
    difficulty,
    count - priority.length,
    [...excludeIds, ...priority.map((question) => question.id)],
  );
  const priorityText = new Set(priority.map((question) => comparisonText(question.question)));
  return [...priority, ...selected.filter((question) => !priorityText.has(comparisonText(question.question)))].slice(0, count);
};

export const clearCloudQuestionCacheForTests = (): void => cloudTopicCache.clear();
