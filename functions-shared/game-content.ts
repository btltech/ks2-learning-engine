export type GameId =
  | 'maths_mission'
  | 'times_table_sprint'
  | 'spelling_workshop'
  | 'science_lab'
  | 'history_detective';

export interface GameConfig {
  yearGroup?: '3-4' | '5-6';
  table?: number | 'mixed';
}

export interface PrivateGameQuestion {
  id: string;
  kind: 'choice' | 'text';
  prompt: string;
  context?: string;
  hint?: string;
  speak?: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface PublicGameQuestion {
  id: string;
  kind: 'choice' | 'text';
  prompt: string;
  context?: string;
  hint?: string;
  speak?: string;
  options?: string[];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(values: T[]) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = randomInt(0, index);
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function numericOptions(answer: number, distractors: number[] = []) {
  const values = new Set<number>([answer, ...distractors.filter((value) => value >= 0)]);
  let distance = Math.max(1, Math.round(Math.abs(answer) * 0.1));
  while (values.size < 4) {
    const candidate = answer + (values.size % 2 ? distance : -distance);
    if (candidate >= 0) values.add(candidate);
    distance += Math.max(1, Math.round(Math.abs(answer) * 0.05));
  }
  return shuffle(Array.from(values).slice(0, 4).map(String));
}

function mathsMission(yearGroup: '3-4' | '5-6'): PrivateGameQuestion[] {
  const lower = () => {
    const a = randomInt(120, 899);
    const b = randomInt(40, 199);
    const productA = randomInt(3, 12);
    const productB = randomInt(3, 12);
    const perimeterLength = randomInt(4, 15);
    const perimeterWidth = randomInt(2, 10);
    const fractionBase = shuffle([2, 3, 4, 5, 8, 10])[0];
    return [
      {
        prompt: `A library has ${a} books and receives ${b} more. How many books are there now?`,
        answer: String(a + b),
        options: numericOptions(a + b, [a + b + 10, a - b, a + b - 100]),
        explanation: `Add the hundreds, tens and ones: ${a} + ${b} = ${a + b}.`,
      },
      {
        prompt: `A rectangle is ${perimeterLength} cm long and ${perimeterWidth} cm wide. What is its perimeter?`,
        answer: String(2 * (perimeterLength + perimeterWidth)),
        options: numericOptions(2 * (perimeterLength + perimeterWidth), [perimeterLength + perimeterWidth, perimeterLength * perimeterWidth]),
        explanation: `Perimeter is the distance around: 2 × (${perimeterLength} + ${perimeterWidth}) = ${2 * (perimeterLength + perimeterWidth)} cm.`,
      },
      {
        prompt: `${productA} teams have ${productB} players each. How many players are there altogether?`,
        answer: String(productA * productB),
        options: numericOptions(productA * productB, [productA + productB, productA * (productB - 1)]),
        explanation: `${productA} equal groups of ${productB} means ${productA} × ${productB} = ${productA * productB}.`,
      },
      {
        prompt: `Which fraction is equivalent to 1/${fractionBase}?`,
        answer: `2/${fractionBase * 2}`,
        options: shuffle([`2/${fractionBase * 2}`, `1/${fractionBase * 2}`, `2/${fractionBase}`, `3/${fractionBase * 2}`]),
        explanation: `Multiplying the numerator and denominator by 2 keeps the fraction equivalent: 1/${fractionBase} = 2/${fractionBase * 2}.`,
      },
      {
        prompt: `What is the value of the digit 7 in 7${randomInt(1, 9)}${randomInt(0, 9)}?`,
        answer: '700',
        options: shuffle(['7', '70', '700', '7,000']),
        explanation: 'The 7 is in the hundreds column, so its value is 700.',
      },
    ];
  };

  const upper = () => {
    const price = randomInt(12, 48) * 5;
    const percent = shuffle([10, 20, 25, 50])[0];
    const decimalA = randomInt(40, 95) / 10;
    const decimalB = randomInt(5, Math.round(decimalA * 10) - 5) / 10;
    const ratioGroups = randomInt(4, 9);
    return [
      {
        prompt: `${percent}% of a £${price} budget is spent on books. How much is spent?`,
        answer: String((price * percent) / 100),
        options: numericOptions((price * percent) / 100, [price - (price * percent) / 100, price / percent]),
        explanation: `${percent}% of ${price} is ${price} × ${percent}/100 = ${(price * percent) / 100}.`,
      },
      {
        prompt: `A trail is ${decimalA.toFixed(1)} km long. Mia walks ${decimalB.toFixed(1)} km. How far remains?`,
        answer: (decimalA - decimalB).toFixed(1),
        options: shuffle([
          (decimalA - decimalB).toFixed(1),
          (decimalA + decimalB).toFixed(1),
          Math.abs(decimalA - decimalB + 1).toFixed(1),
          Math.abs(decimalA - decimalB - 0.1).toFixed(1),
        ]),
        explanation: `Align the decimal points and subtract: ${decimalA.toFixed(1)} − ${decimalB.toFixed(1)} = ${(decimalA - decimalB).toFixed(1)} km.`,
      },
      {
        prompt: `Red and blue counters are in the ratio 2:3. There are ${ratioGroups * 5} counters. How many are blue?`,
        answer: String(ratioGroups * 3),
        options: numericOptions(ratioGroups * 3, [ratioGroups * 2, ratioGroups * 5]),
        explanation: `There are 5 equal ratio parts. Each part is ${ratioGroups}; blue uses 3 parts, so ${ratioGroups} × 3 = ${ratioGroups * 3}.`,
      },
      {
        prompt: 'Which value is greatest?',
        answer: '0.72',
        options: shuffle(['0.72', '0.702', '0.27', '0.7']),
        explanation: 'Write each number to three decimal places: 0.720 is greater than 0.702, 0.700 and 0.270.',
      },
      {
        prompt: 'Calculate 6 + 4 × 5.',
        answer: '26',
        options: shuffle(['26', '50', '30', '40']),
        explanation: 'Multiplication comes before addition: 4 × 5 = 20, then 6 + 20 = 26.',
      },
    ];
  };

  const templates = yearGroup === '5-6' ? upper : lower;
  return Array.from({ length: 2 }, () => templates()).flat().map((question, index) => ({
    ...question,
    id: `maths_${index + 1}`,
    kind: 'choice' as const,
  }));
}

function timesTableSprint(table: number | 'mixed'): PrivateGameQuestion[] {
  return Array.from({ length: 20 }, (_, index) => {
    const a = table === 'mixed' ? randomInt(2, 12) : table;
    const b = randomInt(2, 12);
    const answer = a * b;
    return {
      id: `table_${index + 1}`,
      kind: 'choice',
      prompt: `${a} × ${b} = ?`,
      answer: String(answer),
      options: numericOptions(answer, [a * (b - 1), a * (b + 1), answer + b]),
      explanation: `${a} groups of ${b} make ${answer}.`,
    };
  });
}

const SPELLING_WORDS = {
  '3-4': [
    ['accidentally', 'The paint was spilled ________.', 'It begins with accident.'],
    ['believe', 'I ________ that you can do it.', "Remember: 'i' before 'e' here."],
    ['calendar', 'Mark the date on the ________.', 'It ends with -dar.'],
    ['different', 'The two patterns look ________.', 'It has double f.'],
    ['exercise', 'Regular ________ helps us stay healthy.', 'It begins exer-.'],
    ['favourite', 'Blue is her ________ colour.', 'Use the British spelling with -our-.'],
    ['February', 'The second month is ________.', 'Do not forget the first r.'],
    ['important', 'Clean water is very ________.', 'It begins im- and ends -ant.'],
    ['knowledge', 'Reading builds your ________.', 'The k is silent.'],
    ['library', 'We borrowed a book from the ________.', 'It contains brar.'],
    ['necessary', 'A coat is ________ in cold weather.', 'One collar and two sleeves: one c, two s.'],
    ['occasionally', 'We ________ eat outdoors.', 'It begins occasion-.'],
    ['separate', 'Please ________ the paper and plastic.', 'There is a rat in separate.'],
    ['straight', 'Draw a ________ line.', 'It contains -aight.'],
    ['surprise', 'The party was a complete ________.', 'It begins sur-.'],
    ['through', 'We walked ________ the tunnel.', 'It ends -ough.'],
    ['various', 'The shop sells ________ fruits.', 'It ends -ious.'],
    ['weight', 'The scale measures ________.', 'It contains eigh.'],
    ['woman', 'The ________ opened the door.', 'The singular is woman.'],
    ['women', 'The ________ formed a team.', 'The plural sounds different.'],
  ],
  '5-6': [
    ['accommodate', 'The hall can ________ two hundred people.', 'It has double c and double m.'],
    ['accompany', 'An adult will ________ the group.', 'It has double c.'],
    ['achieve', 'Practice helps you ________ your goal.', 'It contains -ieve.'],
    ['available', 'The book is ________ from the library.', 'It ends -able.'],
    ['community', 'Our ________ planted a garden.', 'It has double m.'],
    ['conscience', 'His ________ told him to be honest.', 'It contains science.'],
    ['conscious', 'She was ________ of the noise.', 'It ends -scious.'],
    ['definite', 'We need a ________ answer.', 'It ends -finite, not -finate.'],
    ['desperate', 'The plants were ________ for water.', 'It ends -perate.'],
    ['environment', 'We should care for the ________.', 'It begins environ-.'],
    ['especially', 'I enjoy science, ________ experiments.', 'It begins especial-.'],
    ['exaggerate', 'Do not ________ what happened.', 'It has double g.'],
    ['existence', 'Scientists search for evidence of its ________.', 'It ends -ence.'],
    ['foreign', 'She learnt a ________ language.', 'It contains -eign.'],
    ['government', 'The ________ introduced a new law.', 'Do not drop the n in govern.'],
    ['immediately', 'Please stop ________.', 'It begins immediate-.'],
    ['mischievous', 'The puppy was playful and ________.', 'It has three syllables.'],
    ['opportunity', 'This is a good ________ to learn.', 'It has double p.'],
    ['parliament', 'MPs debate laws in ________.', 'It contains -liament.'],
    ['pronunciation', 'Check the word’s ________.', 'It is pronunciation, not pronounciation.'],
  ],
} as const;

function spellingWorkshop(yearGroup: '3-4' | '5-6'): PrivateGameQuestion[] {
  return shuffle([...SPELLING_WORDS[yearGroup]]).slice(0, 10).map(([word, sentence, hint], index) => ({
    id: `spelling_${index + 1}`,
    kind: 'text',
    prompt: 'Listen, then type the missing word.',
    context: sentence,
    hint,
    speak: word,
    answer: word,
    explanation: `${word} — ${hint}`,
  }));
}

const SCIENCE_CARDS = [
  ['3-4', 'Dog', 'Vertebrate', 'A dog has an internal skeleton and backbone.'],
  ['3-4', 'Spider', 'Invertebrate', 'A spider has an external skeleton but no backbone.'],
  ['3-4', 'Salmon', 'Vertebrate', 'A salmon is a fish with a backbone.'],
  ['3-4', 'Snail', 'Invertebrate', 'A snail has no backbone.'],
  ['3-4', 'Ice', 'Solid', 'Ice keeps its own shape until it melts.'],
  ['3-4', 'Water', 'Liquid', 'Liquid water flows and takes the shape of its container.'],
  ['3-4', 'Water vapour', 'Gas', 'Water vapour spreads to fill the space available.'],
  ['3-4', 'Oxygen', 'Gas', 'Oxygen is a gas at room temperature.'],
  ['3-4', 'Iron', 'Solid', 'Iron has a fixed shape and volume at room temperature.'],
  ['3-4', 'Honey', 'Liquid', 'Honey flows slowly but is still a liquid.'],
  ['3-4', 'Bat', 'Mammal', 'Bats have hair and feed their young with milk.'],
  ['3-4', 'Penguin', 'Bird', 'Penguins have feathers and lay eggs.'],
  ['3-4', 'Newt', 'Amphibian', 'Newts live on land and in water during their life cycle.'],
  ['3-4', 'Tortoise', 'Reptile', 'A tortoise has dry scales and lays eggs.'],
  ['3-4', 'Trout', 'Fish', 'A trout has gills and fins.'],
  ['5-6', 'Copper wire', 'Electrical conductor', 'Copper allows electric current to pass through it.'],
  ['5-6', 'Rubber coating', 'Electrical insulator', 'Rubber resists the flow of electric current.'],
  ['5-6', 'Aluminium foil', 'Electrical conductor', 'Aluminium is a metal and conducts electricity.'],
  ['5-6', 'Plastic ruler', 'Electrical insulator', 'Plastic does not allow current to flow easily.'],
  ['5-6', 'Glass rod', 'Transparent', 'Most visible light passes through clear glass.'],
  ['5-6', 'Tracing paper', 'Translucent', 'It lets some light through but scatters it.'],
  ['5-6', 'Wooden board', 'Opaque', 'Light cannot pass through an ordinary wooden board.'],
  ['5-6', 'Moon', 'Reflects light', 'The Moon is visible because it reflects sunlight.'],
  ['5-6', 'Sun', 'Produces light', 'The Sun releases its own light energy.'],
  ['5-6', 'Bacterium', 'Microorganism', 'A bacterium is a microscopic living organism.'],
  ['5-6', 'Mushroom', 'Fungus', 'A mushroom is the fruiting body of a fungus.'],
  ['5-6', 'Oak tree', 'Plant', 'An oak makes its own food through photosynthesis.'],
  ['5-6', 'Dolphin', 'Mammal', 'Dolphins breathe air and feed their young with milk.'],
] as const;

function scienceLab(yearGroup: '3-4' | '5-6'): PrivateGameQuestion[] {
  const pool = SCIENCE_CARDS.filter(([group]) => group === yearGroup);
  const categorySets: Record<string, string[]> = {
    Vertebrate: ['Vertebrate', 'Invertebrate'], Invertebrate: ['Vertebrate', 'Invertebrate'],
    Solid: ['Solid', 'Liquid', 'Gas'], Liquid: ['Solid', 'Liquid', 'Gas'], Gas: ['Solid', 'Liquid', 'Gas'],
    Mammal: ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish'], Bird: ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish'],
    Reptile: ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish'], Amphibian: ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish'], Fish: ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish'],
    'Electrical conductor': ['Electrical conductor', 'Electrical insulator'], 'Electrical insulator': ['Electrical conductor', 'Electrical insulator'],
    Transparent: ['Transparent', 'Translucent', 'Opaque'], Translucent: ['Transparent', 'Translucent', 'Opaque'], Opaque: ['Transparent', 'Translucent', 'Opaque'],
    'Reflects light': ['Reflects light', 'Produces light'], 'Produces light': ['Reflects light', 'Produces light'],
    Microorganism: ['Microorganism', 'Fungus', 'Plant', 'Mammal'], Fungus: ['Microorganism', 'Fungus', 'Plant', 'Mammal'],
    Plant: ['Microorganism', 'Fungus', 'Plant', 'Mammal'],
  };
  return shuffle(pool).slice(0, 12).map(([, label, category, explanation], index) => ({
    id: `science_${index + 1}`,
    kind: 'choice',
    prompt: `Classify: ${label}`,
    context: 'Choose the most accurate scientific category.',
    answer: category,
    options: categorySets[category] || [category],
    explanation,
  }));
}

