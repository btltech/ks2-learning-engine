import { CognitiveLevel, Difficulty, QuestionType, type BankQuestion } from '../types';
import { getCurriculumUnit } from './curriculumSequences';

type ReviewedLanguage = 'Yoruba' | 'Romanian';
type WordPair = readonly [target: string, english: string, pronunciation: string];

interface LanguageUnitPack {
  words: readonly WordPair[];
  teach: string;
  model: string;
}

const YORUBA: Record<string, LanguageUnitPack> = {
  'Greetings and introductions': {
    words: [
      ['Ẹ káàárọ̀', 'Good morning', 'eh KAH-ah-roh'],
      ['Báwo ni?', 'How are you?', 'BAH-woh nee'],
      ['Ẹ ṣé', 'Thank you', 'eh SHEH'],
      ['Ó dàbọ̀', 'Goodbye', 'oh DAH-boh'],
    ],
    teach: 'Yoruba is tonal: a high, mid or low tone can change meaning. Keep the tone marks and the underdotted letters ẹ, ọ and ṣ when reading and writing.',
    model: 'A polite exchange is: “Ẹ káàárọ̀. Báwo ni?” — “Good morning. How are you?”',
  },
  'Numbers and age': {
    words: [
      ['ọ̀kan', 'one', 'aw-KAHN'],
      ['èjì', 'two', 'eh-JEE'],
      ['ẹ̀ta', 'three', 'eh-TAH'],
      ['ẹ̀rin', 'four', 'eh-REEN'],
    ],
    teach: 'Say each number with its written tones. To ask someone’s age, “Ọmọ ọdún mélòó ni ọ?” means “How old are you?”',
    model: '“Ọmọ ọdún mẹ́wàá ni mí.” means “I am ten years old.”',
  },
  'Colours and classroom objects': {
    words: [
      ['pupa', 'red', 'KPOO-kpah'],
      ['dúdú', 'black', 'DOO-doo'],
      ['ìwé', 'book', 'ee-WEH'],
      ['àga', 'chair', 'ah-GAH'],
    ],
    teach: 'Yoruba describing words normally follow the noun. Accurate underdots distinguish letters such as ẹ from e and ọ from o.',
    model: '“Ìwé pupa” means “a red book”: ìwé is book and pupa is red.',
  },
  'Family and people': {
    words: [
      ['ìyá', 'mother', 'ee-YAH'],
      ['bàbá', 'father', 'BAH-bah'],
      ['ọmọ', 'child', 'AW-maw'],
      ['ẹ̀gbọ́n', 'older sibling', 'eh-GBON'],
    ],
    teach: 'Family words use tone and underdots to preserve meaning. Yoruba distinguishes an older sibling, ẹ̀gbọ́n, from a younger sibling, àbúrò.',
    model: '“Ìyá mi” means “my mother”; mi comes after the family word to mean “my”.',
  },
  'Food and preferences': {
    words: [
      ['oúnjẹ', 'food', 'oh-OON-jeh'],
      ['omi', 'water', 'AW-mee'],
      ['ìrẹsì', 'rice', 'ee-REH-see'],
      ['Mo fẹ́ràn', 'I like', 'moh FEH-rahn'],
    ],
    teach: 'Use “Mo fẹ́ràn…” before a food or activity to say that you like it. “Mi ò fẹ́ràn…” expresses that you do not like it.',
    model: '“Mo fẹ́ràn ìrẹsì.” means “I like rice.”',
  },
  'Listening and pronunciation': {
    words: [
      ['ẹja', 'fish', 'eh-JAH'],
      ['ọjọ́', 'day', 'aw-JAW'],
      ['ṣé', 'question marker', 'SHEH'],
      ['gba', 'receive', 'GBAH'],
    ],
    teach: 'Listen for Yoruba sounds that English does not mark in the same way: ṣ sounds like “sh”, and gb is one combined consonant. Tone remains part of the word.',
    model: 'In “Ṣé o fẹ́…?”, ṣé signals a yes-or-no question; it is not the same sound as plain s.',
  },
  'School and daily routine': {
    words: [
      ['ilé-ẹ̀kọ́', 'school', 'ee-LEH eh-KAW'],
      ['olùkọ́', 'teacher', 'oh-loo-KAW'],
      ['akẹ́kọ̀ọ́', 'learner', 'ah-keh-KAW-aw'],
      ['Mo ń kàwé', 'I am studying', 'moh n KAH-weh'],
    ],
    teach: 'The marker ń can show an action in progress. It appears before the verb phrase.',
    model: '“Mo ń kàwé ní ilé-ẹ̀kọ́.” means “I am studying at school.”',
  },
  'Places and directions': {
    words: [
      ['ilé', 'house', 'ee-LEH'],
      ['ọjà', 'market', 'aw-JAH'],
      ['òsì', 'left', 'aw-SEE'],
      ['ọ̀tún', 'right', 'aw-TOON'],
    ],
    teach: 'Use “níbo?” to ask “where?” and direction words to make a route clear.',
    model: '“Ọjà wà ní ọ̀tún.” means “The market is on the right.”',
  },
  'Reading short texts': {
    words: [
      ['lónìí', 'today', 'loh-NEE'],
      ['lọ', 'go', 'LAW'],
      ['pẹ̀lú', 'with', 'peh-LOO'],
      ['ní', 'at/in', 'NEE'],
    ],
    teach: 'When reading, use familiar time, action and place words to locate the main message before translating every word.',
    model: '“Lónìí, Adé lọ sí ọjà pẹ̀lú ìyá rẹ̀.” means “Today, Ade went to the market with his mother.”',
  },
  'Conversations and opinions': {
    words: [
      ['Mo fẹ́ràn', 'I like', 'moh FEH-rahn'],
      ['Mi ò fẹ́ràn', 'I do not like', 'mee aw FEH-rahn'],
      ['nítorí', 'because', 'nee-toh-REE'],
      ['Kí ni?', 'What?', 'KEE nee'],
    ],
    teach: 'State an opinion, then use nítorí to give a short reason. Listen to the other speaker before responding.',
    model: '“Mo fẹ́ràn orin nítorí ó dùn.” means “I like music because it is pleasant.”',
  },
  'Writing connected sentences': {
    words: [
      ['àti', 'and', 'ah-TEE'],
      ['ṣùgbọ́n', 'but', 'shoo-GBON'],
      ['nítorí', 'because', 'nee-toh-REE'],
      ['lẹ́yìn náà', 'after that', 'leh-YEEN nah-AH'],
    ],
    teach: 'Connect short accurate clauses with àti, ṣùgbọ́n or nítorí. Keep tone marks when copying and adapting a model.',
    model: '“Mo lọ sí ilé-ẹ̀kọ́, lẹ́yìn náà mo lọ sí ilé.” means “I went to school; after that I went home.”',
  },
  'Language patterns and grammar': {
    words: [
      ['mo', 'I', 'MOH'],
      ['o', 'you', 'OH'],
      ['ó', 'he/she', 'OH (high tone)'],
      ['wọ́n', 'they', 'WAWN'],
    ],
    teach: 'Yoruba pronouns do not use grammatical gender in the same way as English. Tone distinguishes forms such as o (“you”) and ó (“he/she”).',
    model: '“Ó ń kàwé” can mean “He is studying” or “She is studying”; context identifies the person.',
  },
};

