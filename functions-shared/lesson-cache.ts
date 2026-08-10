import { getCurriculumUnit, getYearGroupForAge } from '../data/curriculumSequences';
import { Difficulty } from '../types';
import {
  LESSON_MODEL,
  LESSON_PROMPT_VERSION,
  type LessonRequestContext,
  validateGeneratedLessonContent,
} from '../services/lessonGeneration';
import { validateLesson } from '../services/contentValidator';

const ALLOWED_DIFFICULTIES = new Set<string>(Object.values(Difficulty));
const USABLE_STATUSES = new Set(['approved', 'generated', 'migrated']);

function boundedText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

export interface CanonicalLessonContext extends LessonRequestContext {
  curriculumUnitId: string;
  objective: string;
  yearGroup: number;
}

export function parseLessonContext(value: unknown): CanonicalLessonContext | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const subject = boundedText(input.subject, 80);
  const topic = boundedText(input.topic, 160);
  const difficulty = boundedText(input.difficulty, 20);
  const studentAge = Number(input.studentAge);
  if (!subject || !topic || !ALLOWED_DIFFICULTIES.has(difficulty)) return null;
  if (!Number.isInteger(studentAge) || studentAge < 7 || studentAge > 11) return null;

  const unit = getCurriculumUnit(subject, topic, studentAge);
  if (!unit) return null;
  return {
    subject: unit.subject,
    topic: unit.title,
    difficulty: difficulty as Difficulty,
    studentAge,
    curriculumUnitId: unit.id,
    objective: unit.objective,
    yearGroup: getYearGroupForAge(studentAge),
  };
}

export function lessonDocumentId(context: CanonicalLessonContext): string {
  return `lesson-${context.curriculumUnitId}-${context.difficulty.toLowerCase()}-age-${context.studentAge}`;
}

export function legacyLessonDocumentId(context: CanonicalLessonContext): string {
  return ['lesson', context.subject, context.topic, context.difficulty, String(context.studentAge)]
    .map(slug)
    .join('-')
    .replace(/[^a-zA-Z0-9-]/g, '_');
}

export function getCanonicalStoredLesson(
  document: Record<string, unknown> | null,
  context: CanonicalLessonContext,
): string | null {
  if (!document) return null;
  const content = typeof document.content === 'string' ? document.content.trim() : '';
  const status = typeof document.status === 'string' ? document.status : '';
  const approved = status === 'approved';
  const currentGenerated = USABLE_STATUSES.has(status)
    && document.promptVersion === LESSON_PROMPT_VERSION
    && document.model === LESSON_MODEL;
  const matchesContext = document.contentType === 'lesson'
    && document.curriculumUnitId === context.curriculumUnitId
    && document.difficulty === context.difficulty
    && document.studentAge === context.studentAge;
  if (!content || !matchesContext || (!approved && !currentGenerated)) return null;
  return validateGeneratedLessonContent(content).isValid ? content : null;
}

export function getLegacyStoredLesson(document: Record<string, unknown> | null): string | null {
  if (!document || document.version !== LESSON_MODEL || typeof document.data !== 'string') return null;
  const content = document.data.trim();
  return validateLesson(content).isValid ? content : null;
}

export function buildLessonDocument(
  context: CanonicalLessonContext,
  content: string,
  source: 'gemini' | 'gemini-legacy-rewrite' | 'legacy-cache',
  now = new Date().toISOString(),
) {
  return {
    contentType: 'lesson',
    schemaVersion: 1,
    status: source === 'legacy-cache' ? 'migrated' : 'generated',
    subject: context.subject,
    topic: context.topic,
    curriculumUnitId: context.curriculumUnitId,
    objective: context.objective,
    yearGroup: context.yearGroup,
    studentAge: context.studentAge,
    difficulty: context.difficulty,
    content,
    model: LESSON_MODEL,
    promptVersion: LESSON_PROMPT_VERSION,
    source,
    validation: { passed: true, issues: [] },
    createdAt: now,
    updatedAt: now,
  };
}