const HISTORY_QUESTIONS = [
  ['A Roman road is straight, paved and links two forts. What is the strongest conclusion?', 'It helped the army and trade move efficiently', ['It helped the army and trade move efficiently', 'Romans never travelled by sea', 'Every Roman was a soldier', 'The road was built by Vikings'], 'Roads helped Roman armies, officials and goods move around Britain.'],
  ['Which event happened first?', 'Romans invaded Britain in AD 43', ['Romans invaded Britain in AD 43', 'Vikings raided Lindisfarne in AD 793', 'The Battle of Hastings in 1066', 'Magna Carta in 1215'], 'AD 43 comes before AD 793, 1066 and 1215.'],
  ['A monk described a Viking raid many years after it happened. What should a historian ask?', 'When and why the account was written', ['When and why the account was written', 'Whether the handwriting is neat', 'Whether Vikings used Roman roads', 'How much the paper weighs'], 'The creator, purpose and date of a source affect how historians interpret it.'],
  ['Why is the year 1066 significant in English history?', 'Norman rule began after the Battle of Hastings', ['Norman rule began after the Battle of Hastings', 'The Romans first invaded Britain', 'Magna Carta was signed', 'The Great Fire of London began'], 'William’s victory at Hastings led to Norman rule and major political and social change.'],
  ['Which is a cause of the Great Fire of London spreading quickly?', 'Closely packed timber buildings and strong wind', ['Closely packed timber buildings and strong wind', 'Stone skyscrapers', 'A frozen River Thames', 'Electric street lights'], 'Timber buildings, narrow streets, dry weather and wind helped the fire spread.'],
  ['Two accounts disagree about a battle. What should a historian do?', 'Compare both accounts with other evidence', ['Compare both accounts with other evidence', 'Choose the longer account', 'Ignore both accounts', 'Believe the newest website'], 'Historians corroborate claims by comparing several sources and considering provenance.'],
  ['Put these periods in chronological order.', 'Stone Age, Bronze Age, Iron Age, Roman Britain', ['Stone Age, Bronze Age, Iron Age, Roman Britain', 'Roman Britain, Stone Age, Iron Age, Bronze Age', 'Bronze Age, Stone Age, Roman Britain, Iron Age', 'Iron Age, Bronze Age, Stone Age, Roman Britain'], 'In Britain, the Stone Age was followed by the Bronze Age, Iron Age and Roman period.'],
  ['What does an archaeological layer underneath another layer usually suggest?', 'It is generally older', ['It is generally older', 'It is always more valuable', 'It was made by Romans', 'It contains no evidence'], 'In an undisturbed site, lower layers were usually deposited earlier.'],
  ['Why did Magna Carta become historically important?', 'It helped establish that the monarch was subject to law', ['It helped establish that the monarch was subject to law', 'It ended every war in Europe', 'It created the Roman Senate', 'It gave every adult the vote immediately'], 'Although limited in 1215, Magna Carta became an important symbol of lawful government.'],
  ['A factory census shows many children at work in 1841. What can it directly help us investigate?', 'Who worked in that factory at that time', ['Who worked in that factory at that time', 'Every child’s feelings', 'Life in Ancient Egypt', 'The exact future of the town'], 'A census can identify people and occupations, but other sources are needed for feelings and experiences.'],
  ['Which question investigates change over time?', 'How did homes in Britain change from Roman to Victorian times?', ['How did homes in Britain change from Roman to Victorian times?', 'What colour is this pot?', 'Who is standing nearest?', 'How heavy is one coin?'], 'A change-over-time question compares evidence from more than one period.'],
  ['Why do historians use timelines?', 'To organise events and see duration, sequence and overlap', ['To organise events and see duration, sequence and overlap', 'To prove every source is accurate', 'To replace all written evidence', 'To predict the future'], 'Timelines help historians reason about chronology and connections.'],
  ['A Roman coin and a modern drawing show Emperor Claudius differently. Which is a primary source?', 'The Roman coin', ['The Roman coin', 'The modern drawing', 'Both are modern', 'Neither can be evidence'], 'The coin was created during the Roman period; the drawing is a later interpretation.'],
  ['What is the best evidence that Benin City traded over long distances?', 'Imported materials found with locally made objects', ['Imported materials found with locally made objects', 'A fictional story written yesterday', 'The weather forecast', 'One person’s guess'], 'Imported materials can be compared with local artefacts to demonstrate connections and trade.'],
  ['Which statement shows consequence?', 'Railways allowed people and goods to travel faster', ['Railways allowed people and goods to travel faster', 'Railways are made from metal', 'A station has platforms', 'Trains have wheels'], 'A consequence explains what happened because of a development or event.'],
  ['Why might a wartime government poster be biased?', 'It was designed to persuade people', ['It was designed to persuade people', 'It uses printed letters', 'It is kept in an archive', 'It is old'], 'Purpose matters: persuasive sources select words and images to influence an audience.'],
] as const;

