import { BankQuestion, Difficulty } from '../../types';

export const peQuestions: BankQuestion[] = [
  // ===== HEALTHY EATING =====
  { id: 'pe-he-01', subject: 'PE', topic: 'Healthy Eating', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which food is a fruit?', options: ['Apple', 'Bread', 'Chicken', 'Cheese'], correctAnswer: 'Apple' },
  { id: 'pe-he-02', subject: 'PE', topic: 'Healthy Eating', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which drink is best for hydration?', options: ['Water', 'Soda', 'Milkshake', 'Juice'], correctAnswer: 'Water' },
  { id: 'pe-he-03', subject: 'PE', topic: 'Healthy Eating', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which nutrient gives you energy?', options: ['Carbohydrates', 'Vitamins', 'Minerals', 'Water'], correctAnswer: 'Carbohydrates' },
  { id: 'pe-he-04', subject: 'PE', topic: 'Healthy Eating', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Calcium helps build strong...', options: ['Bones', 'Muscles', 'Eyes', 'Hair'], correctAnswer: 'Bones' },

  // ===== EXERCISE =====
  { id: 'pe-ex-01', subject: 'PE', topic: 'Exercise', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What happens to your heart when you run?', options: ['Beats faster', 'Beats slower', 'Stops', 'Nothing'], correctAnswer: 'Beats faster' },
  { id: 'pe-ex-02', subject: 'PE', topic: 'Exercise', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which is a warm-up exercise?', options: ['Stretching', 'Sprinting', 'Sleeping', 'Eating'], correctAnswer: 'Stretching' },
  { id: 'pe-ex-03', subject: 'PE', topic: 'Exercise', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Why do we cool down after sport?', options: ['To lower heart rate', 'To get hot', 'To run faster', 'To eat'], correctAnswer: 'To lower heart rate' },
  { id: 'pe-ex-04', subject: 'PE', topic: 'Exercise', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which activity improves flexibility?', options: ['Yoga', 'Weightlifting', 'Sprinting', 'Sitting'], correctAnswer: 'Yoga' },

  // ===== THE BODY =====
  { id: 'pe-bo-01', subject: 'PE', topic: 'The Body', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which organ pumps blood?', options: ['Heart', 'Lungs', 'Stomach', 'Brain'], correctAnswer: 'Heart' },
  { id: 'pe-bo-02', subject: 'PE', topic: 'The Body', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which organ helps you breathe?', options: ['Lungs', 'Heart', 'Liver', 'Kidneys'], correctAnswer: 'Lungs' },
  { id: 'pe-bo-03', subject: 'PE', topic: 'The Body', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is the largest muscle in the body?', options: ['Gluteus Maximus', 'Bicep', 'Heart', 'Tongue'], correctAnswer: 'Gluteus Maximus' },
  { id: 'pe-bo-04', subject: 'PE', topic: 'The Body', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'How many bones are in the adult human body?', options: ['206', '100', '300', '500'], correctAnswer: '206' },

  // ===== SPORTS RULES =====
  { id: 'pe-sr-01', subject: 'PE', topic: 'Sports Rules', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'In football (soccer), who can use their hands?', options: ['Goalkeeper', 'Striker', 'Defender', 'Referee'], correctAnswer: 'Goalkeeper' },
  { id: 'pe-sr-02', subject: 'PE', topic: 'Sports Rules', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How many players are on a netball team?', options: ['7', '11', '5', '9'], correctAnswer: '7' },
  { id: 'pe-sr-03', subject: 'PE', topic: 'Sports Rules', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'In tennis, what is a score of zero called?', options: ['Love', 'Nil', 'Zero', 'Duck'], correctAnswer: 'Love' },
  { id: 'pe-sr-04', subject: 'PE', topic: 'Sports Rules', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'How many runs is a "century" in cricket?', options: ['100', '50', '6', '10'], correctAnswer: '100' },

  // ===== FITNESS =====
  { id: 'pe-fi-01', subject: 'PE', topic: 'Fitness', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What does cardio improve?', options: ['Heart and lungs', 'Muscles only', 'Flexibility', 'Balance'], correctAnswer: 'Heart and lungs' },
  { id: 'pe-fi-02', subject: 'PE', topic: 'Fitness', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which is a strength exercise?', options: ['Push-ups', 'Jogging', 'Walking', 'Stretching'], correctAnswer: 'Push-ups' },
  { id: 'pe-fi-03', subject: 'PE', topic: 'Fitness', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is stamina?', options: ['Ability to keep going', 'Speed', 'Strength', 'Flexibility'], correctAnswer: 'Ability to keep going' },
  { id: 'pe-fi-04', subject: 'PE', topic: 'Fitness', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which test measures aerobic fitness?', options: ['Bleep Test', 'Sit and Reach', 'Grip Test', 'Jump Test'], correctAnswer: 'Bleep Test' },
];
