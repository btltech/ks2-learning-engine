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
      expect(getCurriculumUnits(language, 10).length).toBeGreaterThan(0);
    }
  });

  it('publishes RE while keeping citizenship inside PSHE', () => {
    expect(SUBJECTS.some((subject) => subject.name === 'Religious Education')).toBe(true);
    expect(SUBJECTS.some((subject) => subject.name === 'Citizenship')).toBe(false);
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
          expect(getReviewedLanguageQuestions(language, unit.title, age).length, `${language}: ${unit.title}`).toBeGreaterThanOrEqual(4);
        }
      }
    }
  });

  it('covers the complete Yoruba KS2 topic map', () => {
    const expectedTopics = [
      'Greetings and introductions',
      'Alphabet and pronunciation',
      'Numbers and age',
      'Colours and classroom objects',
      'Family and people',
      'Body and health',
      'Food and preferences',
      'School and daily routine',
      'Home and everyday objects',
      'Clothing',
      'Animals and nature',
      'Weather and seasons',
      'Time and calendar',
      'Transport and road safety',
      'Places and directions',
      'Shopping and money',
      'Hobbies and free time',
      'Community and public places',
      'Yoruba culture and identity',
      'Grammar and sentence patterns',
      'Reading short texts',
      'Reading stories, poems and songs',
      'Listening and dictation',
      'Speaking and presentations',
      'Conversations and opinions',
      'Writing connected sentences',
    ];
    const publishedTopics = new Set([7, 8, 9, 10].flatMap((age) => getCurriculumUnits('Yoruba', age).map((unit) => unit.title)));
    expect([...publishedTopics].sort()).toEqual([...expectedTopics].sort());
  });

  it('uses source-audited Yoruba forms and tone patterns instead of English stress respellings', () => {
    const ageLesson = getReviewedLanguageLesson('Yoruba', 'Numbers and age', 7);
    const schoolLesson = getReviewedLanguageLesson('Yoruba', 'School and daily routine', 8);
    const opinionLesson = getReviewedLanguageLesson('Yoruba', 'Conversations and opinions', 10);

    expect(ageLesson).toContain('Ọmọ ọdún mélòó ni ọ́?');
    expect(schoolLesson).toContain('Mo ń kẹ́kọ̀ọ́ ní ilé-ìwé.');
    expect(opinionLesson).toContain('nítorí pé ó dùn');

    for (const age of [7, 8, 9, 10]) {
      for (const unit of getCurriculumUnits('Yoruba', age)) {
        const vocabulary = getReviewedLanguageVocabulary('Yoruba', unit.title);
        expect(vocabulary.length).toBeGreaterThanOrEqual(4);
        expect(vocabulary.every(({ phonetic }) => /^tones: [HML](?:–[HML])*$/.test(phonetic) || phonetic === 'tone-marked spelling')).toBe(true);
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