const ROMANIAN: Record<string, LanguageUnitPack> = {
  'Greetings and introductions': {
    words: [
      ['Bună dimineața', 'Good morning', 'BOO-nuh dee-mee-NYAH-tsah'],
      ['Ce mai faci?', 'How are you?', 'cheh my FAHCH'],
      ['Mulțumesc', 'Thank you', 'mool-tsoo-MESK'],
      ['La revedere', 'Goodbye', 'lah reh-veh-DEH-reh'],
    ],
    teach: 'Romanian uses the Latin alphabet with five important letters: ă, â, î, ș and ț. Keep their marks because they change pronunciation.',
    model: '“Bună! Eu sunt Mara.” means “Hello! I am Mara.”',
  },
  'Numbers and age': {
    words: [
      ['unu', 'one', 'OO-noo'],
      ['doi', 'two', 'doy'],
      ['trei', 'three', 'tray'],
      ['patru', 'four', 'PAH-troo'],
    ],
    teach: 'To ask someone’s age, use “Câți ani ai?” The answer begins “Am … ani.”',
    model: '“Am zece ani.” means “I am ten years old.”',
  },
  'Colours and classroom objects': {
    words: [
      ['roșu', 'red', 'ROH-shoo'],
      ['albastru', 'blue', 'al-BAH-stroo'],
      ['carte', 'book', 'KAR-teh'],
      ['scaun', 'chair', 'skown'],
    ],
    teach: 'Romanian describing words often change form to agree with the noun. Begin by learning each model as a complete phrase.',
    model: '“O carte roșie” means “a red book”; roșie agrees with the feminine noun carte.',
  },
  'Family and people': {
    words: [
      ['mamă', 'mother', 'MAH-muh'],
      ['tată', 'father', 'TAH-tuh'],
      ['soră', 'sister', 'SOH-ruh'],
      ['frate', 'brother', 'FRAH-teh'],
    ],
    teach: 'Use “meu” or “mea” after a family noun for “my”, choosing the form that agrees with the noun.',
    model: '“Mama mea” means “my mother”, while “fratele meu” means “my brother”.',
  },
  'Food and preferences': {
    words: [
      ['mâncare', 'food', 'muhn-KAH-reh'],
      ['apă', 'water', 'AH-puh'],
      ['pâine', 'bread', 'PUH-ee-neh'],
      ['Îmi place', 'I like', 'uhm PLAA-cheh'],
    ],
    teach: 'Use “Îmi place…” for one thing you like and “Nu-mi place…” for something you do not like.',
    model: '“Îmi place pâinea.” means “I like bread.”',
  },
  'Listening and pronunciation': {
    words: [
      ['șase', 'six', 'SHAH-seh'],
      ['țară', 'country', 'TSAH-ruh'],
      ['în', 'in', 'uhn'],
      ['fată', 'girl', 'FAH-tuh'],
    ],
    teach: 'Romanian ș sounds like “sh”, ț sounds like “ts”, ă is a short relaxed vowel, and â/î represent the same central vowel sound.',
    model: 'The first sounds in șase and țară are different: “sh” in șase and “ts” in țară.',
  },
  'School and daily routine': {
    words: [
      ['școală', 'school', 'SHKOH-ah-luh'],
      ['profesor', 'teacher', 'pro-feh-SOR'],
      ['elev', 'pupil', 'eh-LEV'],
      ['Eu învăț', 'I study', 'yew uhn-VUHTS'],
    ],
    teach: 'Romanian verbs change with the person doing the action. Learn a useful first-person form as part of a complete phrase.',
    model: '“Eu învăț la școală.” means “I study at school.”',
  },
  'Places and directions': {
    words: [
      ['casă', 'house', 'KAH-suh'],
      ['piață', 'market/square', 'PYAH-tsuh'],
      ['stânga', 'left', 'STUHN-gah'],
      ['dreapta', 'right', 'DRYAP-tah'],
    ],
    teach: 'Use “Unde este…?” to ask where something is, followed by a place or direction phrase.',
    model: '“Piața este la dreapta.” means “The market is on the right.”',
  },
  'Reading short texts': {
    words: [
      ['astăzi', 'today', 'ahs-TUHZ'],
      ['merge', 'goes', 'MER-jeh'],
      ['cu', 'with', 'koo'],
      ['la', 'to/at', 'lah'],
    ],
    teach: 'Find familiar time, verb and place words first. Romanian spelling is relatively regular once its special letter sounds are known.',
    model: '“Astăzi, Ana merge la piață cu mama ei.” means “Today, Ana goes to the market with her mother.”',
  },
  'Conversations and opinions': {
    words: [
      ['Îmi place', 'I like', 'uhm PLAA-cheh'],
      ['Nu-mi place', 'I do not like', 'noom PLAA-cheh'],
      ['pentru că', 'because', 'PEN-troo kuh'],
      ['Ce îți place?', 'What do you like?', 'cheh uhts PLAA-cheh'],
    ],
    teach: 'Give an opinion with Îmi place or Nu-mi place, then add a reason with pentru că.',
    model: '“Îmi place muzica pentru că este veselă.” means “I like music because it is cheerful.”',
  },
  'Writing connected sentences': {
    words: [
      ['și', 'and', 'shee'],
      ['dar', 'but', 'dar'],
      ['pentru că', 'because', 'PEN-troo kuh'],
      ['apoi', 'then', 'ah-POY'],
    ],
    teach: 'Connect short clauses using și, dar or pentru că. Check every Romanian diacritic when adapting a model.',
    model: '“Merg la școală, apoi merg acasă.” means “I go to school, then I go home.”',
  },
  'Language patterns and grammar': {
    words: [
      ['eu', 'I', 'yew'],
      ['tu', 'you', 'too'],
      ['el', 'he', 'el'],
      ['ea', 'she', 'yah'],
    ],
    teach: 'Romanian verbs change with the subject, and nouns have grammatical gender. Notice patterns in complete model sentences rather than translating word by word.',
    model: '“Eu învăț” means “I study”, while “el învață” means “he studies”.',
  },
};

