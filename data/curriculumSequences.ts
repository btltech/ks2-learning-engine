import { YearGroup } from '../types';

export interface CurriculumUnit {
  id: string;
  subject: string;
  yearGroup: YearGroup;
  order: number;
  title: string;
  objective: string;
  bankTopic: string;
  prerequisiteId?: string;
  practicalNote?: string;
}

type UnitSpec = readonly [title: string, objective: string, bankTopic: string, practicalNote?: string];
type YearSequence = Record<YearGroup, readonly UnitSpec[]>;

export const CURATED_LANGUAGES = ['French', 'Spanish', 'German', 'Welsh', 'Yoruba', 'Romanian', 'Mandarin', 'Japanese', 'Korean'] as const;

const coreSequences: Record<string, YearSequence> = {
  Maths: {
    [YearGroup.Year3]: [
      ['Place value to 1,000', 'Read, compare and represent numbers to 1,000.', 'Number - number and place value'],
      ['Addition and subtraction', 'Add and subtract up to three-digit numbers using mental and written methods.', 'Number - addition and subtraction'],
      ['Multiplication and division', 'Use the 3, 4 and 8 multiplication tables to solve problems.', 'Number - multiplication and division'],
      ['Fractions of shapes and amounts', 'Recognise, find and compare simple fractions.', 'Number - fractions'],
      ['Measurement', 'Measure and compare length, mass, volume, money and time.', 'Measurement'],
      ['Shape and angles', 'Recognise angles and describe properties of 2-D and 3-D shapes.', 'Geometry - properties of shapes'],
      ['Statistics', 'Interpret and present data using tables, pictograms and bar charts.', 'Statistics'],
    ],
    [YearGroup.Year4]: [
      ['Place value to 10,000', 'Read, order and round numbers beyond 1,000.', 'Number - number and place value'],
      ['Column addition and subtraction', 'Use formal written methods and check answers with inverse operations.', 'Number - addition and subtraction'],
      ['Times tables and division', 'Recall multiplication facts to 12 × 12 and use them in problems.', 'Number - multiplication and division'],
      ['Fractions and decimals', 'Recognise equivalent fractions and decimal equivalents.', 'Number - fractions (including decimals)'],
      ['Perimeter, area and measures', 'Convert measures and calculate perimeter and area of rectilinear shapes.', 'Measurement'],
      ['Coordinates and symmetry', 'Plot positions and identify lines of symmetry.', 'Geometry - position and direction'],
      ['Charts and time graphs', 'Interpret discrete and continuous data.', 'Statistics'],
    ],
    [YearGroup.Year5]: [
      ['Place value to 1,000,000', 'Read, order and round numbers to one million.', 'Number - number and place value'],
      ['Written calculation', 'Solve multi-step addition, subtraction, multiplication and division problems.', 'Number - addition, subtraction, multiplication and division'],
      ['Factors, multiples and primes', 'Identify factors, multiples, prime and square numbers.', 'Number - multiplication and division'],
      ['Fractions, decimals and percentages', 'Compare, calculate with and convert fractions, decimals and percentages.', 'Number - fractions (including decimals and percentages)'],
      ['Measurement and volume', 'Convert units and estimate area, volume and capacity.', 'Measurement'],
      ['Angles and transformations', 'Measure angles and describe reflection and translation.', 'Geometry - properties of shapes'],
      ['Line graphs and tables', 'Complete, read and interpret information in tables and line graphs.', 'Statistics'],
    ],
    [YearGroup.Year6]: [
      ['Place value to 10,000,000', 'Read, order and round numbers to ten million.', 'Number - number and place value'],
      ['Four-operation fluency', 'Use efficient written and mental methods for all four operations.', 'Number - addition, subtraction, multiplication and division'],
      ['Fractions, decimals and percentages', 'Calculate with fractions and solve percentage problems.', 'Number - fractions (including decimals and percentages)'],
      ['Ratio and proportion', 'Solve problems involving relative sizes, scale and unequal sharing.', 'Ratio and proportion'],
      ['Algebra', 'Use formulae, sequences and equations with unknown values.', 'Algebra'],
      ['Geometry and measures', 'Reason about angles, coordinates, area, volume and unit conversion.', 'Geometry - properties of shapes'],
      ['Statistics and averages', 'Interpret pie charts, line graphs and calculate the mean.', 'Statistics'],
    ],
  },
  English: {
    [YearGroup.Year3]: [
      ['Reading fluency and vocabulary', 'Read accurately and use context to explain unfamiliar words.', 'Reading - Word Reading'],
      ['Retrieval and inference', 'Retrieve information and make supported inferences from a text.', 'Reading - Comprehension'],
      ['Spelling patterns', 'Apply prefixes, suffixes and common exception spelling patterns.', 'Spelling & Phonics'],
      ['Sentence structure', 'Build clear sentences using nouns, verbs, adjectives and conjunctions.', 'Grammar'],
      ['Speech and apostrophes', 'Punctuate direct speech and use apostrophes accurately.', 'Punctuation'],
      ['Planning and composing', 'Plan, draft and improve short narratives and non-fiction.', 'Writing - Composition'],
    ],
    [YearGroup.Year4]: [
      ['Reading for meaning', 'Explain ideas and support inferences with evidence from a text.', 'Reading - Comprehension'],
      ['Vocabulary in context', 'Work out word meanings and discuss how language creates an effect.', 'Reading Comprehension'],
      ['Spelling and handwriting', 'Apply Year 3–4 spelling patterns and write fluently and legibly.', 'Writing - Transcription'],
      ['Expanded noun phrases', 'Use expanded noun phrases, pronouns and conjunctions accurately.', 'Writing - Vocabulary, Grammar and Punctuation'],
      ['Paragraphs and cohesion', 'Organise related ideas into paragraphs.', 'Writing - Composition'],
      ['Punctuation for clarity', 'Use commas, inverted commas and apostrophes accurately.', 'Punctuation'],
    ],
    [YearGroup.Year5]: [
      ['Summarising and inference', 'Summarise key ideas and justify inferences with evidence.', 'Reading - Comprehension'],
      ['Authorial choices', 'Explain how vocabulary, structure and presentation affect meaning.', 'Reading Comprehension'],
      ['Year 5 spelling', 'Apply morphology, etymology and statutory spelling patterns.', 'Spelling & Phonics'],
      ['Relative clauses and modality', 'Use relative clauses, modal verbs and adverbs precisely.', 'Writing - Vocabulary, Grammar and Punctuation'],
      ['Cohesion across paragraphs', 'Link ideas using tense, pronouns and cohesive devices.', 'Writing - Composition'],
      ['Editing for effect', 'Evaluate and edit vocabulary, grammar and punctuation choices.', 'Writing - Composition'],
    ],
    [YearGroup.Year6]: [
      ['Reading analysis', 'Explain themes, compare texts and justify interpretations with evidence.', 'Reading - Comprehension'],
      ['Vocabulary and language effect', 'Explain precisely how language choices shape meaning.', 'Reading Comprehension'],
      ['Spelling and proofreading', 'Apply Year 5–6 spelling conventions and proofread accurately.', 'Spelling & Phonics'],
      ['Grammar for purpose', 'Control voice, formality, clauses and verb forms for effect.', 'Writing - Vocabulary, Grammar and Punctuation'],
      ['Advanced punctuation', 'Use colons, semicolons, dashes and hyphens accurately.', 'Punctuation'],
      ['Independent composition', 'Plan, draft, evaluate and edit sustained writing for an audience.', 'Writing - Composition'],
    ],
  },
  Science: {
    [YearGroup.Year3]: [
      ['Plants', 'Explain the functions of flowering-plant parts and what plants need to grow.', 'Plants'],
      ['Animals including humans', 'Describe nutrition, skeletons and muscles.', 'Animals, including humans'],
      ['Rocks and soils', 'Compare rocks and explain fossils and soil formation.', 'Rocks'],
      ['Light and shadows', 'Explain how light, reflection and shadows behave.', 'Light'],
      ['Forces and magnets', 'Compare contact forces and investigate magnetic attraction.', 'Forces and magnets'],
    ],
    [YearGroup.Year4]: [
      ['Living things and habitats', 'Use classification keys and recognise environmental change.', 'Living things and their habitats'],
      ['Digestion and food chains', 'Describe digestion, teeth and food chains.', 'Animals, including humans'],
      ['States of matter', 'Compare solids, liquids and gases and explain changes of state.', 'States of matter'],
      ['Sound', 'Explain vibration, pitch, volume and how sound travels.', 'Sound'],
      ['Electricity', 'Build and reason about simple series circuits.', 'Electricity'],
    ],
    [YearGroup.Year5]: [
      ['Life cycles and reproduction', 'Compare life cycles and describe reproduction in plants and animals.', 'Living things and their habitats'],
      ['Human development', 'Describe changes in humans from birth to old age.', 'Animals, including humans'],
      ['Properties and changes of materials', 'Compare materials, dissolve, separate and explain reversible change.', 'Properties and changes of materials'],
      ['Earth and space', 'Describe the movement of Earth, the Moon and other bodies.', 'Earth and space'],
      ['Forces', 'Explain gravity, resistance and mechanisms.', 'Forces'],
    ],
    [YearGroup.Year6]: [
      ['Classification', 'Classify living things using observable characteristics.', 'Living things and their habitats'],
      ['Circulation and health', 'Explain the circulatory system and effects of lifestyle.', 'Animals, including humans'],
      ['Evolution and inheritance', 'Explain adaptation, inheritance and change over time.', 'Evolution and inheritance'],
      ['Light', 'Use the idea that light travels in straight lines to explain observations.', 'Light'],
      ['Electricity and circuits', 'Relate circuit behaviour to the number and voltage of components.', 'Electricity'],
    ],
  },
};

