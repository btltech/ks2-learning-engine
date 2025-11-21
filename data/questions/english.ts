import { BankQuestion, Difficulty } from '../../types';

export const englishQuestions: BankQuestion[] = [
  // ===== GRAMMAR (20 Questions) =====
  // Easy (7-8)
  { id: 'e-gr-01', subject: 'English', topic: 'Grammar', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which word is a noun?', options: ['Cat', 'Run', 'Blue', 'Quickly'], correctAnswer: 'Cat' },
  { id: 'e-gr-02', subject: 'English', topic: 'Grammar', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which word is a verb?', options: ['Jump', 'Table', 'Happy', 'Green'], correctAnswer: 'Jump' },
  { id: 'e-gr-03', subject: 'English', topic: 'Grammar', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Find the adjective: "The red car."', options: ['Red', 'The', 'Car', 'Is'], correctAnswer: 'Red' },
  { id: 'e-gr-04', subject: 'English', topic: 'Grammar', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What goes at the end of a question?', options: ['Question mark', 'Full stop', 'Comma', 'Exclamation mark'], correctAnswer: 'Question mark' },
  { id: 'e-gr-05', subject: 'English', topic: 'Grammar', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which letter should be capital? "london"', options: ['L', 'o', 'n', 'd'], correctAnswer: 'L' },
  { id: 'e-gr-06', subject: 'English', topic: 'Grammar', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Plural of "dog"?', options: ['Dogs', 'Doges', 'Doggs', 'Dogies'], correctAnswer: 'Dogs' },
  { id: 'e-gr-07', subject: 'English', topic: 'Grammar', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Opposite of "hot"?', options: ['Cold', 'Warm', 'Sunny', 'Dry'], correctAnswer: 'Cold' },

  // Medium (9-10)
  { id: 'e-gr-08', subject: 'English', topic: 'Grammar', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which is an adverb?', options: ['Quickly', 'Quick', 'Run', 'Fast'], correctAnswer: 'Quickly' },
  { id: 'e-gr-09', subject: 'English', topic: 'Grammar', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Find the pronoun: "She went home."', options: ['She', 'Went', 'Home', 'The'], correctAnswer: 'She' },
  { id: 'e-gr-10', subject: 'English', topic: 'Grammar', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Past tense of "eat"?', options: ['Ate', 'Eated', 'Eating', 'Eats'], correctAnswer: 'Ate' },
  { id: 'e-gr-11', subject: 'English', topic: 'Grammar', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which sentence is correct?', options: ['They are playing.', 'They is playing.', 'They am playing.', 'They be playing.'], correctAnswer: 'They are playing.' },
  { id: 'e-gr-12', subject: 'English', topic: 'Grammar', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a synonym for "happy"?', options: ['Joyful', 'Sad', 'Angry', 'Tired'], correctAnswer: 'Joyful' },
  { id: 'e-gr-13', subject: 'English', topic: 'Grammar', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Identify the conjunction: "I like tea and cake."', options: ['And', 'Like', 'Tea', 'Cake'], correctAnswer: 'And' },
  { id: 'e-gr-14', subject: 'English', topic: 'Grammar', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which word needs an apostrophe? "Dont"', options: ['Don\'t', 'Do\'nt', 'Dont\'', 'D\'ont'], correctAnswer: 'Don\'t' },

  // Hard (10-11)
  { id: 'e-gr-15', subject: 'English', topic: 'Grammar', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which sentence uses passive voice?', options: ['The cake was eaten by the dog.', 'The dog ate the cake.', 'The dog is eating.', 'The dog eats cake.'], correctAnswer: 'The cake was eaten by the dog.' },
  { id: 'e-gr-16', subject: 'English', topic: 'Grammar', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Identify the preposition: "The cat is under the table."', options: ['Under', 'Cat', 'Is', 'Table'], correctAnswer: 'Under' },
  { id: 'e-gr-17', subject: 'English', topic: 'Grammar', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a clause?', options: ['A group of words with a subject and verb', 'A single word', 'A punctuation mark', 'A type of noun'], correctAnswer: 'A group of words with a subject and verb' },
  { id: 'e-gr-18', subject: 'English', topic: 'Grammar', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which is a relative pronoun?', options: ['Who', 'Big', 'Run', 'Table'], correctAnswer: 'Who' },
  { id: 'e-gr-19', subject: 'English', topic: 'Grammar', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Correct the sentence: "Me and him went out."', options: ['He and I went out.', 'Me and him went out.', 'Him and me went out.', 'I and him went out.'], correctAnswer: 'He and I went out.' },
  { id: 'e-gr-20', subject: 'English', topic: 'Grammar', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is an antonym for "benevolent"?', options: ['Cruel', 'Kind', 'Nice', 'Good'], correctAnswer: 'Cruel' },

  // ===== READING COMPREHENSION (20 Questions) =====
  // Easy (7-8)
  { id: 'e-rc-01', subject: 'English', topic: 'Reading Comprehension', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Who is the main character in the story?', options: ['The hero or main person described', 'The villain', 'The narrator', 'A minor character'], correctAnswer: 'The hero or main person described' },
  { id: 'e-rc-02', subject: 'English', topic: 'Reading Comprehension', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is the setting of a story?', options: ['Where and when the story happens', 'What happens', 'How it ends', 'Who is involved'], correctAnswer: 'Where and when the story happens' },
  { id: 'e-rc-03', subject: 'English', topic: 'Reading Comprehension', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Why did the character go to the shop?', options: ['To find out - read the text carefully', 'Always for money', 'To meet friends', 'It is not important'], correctAnswer: 'To find out - read the text carefully' },
  { id: 'e-rc-04', subject: 'English', topic: 'Reading Comprehension', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is the first event in a story?', options: ['The introduction', 'The climax', 'The ending', 'The conflict'], correctAnswer: 'The introduction' },
  { id: 'e-rc-05', subject: 'English', topic: 'Reading Comprehension', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'How do we know if a character is happy?', options: ['Look for clues like smiling or laughing', 'The author says so', 'From the title', 'From the page number'], correctAnswer: 'Look for clues like smiling or laughing' },
  { id: 'e-rc-06', subject: 'English', topic: 'Reading Comprehension', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What does a narrator do?', options: ['Tells the story', 'Acts in it', 'Watches from side', 'Illustrates it'], correctAnswer: 'Tells the story' },
  { id: 'e-rc-07', subject: 'English', topic: 'Reading Comprehension', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What is the ending of a story called?', options: ['The conclusion', 'The beginning', 'The problem', 'The solution'], correctAnswer: 'The conclusion' },

  // Medium (9-10)
  { id: 'e-rc-08', subject: 'English', topic: 'Reading Comprehension', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is inference in reading?', options: ['Using clues to understand what is implied', 'Reading every word', 'Skipping difficult parts', 'Guessing randomly'], correctAnswer: 'Using clues to understand what is implied' },
  { id: 'e-rc-09', subject: 'English', topic: 'Reading Comprehension', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is the main idea of a passage?', options: ['The central message or topic', 'Every detail mentioned', 'The first sentence', 'The conclusion'], correctAnswer: 'The central message or topic' },
  { id: 'e-rc-10', subject: 'English', topic: 'Reading Comprehension', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a supporting detail?', options: ['Information that backs up the main idea', 'The beginning', 'A conclusion', 'A different topic'], correctAnswer: 'Information that backs up the main idea' },
  { id: 'e-rc-11', subject: 'English', topic: 'Reading Comprehension', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is sequencing in a text?', options: ['The order events happen', 'Repeating events', 'Creating new events', 'Counting events'], correctAnswer: 'The order events happen' },
  { id: 'e-rc-12', subject: 'English', topic: 'Reading Comprehension', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a cause?', options: ['Why something happens', 'What happens as a result', 'When something happens', 'Where it happens'], correctAnswer: 'Why something happens' },
  { id: 'e-rc-13', subject: 'English', topic: 'Reading Comprehension', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is an effect?', options: ['What happens as a result', 'Why it happened', 'When it happens', 'The beginning'], correctAnswer: 'What happens as a result' },
  { id: 'e-rc-14', subject: 'English', topic: 'Reading Comprehension', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How do you find the author\'s purpose?', options: ['Think why the author wrote this', 'Count pages', 'Find difficult words', 'Skip descriptions'], correctAnswer: 'Think why the author wrote this' },

  // Hard (10-11)
  { id: 'e-rc-15', subject: 'English', topic: 'Reading Comprehension', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is summarization?', options: ['Stating main points in fewer words', 'Reading everything twice', 'Copying the text', 'Memorizing details'], correctAnswer: 'Stating main points in fewer words' },
  { id: 'e-rc-16', subject: 'English', topic: 'Reading Comprehension', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is critical reading?', options: ['Analyzing and evaluating the text', 'Reading quickly', 'Reading once only', 'Trusting everything'], correctAnswer: 'Analyzing and evaluating the text' },
  { id: 'e-rc-17', subject: 'English', topic: 'Reading Comprehension', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is a theme?', options: ['The central message or idea about life', 'The plot', 'The setting', 'The author'], correctAnswer: 'The central message or idea about life' },
  { id: 'e-rc-18', subject: 'English', topic: 'Reading Comprehension', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is character development?', options: ['How characters change through the story', 'Physical description', 'Names of people', 'Their actions only'], correctAnswer: 'How characters change through the story' },
  { id: 'e-rc-19', subject: 'English', topic: 'Reading Comprehension', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is figurative language?', options: ['Language used not literally (like metaphors)', 'Exact, literal language', 'Difficult words', 'Simple descriptions'], correctAnswer: 'Language used not literally (like metaphors)' },
  { id: 'e-rc-20', subject: 'English', topic: 'Reading Comprehension', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is an idiom?', options: ['A phrase with meaning different from literal words', 'A difficult word', 'A sentence structure', 'A punctuation rule'], correctAnswer: 'A phrase with meaning different from literal words' },

  // ===== SPELLING & PHONICS (15 Questions) =====
  // Easy (7-8)
  { id: 'e-sp-01', subject: 'English', topic: 'Spelling & Phonics', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'How many syllables does "elephant" have?', options: ['3', '2', '4', '5'], correctAnswer: '3' },
  { id: 'e-sp-02', subject: 'English', topic: 'Spelling & Phonics', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'Which word is spelled correctly?', options: ['Beautiful', 'Beautifull', 'Beaufiful', 'Beautful'], correctAnswer: 'Beautiful' },
  { id: 'e-sp-03', subject: 'English', topic: 'Spelling & Phonics', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What sound does "ch" make in "chair"?', options: ['/tʃ/', '/ʃ/', '/k/', '/h/'], correctAnswer: '/tʃ/' },
  { id: 'e-sp-04', subject: 'English', topic: 'Spelling & Phonics', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'How do you spell the word for frozen water?', options: ['Ice', 'Ise', 'Yce', 'Yse'], correctAnswer: 'Ice' },
  { id: 'e-sp-05', subject: 'English', topic: 'Spelling & Phonics', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'How many syllables does "cat" have?', options: ['1', '2', '3', '0'], correctAnswer: '1' },

  // Medium (9-10)
  { id: 'e-sp-06', subject: 'English', topic: 'Spelling & Phonics', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Add a suffix: "happy" + "ness" = ?', options: ['Happiness', 'Happyness', 'Happines', 'Happy-ness'], correctAnswer: 'Happiness' },
  { id: 'e-sp-07', subject: 'English', topic: 'Spelling & Phonics', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a homophone?', options: ['Words that sound the same but mean different things', 'Words that look the same', 'Words that rhyme', 'Words with silent letters'], correctAnswer: 'Words that sound the same but mean different things' },
  { id: 'e-sp-08', subject: 'English', topic: 'Spelling & Phonics', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which pair are homophones?', options: ['There / Their', 'Cat / Dog', 'Run / Ran', 'Happy / Sad'], correctAnswer: 'There / Their' },
  { id: 'e-sp-09', subject: 'English', topic: 'Spelling & Phonics', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'How do you spell "necessary"?', options: ['Necessary', 'Neccessary', 'Necesary', 'Neccesssary'], correctAnswer: 'Necessary' },
  { id: 'e-sp-10', subject: 'English', topic: 'Spelling & Phonics', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is the plural of "child"?', options: ['Children', 'Childs', 'Childes', 'Childrens'], correctAnswer: 'Children' },

  // Hard (10-11)
  { id: 'e-sp-11', subject: 'English', topic: 'Spelling & Phonics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Add a prefix: "un" + "happy" = ?', options: ['Unhappy', 'Unhapy', 'Unhapiness', 'Un-happy'], correctAnswer: 'Unhappy' },
  { id: 'e-sp-12', subject: 'English', topic: 'Spelling & Phonics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What are silent letters?', options: ['Letters we do not pronounce', 'Letters at the end', 'Capital letters', 'Double letters'], correctAnswer: 'Letters we do not pronounce' },
  { id: 'e-sp-13', subject: 'English', topic: 'Spelling & Phonics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which word has a silent "k"?', options: ['Knight', 'Knife', 'Know', 'All of the above'], correctAnswer: 'All of the above' },
  { id: 'e-sp-14', subject: 'English', topic: 'Spelling & Phonics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'How do you spell "accommodation"?', options: ['Accommodation', 'Accomodation', 'Acommodation', 'Accommodtion'], correctAnswer: 'Accommodation' },
  { id: 'e-sp-15', subject: 'English', topic: 'Spelling & Phonics', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What does morphology study?', options: ['The structure and meaning of words', 'Sound patterns', 'Sentence structure', 'Writing systems'], correctAnswer: 'The structure and meaning of words' },

  // ===== PUNCTUATION (15 Questions) =====
  // Easy (7-8)
  { id: 'e-pun-01', subject: 'English', topic: 'Punctuation', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What does a period (.) mark the end of?', options: ['A sentence', 'A word', 'A paragraph', 'A page'], correctAnswer: 'A sentence' },
  { id: 'e-pun-02', subject: 'English', topic: 'Punctuation', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What does a comma (,) do?', options: ['Separates ideas in a sentence', 'Ends a sentence', 'Starts a sentence', 'Makes emphasis'], correctAnswer: 'Separates ideas in a sentence' },
  { id: 'e-pun-03', subject: 'English', topic: 'Punctuation', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What punctuation ends a question?', options: ['Question mark (?)', 'Period (.)', 'Comma (,)', 'Colon (:)'], correctAnswer: 'Question mark (?)' },
  { id: 'e-pun-04', subject: 'English', topic: 'Punctuation', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: "What is an apostrophe (') used for?", options: ['Showing possession or contraction', 'Ending sentences', 'Separation', 'Quotation marks'], correctAnswer: 'Showing possession or contraction' },
  { id: 'e-pun-05', subject: 'English', topic: 'Punctuation', ageGroup: [7, 8], difficulty: Difficulty.Easy, question: 'What punctuation shows strong feeling?', options: ['Exclamation mark (!)', 'Period (.)', 'Comma (,)', 'Dash (-)'], correctAnswer: 'Exclamation mark (!)' },

  // Medium (9-10)
  { id: 'e-pun-06', subject: 'English', topic: 'Punctuation', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What does a semicolon (;) do?', options: ['Joins two independent clauses', 'Ends a sentence', 'Starts a list', 'Shows possession'], correctAnswer: 'Joins two independent clauses' },
  { id: 'e-pun-07', subject: 'English', topic: 'Punctuation', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What is a colon (:) used for?', options: ['Introducing a list or explanation', 'Ending a sentence', 'Joining words', 'Showing time'], correctAnswer: 'Introducing a list or explanation' },
  { id: 'e-pun-08', subject: 'English', topic: 'Punctuation', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What do quotation marks ("") indicate?', options: ['Exact words someone said', 'Important words', 'Book titles', 'Definitions'], correctAnswer: 'Exact words someone said' },
  { id: 'e-pun-09', subject: 'English', topic: 'Punctuation', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'Which sentence uses apostrophes correctly?', options: ['It\'s a beautiful day', 'Its a beautiful day', 'Its\' a beautiful day', 'It\'s\' a beautiful day'], correctAnswer: 'It\'s a beautiful day' },
  { id: 'e-pun-10', subject: 'English', topic: 'Punctuation', ageGroup: [9, 10], difficulty: Difficulty.Medium, question: 'What does a dash (-) do?', options: ['Adds emphasis or shows a pause', 'Ends sentences', 'Starts lists', 'Separates numbers'], correctAnswer: 'Adds emphasis or shows a pause' },

  // Hard (10-11)
  { id: 'e-pun-11', subject: 'English', topic: 'Punctuation', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is an ellipsis (...)?', options: ['Shows omitted words or trailing off', 'Ends a sentence', 'Joins clauses', 'Creates lists'], correctAnswer: 'Shows omitted words or trailing off' },
  { id: 'e-pun-12', subject: 'English', topic: 'Punctuation', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'When do we use parentheses ()?', options: ['To add extra information that is not essential', 'To end sentences', 'To separate items', 'To show ownership'], correctAnswer: 'To add extra information that is not essential' },
  { id: 'e-pun-13', subject: 'English', topic: 'Punctuation', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'Which uses punctuation correctly?', options: ['"Hello," she said.', '"Hello" she said.', 'She said "Hello"', 'She said, "hello"'], correctAnswer: '"Hello," she said.' },
  { id: 'e-pun-14', subject: 'English', topic: 'Punctuation', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'What is the comma splice error?', options: ['Joining clauses with only a comma', 'Using too many commas', 'Missing commas', 'Wrong comma placement'], correctAnswer: 'Joining clauses with only a comma' },
  { id: 'e-pun-15', subject: 'English', topic: 'Punctuation', ageGroup: [10, 11], difficulty: Difficulty.Hard, question: 'How should titles of books be punctuated?', options: ['Italicized or underlined', 'In quotation marks', 'In parentheses', 'In bold'], correctAnswer: 'Italicized or underlined' },
];
