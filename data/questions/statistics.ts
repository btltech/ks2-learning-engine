import { BankQuestion, Difficulty } from '../../types';

export const statisticsQuestions: BankQuestion[] = [
  // ===== STATISTICS (15 Questions) =====
  
  // Year 3: Bar Charts & Pictograms
  { id: 'm-stat-01', subject: 'Maths', topic: 'Statistics', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'In a pictogram, if one smiley face represents 2 children, how many children do 3 smiley faces represent?', options: ['6', '3', '5', '2'], correctAnswer: '6' },
  { id: 'm-stat-02', subject: 'Maths', topic: 'Statistics', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which chart uses bars to show data?', options: ['Bar chart', 'Pie chart', 'Line graph', 'Tally chart'], correctAnswer: 'Bar chart' },
  { id: 'm-stat-03', subject: 'Maths', topic: 'Statistics', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'If 5 children like Red and 3 children like Blue, how many more like Red?', options: ['2', '8', '5', '3'], correctAnswer: '2' },
  
  // Year 4: Discrete & Continuous Data
  { id: 'm-stat-04', subject: 'Maths', topic: 'Statistics', ageGroup: [8, 9], difficulty: Difficulty.Medium, question: 'Which graph is best for showing how temperature changes over time?', options: ['Line graph', 'Bar chart', 'Pictogram', 'Pie chart'], correctAnswer: 'Line graph' },
  { id: 'm-stat-05', subject: 'Maths', topic: 'Statistics', ageGroup: [8, 9], difficulty: Difficulty.Medium, question: 'In a bar chart, what does the height of the bar usually represent?', options: ['The frequency or amount', 'The time', 'The category name', 'The width'], correctAnswer: 'The frequency or amount' },
  
  // Year 5: Line Graphs & Tables
  { id: 'm-stat-06', subject: 'Maths', topic: 'Statistics', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'A train leaves at 10:15 and arrives at 11:30. How long is the journey?', options: ['1 hour 15 minutes', '1 hour 30 minutes', '1 hour', '45 minutes'], correctAnswer: '1 hour 15 minutes' },
  { id: 'm-stat-07', subject: 'Maths', topic: 'Statistics', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'If a line graph goes up, what does it usually mean?', options: ['The value is increasing', 'The value is decreasing', 'The value is staying the same', 'The value is zero'], correctAnswer: 'The value is increasing' },
  { id: 'm-stat-08', subject: 'Maths', topic: 'Statistics', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Look at the table: Bus A (10:00), Bus B (10:30). Which bus comes first?', options: ['Bus A', 'Bus B', 'Both same time', 'Unknown'], correctAnswer: 'Bus A' },

  // Year 6: Pie Charts & Mean
  { id: 'm-stat-09', subject: 'Maths', topic: 'Statistics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'In a pie chart representing 100 people, if 50% like apples, how many people is that?', options: ['50', '100', '25', '10'], correctAnswer: '50' },
  { id: 'm-stat-10', subject: 'Maths', topic: 'Statistics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is the mean (average) of 2, 4, and 6?', options: ['4', '12', '6', '2'], correctAnswer: '4' },
  { id: 'm-stat-11', subject: 'Maths', topic: 'Statistics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Calculate the mean of 10, 20, 30.', options: ['20', '60', '30', '10'], correctAnswer: '20' },
  { id: 'm-stat-12', subject: 'Maths', topic: 'Statistics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'In a pie chart, what is the angle for a quarter (1/4) of the data?', options: ['90°', '180°', '45°', '360°'], correctAnswer: '90°' },
  { id: 'm-stat-13', subject: 'Maths', topic: 'Statistics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'If the mean of 3 numbers is 5, what is the total sum of the numbers?', options: ['15', '5', '3', '8'], correctAnswer: '15' },
  { id: 'm-stat-14', subject: 'Maths', topic: 'Statistics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'A pie chart shows 25% Blue, 25% Red, 50% Green. Which colour is most popular?', options: ['Green', 'Blue', 'Red', 'All equal'], correctAnswer: 'Green' },
  { id: 'm-stat-15', subject: 'Maths', topic: 'Statistics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is the mean of 5, 5, 5, 5?', options: ['5', '20', '4', '0'], correctAnswer: '5' },
];
