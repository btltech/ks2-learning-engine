import { BankQuestion, Difficulty } from '../../types';

export const computingQuestions: BankQuestion[] = [
  // ===== BASICS (20 Questions) =====
  // Easy (7-8)
  { id: 'c-ba-01', subject: 'Computing', topic: 'Basics', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is code?', options: ['Instructions for computers', 'A secret language', 'A game', 'A robot'], correctAnswer: 'Instructions for computers' },
  { id: 'c-ba-02', subject: 'Computing', topic: 'Basics', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is a bug?', options: ['An error', 'An insect', 'A feature', 'A game'], correctAnswer: 'An error' },
  { id: 'c-ba-03', subject: 'Computing', topic: 'Basics', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is a loop?', options: ['Repeating action', 'A circle', 'A knot', 'A stop sign'], correctAnswer: 'Repeating action' },
  { id: 'c-ba-04', subject: 'Computing', topic: 'Basics', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is a sprite?', options: ['Character on screen', 'A drink', 'A code', 'A computer'], correctAnswer: 'Character on screen' },
  { id: 'c-ba-05', subject: 'Computing', topic: 'Basics', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What does "run" mean?', options: ['Start the program', 'Walk fast', 'Stop', 'Delete'], correctAnswer: 'Start the program' },
  { id: 'c-ba-06', subject: 'Computing', topic: 'Basics', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is an algorithm?', options: ['Steps to solve a problem', 'A dance', 'A math problem', 'A robot'], correctAnswer: 'Steps to solve a problem' },
  { id: 'c-ba-07', subject: 'Computing', topic: 'Basics', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is input?', options: ['Information going in', 'Information coming out', 'A plug', 'A screen'], correctAnswer: 'Information going in' },

  // Medium (9-10)
  { id: 'c-ba-08', subject: 'Computing', topic: 'Basics', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a variable?', options: ['Stores data', 'Changes code', 'A number', 'A loop'], correctAnswer: 'Stores data' },
  { id: 'c-ba-09', subject: 'Computing', topic: 'Basics', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is debugging?', options: ['Fixing errors', 'Finding bugs', 'Writing code', 'Playing games'], correctAnswer: 'Fixing errors' },
  { id: 'c-ba-10', subject: 'Computing', topic: 'Basics', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a conditional?', options: ['If/Then statement', 'A loop', 'A variable', 'A function'], correctAnswer: 'If/Then statement' },
  { id: 'c-ba-11', subject: 'Computing', topic: 'Basics', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is output?', options: ['Result shown', 'Typing', 'Clicking', 'Thinking'], correctAnswer: 'Result shown' },
  { id: 'c-ba-12', subject: 'Computing', topic: 'Basics', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a sequence?', options: ['Order of steps', 'A loop', 'A variable', 'A bug'], correctAnswer: 'Order of steps' },
  { id: 'c-ba-13', subject: 'Computing', topic: 'Basics', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is Scratch?', options: ['Block coding language', 'A cat', 'A game', 'A computer'], correctAnswer: 'Block coding language' },
  { id: 'c-ba-14', subject: 'Computing', topic: 'Basics', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is Python?', options: ['Text coding language', 'A snake', 'A game', 'A robot'], correctAnswer: 'Text coding language' },

  // Hard (10-11)
  { id: 'c-ba-15', subject: 'Computing', topic: 'Basics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a function?', options: ['Reusable code block', 'A variable', 'A loop', 'An error'], correctAnswer: 'Reusable code block' },
  { id: 'c-ba-16', subject: 'Computing', topic: 'Basics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a boolean?', options: ['True/False value', 'A number', 'Text', 'A list'], correctAnswer: 'True/False value' },
  { id: 'c-ba-17', subject: 'Computing', topic: 'Basics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is iteration?', options: ['Repeating a process', 'Stopping', 'Starting', 'Saving'], correctAnswer: 'Repeating a process' },
  { id: 'c-ba-18', subject: 'Computing', topic: 'Basics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is decomposition?', options: ['Breaking down problems', 'Rotting', 'Building up', 'Coding fast'], correctAnswer: 'Breaking down problems' },
  { id: 'c-ba-19', subject: 'Computing', topic: 'Basics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is abstraction?', options: ['Hiding details', 'Showing everything', 'Drawing', 'Writing'], correctAnswer: 'Hiding details' },
  { id: 'c-ba-20', subject: 'Computing', topic: 'Basics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is an infinite loop?', options: ['Never ends', 'Ends quickly', 'A circle', 'A long code'], correctAnswer: 'Never ends' },
];