const PACKS: Record<ReviewedLanguage, Record<string, LanguageUnitPack>> = { Yoruba: YORUBA, Romanian: ROMANIAN };

const getPack = (subject: string, topic: string): LanguageUnitPack | null => {
  if (subject !== 'Yoruba' && subject !== 'Romanian') return null;
  return PACKS[subject][topic] ?? null;
};

export const getReviewedLanguageQuestions = (subject: string, topic: string, age: number): BankQuestion[] => {
  const pack = getPack(subject, topic);
  if (!pack) return [];
  const options = pack.words.map(([target]) => target);
  return pack.words.map(([target, english], index) => ({
    id: `reviewed-${subject.toLowerCase()}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`,
    subject,
    topic,
    ageGroup: [age],
    difficulty: index < 2 ? Difficulty.Easy : Difficulty.Medium,
    question: `Which ${subject} word or phrase means “${english}”?`,
    options: [...options].sort(() => Math.random() - 0.5),
    correctAnswer: target,
    explanation: `${target} means “${english}”.`,
    questionType: QuestionType.MultipleChoice,
    cognitiveLevel: index < 2 ? CognitiveLevel.Remember : CognitiveLevel.Understand,
  }));
};

export const getReviewedLanguageLesson = (subject: string, topic: string, age: number): string | null => {
  const pack = getPack(subject, topic);
  const unit = getCurriculumUnit(subject, topic, age);
  if (!pack || !unit) return null;
  const vocabulary = pack.words
    .map(([target, english, pronunciation]) => `* ${target} (${pronunciation}) — ${english}`)
    .join('\n');

  return `# Learning Objective
${unit.objective}

# Key Vocabulary
${vocabulary}

# Teach
${pack.teach}

# Modelled Example
${pack.model}

# Guided Practice
* Say each key word slowly, then match it to its English meaning.
* Cover the English meanings and recall any two words.

# Independent Check
Write one accurate ${subject} phrase from this unit, keeping every tone mark or diacritic shown.`;
};
