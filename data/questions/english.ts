import { BankQuestion, Difficulty } from '../../types';

export const englishQuestions: BankQuestion[] = [
  // ===== GRAMMAR (20 Questions) =====
  // Easy (7-8)
  { id: 'e-gr-01', subject: 'English', topic: 'Grammar', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which word is a noun?', options: ['Cat', 'Run', 'Blue', 'Quickly'], correctAnswer: 'Cat' },
  { id: 'e-gr-02', subject: 'English', topic: 'Grammar', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which word is a verb?', options: ['Jump', 'Table', 'Happy', 'Green'], correctAnswer: 'Jump' },
  { id: 'e-gr-03', subject: 'English', topic: 'Grammar', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Find the adjective: "The red car."', options: ['Red', 'The', 'Car', 'Is'], correctAnswer: 'Red' },
  { id: 'e-gr-04', subject: 'English', topic: 'Grammar', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What goes at the end of a question?', options: ['Question mark', 'Full stop', 'Comma', 'Exclamation mark'], correctAnswer: 'Question mark' },
  { id: 'e-gr-05', subject: 'English', topic: 'Grammar', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which letter should be capital? "london"', options: ['L', 'o', 'n', 'd'], correctAnswer: 'L' },
  { id: 'e-gr-06', subject: 'English', topic: 'Grammar', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Plural of "dog"?', options: ['Dogs', 'Doges', 'Doggs', 'Dogies'], correctAnswer: 'Dogs' },
  { id: 'e-gr-07', subject: 'English', topic: 'Grammar', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Opposite of "hot"?', options: ['Cold', 'Warm', 'Sunny', 'Dry'], correctAnswer: 'Cold' },

  // Medium (9-10)
  { id: 'e-gr-08', subject: 'English', topic: 'Grammar', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which is an adverb?', options: ['Quickly', 'Quick', 'Run', 'Fast'], correctAnswer: 'Quickly' },
  { id: 'e-gr-09', subject: 'English', topic: 'Grammar', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Find the pronoun: "She went home."', options: ['She', 'Went', 'Home', 'The'], correctAnswer: 'She' },
  { id: 'e-gr-10', subject: 'English', topic: 'Grammar', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Past tense of "eat"?', options: ['Ate', 'Eated', 'Eating', 'Eats'], correctAnswer: 'Ate' },
  { id: 'e-gr-11', subject: 'English', topic: 'Grammar', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which sentence is correct?', options: ['They are playing.', 'They is playing.', 'They am playing.', 'They be playing.'], correctAnswer: 'They are playing.' },
  { id: 'e-gr-12', subject: 'English', topic: 'Grammar', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a synonym for "happy"?', options: ['Joyful', 'Sad', 'Angry', 'Tired'], correctAnswer: 'Joyful' },
  { id: 'e-gr-13', subject: 'English', topic: 'Grammar', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Identify the conjunction: "I like tea and cake."', options: ['And', 'Like', 'Tea', 'Cake'], correctAnswer: 'And' },
  { id: 'e-gr-14', subject: 'English', topic: 'Grammar', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which word needs an apostrophe? "Dont"', options: ['Don\'t', 'Do\'nt', 'Dont\'', 'D\'ont'], correctAnswer: 'Don\'t' },

  // Hard (10-11)
  { id: 'e-gr-15', subject: 'English', topic: 'Grammar', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which sentence uses passive voice?', options: ['The cake was eaten by the dog.', 'The dog ate the cake.', 'The dog is eating.', 'The dog eats cake.'], correctAnswer: 'The cake was eaten by the dog.' },
  { id: 'e-gr-16', subject: 'English', topic: 'Grammar', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Identify the preposition: "The cat is under the table."', options: ['Under', 'Cat', 'Is', 'Table'], correctAnswer: 'Under' },
  { id: 'e-gr-17', subject: 'English', topic: 'Grammar', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a clause?', options: ['A group of words with a subject and verb', 'A single word', 'A punctuation mark', 'A type of noun'], correctAnswer: 'A group of words with a subject and verb' },
  { id: 'e-gr-18', subject: 'English', topic: 'Grammar', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which is a relative pronoun?', options: ['Who', 'Big', 'Run', 'Table'], correctAnswer: 'Who' },
  { id: 'e-gr-19', subject: 'English', topic: 'Grammar', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Correct the sentence: "Me and him went out."', options: ['He and I went out.', 'Me and him went out.', 'Him and me went out.', 'I and him went out.'], correctAnswer: 'He and I went out.' },
  { id: 'e-gr-20', subject: 'English', topic: 'Grammar', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is an antonym for "benevolent"?', options: ['Cruel', 'Kind', 'Nice', 'Good'], correctAnswer: 'Cruel' },
];
