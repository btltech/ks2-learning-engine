import { describe, expect, it } from 'vitest';
import { Difficulty } from '../types';
import { buildLessonPrompt, normalizeLessonHeadings, validateGeneratedLessonContent } from './lessonGeneration';

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

describe('lesson generation guardrails', () => {
  it('grounds the prompt in the exact published curriculum objective', () => {
    const prompt = buildLessonPrompt({
      subject: 'Maths',
      topic: 'Place value to 1,000',
      difficulty: Difficulty.Medium,
      studentAge: 7,
    });
    expect(prompt).toContain('Read, compare and represent numbers to 1,000.');
    expect(prompt).toContain('exactly those 6 headings');
  });

  it('accepts a complete bounded lesson and rejects a missing required section', () => {
    expect(validateGeneratedLessonContent(VALID_LESSON).isValid).toBe(true);
    const incomplete = VALID_LESSON.replace('# Independent Check', '# Final Activity');
    expect(validateGeneratedLessonContent(incomplete).issues).toContain(
      'Lesson is missing the required Independent Check heading',
    );
  });

  it('canonicalises plain, bold and numbered section labels before validation', () => {
    const looselyFormatted = VALID_LESSON
      .replace('# Learning Objective', '**Learning Objective:**')
      .replace('# Key Vocabulary', '2. Key Vocabulary')
      .replace('# Teach', 'Teach:')
      .replace('# Modelled Example', '4) **Modelled Example**')
      .replace('# Guided Practice', '## Guided Practice')
      .replace('# Independent Check', '__Independent Check__');

    const normalized = normalizeLessonHeadings(looselyFormatted);
    expect(normalized).toContain('# Learning Objective');
    expect(normalized).toContain('# Independent Check');
    expect(validateGeneratedLessonContent(looselyFormatted).isValid).toBe(true);
  });

  it('rejects a topic outside the published curriculum', () => {
    expect(() => buildLessonPrompt({
      subject: 'Maths',
      topic: 'Unpublished topic',
      difficulty: Difficulty.Easy,
      studentAge: 7,
    })).toThrow('not part of the published KS2 curriculum');
  });
});
