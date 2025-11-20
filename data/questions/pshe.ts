import { BankQuestion, Difficulty } from '../../types';

export const psheQuestions: BankQuestion[] = [
  // ===== FRIENDSHIP =====
  { id: 'ps-fr-01', subject: 'PSHE', topic: 'Friendship', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What makes a good friend?', options: ['Sharing', 'Being mean', 'Ignoring you', 'Lying'], correctAnswer: 'Sharing' },
  { id: 'ps-fr-02', subject: 'PSHE', topic: 'Friendship', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'If a friend is sad, you should...', options: ['Ask if they are okay', 'Laugh at them', 'Walk away', 'Shout'], correctAnswer: 'Ask if they are okay' },
  { id: 'ps-fr-03', subject: 'PSHE', topic: 'Friendship', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is empathy?', options: ['Understanding feelings', 'Being angry', 'Running fast', 'Eating lunch'], correctAnswer: 'Understanding feelings' },
  { id: 'ps-fr-04', subject: 'PSHE', topic: 'Friendship', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How do you resolve an argument?', options: ['Talk and listen', 'Fight', 'Ignore it', 'Scream'], correctAnswer: 'Talk and listen' },

  // ===== EMOTIONS =====
  { id: 'ps-em-01', subject: 'PSHE', topic: 'Emotions', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which is a happy feeling?', options: ['Joy', 'Sadness', 'Anger', 'Fear'], correctAnswer: 'Joy' },
  { id: 'ps-em-02', subject: 'PSHE', topic: 'Emotions', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'It is okay to cry when you are...', options: ['Sad', 'Hungry', 'Bored', 'Asleep'], correctAnswer: 'Sad' },
  { id: 'ps-em-03', subject: 'PSHE', topic: 'Emotions', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is anxiety?', options: ['Feeling worried', 'Feeling happy', 'Feeling tired', 'Feeling hungry'], correctAnswer: 'Feeling worried' },
  { id: 'ps-em-04', subject: 'PSHE', topic: 'Emotions', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How can you calm down?', options: ['Deep breathing', 'Shouting', 'Running around', 'Eating sweets'], correctAnswer: 'Deep breathing' },

  // ===== ONLINE SAFETY =====
  { id: 'ps-os-01', subject: 'PSHE', topic: 'Online Safety', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Should you share your password?', options: ['No, never', 'Yes, with friends', 'Yes, with strangers', 'Maybe'], correctAnswer: 'No, never' },
  { id: 'ps-os-02', subject: 'PSHE', topic: 'Online Safety', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is personal information?', options: ['Address', 'Favorite color', 'Pet name', 'Game score'], correctAnswer: 'Address' },
  { id: 'ps-os-03', subject: 'PSHE', topic: 'Online Safety', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is cyberbullying?', options: ['Bullying online', 'Playing games', 'Coding', 'Emailing'], correctAnswer: 'Bullying online' },
  { id: 'ps-os-04', subject: 'PSHE', topic: 'Online Safety', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'If you see something bad online, you should...', options: ['Tell an adult', 'Share it', 'Ignore it', 'Laugh'], correctAnswer: 'Tell an adult' },

  // ===== MONEY =====
  { id: 'ps-mo-01', subject: 'PSHE', topic: 'Money', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What do you use to buy things?', options: ['Money', 'Leaves', 'Stones', 'Paper'], correctAnswer: 'Money' },
  { id: 'ps-mo-02', subject: 'PSHE', topic: 'Money', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Where can you save money?', options: ['Bank', 'Bin', 'Floor', 'Garden'], correctAnswer: 'Bank' },
  { id: 'ps-mo-03', subject: 'PSHE', topic: 'Money', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a budget?', options: ['A plan for spending', 'A type of car', 'A game', 'A coin'], correctAnswer: 'A plan for spending' },
  { id: 'ps-mo-04', subject: 'PSHE', topic: 'Money', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is debt?', options: ['Money you owe', 'Money you have', 'A gift', 'A prize'], correctAnswer: 'Money you owe' },

  // ===== RELATIONSHIPS =====
  { id: 'ps-re-01', subject: 'PSHE', topic: 'Relationships', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Who is part of your family?', options: ['Parents', 'Teachers', 'Shopkeepers', 'Strangers'], correctAnswer: 'Parents' },
  { id: 'ps-re-02', subject: 'PSHE', topic: 'Relationships', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Respect means...', options: ['Treating others well', 'Being rude', 'Ignoring rules', 'Shouting'], correctAnswer: 'Treating others well' },
  { id: 'ps-re-03', subject: 'PSHE', topic: 'Relationships', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is peer pressure?', options: ['Friends influencing you', 'Teacher helping you', 'Parents loving you', 'Playing alone'], correctAnswer: 'Friends influencing you' },
  { id: 'ps-re-04', subject: 'PSHE', topic: 'Relationships', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'A healthy relationship is based on...', options: ['Trust', 'Fear', 'Lies', 'Secrets'], correctAnswer: 'Trust' },
];
