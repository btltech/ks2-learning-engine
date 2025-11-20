import { BankQuestion, Difficulty } from '../../types';

export const geographyQuestions: BankQuestion[] = [
  // ===== CLIMATE (20 Questions) =====
  // Easy (7-8)
  { id: 'g-cl-01', subject: 'Geography', topic: 'Climate', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is weather?', options: ['Daily conditions', 'Climate', 'Season', 'Time'], correctAnswer: 'Daily conditions' },
  { id: 'g-cl-02', subject: 'Geography', topic: 'Climate', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which is a season?', options: ['Summer', 'Monday', 'January', 'Morning'], correctAnswer: 'Summer' },
  { id: 'g-cl-03', subject: 'Geography', topic: 'Climate', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What falls from clouds?', options: ['Rain', 'Sand', 'Rocks', 'Leaves'], correctAnswer: 'Rain' },
  { id: 'g-cl-04', subject: 'Geography', topic: 'Climate', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Is the desert hot or cold?', options: ['Hot', 'Cold', 'Wet', 'Snowy'], correctAnswer: 'Hot' },
  { id: 'g-cl-05', subject: 'Geography', topic: 'Climate', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What do we wear in winter?', options: ['Coat', 'Swimsuit', 'Sandals', 'Shorts'], correctAnswer: 'Coat' },
  { id: 'g-cl-06', subject: 'Geography', topic: 'Climate', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is the sun?', options: ['Star', 'Planet', 'Moon', 'Comet'], correctAnswer: 'Star' },
  { id: 'g-cl-07', subject: 'Geography', topic: 'Climate', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Where is it coldest?', options: ['Poles', 'Equator', 'Desert', 'Beach'], correctAnswer: 'Poles' },

  // Medium (9-10)
  { id: 'g-cl-08', subject: 'Geography', topic: 'Climate', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Difference between weather and climate?', options: ['Time period', 'Temperature', 'Location', 'None'], correctAnswer: 'Time period' },
  { id: 'g-cl-09', subject: 'Geography', topic: 'Climate', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is the Equator?', options: ['Imaginary line', 'A country', 'A wall', 'A river'], correctAnswer: 'Imaginary line' },
  { id: 'g-cl-10', subject: 'Geography', topic: 'Climate', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is precipitation?', options: ['Rain/Snow', 'Wind', 'Sun', 'Clouds'], correctAnswer: 'Rain/Snow' },
  { id: 'g-cl-11', subject: 'Geography', topic: 'Climate', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a tropical climate?', options: ['Hot and wet', 'Cold and dry', 'Hot and dry', 'Cold and wet'], correctAnswer: 'Hot and wet' },
  { id: 'g-cl-12', subject: 'Geography', topic: 'Climate', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What measures temperature?', options: ['Thermometer', 'Ruler', 'Scale', 'Clock'], correctAnswer: 'Thermometer' },
  { id: 'g-cl-13', subject: 'Geography', topic: 'Climate', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a drought?', options: ['No rain', 'Too much rain', 'Snow storm', 'Windy'], correctAnswer: 'No rain' },
  { id: 'g-cl-14', subject: 'Geography', topic: 'Climate', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Why do seasons happen?', options: ['Earth\'s tilt', 'Sun moves', 'Moon moves', 'Clouds move'], correctAnswer: 'Earth\'s tilt' },

  // Hard (10-11)
  { id: 'g-cl-15', subject: 'Geography', topic: 'Climate', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is global warming?', options: ['Earth getting hotter', 'Earth getting colder', 'More rain', 'Less wind'], correctAnswer: 'Earth getting hotter' },
  { id: 'g-cl-16', subject: 'Geography', topic: 'Climate', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What are greenhouse gases?', options: ['Trap heat', 'Cool Earth', 'Make rain', 'Clean air'], correctAnswer: 'Trap heat' },
  { id: 'g-cl-17', subject: 'Geography', topic: 'Climate', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is the water cycle?', options: ['Water movement', 'Rain only', 'River flow', 'Ocean waves'], correctAnswer: 'Water movement' },
  { id: 'g-cl-18', subject: 'Geography', topic: 'Climate', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a biome?', options: ['Large ecosystem', 'Small plant', 'Single animal', 'A rock'], correctAnswer: 'Large ecosystem' },
  { id: 'g-cl-19', subject: 'Geography', topic: 'Climate', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is humidity?', options: ['Water vapor in air', 'Rainfall', 'Wind speed', 'Heat'], correctAnswer: 'Water vapor in air' },
  { id: 'g-cl-20', subject: 'Geography', topic: 'Climate', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is renewable energy?', options: ['Won\'t run out', 'Runs out', 'Coal', 'Oil'], correctAnswer: 'Won\'t run out' },
];
