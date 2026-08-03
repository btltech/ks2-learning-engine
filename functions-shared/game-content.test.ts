import { describe, expect, it } from 'vitest';
import { answerIsCorrect, calculateGameResult, createGameQuestions, publicQuestion } from './game-content';

describe('game content', () => {
  it.each([
    ['maths_mission', 10],
    ['times_table_sprint', 20],
    ['spelling_workshop', 10],
    ['science_lab', 12],
    ['history_detective', 10],
  ] as const)('creates a complete %s session', (gameId, expected) => {
    const questions = createGameQuestions(gameId, { yearGroup: '5-6', table: 'mixed' });
    expect(questions).toHaveLength(expected);
    expect(questions.every((question) => question.answer && question.explanation)).toBe(true);
    expect(publicQuestion(questions[0])).not.toHaveProperty('answer');
    expect(publicQuestion(questions[0])).not.toHaveProperty('explanation');
  });

  it('normalises spelling answers using British case-insensitive matching', () => {
    const question = createGameQuestions('spelling_workshop', { yearGroup: '3-4' })[0];
    expect(answerIsCorrect('spelling_workshop', question, `  ${question.answer.toUpperCase()} `)).toBe(true);
  });

  it('always puts one unambiguous correct answer in each choice list', () => {
    const gameIds = ['maths_mission', 'times_table_sprint', 'science_lab', 'history_detective'] as const;
    for (let run = 0; run < 20; run += 1) {
      gameIds.forEach((gameId) => {
        createGameQuestions(gameId, { yearGroup: run % 2 ? '3-4' : '5-6', table: 'mixed' }).forEach((question) => {
          expect(question.options).toContain(question.answer);
          expect(new Set(question.options).size).toBe(question.options?.length);
        });
      });
    }
  });

  it('requires accuracy before awarding a times-table speed bonus', () => {
    expect(calculateGameResult('times_table_sprint', 10, 20, 40).speedBonus).toBe(0);
    expect(calculateGameResult('times_table_sprint', 18, 20, 70)).toMatchObject({ stars: 3, speedBonus: 40 });
  });
});