const foundationSequences: Record<string, YearSequence> = {
  History: {
    [YearGroup.Year3]: [
      ['Stone Age to Iron Age', 'Build a chronology and explain how life in Britain changed.', 'British History'],
      ['Ancient Egypt', 'Use evidence to understand Egyptian society, belief and achievement.', 'Ancient Egypt'],
      ['Local history enquiry', 'Use sources to investigate change in the local area.', 'Local History'],
    ],
    [YearGroup.Year4]: [
      ['Roman Britain', 'Explain invasion, resistance and the Roman legacy in Britain.', 'British History'],
      ['Ancient Greece', 'Compare Greek society and explain its lasting influence.', 'World History'],
      ['Working with historical sources', 'Distinguish evidence, interpretation and historical claim.', 'World History'],
    ],
    [YearGroup.Year5]: [
      ['Anglo-Saxons and Scots', 'Explain settlement and the development of English kingdoms.', 'British History'],
      ['Vikings and Anglo-Saxons', 'Explain raids, settlement and the struggle for England.', 'British History'],
      ['Maya civilisation', 'Compare Maya achievements and society with Britain at the same time.', 'World History'],
    ],
    [YearGroup.Year6]: [
      ['Britain beyond 1066', 'Study a significant theme or turning point after 1066.', 'British History'],
      ['Local history depth study', 'Construct an evidence-based account of local change.', 'Local History'],
      ['Historical interpretation', 'Compare interpretations and evaluate the evidence behind them.', 'World History'],
    ],
  },
  Geography: {
    [YearGroup.Year3]: [
      ['The United Kingdom', 'Locate UK countries, regions, cities and physical features.', 'Locational Knowledge'],
      ['Maps and fieldwork basics', 'Use compass points, symbols and simple fieldwork observations.', 'Geographical Skills and Fieldwork'],
      ['Rivers and the water cycle', 'Describe river features and the water cycle.', 'Human and Physical Geography'],
    ],
    [YearGroup.Year4]: [
      ['Europe and world regions', 'Locate countries and major environmental regions.', 'Locational Knowledge'],
      ['Settlements and land use', 'Explain how settlements grow and land is used.', 'Human and Physical Geography'],
      ['Comparing places', 'Compare the human and physical geography of contrasting places.', 'Place Knowledge'],
    ],
    [YearGroup.Year5]: [
      ['Latitude, longitude and time zones', 'Use global reference lines to describe location and time.', 'Locational Knowledge'],
      ['Mountains, volcanoes and earthquakes', 'Explain key physical processes and their effects.', 'Human and Physical Geography'],
      ['Four- and six-figure grid references', 'Use maps, scale, symbols and grid references accurately.', 'Geographical Skills and Fieldwork'],
    ],
    [YearGroup.Year6]: [
      ['Climate, biomes and vegetation', 'Explain global climate zones, biomes and vegetation belts.', 'Climate'],
      ['Trade, resources and sustainability', 'Explain connections between resources, trade and communities.', 'Human and Physical Geography'],
      ['Independent fieldwork enquiry', 'Collect, present and evaluate geographical data.', 'Geographical Skills and Fieldwork'],
    ],
  },
  Art: {
    [YearGroup.Year3]: [
      ['Sketchbooks and observation', 'Record observations and develop ideas in a sketchbook.', 'Creativity and Ideas'],
      ['Line, tone and texture', 'Develop control of drawing materials and visual elements.', 'Skills and Techniques'],
      ['Sculpture', 'Shape and join materials to create a three-dimensional form.', 'Sculpture', 'Use safe, age-appropriate materials with adult guidance.'],
    ],
    [YearGroup.Year4]: [
      ['Colour and painting', 'Mix colour and control paint for purpose and effect.', 'Colors'],
      ['Print and pattern', 'Develop repeating and layered printed designs.', 'Skills and Techniques'],
      ['Artists and designers', 'Compare how artists and designers communicate ideas.', 'Art History'],
    ],
    [YearGroup.Year5]: [
      ['Perspective and composition', 'Use viewpoint, proportion and composition intentionally.', 'Skills and Techniques'],
      ['Mixed media', 'Select and combine materials to communicate an idea.', 'Creativity and Ideas'],
      ['Art across cultures', 'Analyse art from different times and cultural traditions.', 'Art History'],
    ],
    [YearGroup.Year6]: [
      ['Developing a personal response', 'Research, experiment, refine and present an original outcome.', 'Creativity and Ideas'],
      ['Mastering technique', 'Choose and control techniques to achieve an intended effect.', 'Skills and Techniques'],
      ['Curating and evaluating', 'Present work and evaluate creative decisions using subject vocabulary.', 'Art History'],
    ],
  },
  Computing: {
    [YearGroup.Year3]: [
      ['Sequences and algorithms', 'Design and explain ordered instructions.', 'Coding and Programming'],
      ['Debugging programs', 'Find and correct errors in simple programs.', 'Logical Reasoning'],
      ['Online safety foundations', 'Recognise safe, respectful and responsible online behaviour.', 'E-Safety'],
    ],
    [YearGroup.Year4]: [
      ['Repetition and loops', 'Use repetition to make programs efficient.', 'Coding and Programming'],
      ['Networks and the internet', 'Explain how devices and networks exchange information.', 'Networks and Internet'],
      ['Searching and evaluating', 'Search effectively and judge whether digital content is trustworthy.', 'Using Technology'],
    ],
    [YearGroup.Year5]: [
      ['Selection and variables', 'Use conditions and variables in purposeful programs.', 'Coding and Programming'],
      ['Data and information', 'Collect, organise and interpret data using digital tools.', 'Using Technology'],
      ['Privacy and digital identity', 'Protect personal information and respond to online concerns.', 'E-Safety'],
    ],
    [YearGroup.Year6]: [
      ['Designing complex programs', 'Combine sequence, selection, repetition and variables.', 'Coding and Programming'],
      ['Reasoning about systems', 'Explain program behaviour and decompose complex problems.', 'Logical Reasoning'],
      ['Creating and evaluating media', 'Create, refine and evaluate digital content for an audience.', 'Using Technology'],
    ],
  },
  Music: {
    [YearGroup.Year3]: [
      ['Pulse, rhythm and pitch', 'Identify and perform steady pulse, rhythmic patterns and pitch movement.', 'Performance'],
      ['Instrument families', 'Recognise instrument families and how sound is produced.', 'Instruments'],
      ['Listening and responding', 'Describe musical features using accurate vocabulary.', 'Listening'],
    ],
    [YearGroup.Year4]: [
      ['Notation basics', 'Read and use simple rhythmic and melodic notation.', 'Notation'],
      ['Ensemble performance', 'Maintain a part and respond to others in a group.', 'Performance'],
      ['Structure and texture', 'Recognise how musical ideas are organised and layered.', 'Appreciation'],
    ],
    [YearGroup.Year5]: [
      ['Melody and harmony', 'Recognise and create melodic phrases and simple harmony.', 'Composition'],
      ['Composers and traditions', 'Compare music from different times, places and traditions.', 'History of Music'],
      ['Refining performance', 'Rehearse, perform and evaluate with increasing accuracy.', 'Performance'],
    ],
    [YearGroup.Year6]: [
      ['Composing with intent', 'Develop, notate and refine music for a purpose.', 'Composition'],
      ['Critical listening', 'Analyse how musical elements create mood and meaning.', 'Listening'],
      ['Performance project', 'Prepare, perform and evaluate an extended musical outcome.', 'Performance'],
    ],
  },
  PE: {
    [YearGroup.Year3]: [
      ['Movement skills', 'Describe balance, coordination and safe movement technique.', 'Movement Skills', 'Practise movement only in a safe space with suitable supervision.'],
      ['Games and teamwork', 'Apply simple tactics, rules and fair play.', 'Games'],
      ['Exercise and the body', 'Explain how exercise affects the body.', 'Exercise'],
    ],
    [YearGroup.Year4]: [
      ['Gymnastics and athletics', 'Explain safe technique, control and performance improvement.', 'Gymnastics and Athletics', 'Use appropriate space and adult or teacher guidance.'],
      ['Dance and sequences', 'Describe how actions combine into controlled movement sequences.', 'Dance'],
      ['Fitness and warm-ups', 'Explain components of fitness and safe preparation for exercise.', 'Fitness'],
    ],
    [YearGroup.Year5]: [
      ['Tactics and decision-making', 'Choose and evaluate tactics in competitive games.', 'Games'],
      ['Outdoor activity and safety', 'Explain teamwork, navigation and risk management.', 'Outdoor Activities'],
      ['Health and nutrition', 'Connect activity, recovery and balanced nutrition.', 'Healthy Eating'],
    ],
    [YearGroup.Year6]: [
      ['Evaluating performance', 'Use evidence to identify strengths and improve performance.', 'Evaluation'],
      ['Swimming and water safety', 'Explain key water-safety principles and swimming expectations.', 'Swimming', 'This lesson supports knowledge only; swimming requires qualified supervision.'],
      ['Lifelong physical activity', 'Plan balanced, safe and sustainable physical activity.', 'Fitness'],
    ],
  },
  PSHE: {
    [YearGroup.Year3]: [
      ['Friendship and respect', 'Recognise healthy friendships, kindness and respectful boundaries.', 'Friendship'],
      ['Understanding emotions', 'Name feelings and use safe strategies to manage them.', 'Emotions'],
      ['Staying safe online', 'Protect personal information and tell a trusted adult about concerns.', 'Online Safety'],
    ],
    [YearGroup.Year4]: [
      ['Families and relationships', 'Respect different families and recognise caring relationships.', 'Relationships'],
      ['Conflict and repair', 'Resolve disagreement calmly and know when to seek help.', 'Friendship'],
      ['Money choices', 'Understand spending, saving and that choices have consequences.', 'Money'],
    ],
    [YearGroup.Year5]: [
      ['Identity and belonging', 'Value individuality and challenge unfair treatment safely.', 'Relationships'],
      ['Health and wellbeing', 'Connect sleep, movement, food and routines with wellbeing.', 'Emotions'],
      ['Media and influence', 'Evaluate how media can influence choices and self-image.', 'Online Safety'],
    ],
    [YearGroup.Year6]: [
      ['Changing relationships', 'Manage changing friendships and seek support when needed.', 'Relationships'],
      ['Community and democracy', 'Explain shared rules, participation, rights and responsibilities.', 'Friendship'],
      ['Preparing for transition', 'Use practical strategies to manage change and uncertainty.', 'Emotions'],
    ],
  },
  'D&T': {
    [YearGroup.Year3]: [
      ['Investigate and design', 'Research users and create an annotated design specification.', 'Design Process'],
      ['Structures', 'Make and strengthen stable structures.', 'Structures', 'Use tools and materials with adult or teacher supervision.'],
      ['Food and nutrition', 'Prepare simple food safely and understand a balanced diet.', 'Cooking and Nutrition', 'Food preparation requires adult supervision and allergy checks.'],
    ],
    [YearGroup.Year4]: [
      ['Mechanisms', 'Use levers, linkages and simple mechanisms in a product.', 'Mechanisms'],
      ['Materials and making', 'Select materials and tools for their properties and purpose.', 'Materials', 'Use tools with appropriate adult or teacher supervision.'],
      ['Evaluate and improve', 'Test a product against criteria and make evidence-based improvements.', 'Evaluate'],
    ],
    [YearGroup.Year5]: [
      ['Design for a user', 'Develop and communicate a design from research and constraints.', 'Design'],
      ['Mechanical systems', 'Use gears, pulleys, cams or linkages purposefully.', 'Technical Knowledge'],
      ['Food seasonality', 'Understand seasonality and prepare a safe savoury dish.', 'Cooking and Nutrition', 'Food preparation requires adult supervision and allergy checks.'],
    ],
    [YearGroup.Year6]: [
      ['Design innovation', 'Generate, model and justify alternative solutions.', 'Design Process'],
      ['Electrical and programmed products', 'Combine electrical or computing control in a purposeful design.', 'Technical Knowledge', 'Electrical construction requires suitable equipment and supervision.'],
      ['Make, test and refine', 'Manufacture accurately, test systematically and refine the outcome.', 'Make', 'Use tools with appropriate adult or teacher supervision.'],
    ],
  },
  'Religious Education': {
    [YearGroup.Year3]: [
      ['Beliefs and communities', 'Compare how religious and non-religious beliefs shape communities and daily life.', 'Beliefs and Communities'],
      ['Stories and good choices', 'Explain how religious and non-religious stories can guide choices about right and wrong.', 'Ethics and Choices'],
    ],
    [YearGroup.Year4]: [
      ['Jesus and Christianity', 'Explore accounts about Jesus and explain their importance to Christians.', 'Christianity'],
      ['Creation stories', 'Compare a Christian creation account with other ways people understand origins.', 'Creation Stories'],
    ],
    [YearGroup.Year5]: [
      ['Sikhism, langar and service', 'Explain how langar expresses equality, service and community in Sikhism.', 'Sikhism'],
      ['Comparing belief and practice', 'Compare how people express belief through worship, service and everyday choices.', 'Beliefs and Communities'],
    ],
    [YearGroup.Year6]: [
      ['Religion and ethical decisions', 'Use reasons and evidence to discuss religious and non-religious responses to ethical questions.', 'Ethics and Choices'],
      ['Belief in a diverse society', 'Compare viewpoints respectfully and explain how freedom of religion and belief supports a diverse society.', 'Beliefs and Communities'],
    ],
  },
};

