import { BankQuestion, Difficulty } from '../../types';

export const historyQuestions: BankQuestion[] = [
  // ===== ANCIENT EGYPT (20 Questions) =====
  // Easy (7-8)
  { id: 'h-ae-01', subject: 'History', topic: 'Ancient Egypt', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Who was the king of Egypt?', options: ['Pharaoh', 'President', 'Emperor', 'Chief'], correctAnswer: 'Pharaoh' },
  { id: 'h-ae-02', subject: 'History', topic: 'Ancient Egypt', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is a pyramid?', options: ['A tomb', 'A house', 'A shop', 'A school'], correctAnswer: 'A tomb' },
  { id: 'h-ae-03', subject: 'History', topic: 'Ancient Egypt', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which river is in Egypt?', options: ['Nile', 'Thames', 'Amazon', 'Seine'], correctAnswer: 'Nile' },
  { id: 'h-ae-04', subject: 'History', topic: 'Ancient Egypt', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is a mummy?', options: ['Preserved body', 'A monster', 'A bandage', 'A statue'], correctAnswer: 'Preserved body' },
  { id: 'h-ae-05', subject: 'History', topic: 'Ancient Egypt', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What animal was sacred?', options: ['Cat', 'Dog', 'Horse', 'Pig'], correctAnswer: 'Cat' },
  { id: 'h-ae-06', subject: 'History', topic: 'Ancient Egypt', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is the Sphinx?', options: ['Statue with lion body', 'A pyramid', 'A god', 'A city'], correctAnswer: 'Statue with lion body' },
  { id: 'h-ae-07', subject: 'History', topic: 'Ancient Egypt', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Where is Egypt?', options: ['Africa', 'Europe', 'Asia', 'America'], correctAnswer: 'Africa' },

  // Medium (9-10)
  { id: 'h-ae-08', subject: 'History', topic: 'Ancient Egypt', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is hieroglyphics?', options: ['Picture writing', 'Spoken language', 'A game', 'A dance'], correctAnswer: 'Picture writing' },
  { id: 'h-ae-09', subject: 'History', topic: 'Ancient Egypt', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Who was Tutankhamun?', options: ['Boy King', 'A builder', 'A priest', 'A soldier'], correctAnswer: 'Boy King' },
  { id: 'h-ae-10', subject: 'History', topic: 'Ancient Egypt', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What paper did they use?', options: ['Papyrus', 'Wood', 'Plastic', 'Cloth'], correctAnswer: 'Papyrus' },
  { id: 'h-ae-11', subject: 'History', topic: 'Ancient Egypt', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Why did they mummify bodies?', options: ['For the afterlife', 'To scare people', 'For fun', 'To save space'], correctAnswer: 'For the afterlife' },
  { id: 'h-ae-12', subject: 'History', topic: 'Ancient Egypt', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a sarcophagus?', options: ['Stone coffin', 'A temple', 'A boat', 'A jewel'], correctAnswer: 'Stone coffin' },
  { id: 'h-ae-13', subject: 'History', topic: 'Ancient Egypt', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Who was the Sun God?', options: ['Ra', 'Zeus', 'Thor', 'Mars'], correctAnswer: 'Ra' },
  { id: 'h-ae-14', subject: 'History', topic: 'Ancient Egypt', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What are canopic jars?', options: ['Jars for organs', 'Jars for food', 'Jars for water', 'Jars for coins'], correctAnswer: 'Jars for organs' },

  // Hard (10-11)
  { id: 'h-ae-15', subject: 'History', topic: 'Ancient Egypt', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Who discovered Tutankhamun\'s tomb?', options: ['Howard Carter', 'Indiana Jones', 'Christopher Columbus', 'Neil Armstrong'], correctAnswer: 'Howard Carter' },
  { id: 'h-ae-16', subject: 'History', topic: 'Ancient Egypt', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is the Rosetta Stone?', options: ['Key to hieroglyphs', 'A big rock', 'A jewel', 'A map'], correctAnswer: 'Key to hieroglyphs' },
  { id: 'h-ae-17', subject: 'History', topic: 'Ancient Egypt', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Who was the last Pharaoh?', options: ['Cleopatra', 'Nefertiti', 'Hatshepsut', 'Ramses'], correctAnswer: 'Cleopatra' },
  { id: 'h-ae-18', subject: 'History', topic: 'Ancient Egypt', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is the Valley of the Kings?', options: ['Burial place', 'A city', 'A farm', 'A market'], correctAnswer: 'Burial place' },
  { id: 'h-ae-19', subject: 'History', topic: 'Ancient Egypt', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What was the Shaduf used for?', options: ['Lifting water', 'Building', 'Fighting', 'Cooking'], correctAnswer: 'Lifting water' },
  { id: 'h-ae-20', subject: 'History', topic: 'Ancient Egypt', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which organ was left in the body?', options: ['Heart', 'Brain', 'Liver', 'Lungs'], correctAnswer: 'Heart' },
];
