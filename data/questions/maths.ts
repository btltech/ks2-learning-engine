import { BankQuestion, Difficulty } from '../../types';

export const mathsQuestions: BankQuestion[] = [
  // ===== FRACTIONS (20 Questions) =====
  // Easy (7-8)
  { id: 'm-fr-01', subject: 'Maths', topic: 'Fractions', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is half of 10?', options: ['5', '2', '10', '4'], correctAnswer: '5' },
  { id: 'm-fr-02', subject: 'Maths', topic: 'Fractions', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which shape shows 1/4 shaded?', options: ['Square with 1 corner shaded', 'Circle half shaded', 'Triangle all shaded', 'Square empty'], correctAnswer: 'Square with 1 corner shaded' },
  { id: 'm-fr-03', subject: 'Maths', topic: 'Fractions', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is 1/2 + 1/2?', options: ['1', '2', '1/4', '0'], correctAnswer: '1' },
  { id: 'm-fr-04', subject: 'Maths', topic: 'Fractions', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'If you have 4 apples and eat 1/2, how many are left?', options: ['2', '1', '3', '4'], correctAnswer: '2' },
  { id: 'm-fr-05', subject: 'Maths', topic: 'Fractions', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which is smaller: 1/2 or 1/4?', options: ['1/4', '1/2', 'Same', 'None'], correctAnswer: '1/4' },
  { id: 'm-fr-06', subject: 'Maths', topic: 'Fractions', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'How many halves make a whole?', options: ['2', '1', '4', '3'], correctAnswer: '2' },
  { id: 'm-fr-07', subject: 'Maths', topic: 'Fractions', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is 1/3 of 9?', options: ['3', '1', '9', '6'], correctAnswer: '3' },
  
  // Medium (9-10)
  { id: 'm-fr-08', subject: 'Maths', topic: 'Fractions', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Simplify 4/8', options: ['1/2', '2/4', '1/4', '4/2'], correctAnswer: '1/2' },
  { id: 'm-fr-09', subject: 'Maths', topic: 'Fractions', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is 3/4 + 1/4?', options: ['1', '4/8', '3/8', '2/4'], correctAnswer: '1' },
  { id: 'm-fr-10', subject: 'Maths', topic: 'Fractions', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which is equivalent to 1/3?', options: ['2/6', '1/6', '3/6', '2/3'], correctAnswer: '2/6' },
  { id: 'm-fr-11', subject: 'Maths', topic: 'Fractions', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is 1/2 of 50?', options: ['25', '20', '15', '30'], correctAnswer: '25' },
  { id: 'm-fr-12', subject: 'Maths', topic: 'Fractions', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Convert 0.5 to a fraction', options: ['1/2', '1/5', '5/100', '1/10'], correctAnswer: '1/2' },
  { id: 'm-fr-13', subject: 'Maths', topic: 'Fractions', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is 1/4 of 20?', options: ['5', '4', '10', '2'], correctAnswer: '5' },
  { id: 'm-fr-14', subject: 'Maths', topic: 'Fractions', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which is larger: 2/3 or 1/2?', options: ['2/3', '1/2', 'Equal', 'Unknown'], correctAnswer: '2/3' },

  // Hard (10-11)
  { id: 'm-fr-15', subject: 'Maths', topic: 'Fractions', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is 2/3 + 1/6?', options: ['5/6', '3/9', '1/2', '4/6'], correctAnswer: '5/6' },
  { id: 'm-fr-16', subject: 'Maths', topic: 'Fractions', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Convert 7/4 to a mixed number', options: ['1 3/4', '1 1/4', '2 3/4', '1 2/4'], correctAnswer: '1 3/4' },
  { id: 'm-fr-17', subject: 'Maths', topic: 'Fractions', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is 3/5 of 25?', options: ['15', '10', '5', '20'], correctAnswer: '15' },
  { id: 'm-fr-18', subject: 'Maths', topic: 'Fractions', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Simplify 12/16', options: ['3/4', '2/3', '4/5', '6/8'], correctAnswer: '3/4' },
  { id: 'm-fr-19', subject: 'Maths', topic: 'Fractions', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is 1/2 divided by 2?', options: ['1/4', '1', '2', '1/8'], correctAnswer: '1/4' },
  { id: 'm-fr-20', subject: 'Maths', topic: 'Fractions', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Add 1 1/2 and 2 1/4', options: ['3 3/4', '3 1/2', '3 1/4', '4'], correctAnswer: '3 3/4' },

  // ===== ADDITION (20 Questions) =====
  // Easy (7-8)
  { id: 'm-add-01', subject: 'Maths', topic: 'Addition', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '5 + 5 = ?', options: ['10', '11', '9', '15'], correctAnswer: '10' },
  { id: 'm-add-02', subject: 'Maths', topic: 'Addition', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '12 + 4 = ?', options: ['16', '15', '18', '14'], correctAnswer: '16' },
  { id: 'm-add-03', subject: 'Maths', topic: 'Addition', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '20 + 10 = ?', options: ['30', '20', '40', '10'], correctAnswer: '30' },
  { id: 'm-add-04', subject: 'Maths', topic: 'Addition', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '7 + 6 = ?', options: ['13', '12', '14', '11'], correctAnswer: '13' },
  { id: 'm-add-05', subject: 'Maths', topic: 'Addition', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '15 + 5 = ?', options: ['20', '25', '10', '30'], correctAnswer: '20' },
  { id: 'm-add-06', subject: 'Maths', topic: 'Addition', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '8 + 9 = ?', options: ['17', '16', '18', '15'], correctAnswer: '17' },
  { id: 'm-add-07', subject: 'Maths', topic: 'Addition', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '10 + 10 + 10 = ?', options: ['30', '20', '40', '100'], correctAnswer: '30' },

  // Medium (9-10)
  { id: 'm-add-08', subject: 'Maths', topic: 'Addition', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '45 + 23 = ?', options: ['68', '67', '78', '58'], correctAnswer: '68' },
  { id: 'm-add-09', subject: 'Maths', topic: 'Addition', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '125 + 50 = ?', options: ['175', '185', '165', '125'], correctAnswer: '175' },
  { id: 'm-add-10', subject: 'Maths', topic: 'Addition', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '34 + 46 = ?', options: ['80', '70', '90', '84'], correctAnswer: '80' },
  { id: 'm-add-11', subject: 'Maths', topic: 'Addition', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '200 + 350 = ?', options: ['550', '450', '650', '500'], correctAnswer: '550' },
  { id: 'm-add-12', subject: 'Maths', topic: 'Addition', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '67 + 29 = ?', options: ['96', '86', '95', '97'], correctAnswer: '96' },
  { id: 'm-add-13', subject: 'Maths', topic: 'Addition', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '199 + 1 = ?', options: ['200', '100', '201', '198'], correctAnswer: '200' },
  { id: 'm-add-14', subject: 'Maths', topic: 'Addition', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '500 + 500 = ?', options: ['1000', '100', '5000', '2000'], correctAnswer: '1000' },

  // Hard (10-11)
  { id: 'm-add-15', subject: 'Maths', topic: 'Addition', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '1234 + 5678 = ?', options: ['6912', '6812', '6902', '6922'], correctAnswer: '6912' },
  { id: 'm-add-16', subject: 'Maths', topic: 'Addition', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '4.5 + 3.2 = ?', options: ['7.7', '7.5', '8.7', '7.2'], correctAnswer: '7.7' },
  { id: 'm-add-17', subject: 'Maths', topic: 'Addition', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '10.5 + 0.5 = ?', options: ['11', '10.55', '11.5', '12'], correctAnswer: '11' },
  { id: 'm-add-18', subject: 'Maths', topic: 'Addition', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '2500 + 1750 = ?', options: ['4250', '4350', '3250', '4150'], correctAnswer: '4250' },
  { id: 'm-add-19', subject: 'Maths', topic: 'Addition', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '9.9 + 0.1 = ?', options: ['10', '9.10', '10.9', '9.01'], correctAnswer: '10' },
  { id: 'm-add-20', subject: 'Maths', topic: 'Addition', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '15.75 + 5.25 = ?', options: ['21', '20', '21.5', '20.5'], correctAnswer: '21' },
];