const yorubaLanguageSequence: YearSequence = {
  [YearGroup.Year3]: [
    ['Greetings and introductions', 'Listen, respond and introduce yourself using familiar phrases.', 'Greetings'],
    ['Alphabet and pronunciation', 'Recognise Yoruba letters, underdots, tone marks and common syllables.', 'Alphabet and Pronunciation'],
    ['Numbers and age', 'Recognise, say and write numbers in short exchanges.', 'Numbers'],
    ['Colours and classroom objects', 'Describe familiar objects using accurate vocabulary.', 'Colors'],
    ['Family and people', 'Name close family members and describe people respectfully.', 'Family'],
    ['Body and health', 'Name common body parts and say simple wellbeing phrases.', 'Body and Health'],
  ],
  [YearGroup.Year4]: [
    ['Food and preferences', 'Express likes, dislikes and simple requests.', 'Vocabulary'],
    ['School and daily routine', 'Use classroom vocabulary and describe a simple school day.', 'School and Routine'],
    ['Home and everyday objects', 'Name rooms, furniture and everyday household items.', 'Home'],
    ['Clothing', 'Name common clothes and describe colours and what someone is wearing.', 'Clothing'],
    ['Animals and nature', 'Name familiar domestic animals, wild animals, birds and fish.', 'Animals and Nature'],
    ['Weather and seasons', 'Describe rain, heat, cold, wind and familiar seasons.', 'Weather'],
  ],
  [YearGroup.Year5]: [
    ['Time and calendar', 'Use today, tomorrow, yesterday, weekdays, months and simple dates.', 'Time and Calendar'],
    ['Transport and road safety', 'Name transport and use simple safe-travel instructions.', 'Transport'],
    ['Places and directions', 'Ask for and give simple location and route information.', 'Places and Directions'],
    ['Shopping and money', 'Ask for items, prices and quantities in a market exchange.', 'Shopping'],
    ['Hobbies and free time', 'Talk about sport, reading, music, dancing and creative activities.', 'Hobbies'],
    ['Community and public places', 'Recognise community helpers and ask for help in public places.', 'Community'],
    ['Reading short texts', 'Read short authentic-style passages and identify key details.', 'Reading and Comprehension'],
  ],
  [YearGroup.Year6]: [
    ['Yoruba culture and identity', 'Explore names, festivals, clothing, music, food, respect and simple proverbs.', 'Culture'],
    ['Conversations and opinions', 'Take part in short exchanges and justify simple opinions.', 'Speaking and Pronunciation'],
    ['Grammar and sentence patterns', 'Apply pronouns, verbs, questions, negatives, adjectives and basic plurals.', 'Grammar'],
    ['Reading stories, poems and songs', 'Read and respond to short stories, poems and age-appropriate song texts.', 'Reading and Comprehension'],
    ['Listening and dictation', 'Understand short conversations, instructions and dictated marked words.', 'Listening'],
    ['Speaking and presentations', 'Role-play, answer questions, describe pictures and give a short presentation.', 'Speaking'],
    ['Writing connected sentences', 'Copy, complete and write simple paragraphs while preserving tone marks.', 'Writing'],
  ],
};

