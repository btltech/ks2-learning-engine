import { describe, expect, it } from 'vitest';
import { Difficulty } from '../types';
import { LESSON_MODEL, LESSON_PROMPT_VERSION } from '../services/lessonGeneration';
import {
  buildLessonDocument,
  getCanonicalStoredLesson,
  getLegacyStoredLesson,
  legacyLessonDocumentId,
  lessonDocumentId,
  parseLessonContext,
} from './lesson-cache';

const VALID_LESSON = `# Learning Objective
I can explain how place value works in numbers to 1,000.

# Key Vocabulary
Digit means one numeral. Place means a digit's position. Value means what that digit represents.

# Teach
Each digit has a value based on its column. Moving one place left makes its value ten times greater.

# Modelled Example
In 472, the 4 is in the hundreds column, so its value is 400. The 7 has a value of 70 and the 2 has a value of 2.

# Guided Practice
Find the value of 6 in 361. Hint: identify its column first.

# Independent Check
Write 805 as hundreds, tens and ones.`;

function mathsContext() {
  const context = parseLessonContext({
    subject: 'Maths',
    topic: 'Place value to 1,000',
    difficulty: Difficulty.Medium,
    studentAge: 7,
  });
  if (!context) throw new Error('Expected a canonical context');
  return context;
}

describe('Firestore lesson cache records', () => {
  it('accepts only published KS2 lesson contexts', () => {
    expect(mathsContext().curriculumUnitId).toContain('maths-y3');
    expect(parseLessonContext({
      subject: 'Maths',
      topic: 'Invented topic',
      difficulty: Difficulty.Medium,
      studentAge: 7,
    })).toBeNull();
  });

  it('uses deterministic canonical and legacy Firebase document IDs', () => {
    const context = mathsContext();
    expect(lessonDocumentId(context)).toBe(
      'lesson-maths-y3-1-place-value-to-1-000-medium-age-7',
    );
    expect(legacyLessonDocumentId(context)).toBe(
      'lesson-maths-place-value-to-1-000-medium-7',
    );
  });

  it('returns current generated content but ignores quarantined content', () => {
    const context = mathsContext();
    const document = buildLessonDocument(context, VALID_LESSON, 'gemini');
    expect(document.promptVersion).toBe(LESSON_PROMPT_VERSION);
    expect(getCanonicalStoredLesson(document, context)).toBe(VALID_LESSON);
    expect(getCanonicalStoredLesson({ ...document, status: 'quarantined' }, context)).toBeNull();
  });

  it('accepts a valid matching legacy Gemini lesson for one-time migration', () => {
    expect(getLegacyStoredLesson({ version: LESSON_MODEL, data: VALID_LESSON })).toBe(VALID_LESSON);
    expect(getLegacyStoredLesson({ version: 'old-model', data: VALID_LESSON })).toBeNull();
  });
});
