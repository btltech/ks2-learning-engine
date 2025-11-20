import { BankQuestion, Difficulty } from '../../types';

export const musicQuestions: BankQuestion[] = [
  // ===== INSTRUMENTS =====
  { id: 'mu-in-01', subject: 'Music', topic: 'Instruments', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which of these is a string instrument?', options: ['Violin', 'Trumpet', 'Drum', 'Flute'], correctAnswer: 'Violin' },
  { id: 'mu-in-02', subject: 'Music', topic: 'Instruments', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which instrument has black and white keys?', options: ['Piano', 'Guitar', 'Violin', 'Drum'], correctAnswer: 'Piano' },
  { id: 'mu-in-03', subject: 'Music', topic: 'Instruments', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'You hit this instrument with sticks.', options: ['Drum', 'Flute', 'Violin', 'Piano'], correctAnswer: 'Drum' },
  { id: 'mu-in-04', subject: 'Music', topic: 'Instruments', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which of these is a woodwind instrument?', options: ['Flute', 'Trumpet', 'Cello', 'Timpani'], correctAnswer: 'Flute' },
  { id: 'mu-in-05', subject: 'Music', topic: 'Instruments', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which of these is a brass instrument?', options: ['Trumpet', 'Clarinet', 'Violin', 'Piano'], correctAnswer: 'Trumpet' },
  { id: 'mu-in-06', subject: 'Music', topic: 'Instruments', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How many strings does a standard guitar have?', options: ['6', '4', '8', '10'], correctAnswer: '6' },
  { id: 'mu-in-07', subject: 'Music', topic: 'Instruments', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which is the largest string instrument in an orchestra?', options: ['Double Bass', 'Cello', 'Viola', 'Violin'], correctAnswer: 'Double Bass' },

  // ===== NOTATION =====
  { id: 'mu-no-01', subject: 'Music', topic: 'Notation', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is the symbol at the start of a music staff called?', options: ['Clef', 'Note', 'Rest', 'Bar'], correctAnswer: 'Clef' },
  { id: 'mu-no-02', subject: 'Music', topic: 'Notation', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How many lines are on a music staff?', options: ['5', '4', '6', '3'], correctAnswer: '5' },
  { id: 'mu-no-03', subject: 'Music', topic: 'Notation', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which note looks like an empty circle?', options: ['Semibreve (Whole Note)', 'Crotchet (Quarter Note)', 'Minim (Half Note)', 'Quaver (Eighth Note)'], correctAnswer: 'Semibreve (Whole Note)' },
  { id: 'mu-no-04', subject: 'Music', topic: 'Notation', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What does "forte" mean?', options: ['Loud', 'Soft', 'Fast', 'Slow'], correctAnswer: 'Loud' },
  { id: 'mu-no-05', subject: 'Music', topic: 'Notation', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What does "piano" mean in dynamics?', options: ['Soft', 'Loud', 'Fast', 'Slow'], correctAnswer: 'Soft' },
  { id: 'mu-no-06', subject: 'Music', topic: 'Notation', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a "rest" in music?', options: ['Silence', 'A loud note', 'A fast note', 'The end'], correctAnswer: 'Silence' },
  { id: 'mu-no-07', subject: 'Music', topic: 'Notation', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which note is worth half a beat?', options: ['Quaver', 'Crotchet', 'Minim', 'Semibreve'], correctAnswer: 'Quaver' },

  // ===== COMPOSERS =====
  { id: 'mu-co-01', subject: 'Music', topic: 'Composers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Who composed "Fur Elise"?', options: ['Beethoven', 'Mozart', 'Bach', 'Chopin'], correctAnswer: 'Beethoven' },
  { id: 'mu-co-02', subject: 'Music', topic: 'Composers', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Who was a famous child prodigy?', options: ['Mozart', 'Beethoven', 'Bach', 'Handel'], correctAnswer: 'Mozart' },
  { id: 'mu-co-03', subject: 'Music', topic: 'Composers', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which composer became deaf?', options: ['Beethoven', 'Mozart', 'Bach', 'Vivaldi'], correctAnswer: 'Beethoven' },
  { id: 'mu-co-04', subject: 'Music', topic: 'Composers', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which country was Mozart from?', options: ['Austria', 'Germany', 'France', 'Italy'], correctAnswer: 'Austria' },
  { id: 'mu-co-05', subject: 'Music', topic: 'Composers', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Who composed "The Four Seasons"?', options: ['Vivaldi', 'Bach', 'Handel', 'Haydn'], correctAnswer: 'Vivaldi' },
  { id: 'mu-co-06', subject: 'Music', topic: 'Composers', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which of these is a Baroque composer?', options: ['Bach', 'Mozart', 'Beethoven', 'Tchaikovsky'], correctAnswer: 'Bach' },
];