const sharedLanguageSequence: YearSequence = {
  [YearGroup.Year3]: [
    ['Greetings and introductions', 'Listen, respond and introduce yourself using familiar phrases.', 'Greetings'],
    ['Numbers and age', 'Recognise, say and write numbers in short exchanges.', 'Numbers'],
    ['Colours and classroom objects', 'Describe familiar objects using accurate vocabulary.', 'Colors'],
  ],
  [YearGroup.Year4]: [
    ['Family and people', 'Describe people using simple sentences and questions.', 'Family'],
    ['Food and preferences', 'Express likes, dislikes and simple requests.', 'Vocabulary'],
    ['Listening and pronunciation', 'Recognise familiar sound patterns and reproduce them accurately.', 'Speaking and Pronunciation'],
  ],
  [YearGroup.Year5]: [
    ['School and daily routine', 'Understand and create short spoken and written descriptions.', 'Writing'],
    ['Places and directions', 'Ask for and give simple location information.', 'Vocabulary'],
    ['Reading short texts', 'Read short authentic-style passages and identify key details.', 'Reading and Comprehension'],
  ],
  [YearGroup.Year6]: [
    ['Conversations and opinions', 'Take part in short exchanges and justify simple opinions.', 'Speaking and Pronunciation'],
    ['Writing connected sentences', 'Write adapted sentences from a known model.', 'Writing'],
    ['Language patterns and grammar', 'Notice and apply high-frequency grammatical patterns.', 'Grammar'],
  ],
};

