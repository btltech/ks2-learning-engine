import { BankQuestion, Difficulty } from '../../types';

export const dtQuestions: BankQuestion[] = [
  // ===== FOOD =====
  { id: 'dt-fo-01', subject: 'D&T', topic: 'Food', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which tool do you use to cut vegetables?', options: ['Knife', 'Spoon', 'Fork', 'Whisk'], correctAnswer: 'Knife' },
  { id: 'dt-fo-02', subject: 'D&T', topic: 'Food', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Where should you store milk?', options: ['Fridge', 'Cupboard', 'Oven', 'Freezer'], correctAnswer: 'Fridge' },
  { id: 'dt-fo-03', subject: 'D&T', topic: 'Food', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is hygiene?', options: ['Keeping clean', 'Cooking fast', 'Eating lots', 'Sleeping'], correctAnswer: 'Keeping clean' },
  { id: 'dt-fo-04', subject: 'D&T', topic: 'Food', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which food group gives energy?', options: ['Carbohydrates', 'Water', 'Vitamins', 'Minerals'], correctAnswer: 'Carbohydrates' },

  // ===== MATERIALS =====
  { id: 'dt-ma-01', subject: 'D&T', topic: 'Materials', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which material is hard?', options: ['Wood', 'Cotton', 'Wool', 'Paper'], correctAnswer: 'Wood' },
  { id: 'dt-ma-02', subject: 'D&T', topic: 'Materials', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which material is soft?', options: ['Fabric', 'Metal', 'Stone', 'Glass'], correctAnswer: 'Fabric' },
  { id: 'dt-ma-03', subject: 'D&T', topic: 'Materials', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which material is waterproof?', options: ['Plastic', 'Paper', 'Cardboard', 'Tissue'], correctAnswer: 'Plastic' },
  { id: 'dt-ma-04', subject: 'D&T', topic: 'Materials', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which material conducts electricity?', options: ['Copper', 'Wood', 'Plastic', 'Rubber'], correctAnswer: 'Copper' },

  // ===== STRUCTURES =====
  { id: 'dt-st-01', subject: 'D&T', topic: 'Structures', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What makes a structure strong?', options: ['Triangles', 'Circles', 'Squares', 'Lines'], correctAnswer: 'Triangles' },
  { id: 'dt-st-02', subject: 'D&T', topic: 'Structures', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a shell structure?', options: ['Egg', 'Bridge', 'Crane', 'Table'], correctAnswer: 'Egg' },
  { id: 'dt-st-03', subject: 'D&T', topic: 'Structures', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a frame structure?', options: ['Skeleton', 'Egg', 'Box', 'Can'], correctAnswer: 'Skeleton' },
  { id: 'dt-st-04', subject: 'D&T', topic: 'Structures', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which force pulls structures down?', options: ['Gravity', 'Friction', 'Magnetism', 'Wind'], correctAnswer: 'Gravity' },

  // ===== MECHANISMS =====
  { id: 'dt-me-01', subject: 'D&T', topic: 'Mechanisms', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What does a lever do?', options: ['Lifts loads', 'Cuts paper', 'Glues things', 'Colors'], correctAnswer: 'Lifts loads' },
  { id: 'dt-me-02', subject: 'D&T', topic: 'Mechanisms', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a pivot?', options: ['Turning point', 'Handle', 'Weight', 'Force'], correctAnswer: 'Turning point' },
  { id: 'dt-me-03', subject: 'D&T', topic: 'Mechanisms', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What do gears do?', options: ['Change speed/direction', 'Make light', 'Make sound', 'Heat up'], correctAnswer: 'Change speed/direction' },
  { id: 'dt-me-04', subject: 'D&T', topic: 'Mechanisms', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a pulley used for?', options: ['Lifting', 'Cutting', 'Drawing', 'Writing'], correctAnswer: 'Lifting' },

  // ===== DESIGN PROCESS =====
  { id: 'dt-dp-01', subject: 'D&T', topic: 'Design Process', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is the first step in design?', options: ['Research', 'Making', 'Evaluating', 'Selling'], correctAnswer: 'Research' },
  { id: 'dt-dp-02', subject: 'D&T', topic: 'Design Process', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a prototype?', options: ['A model', 'A finished product', 'A drawing', 'A tool'], correctAnswer: 'A model' },
  { id: 'dt-dp-03', subject: 'D&T', topic: 'Design Process', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is evaluation?', options: ['Checking if it works', 'Drawing', 'Cutting', 'Gluing'], correctAnswer: 'Checking if it works' },
  { id: 'dt-dp-04', subject: 'D&T', topic: 'Design Process', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a design brief?', options: ['Instructions', 'A drawing', 'A material', 'A tool'], correctAnswer: 'Instructions' },
];
