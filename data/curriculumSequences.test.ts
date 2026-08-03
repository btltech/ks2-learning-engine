import { describe, expect, it } from 'vitest';
import { SUBJECTS, LANGUAGES } from '../constants';
import { CURATED_LANGUAGES, getCurriculumUnits } from './curriculumSequences';

describe('published curriculum sequences', () => {
  it('gives every visible learning subject an ordered sequence in every KS2 year', () => {
    const learningSubjects = SUBJECTS.map((subject) => subject.name).filter((name) => name !== 'Languages');
    for (const age of [7, 8, 9, 10]) {
      for (const subject of learningSubjects) {
        const units = getCurriculumUnits(subject, age);
        expect(units.length, `${subject} at age ${age}`).toBeGreaterThan(0);
        expect(units.map((unit) => unit.order)).toEqual(units.map((_, index) => index + 1));
        expect(units.every((unit) => unit.objective.length > 20 && unit.bankTopic.length > 0)).toBe(true);
      }
    }
  });

  it('publishes only the four languages with complete flows', () => {
    expect(LANGUAGES.map((language) => language.name)).toEqual([...CURATED_LANGUAGES]);
    for (const language of CURATED_LANGUAGES) {
      expect(getCurriculumUnits(language, 10)).toHaveLength(3);
    }
  });

  it('does not publish unsupported RE or standalone citizenship cards', () => {
    expect(SUBJECTS.some((subject) => ['Religious Education', 'Citizenship'].includes(subject.name))).toBe(false);
  });
});
