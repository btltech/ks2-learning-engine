import { BankQuestion, Difficulty } from '../../types';

export const algebraQuestions: BankQuestion[] = [
  // ===== ALGEBRA (10 Questions) =====
  
  // Year 6: Simple Formulae & Sequences
  { id: 'm-alg-01', subject: 'Maths', topic: 'Algebra', ageGroup: [10, 11], difficulty: Difficulty.Medium, question: 'If a = 5, what is 2a?', options: ['10', '7', '25', '52'], correctAnswer: '10' },
  { id: 'm-alg-02', subject: 'Maths', topic: 'Algebra', ageGroup: [10, 11], difficulty: Difficulty.Medium, question: 'What is the next number in the sequence: 2, 4, 6, 8, ...?', options: ['10', '9', '12', '11'], correctAnswer: '10' },
  { id: 'm-alg-03', subject: 'Maths', topic: 'Algebra', ageGroup: [10, 11], difficulty: Difficulty.Medium, question: 'If x + 3 = 10, what is x?', options: ['7', '13', '3', '10'], correctAnswer: '7' },
  { id: 'm-alg-04', subject: 'Maths', topic: 'Algebra', ageGroup: [10, 11], difficulty: Difficulty.Medium, question: 'Complete the sequence: 5, 10, 15, ...', options: ['20', '16', '25', '30'], correctAnswer: '20' },
  { id: 'm-alg-05', subject: 'Maths', topic: 'Algebra', ageGroup: [10, 11], difficulty: Difficulty.Medium, question: 'If y = 2x + 1, and x = 3, what is y?', options: ['7', '6', '5', '8'], correctAnswer: '7' },

  // Year 6: Equations & Unknowns
  { id: 'm-alg-06', subject: 'Maths', topic: 'Algebra', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Find n if 3n = 12', options: ['4', '3', '9', '15'], correctAnswer: '4' },
  { id: 'm-alg-07', subject: 'Maths', topic: 'Algebra', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'If a + b = 10, and a = 6, what is b?', options: ['4', '16', '6', '10'], correctAnswer: '4' },
  { id: 'm-alg-08', subject: 'Maths', topic: 'Algebra', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is the rule for the sequence: 3, 6, 9, 12?', options: ['Add 3', 'Multiply by 2', 'Add 2', 'Subtract 3'], correctAnswer: 'Add 3' },
  { id: 'm-alg-09', subject: 'Maths', topic: 'Algebra', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'If 2x + 4 = 14, what is x?', options: ['5', '10', '9', '7'], correctAnswer: '5' },
  { id: 'm-alg-10', subject: 'Maths', topic: 'Algebra', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which pair of numbers satisfies x + y = 5?', options: ['2 and 3', '2 and 4', '1 and 5', '3 and 3'], correctAnswer: '2 and 3' },
  
  // Additional Practice
  { id: 'm-alg-11', subject: 'Maths', topic: 'Algebra', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'If p = 10 and q = 2, what is p - q?', options: ['8', '12', '5', '20'], correctAnswer: '8' },
  { id: 'm-alg-12', subject: 'Maths', topic: 'Algebra', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Solve for x: 10 - x = 2', options: ['8', '12', '5', '2'], correctAnswer: '8' },
  { id: 'm-alg-13', subject: 'Maths', topic: 'Algebra', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is the missing number? 50, 40, 30, ?, 10', options: ['20', '25', '15', '35'], correctAnswer: '20' },
  { id: 'm-alg-14', subject: 'Maths', topic: 'Algebra', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'If 4y = 20, what is y?', options: ['5', '4', '16', '24'], correctAnswer: '5' },
  { id: 'm-alg-15', subject: 'Maths', topic: 'Algebra', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'If a = 3, what is 2a + 5?', options: ['11', '8', '10', '13'], correctAnswer: '11' },
];
