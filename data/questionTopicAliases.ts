/**
 * Maps the published curriculum topics to the topic labels used by older
 * generations of the Firestore question bank. These labels are deliberately
 * exact: a quiz may relax age/difficulty, but it must not drift into an
 * unrelated curriculum unit.
 */

const TOPIC_ALIASES: Record<string, Record<string, readonly string[]>> = {
  Maths: {
    'Number - number and place value': [
      'Place Value Power!',
      'Number and Place Value: Understanding numbers up to 10,000,000!',
      'Amazing Place Value: Understanding big numbers!',
      'Place Value Power: Understanding the value of each digit in big numbers',
      'Understanding Place Value',
    ],
    'Number - addition and subtraction': [
      'Adding Numbers (Using clever column adding!)',
      'Super Adding!',
      'Adding and Subtracting Big Numbers: Mental and written methods.',
    ],
    'Number - multiplication and division': [
      'Mastering Times Tables (All facts up to 12x12!)',
      'Mastering Multiplication: Long multiplication with large numbers.',
      'Solving tricky word problems with multiplying and dividing',
      'Amazing Times Tables (Learning your 2s, 3s, 4s, 5s, 8s, 10s!)',
    ],
    'Number - addition, subtraction, multiplication and division': [
      'Mixed',
      'Adding Numbers (Using clever column adding!)',
      'Adding and Subtracting Big Numbers: Mental and written methods.',
      'Mastering Multiplication: Long multiplication with large numbers.',
      'Solving tricky word problems with multiplying and dividing',
    ],
    'Number - fractions': ['What are Fractions? (Understanding halves, quarters, thirds!)'],
    'Number - fractions (including decimals)': ['What are Fractions? (Understanding halves, quarters, thirds!)'],
    'Number - fractions (including decimals and percentages)': ['What are Fractions? (Understanding halves, quarters, thirds!)'],
    Measurement: ['Measuring Up: Length, Area, and Volume'],
  },
  English: {
    'Reading - Word Reading': ['Decoding Words: Reading tricky words accurately'],
    'Reading - Comprehension': [
      'Reading Adventures',
      'Reading Adventures: Understanding stories, finding clues, and talking about what you read',
      'Finding Clues and Inferring Meaning',
      'Fact Finder',
      'Finding Important Information',
      'Guessing What Might Happen Next',
      'Story Detective',
      'Understanding Story Plots & Characters',
      'Reading and Comprehension',
    ],
    'Reading Comprehension': [
      'Reading Adventures',
      'Reading Adventures: Understanding stories, finding clues, and talking about what you read',
      'Finding Clues and Inferring Meaning',
      'Fact Finder',
      'Finding Important Information',
      'Guessing What Might Happen Next',
      'Story Detective',
      'Understanding Story Plots & Characters', 'Reading and Comprehension', 'Vocabulary',
    ],
    'Writing - Transcription': ['Writing - Handwriting'],
    'Writing - Composition': [
      'Amazing Authors: Learning about different types of writing and how authors craft their stories',
      'Setting the Scene', 'Poetry Fun', 'Spoken Language', 'Role Play Fun',
      'Listening and Comprehension', 'Speaking and Pronunciation', 'Writing',
    ],
    'Writing - Vocabulary, Grammar and Punctuation': ['Adverbs Action', 'Apostrophe Power', 'Grammar', 'Capital Letters & Full Stops', 'Speech Bubbles'],
    Grammar: ['Adverbs Action', 'Apostrophe Power', 'Capital Letters & Full Stops', 'Speech Bubbles'],
    Punctuation: ['Apostrophe Power', 'Capital Letters & Full Stops', 'Speech Bubbles'],
    'Spoken Language': ['Role Play Fun'],
  },
  Science: {
    Plants: [
      'Our Amazing Plant Friends: Learn about what plants need to grow, their different parts (like roots, stems, leaves, flowers!), and how they make seeds.',
      'Plant Life Cycles: From tiny seed to big plant',
      'Amazing Plants: Parts and what they do',
      'Amazing Plants: What they need to grow and how they help us',
      'Plant Power: Exploring different parts of a plant',
      'Being a Super Scientist: Observing, Recording & Analysing Results',
    ],
    'Animals, including humans': ['Human Body Heroes! Our wonderful bones and how they support us (skeletons).', 'Skeletons and Muscles: How our bodies move'],
    'Living things and their habitats': ['Living Things', 'Plant Life Cycles: From tiny seed to big plant'],
    Electricity: ['Conductors and Insulators: Which materials let electricity flow'],
    'Earth and space': ['Our Solar System: A trip to the planets and beyond'],
  },
  History: {
    'British History': [
      'Viking Raiders and Settlers: Longboats, exploration, and new villages',
      'The Stone Age: Early Humans in Britain',
      'When Giants Roamed: Life in the Stone Age',
      'King Alfred the Great: The Anglo-Saxon king who fought the Vikings',
    ],
    'Local History': ["Our Family's Past: Stories from my grandparents' time"],
    'World History': ['Understanding Time: Past, Present, Future', 'Archaeologists: History Detectives!'],
  },
  Geography: {
    'Locational Knowledge': ['Meet the UK: Countries, Capital Cities, and Seas', 'Our amazing planet Earth!', "The world's imaginary lines: Equator, Poles"],
    'Human and Physical Geography': ['Oceans: Our giant water bodies'],
    'Place Knowledge': ['Meet the UK: Countries, Capital Cities, and Seas', 'Our amazing planet Earth!'],
  },
  Art: {
    'Skills and Techniques': [
      'Shading and Light', 'Pencil Play', 'Super Drawing Skills: Learning to draw different lines and shapes.',
      'Portrait Power', 'Acrylic Art', 'Pastel Pictures', 'Nature Art', 'Drawing What You See',
      'Charcoal Creations', 'Drawing Lines and Shapes', 'Still Life Stories', 'Textured Art: Feeling and showing different textures in your artwork.',
      'Creating Textures with Art', 'Landscape Adventures',
    ],
    Colors: ['Amazing Colours: Discovering primary, secondary, warm and cool colours.', 'Colour Magic', 'Mixing Colours Fun'],
    'Creativity and Ideas': ['Wonderful Shapes', 'Imagination Art', 'Pattern Power', 'Making Patterns', 'Art Journaling'],
    'Art History': ['Mona Lisa', 'The Starry Night'],
  },
  Computing: {
    'Coding and Programming': ['What is programming? Giving instructions!'],
    'Using Technology': ['What is Computing? An exciting introduction.'],
  },
  Music: {
    Appreciation: ['What is Music?', 'Welcome to the World of Music!', 'Music from Around the World'],
    Listening: ['What is Sound?', 'What is Music?', 'Welcome to the World of Music!'],
    'History of Music': ['Music from Around the World'],
  },
  PE: {
    'Movement Skills': ['Our Incredible Muscles and Bones: How They Work'],
    Exercise: ['Why Exercise is Amazing: Staying Strong and Happy', 'Why It\'s Good to Be Active Every Day', 'Our Incredible Muscles and Bones: How They Work'],
    Fitness: ['Getting Enough Sleep for Growing Strong', 'Getting Enough Sleep: Rest for Energy', 'What Does It Mean To Be Fit?'],
    'Healthy Eating': [
      'Healthy Eating Superpowers: Fueling our bodies right', 'Healthy Eating: Fueling Our Bodies',
      'Healthy Eating: What foods give us energy', 'Healthy Eating for Energy',
      'Staying Hydrated: The Power of Water', 'Why Water is Super Important for Our Bodies',
    ],
  },
  PSHE: {
    Friendship: [
      'Being Kind to Myself', 'Being Kind and Respectful to Everyone',
      'Listening to Others: Being a good friend and citizen.', 'My Responsibility to Be Kind',
      'Listening to Different Ideas and Opinions', 'Why Rules and Laws Keep Us Safe',
      'Understanding What Democracy Means', 'Working Together to Make Decisions',
      'How Our School Council Works to Help Us All', 'Why Our Voices Matter (Voting and Speaking Up)',
      'Understanding My Rights as a Child', 'My Responsibilities at Home and School',
    ],
    Emotions: [
      'What Makes Me Happy', 'Being Resilient (Bouncing Back)', 'Celebrating My Strengths',
      'Managing Big Emotions', 'Talking About Feelings', 'How to Relax and Calm Down',
      'Understanding Feelings', 'Understanding My Feelings', 'Building My Confidence', 'Dealing with Worries',
    ],
    'Online Safety': ['My Rights to Be Safe', 'Fire Safety at Home'],
    Relationships: ['Being Kind and Respectful to Everyone', 'Listening to Others: Being a good friend and citizen.', 'Listening to Different Ideas and Opinions'],
    Money: ['Helping at Home: Doing chores and looking after our space.', 'Making Good Choices and Being Accountable'],
  },
  'D&T': {
    'Design Process': ['What is D&T? Making Fun Things!', 'What is Design and Technology?', 'Thinking of Ideas (Brainstorming Bonanza!)', 'What is Design? (Problem Solving Fun!)', 'Being a Brilliant Designer', 'Brainstorming Awesome Ideas', 'Finding Problems to Solve', "What is D&T? Let's Explore!"],
    Design: ['Thinking of Ideas (Brainstorming Bonanza!)', 'What is Design? (Problem Solving Fun!)', 'Being a Brilliant Designer', 'Brainstorming Awesome Ideas', 'Finding Problems to Solve'],
    Materials: ['Exploring Materials: Choosing the Best for My Idea!', 'Choosing Materials (Picking Perfect Parts!)'],
    Make: ['Making My Creation (Building Brilliance!)', 'Exploring Materials: Choosing the Best for My Idea!', 'Choosing Materials (Picking Perfect Parts!)'],
  },
  Yoruba: {
    Greetings: ['Let\'s say hello and goodbye in Yoruba!', 'My Name Is...'],
    Numbers: ['Numbers 1-10'],
    Colors: ['Colors'],
    Family: [],
    Vocabulary: ['Weather', 'Tasty Foods and Drinks (Oúnjẹ àti Ohun Mímú)'],
    Writing: ['Building sentences: Making simple Yoruba sentences.'],
  },
  Romanian: {
    Greetings: ['Introducing Myself: Say your name and ask someone theirs. "My name is...".'],
  },
  French: {
    Family: ['Family Members'],
  },
  Mandarin: {
    Vocabulary: ['Yummy Food and Drinks (What I like to eat)', 'My Favourite Foods'],
  },
  Japanese: {
    Greetings: ['Greetings', 'Self-Introduction'],
  },
  Korean: {
    Greetings: ['Hello and Goodbye! (인사해요!)'],
  },
  'Religious Education': {
    'Beliefs and Communities': [
      'Discovering Different Religions: What Do People Believe?',
      'What is special about religions? (Introduction to RE)',
      'Welcome to RE! What are religions?',
    ],
    'Ethics and Choices': ['Good choices: Learning from stories about right and wrong'],
    Christianity: ['Exploring the life of Jesus: Who was he?'],
    'Creation Stories': ['The Christian story of Creation and Adam & Eve.'],
    Sikhism: ['Langar: Sharing and caring in Sikhism.'],
  },
};

const stripLanguagePrefix = (subject: string, topic: string): string => {
  const prefix = `${subject}: `;
  return topic.startsWith(prefix) ? topic.slice(prefix.length) : topic;
};

export const getCloudTopicAliases = (subject: string, bankTopic: string): string[] => {
  const canonicalTopic = stripLanguagePrefix(subject, bankTopic);
  return [...new Set([canonicalTopic, ...(TOPIC_ALIASES[subject]?.[canonicalTopic] ?? [])])];
};

export const getCloudSubjectAliases = (subject: string): string[] =>
  subject === 'PSHE' ? ['PSHE', 'Citizenship']
    : subject === 'English' ? ['English', 'Languages']
      : [subject];
