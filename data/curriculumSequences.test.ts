import { describe, expect, it } from 'vitest';
import { SUBJECTS, LANGUAGES } from '../constants';
import { CURATED_LANGUAGES, getCurriculumUnits } from './curriculumSequences';
import { getQuestionsForCurriculumUnit } from './questionBank';
import { Difficulty } from '../types';
import {
  getReviewedLanguageLesson,
  getReviewedLanguageQuestions,
  getReviewedLanguageVocabulary,
} from './reviewedLanguageContent';

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

  it('publishes only languages with complete lesson flows', () => {
    expect(LANGUAGES.map((language) => language.name)).toEqual([...CURATED_LANGUAGES]);
    for (const language of CURATED_LANGUAGES) {
      expect(getCurriculumUnits(language, 10)).toHaveLength(3);
    }
  });

  it('does not publish unsupported RE or standalone citizenship cards', () => {
    expect(SUBJECTS.some((subject) => ['Religious Education', 'Citizenship'].includes(subject.name))).toBe(false);
  });

  it('connects Yoruba and Romanian to their reviewed starter question banks', async () => {
    const yoruba = await getQuestionsForCurriculumUnit('Yoruba', 'Yoruba: Greetings', 7, Difficulty.Easy, 5);
    const romanian = await getQuestionsForCurriculumUnit('Romanian', 'Romanian: Numbers', 7, Difficulty.Easy, 5);
    expect(yoruba).toHaveLength(5);
    expect(yoruba.some((question) => question.correctAnswer === 'Ẹ ṣé')).toBe(true);
    expect(romanian).toHaveLength(5);
    expect(romanian.every((question) => question.topic === 'Romanian: Numbers')).toBe(true);
    expect(romanian.some((question) => question.correctAnswer === 'Cinci')).toBe(true);
  });

  it('provides reviewed lessons and questions for every Yoruba and Romanian unit', () => {
    for (const language of ['Yoruba', 'Romanian']) {
      for (const age of [7, 8, 9, 10]) {
        for (const unit of getCurriculumUnits(language, age)) {
          expect(getReviewedLanguageLesson(language, unit.title, age), `${language}: ${unit.title}`).toContain('# Modelled Example');
          expect(getReviewedLanguageQuestions(language, unit.title, age), `${language}: ${unit.title}`).toHaveLength(4);
        }
      }
    }
  });

  it('uses source-audited Yoruba forms and tone patterns instead of English stress respellings', () => {
    const ageLesson = getReviewedLanguageLesson('Yoruba', 'Numbers and age', 7);
    const schoolLesson = getReviewedLanguageLesson('Yoruba', 'School and daily routine', 9);
    const opinionLesson = getReviewedLanguageLesson('Yoruba', 'Conversations and opinions', 10);

    expect(ageLesson).toContain('Ọmọ ọdún mélòó ni ọ́?');
    expect(schoolLesson).toContain('Mo ń kẹ́kọ̀ọ́ ní ilé-ìwé.');
    expect(opinionLesson).toContain('nítorí pé ó dùn');

    for (const age of [7, 8, 9, 10]) {
      for (const unit of getCurriculumUnits('Yoruba', age)) {
        const vocabulary = getReviewedLanguageVocabulary('Yoruba', unit.title);
        expect(vocabulary).toHaveLength(4);
        expect(vocabulary.every(({ phonetic }) => /^tones: [HML](?:–[HML])*$/.test(phonetic))).toBe(true);
      }
    }
  });

  it('builds stable language questions with four unique answer options', () => {
    const first = getReviewedLanguageQuestions('Yoruba', 'Greetings and introductions', 7);
    const second = getReviewedLanguageQuestions('Yoruba', 'Greetings and introductions', 7);

    expect(second).toEqual(first);
    for (const question of first) {
      expect(new Set(question.options).size).toBe(4);
      expect(question.options).toContain(question.correctAnswer);
    }
  });
});
