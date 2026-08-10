import { QuestionType, type BankQuestion } from '../types';

interface QuestionOverride {
  patch?: Partial<BankQuestion>;
  quarantineReason?: string;
}

/**
 * Non-destructive corrections keyed by stable question ID. The original bank
 * files and Firestore documents remain untouched, so every change is auditable
 * and reversible.
 */
const QUESTION_OVERRIDES: Record<string, QuestionOverride> = {
  'geo-plac-mirgtd6f-1': {
    patch: {
      question: 'True or False: The River Thames flows through London and is the longest river entirely within England.',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'The Thames flows through London and is the longest river wholly within England. The River Severn is longer overall, but part of it flows through Wales.',
    },
  },
  'geo-loca-mirgt42f-0': {
    patch: {
      question: 'Which city stands on the River Tyne in north-east England?',
      options: ['Edinburgh', 'Glasgow', 'Newcastle upon Tyne', 'Bristol'],
      correctAnswer: 'Newcastle upon Tyne',
      explanation: 'Newcastle upon Tyne stands on the north bank of the River Tyne. The river reaches the North Sea farther east at Tynemouth.',
    },
  },
  'his-loca-mirgx953-1': {
    quarantineReason: 'The question says “our county” but supplies no location, so its answer cannot be established.',
  },
  'geo-geog-mirjsgom-4': {
    quarantineReason: 'This tests an internal curriculum code rather than a child’s geographical knowledge.',
  },
};

const normalized = (value: unknown): string => String(value ?? '').replace(/\s+/g, ' ').trim().toLocaleLowerCase();

function answerCanBeResolved(question: BankQuestion): boolean {
  const type = question.questionType || QuestionType.MultipleChoice;
  if (type === QuestionType.Drawing) return Boolean(question.question.trim());
  if (type === QuestionType.Ordering) {
    return question.options.length >= 2
      && Array.isArray(question.correctOrder)
      && question.correctOrder.length === question.options.length;
  }
  if (type === QuestionType.Matching) return Array.isArray(question.matchingPairs) && question.matchingPairs.length >= 2;
  if (type === QuestionType.DragAndDrop) {
    return Array.isArray(question.dragItems) && question.dragItems.length > 0
      && Array.isArray(question.dropZones) && question.dropZones.length > 0;
  }

  const answer = normalized(question.correctAnswer);
  if (!answer) return false;
  if (type === QuestionType.FillInBlank) return true;
  if (question.options.some((option) => normalized(option) === answer)) return true;
  const numeric = Number(answer);
  if (Number.isInteger(numeric) && (question.options[numeric] || question.options[numeric - 1])) return true;
  const letter = answer.match(/^([a-f])(?:[.)\s:]|$)/i);
  return Boolean(letter && question.options[letter[1].toLowerCase().charCodeAt(0) - 97]);
}

export function getQuestionQuarantineReason(question: BankQuestion): string | null {
  const override = QUESTION_OVERRIDES[question.id];
  if (override?.quarantineReason) return override.quarantineReason;
  if (!question.question?.trim()) return 'Question text is missing.';
  if (!Array.isArray(question.options)) return 'Answer options are malformed.';
  if (new Set(question.options.map(normalized)).size !== question.options.length) return 'Answer options are duplicated.';
  if (!answerCanBeResolved(question)) return 'The stored correct answer cannot be resolved.';
  if (!Array.isArray(question.ageGroup) || question.ageGroup.length === 0 || question.ageGroup.some((age) => ![7, 8, 9, 10, 11].includes(age))) {
    return 'The question has no valid KS2 age range.';
  }

  const text = normalized(question.question);
  if (/\b(our county|our local area|your local area|near your school)\b/.test(text)) {
    return 'The question depends on local context that was not supplied.';
  }
  if (/\bwhich (national )?curriculum objective\b/.test(text)) {
    return 'The question tests internal curriculum metadata instead of subject knowledge.';
  }
  return null;
}

export function applyQuestionQualityControls(question: BankQuestion): BankQuestion | null {
  const override = QUESTION_OVERRIDES[question.id];
  const corrected = override?.patch ? { ...question, ...override.patch } : question;
  return getQuestionQuarantineReason(corrected) ? null : corrected;
}

export function getQuestionOverride(id: string): QuestionOverride | null {
  return QUESTION_OVERRIDES[id] || null;
}
