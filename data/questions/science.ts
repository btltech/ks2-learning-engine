import { BankQuestion, Difficulty } from '../../types';

export const scienceQuestions: BankQuestion[] = [
  // ===== ANIMALS (20 Questions) =====
  // Easy (7-8)
  { id: 's-an-01', subject: 'Science', topic: 'Animals', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which animal is a mammal?', options: ['Dog', 'Fish', 'Lizard', 'Fly'], correctAnswer: 'Dog' },
  { id: 's-an-02', subject: 'Science', topic: 'Animals', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What do fish use to breathe?', options: ['Gills', 'Lungs', 'Nose', 'Mouth'], correctAnswer: 'Gills' },
  { id: 's-an-03', subject: 'Science', topic: 'Animals', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which animal lays eggs?', options: ['Chicken', 'Cat', 'Cow', 'Dog'], correctAnswer: 'Chicken' },
  { id: 's-an-04', subject: 'Science', topic: 'Animals', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What does a herbivore eat?', options: ['Plants', 'Meat', 'Both', 'Insects'], correctAnswer: 'Plants' },
  { id: 's-an-05', subject: 'Science', topic: 'Animals', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which animal can fly?', options: ['Eagle', 'Dog', 'Cat', 'Mouse'], correctAnswer: 'Eagle' },
  { id: 's-an-06', subject: 'Science', topic: 'Animals', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Where do polar bears live?', options: ['Arctic', 'Desert', 'Jungle', 'Forest'], correctAnswer: 'Arctic' },
  { id: 's-an-07', subject: 'Science', topic: 'Animals', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'How many legs does a spider have?', options: ['8', '6', '4', '10'], correctAnswer: '8' },

  // Medium (9-10)
  { id: 's-an-08', subject: 'Science', topic: 'Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is an invertebrate?', options: ['Animal without a backbone', 'Animal with a backbone', 'Animal that flies', 'Animal that swims'], correctAnswer: 'Animal without a backbone' },
  { id: 's-an-09', subject: 'Science', topic: 'Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which is an amphibian?', options: ['Frog', 'Snake', 'Whale', 'Eagle'], correctAnswer: 'Frog' },
  { id: 's-an-10', subject: 'Science', topic: 'Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a habitat?', options: ['Where an animal lives', 'What an animal eats', 'How an animal moves', 'An animal\'s name'], correctAnswer: 'Where an animal lives' },
  { id: 's-an-11', subject: 'Science', topic: 'Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which animal is a reptile?', options: ['Crocodile', 'Frog', 'Shark', 'Bear'], correctAnswer: 'Crocodile' },
  { id: 's-an-12', subject: 'Science', topic: 'Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What do omnivores eat?', options: ['Plants and meat', 'Only plants', 'Only meat', 'Only insects'], correctAnswer: 'Plants and meat' },
  { id: 's-an-13', subject: 'Science', topic: 'Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which bird cannot fly?', options: ['Penguin', 'Sparrow', 'Robin', 'Eagle'], correctAnswer: 'Penguin' },
  { id: 's-an-14', subject: 'Science', topic: 'Animals', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What covers a bird\'s body?', options: ['Feathers', 'Fur', 'Scales', 'Skin'], correctAnswer: 'Feathers' },

  // Hard (10-11)
  { id: 's-an-15', subject: 'Science', topic: 'Animals', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is adaptation?', options: ['Changing to survive', 'Eating food', 'Sleeping', 'Running fast'], correctAnswer: 'Changing to survive' },
  { id: 's-an-16', subject: 'Science', topic: 'Animals', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which is a mammal that lays eggs?', options: ['Platypus', 'Bat', 'Whale', 'Kangaroo'], correctAnswer: 'Platypus' },
  { id: 's-an-17', subject: 'Science', topic: 'Animals', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a food chain?', options: ['Energy transfer order', 'A list of food', 'Animals eating together', 'Plants growing'], correctAnswer: 'Energy transfer order' },
  { id: 's-an-18', subject: 'Science', topic: 'Animals', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What does "nocturnal" mean?', options: ['Active at night', 'Active in day', 'Sleeps all time', 'Eats plants'], correctAnswer: 'Active at night' },
  { id: 's-an-19', subject: 'Science', topic: 'Animals', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which group are humans in?', options: ['Mammals', 'Reptiles', 'Amphibians', 'Birds'], correctAnswer: 'Mammals' },
  { id: 's-an-20', subject: 'Science', topic: 'Animals', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is metamorphosis?', options: ['Changing body form', 'Eating', 'Sleeping', 'Moving'], correctAnswer: 'Changing body form' },
];
