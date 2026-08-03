import { QuestionType, type QuizQuestion, type QuizResult } from '../types';

const normalize = (value?: string | null): string => (value ?? '').trim().toLowerCase();

export const resolveMultipleChoiceAnswer = (question: QuizQuestion): string | undefined => {
  if (!question.correctAnswer) return undefined;
  const answer = question.correctAnswer.trim();
  const exact = question.options?.find((option) => normalize(option) === normalize(answer));
  if (exact) return exact;

  const numeric = Number(answer);
  if (Number.isInteger(numeric)) {
    return question.options?.[numeric] ?? question.options?.[numeric - 1] ?? answer;
  }

  const letter = answer.match(/^([A-Fa-f])(?:[.)\s:]|$)/);
  if (letter) return question.options?.[letter[1].toUpperCase().charCodeAt(0) - 65] ?? answer;
  return answer;
};

export const getExpectedOrder = (question: QuizQuestion): string[] => {
  const order = question.correctOrder ?? [];
  if (order.every((entry) => typeof entry === 'number')) {
    return (order as unknown as number[]).map((index) => question.options[index]).filter(Boolean);
  }
  return order.map(String);
};

export const scoreQuizAnswer = (question: QuizQuestion, userAnswer: string): Pick<QuizResult, 'isCorrect' | 'isScored'> => {
  const type = question.questionType ?? QuestionType.MultipleChoice;

  if (type === QuestionType.Drawing) return { isCorrect: false, isScored: false };

  if (type === QuestionType.FillInBlank) {
    const accepted = [question.correctAnswer, ...(question.acceptableAnswers ?? [])].map(normalize);
    return { isCorrect: accepted.includes(normalize(userAnswer)), isScored: true };
  }

  if (type === QuestionType.Ordering) {
    try {
      const submitted = JSON.parse(userAnswer) as string[];
      const expected = getExpectedOrder(question);
      return {
        isCorrect: Array.isArray(submitted) && submitted.length === expected.length && submitted.every((item, index) => item === expected[index]),
        isScored: true,
      };
    } catch {
      return { isCorrect: false, isScored: true };
    }
  }

  if (type === QuestionType.Matching) {
    try {
      const matches = JSON.parse(userAnswer) as Record<string, string>;
      return { isCorrect: question.matchingPairs?.every((pair) => matches[pair.left] === pair.right) ?? false, isScored: true };
    } catch {
      return { isCorrect: false, isScored: true };
    }
  }

  if (type === QuestionType.DragAndDrop) {
    try {
      const placements = JSON.parse(userAnswer) as Record<string, string>;
      const expectedZones = question.dropZones ?? [];
      return {
        isCorrect: (question.dragItems ?? []).every((_, index) => placements[`item-${index}`] === expectedZones[index]),
        isScored: true,
      };
    } catch {
      return { isCorrect: false, isScored: true };
    }
  }

  const correct = resolveMultipleChoiceAnswer(question);
  return { isCorrect: Boolean(correct && normalize(correct) === normalize(userAnswer)), isScored: true };
};

export const buildQuizResults = (questions: QuizQuestion[], answers: string[]): QuizResult[] =>
  questions.map((question, index) => ({
    ...question,
    userAnswer: answers[index] ?? '',
    ...scoreQuizAnswer(question, answers[index] ?? ''),
  }));