function historyDetective(): PrivateGameQuestion[] {
  return shuffle([...HISTORY_QUESTIONS]).slice(0, 10).map(([prompt, answer, options, explanation], index) => ({
    id: `history_${index + 1}`,
    kind: 'choice',
    prompt,
    context: 'Use chronology and evidence—not just memory.',
    answer,
    options: shuffle([...options]),
    explanation,
  }));
}

export function createGameQuestions(gameId: GameId, config: GameConfig = {}): PrivateGameQuestion[] {
  const yearGroup = config.yearGroup === '5-6' ? '5-6' : '3-4';
  switch (gameId) {
    case 'maths_mission': return mathsMission(yearGroup);
    case 'times_table_sprint': return timesTableSprint(
      config.table === 'mixed' || (Number(config.table) >= 2 && Number(config.table) <= 12)
        ? config.table as number | 'mixed'
        : 'mixed'
    );
    case 'spelling_workshop': return spellingWorkshop(yearGroup);
    case 'science_lab': return scienceLab(yearGroup);
    case 'history_detective': return historyDetective();
    default: throw new Error('Unknown game');
  }
}

export function publicQuestion(question: PrivateGameQuestion): PublicGameQuestion {
  const { answer: _answer, explanation: _explanation, ...safe } = question;
  return safe;
}

export function normaliseGameAnswer(gameId: GameId, value: unknown) {
  const text = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  const trimmed = text.trim().replace(/\s+/g, ' ');
  return gameId === 'spelling_workshop' ? trimmed.toLocaleLowerCase('en-GB') : trimmed;
}

export function answerIsCorrect(gameId: GameId, question: PrivateGameQuestion, value: unknown) {
  return normaliseGameAnswer(gameId, value) === normaliseGameAnswer(gameId, question.answer);
}

export function calculateGameResult(gameId: GameId, correct: number, total: number, durationSeconds: number) {
  const safeTotal = Math.max(1, total);
  const accuracy = Math.round((Math.max(0, correct) / safeTotal) * 100);
  let speedBonus = 0;
  if (gameId === 'times_table_sprint' && accuracy >= 80) {
    speedBonus = durationSeconds <= 75 ? 40 : durationSeconds <= 120 ? 20 : 0;
  }
  const score = correct * 100 + speedBonus;
  const xpEarned = Math.min(100, correct * 5 + (accuracy === 100 ? 20 : 0));
  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
  return { correct, total: safeTotal, accuracy, score, speedBonus, xpEarned, stars, durationSeconds: Math.max(0, Math.round(durationSeconds)) };
}