const slug = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const getYearGroupForAge = (age: number): YearGroup => {
  if (age <= 7) return YearGroup.Year3;
  if (age === 8) return YearGroup.Year4;
  if (age === 9) return YearGroup.Year5;
  return YearGroup.Year6;
};

const buildUnits = (subject: string, yearGroup: YearGroup, specs: readonly UnitSpec[]): CurriculumUnit[] =>
  specs.map(([title, objective, bankTopic, practicalNote], index) => ({
    id: `${slug(subject)}-y${yearGroup}-${index + 1}-${slug(title)}`,
    subject,
    yearGroup,
    order: index + 1,
    title,
    objective,
    bankTopic,
    prerequisiteId: index > 0 ? `${slug(subject)}-y${yearGroup}-${index}-${slug(specs[index - 1][0])}` : undefined,
    practicalNote,
  }));

export const getCurriculumUnits = (subject: string, age: number): CurriculumUnit[] => {
  const yearGroup = getYearGroupForAge(age);
  const sequence = coreSequences[subject] || foundationSequences[subject];
  if (sequence) return buildUnits(subject, yearGroup, sequence[yearGroup]);

  if ((CURATED_LANGUAGES as readonly string[]).includes(subject)) {
    const sequence = subject === 'Yoruba' ? yorubaLanguageSequence : sharedLanguageSequence;
    return buildUnits(subject, yearGroup, sequence[yearGroup]).map((unit) => ({
      ...unit,
      bankTopic: unit.bankTopic.includes(':') ? unit.bankTopic : `${subject}: ${unit.bankTopic}`,
    }));
  }

  return [];
};

export const getCurriculumUnit = (subject: string, topic: string, age: number): CurriculumUnit | undefined =>
  getCurriculumUnits(subject, age).find((unit) => unit.title === topic || unit.id === topic);

export const isPublishedLearningSubject = (subject: string): boolean =>
  Boolean(coreSequences[subject] || foundationSequences[subject] || (CURATED_LANGUAGES as readonly string[]).includes(subject));
