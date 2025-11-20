import { BankQuestion, Difficulty } from '../../types';

export const artQuestions: BankQuestion[] = [
  // ===== COLORS (20 Questions) =====
  // Easy (7-8)
  { id: 'a-co-01', subject: 'Art', topic: 'Colors', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which is a primary color?', options: ['Red', 'Green', 'Purple', 'Orange'], correctAnswer: 'Red' },
  { id: 'a-co-02', subject: 'Art', topic: 'Colors', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Blue + Yellow = ?', options: ['Green', 'Purple', 'Orange', 'Brown'], correctAnswer: 'Green' },
  { id: 'a-co-03', subject: 'Art', topic: 'Colors', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Red + Yellow = ?', options: ['Orange', 'Green', 'Purple', 'Black'], correctAnswer: 'Orange' },
  { id: 'a-co-04', subject: 'Art', topic: 'Colors', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What color is the sky?', options: ['Blue', 'Green', 'Red', 'Yellow'], correctAnswer: 'Blue' },
  { id: 'a-co-05', subject: 'Art', topic: 'Colors', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What color is grass?', options: ['Green', 'Blue', 'Red', 'Purple'], correctAnswer: 'Green' },
  { id: 'a-co-06', subject: 'Art', topic: 'Colors', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which is NOT a primary color?', options: ['Green', 'Red', 'Blue', 'Yellow'], correctAnswer: 'Green' },
  { id: 'a-co-07', subject: 'Art', topic: 'Colors', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Red + Blue = ?', options: ['Purple', 'Green', 'Orange', 'Brown'], correctAnswer: 'Purple' },

  // Medium (9-10)
  { id: 'a-co-08', subject: 'Art', topic: 'Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What are secondary colors?', options: ['Mixed primary colors', 'Primary colors', 'Dark colors', 'Light colors'], correctAnswer: 'Mixed primary colors' },
  { id: 'a-co-09', subject: 'Art', topic: 'Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a shade?', options: ['Color + Black', 'Color + White', 'Color + Grey', 'Color + Red'], correctAnswer: 'Color + Black' },
  { id: 'a-co-10', subject: 'Art', topic: 'Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a tint?', options: ['Color + White', 'Color + Black', 'Color + Grey', 'Color + Blue'], correctAnswer: 'Color + White' },
  { id: 'a-co-11', subject: 'Art', topic: 'Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Complementary to Red?', options: ['Green', 'Blue', 'Yellow', 'Purple'], correctAnswer: 'Green' },
  { id: 'a-co-12', subject: 'Art', topic: 'Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Complementary to Blue?', options: ['Orange', 'Red', 'Yellow', 'Green'], correctAnswer: 'Orange' },
  { id: 'a-co-13', subject: 'Art', topic: 'Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Warm colors are...', options: ['Red, Orange, Yellow', 'Blue, Green, Purple', 'Black, White, Grey', 'Brown, Pink, Gold'], correctAnswer: 'Red, Orange, Yellow' },
  { id: 'a-co-14', subject: 'Art', topic: 'Colors', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Cool colors are...', options: ['Blue, Green, Purple', 'Red, Orange, Yellow', 'Black, White, Grey', 'Brown, Pink, Gold'], correctAnswer: 'Blue, Green, Purple' },

  // Hard (10-11)
  { id: 'a-co-15', subject: 'Art', topic: 'Colors', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a hue?', options: ['Pure color', 'Dark color', 'Light color', 'Dull color'], correctAnswer: 'Pure color' },
  { id: 'a-co-16', subject: 'Art', topic: 'Colors', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What are tertiary colors?', options: ['Primary + Secondary', 'Primary + Primary', 'Secondary + Secondary', 'Black + White'], correctAnswer: 'Primary + Secondary' },
  { id: 'a-co-17', subject: 'Art', topic: 'Colors', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is monochromatic?', options: ['One color scheme', 'Many colors', 'No color', 'Rainbow'], correctAnswer: 'One color scheme' },
  { id: 'a-co-18', subject: 'Art', topic: 'Colors', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is value in art?', options: ['Lightness/Darkness', 'Price', 'Size', 'Shape'], correctAnswer: 'Lightness/Darkness' },
  { id: 'a-co-19', subject: 'Art', topic: 'Colors', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is intensity?', options: ['Brightness/Dullness', 'Lightness', 'Color name', 'Texture'], correctAnswer: 'Brightness/Dullness' },
  { id: 'a-co-20', subject: 'Art', topic: 'Colors', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Who painted Sunflowers?', options: ['Van Gogh', 'Picasso', 'Monet', 'Da Vinci'], correctAnswer: 'Van Gogh' },
];
