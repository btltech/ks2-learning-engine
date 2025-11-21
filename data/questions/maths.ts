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

  // ===== SUBTRACTION (20 Questions) =====
  // Easy (7-8)
  { id: 'm-sub-01', subject: 'Maths', topic: 'Subtraction', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '10 - 5 = ?', options: ['5', '15', '3', '7'], correctAnswer: '5' },
  { id: 'm-sub-02', subject: 'Maths', topic: 'Subtraction', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '15 - 3 = ?', options: ['12', '13', '18', '11'], correctAnswer: '12' },
  { id: 'm-sub-03', subject: 'Maths', topic: 'Subtraction', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '20 - 10 = ?', options: ['10', '30', '5', '15'], correctAnswer: '10' },
  { id: 'm-sub-04', subject: 'Maths', topic: 'Subtraction', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '12 - 4 = ?', options: ['8', '16', '7', '9'], correctAnswer: '8' },
  { id: 'm-sub-05', subject: 'Maths', topic: 'Subtraction', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '18 - 6 = ?', options: ['12', '24', '10', '14'], correctAnswer: '12' },
  { id: 'm-sub-06', subject: 'Maths', topic: 'Subtraction', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '14 - 7 = ?', options: ['7', '21', '5', '10'], correctAnswer: '7' },
  { id: 'm-sub-07', subject: 'Maths', topic: 'Subtraction', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '11 - 2 = ?', options: ['9', '13', '8', '11'], correctAnswer: '9' },

  // Medium (9-10)
  { id: 'm-sub-08', subject: 'Maths', topic: 'Subtraction', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '45 - 23 = ?', options: ['22', '68', '20', '25'], correctAnswer: '22' },
  { id: 'm-sub-09', subject: 'Maths', topic: 'Subtraction', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '100 - 35 = ?', options: ['65', '135', '60', '70'], correctAnswer: '65' },
  { id: 'm-sub-10', subject: 'Maths', topic: 'Subtraction', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '78 - 29 = ?', options: ['49', '107', '48', '52'], correctAnswer: '49' },
  { id: 'm-sub-11', subject: 'Maths', topic: 'Subtraction', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '200 - 75 = ?', options: ['125', '275', '120', '130'], correctAnswer: '125' },
  { id: 'm-sub-12', subject: 'Maths', topic: 'Subtraction', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '156 - 42 = ?', options: ['114', '198', '112', '120'], correctAnswer: '114' },
  { id: 'm-sub-13', subject: 'Maths', topic: 'Subtraction', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '500 - 250 = ?', options: ['250', '750', '240', '260'], correctAnswer: '250' },
  { id: 'm-sub-14', subject: 'Maths', topic: 'Subtraction', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '91 - 18 = ?', options: ['73', '109', '71', '75'], correctAnswer: '73' },

  // Hard (10-11)
  { id: 'm-sub-15', subject: 'Maths', topic: 'Subtraction', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '1000 - 456 = ?', options: ['544', '1456', '540', '550'], correctAnswer: '544' },
  { id: 'm-sub-16', subject: 'Maths', topic: 'Subtraction', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '7.5 - 2.3 = ?', options: ['5.2', '9.8', '5.0', '5.3'], correctAnswer: '5.2' },
  { id: 'm-sub-17', subject: 'Maths', topic: 'Subtraction', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '625 - 137 = ?', options: ['488', '762', '490', '480'], correctAnswer: '488' },
  { id: 'm-sub-18', subject: 'Maths', topic: 'Subtraction', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '10.1 - 3.45 = ?', options: ['6.65', '13.55', '6.60', '6.70'], correctAnswer: '6.65' },
  { id: 'm-sub-19', subject: 'Maths', topic: 'Subtraction', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '2000 - 1234 = ?', options: ['766', '3234', '760', '770'], correctAnswer: '766' },
  { id: 'm-sub-20', subject: 'Maths', topic: 'Subtraction', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '50.5 - 15.25 = ?', options: ['35.25', '65.75', '35.2', '35.3'], correctAnswer: '35.25' },

  // ===== MULTIPLICATION (20 Questions) =====
  // Easy (7-8)
  { id: 'm-mul-01', subject: 'Maths', topic: 'Multiplication', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '2 × 5 = ?', options: ['10', '7', '3', '15'], correctAnswer: '10' },
  { id: 'm-mul-02', subject: 'Maths', topic: 'Multiplication', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '3 × 4 = ?', options: ['12', '7', '15', '8'], correctAnswer: '12' },
  { id: 'm-mul-03', subject: 'Maths', topic: 'Multiplication', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '5 × 5 = ?', options: ['25', '10', '20', '30'], correctAnswer: '25' },
  { id: 'm-mul-04', subject: 'Maths', topic: 'Multiplication', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '6 × 2 = ?', options: ['12', '8', '14', '10'], correctAnswer: '12' },
  { id: 'm-mul-05', subject: 'Maths', topic: 'Multiplication', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '4 × 3 = ?', options: ['12', '7', '15', '10'], correctAnswer: '12' },
  { id: 'm-mul-06', subject: 'Maths', topic: 'Multiplication', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '7 × 2 = ?', options: ['14', '9', '12', '16'], correctAnswer: '14' },
  { id: 'm-mul-07', subject: 'Maths', topic: 'Multiplication', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '8 × 1 = ?', options: ['8', '7', '9', '16'], correctAnswer: '8' },

  // Medium (9-10)
  { id: 'm-mul-08', subject: 'Maths', topic: 'Multiplication', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '9 × 7 = ?', options: ['63', '16', '70', '56'], correctAnswer: '63' },
  { id: 'm-mul-09', subject: 'Maths', topic: 'Multiplication', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '12 × 5 = ?', options: ['60', '65', '55', '70'], correctAnswer: '60' },
  { id: 'm-mul-10', subject: 'Maths', topic: 'Multiplication', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '8 × 6 = ?', options: ['48', '42', '54', '40'], correctAnswer: '48' },
  { id: 'm-mul-11', subject: 'Maths', topic: 'Multiplication', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '11 × 9 = ?', options: ['99', '100', '90', '110'], correctAnswer: '99' },
  { id: 'm-mul-12', subject: 'Maths', topic: 'Multiplication', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '15 × 4 = ?', options: ['60', '55', '65', '70'], correctAnswer: '60' },
  { id: 'm-mul-13', subject: 'Maths', topic: 'Multiplication', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '20 × 3 = ?', options: ['60', '57', '63', '66'], correctAnswer: '60' },
  { id: 'm-mul-14', subject: 'Maths', topic: 'Multiplication', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '13 × 5 = ?', options: ['65', '60', '70', '75'], correctAnswer: '65' },

  // Hard (10-11)
  { id: 'm-mul-15', subject: 'Maths', topic: 'Multiplication', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '23 × 12 = ?', options: ['276', '270', '280', '286'], correctAnswer: '276' },
  { id: 'm-mul-16', subject: 'Maths', topic: 'Multiplication', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '15 × 15 = ?', options: ['225', '230', '220', '240'], correctAnswer: '225' },
  { id: 'm-mul-17', subject: 'Maths', topic: 'Multiplication', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '34 × 6 = ?', options: ['204', '200', '210', '214'], correctAnswer: '204' },
  { id: 'm-mul-18', subject: 'Maths', topic: 'Multiplication', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '25 × 8 = ?', options: ['200', '195', '205', '210'], correctAnswer: '200' },
  { id: 'm-mul-19', subject: 'Maths', topic: 'Multiplication', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '3.5 × 4 = ?', options: ['14', '13.5', '14.5', '12'], correctAnswer: '14' },
  { id: 'm-mul-20', subject: 'Maths', topic: 'Multiplication', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '2.5 × 6 = ?', options: ['15', '14', '16', '12'], correctAnswer: '15' },

  // ===== DIVISION (20 Questions) =====
  // Easy (7-8)
  { id: 'm-div-01', subject: 'Maths', topic: 'Division', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '10 ÷ 2 = ?', options: ['5', '8', '12', '3'], correctAnswer: '5' },
  { id: 'm-div-02', subject: 'Maths', topic: 'Division', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '12 ÷ 3 = ?', options: ['4', '3', '6', '2'], correctAnswer: '4' },
  { id: 'm-div-03', subject: 'Maths', topic: 'Division', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '20 ÷ 4 = ?', options: ['5', '4', '6', '10'], correctAnswer: '5' },
  { id: 'm-div-04', subject: 'Maths', topic: 'Division', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '15 ÷ 5 = ?', options: ['3', '5', '2', '4'], correctAnswer: '3' },
  { id: 'm-div-05', subject: 'Maths', topic: 'Division', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '16 ÷ 2 = ?', options: ['8', '6', '10', '4'], correctAnswer: '8' },
  { id: 'm-div-06', subject: 'Maths', topic: 'Division', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '18 ÷ 6 = ?', options: ['3', '2', '4', '6'], correctAnswer: '3' },
  { id: 'm-div-07', subject: 'Maths', topic: 'Division', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: '24 ÷ 8 = ?', options: ['3', '4', '2', '6'], correctAnswer: '3' },

  // Medium (9-10)
  { id: 'm-div-08', subject: 'Maths', topic: 'Division', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '56 ÷ 7 = ?', options: ['8', '7', '9', '6'], correctAnswer: '8' },
  { id: 'm-div-09', subject: 'Maths', topic: 'Division', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '72 ÷ 9 = ?', options: ['8', '7', '9', '6'], correctAnswer: '8' },
  { id: 'm-div-10', subject: 'Maths', topic: 'Division', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '64 ÷ 8 = ?', options: ['8', '7', '9', '6'], correctAnswer: '8' },
  { id: 'm-div-11', subject: 'Maths', topic: 'Division', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '100 ÷ 5 = ?', options: ['20', '25', '15', '10'], correctAnswer: '20' },
  { id: 'm-div-12', subject: 'Maths', topic: 'Division', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '60 ÷ 6 = ?', options: ['10', '12', '8', '9'], correctAnswer: '10' },
  { id: 'm-div-13', subject: 'Maths', topic: 'Division', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '48 ÷ 4 = ?', options: ['12', '10', '14', '16'], correctAnswer: '12' },
  { id: 'm-div-14', subject: 'Maths', topic: 'Division', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: '90 ÷ 9 = ?', options: ['10', '12', '8', '11'], correctAnswer: '10' },

  // Hard (10-11)
  { id: 'm-div-15', subject: 'Maths', topic: 'Division', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '144 ÷ 12 = ?', options: ['12', '10', '14', '13'], correctAnswer: '12' },
  { id: 'm-div-16', subject: 'Maths', topic: 'Division', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '125 ÷ 5 = ?', options: ['25', '20', '30', '24'], correctAnswer: '25' },
  { id: 'm-div-17', subject: 'Maths', topic: 'Division', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '200 ÷ 8 = ?', options: ['25', '20', '30', '24'], correctAnswer: '25' },
  { id: 'm-div-18', subject: 'Maths', topic: 'Division', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '15 ÷ 3 = ?', options: ['5', '4', '6', '3'], correctAnswer: '5' },
  { id: 'm-div-19', subject: 'Maths', topic: 'Division', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '10 ÷ 2.5 = ?', options: ['4', '3', '5', '2'], correctAnswer: '4' },
  { id: 'm-div-20', subject: 'Maths', topic: 'Division', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: '20 ÷ 0.5 = ?', options: ['40', '10', '35', '45'], correctAnswer: '40' },

  // ===== GEOMETRY (15 Questions) =====
  // Easy (7-8)
  { id: 'm-geo-01', subject: 'Maths', topic: 'Geometry', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'How many sides does a square have?', options: ['4', '3', '5', '6'], correctAnswer: '4' },
  { id: 'm-geo-02', subject: 'Maths', topic: 'Geometry', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'How many sides does a triangle have?', options: ['3', '4', '5', '6'], correctAnswer: '3' },
  { id: 'm-geo-03', subject: 'Maths', topic: 'Geometry', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What shape has 0 sides and is round?', options: ['Circle', 'Square', 'Triangle', 'Rectangle'], correctAnswer: 'Circle' },
  { id: 'm-geo-04', subject: 'Maths', topic: 'Geometry', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'How many corners does a rectangle have?', options: ['4', '3', '5', '6'], correctAnswer: '4' },
  { id: 'm-geo-05', subject: 'Maths', topic: 'Geometry', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which shape is a square?', options: ['■', '□ (not equal sides)', '◇', '▲'], correctAnswer: '■' },

  // Medium (9-10)
  { id: 'm-geo-06', subject: 'Maths', topic: 'Geometry', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is the perimeter of a square with side 5 cm?', options: ['20 cm', '25 cm', '15 cm', '10 cm'], correctAnswer: '20 cm' },
  { id: 'm-geo-07', subject: 'Maths', topic: 'Geometry', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is the area of a rectangle 4 cm × 5 cm?', options: ['20 cm²', '18 cm²', '25 cm²', '9 cm²'], correctAnswer: '20 cm²' },
  { id: 'm-geo-08', subject: 'Maths', topic: 'Geometry', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How many degrees in a right angle?', options: ['90°', '45°', '180°', '360°'], correctAnswer: '90°' },
  { id: 'm-geo-09', subject: 'Maths', topic: 'Geometry', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How many sides does a pentagon have?', options: ['5', '4', '6', '7'], correctAnswer: '5' },
  { id: 'm-geo-10', subject: 'Maths', topic: 'Geometry', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How many sides does a hexagon have?', options: ['6', '5', '7', '8'], correctAnswer: '6' },

  // Hard (10-11)
  { id: 'm-geo-11', subject: 'Maths', topic: 'Geometry', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is the area of a triangle with base 8 cm and height 6 cm?', options: ['24 cm²', '48 cm²', '14 cm²', '12 cm²'], correctAnswer: '24 cm²' },
  { id: 'm-geo-12', subject: 'Maths', topic: 'Geometry', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'How many degrees are in a straight line?', options: ['180°', '90°', '360°', '270°'], correctAnswer: '180°' },
  { id: 'm-geo-13', subject: 'Maths', topic: 'Geometry', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is the circumference of a circle with radius 5 cm? (Use π ≈ 3.14)', options: ['31.4 cm', '25 cm', '15.7 cm', '62.8 cm'], correctAnswer: '31.4 cm' },
  { id: 'm-geo-14', subject: 'Maths', topic: 'Geometry', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which angles are equal in an isosceles triangle?', options: ['The base angles', 'The top angle', 'All angles', 'No angles'], correctAnswer: 'The base angles' },
  { id: 'm-geo-15', subject: 'Maths', topic: 'Geometry', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is the perimeter of a rectangle 7 cm × 3 cm?', options: ['20 cm', '21 cm', '10 cm', '14 cm'], correctAnswer: '20 cm' },

  // ===== MEASUREMENTS (10 Questions) =====
  // Easy-Medium (7-10)
  { id: 'm-mea-01', subject: 'Maths', topic: 'Measurements', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'How many millimetres in 1 centimetre?', options: ['10 mm', '100 mm', '1 mm', '5 mm'], correctAnswer: '10 mm' },
  { id: 'm-mea-02', subject: 'Maths', topic: 'Measurements', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'How many centimetres in 1 metre?', options: ['100 cm', '10 cm', '1000 cm', '50 cm'], correctAnswer: '100 cm' },
  { id: 'm-mea-03', subject: 'Maths', topic: 'Measurements', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How many grams in 1 kilogram?', options: ['1000 g', '100 g', '10 g', '500 g'], correctAnswer: '1000 g' },
  { id: 'm-mea-04', subject: 'Maths', topic: 'Measurements', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How many millilitres in 1 litre?', options: ['1000 ml', '100 ml', '10 ml', '500 ml'], correctAnswer: '1000 ml' },
  { id: 'm-mea-05', subject: 'Maths', topic: 'Measurements', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Convert 5 kg to grams', options: ['5000 g', '500 g', '50 g', '50000 g'], correctAnswer: '5000 g' },
  { id: 'm-mea-06', subject: 'Maths', topic: 'Measurements', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'How many metres in 1 kilometre?', options: ['1000 m', '100 m', '10000 m', '500 m'], correctAnswer: '1000 m' },
  { id: 'm-mea-07', subject: 'Maths', topic: 'Measurements', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Convert 2500 millilitres to litres', options: ['2.5 L', '25 L', '0.25 L', '250 L'], correctAnswer: '2.5 L' },
  { id: 'm-mea-08', subject: 'Maths', topic: 'Measurements', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'How many minutes in 2 hours?', options: ['120 minutes', '60 minutes', '240 minutes', '90 minutes'], correctAnswer: '120 minutes' },
  { id: 'm-mea-09', subject: 'Maths', topic: 'Measurements', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is 30% of 100?', options: ['30', '3', '70', '300'], correctAnswer: '30' },
  { id: 'm-mea-10', subject: 'Maths', topic: 'Measurements', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Convert 3.5 metres to centimetres', options: ['350 cm', '35 cm', '3500 cm', '0.35 cm'], correctAnswer: '350 cm' },
];
