import { CognitiveLevel, Difficulty, QuestionType, type BankQuestion } from '../types';
import { getCurriculumUnit } from './curriculumSequences';

/**
 * Curated language content used without generative AI.
 *
 * Yoruba was source-audited against:
 * - Yale Yoruba Dictionary (yorubadictionary.yale.edu)
 * - Yorùbá Yé Mi, University of Texas COERLL (coerll.utexas.edu/yemi)
 * - National Open University of Nigeria EDU 728 tone-marking guidance
 *
 * English-style respellings are not shown for Yoruba because they cannot encode
 * lexical tone reliably. The UI derives a tone pattern directly from the fully
 * marked Yoruba spelling instead.
 */

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
      ['Ẹ káàsán', 'Good afternoon', 'eh KAH-ah-sahn'],
      ['Ẹ káalẹ́', 'Good evening', 'eh KAH-ah-leh'],
      ['Ẹ kú ọjọ́', 'Good day / greetings', 'eh KOO aw-JAW'],
      ['Báwo ni?', 'How are you?', 'BAH-woh nee'],
      ['Ẹ ṣé', 'Thank you', 'eh SHEH'],
      ['Jọ̀ọ́', 'Please', 'jaw-AW'],
      ['Má bínú', 'Sorry / do not be angry', 'mah BEE-noo'],
      ['Ẹ jọ̀ọ́', 'Excuse me / please (polite)', 'eh jaw-AW'],
      ['Ẹ kú iṣẹ́', 'Respectful greeting to someone working', 'eh KOO ee-SHEH'],
      ['Káàbọ̀ o', 'Welcome', 'kah-ah-BAW oh'],
      ['Ó dàbọ̀', 'Goodbye', 'oh DAH-boh'],
      ['Orúkọ mi ni…', 'My name is…', 'oh-ROO-kaw mee nee'],
      ['Kí ni orúkọ rẹ?', 'What is your name?', 'kee nee oh-ROO-kaw reh'],
      ['Mo wá láti…', 'I come from…', 'moh wah LAH-tee'],
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
      ['òdo', 'zero', 'AW-daw'],
      ['àrún', 'five', 'ah-ROON'],
      ['mẹ́fà', 'six', 'meh-FAH'],
      ['méje', 'seven', 'MEH-jeh'],
      ['méjọ', 'eight', 'MEH-jaw'],
      ['mẹ́sàn-án', 'nine', 'meh-SAHN-ahn'],
      ['mẹ́wàá', 'ten', 'meh-WAH'],
      ['ọ̀kànlá', 'eleven', 'aw-KAHN-lah'],
      ['èjìlá', 'twelve', 'eh-JEE-lah'],
      ['ẹ̀tàlá', 'thirteen', 'eh-TAH-lah'],
      ['ẹ̀rìnlá', 'fourteen', 'eh-REEN-lah'],
      ['ẹ̀ẹ́dógún', 'fifteen', 'eh-eh-DAW-goon'],
      ['mẹ́rìndínlógún', 'sixteen', 'meh-REEN-deen-LAW-goon'],
      ['ẹ̀tàdínlógún', 'seventeen', 'eh-TAH-deen-LAW-goon'],
      ['èjìdínlógún', 'eighteen', 'eh-JEE-deen-LAW-goon'],
      ['ọ̀kàndínlógún', 'nineteen', 'aw-KAHN-deen-LAW-goon'],
      ['ogún', 'twenty', 'aw-GOON'],
      ['ọgbọ̀n', 'thirty', 'aw-GBON'],
      ['ogójì', 'forty', 'aw-GAW-jee'],
      ['àádọ́ta', 'fifty', 'ah-AW-daw-TAH'],
      ['ọgọ́rùn-ún', 'one hundred', 'aw-gaw-ROON-oon'],
      ['ìṣirò', 'arithmetic / maths', 'ee-SHEE-raw'],
      ['méjì àti méjì jẹ́ mẹ́rin', 'two plus two is four', 'meh-JEE ah-TEE meh-JEE jeh meh-REEN'],
      ['Mo ní ìwé mẹ́ta.', 'I have three books.', 'moh nee ee-WEH meh-TAH'],
    ],
    teach: 'Say each number with its written tones. To ask one person informally, “Ọmọ ọdún mélòó ni ọ́?” means “How old are you?”',
    model: '“Ọmọ ọdún mẹ́wàá ni mí.” means “I am ten years old.”',
  },
  'Colours and classroom objects': {
    words: [
      ['pupa', 'red', 'KPOO-kpah'],
      ['dúdú', 'black', 'DOO-doo'],
      ['funfun', 'white', 'foon-foon'],
      ['búlúù', 'blue', 'BOO-loo'],
      ['yẹ́lò', 'yellow', 'YEH-law'],
      ['píìnkì', 'pink', 'PEEN-kee'],
      ['àwọ̀ ewé', 'green', 'ah-WAW eh-weh'],
      ['àwọ̀ pọ́pù', 'purple', 'ah-WAW paw-POO'],
      ['àwọ̀ pupa', 'brown / reddish-brown shade', 'ah-WAW KPOO-kpah'],
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
      ['àbúrò', 'younger sibling', 'ah-BOO-raw'],
      ['ìyá àgbà', 'grandmother', 'ee-YAH ah-gbah'],
      ['bàbá àgbà', 'grandfather', 'BAH-bah ah-gbah'],
      ['ẹbí', 'family', 'eh-BEE'],
      ['ọ̀rẹ́', 'friend', 'aw-REH'],
      ['ọkọ', 'husband', 'aw-KAW'],
      ['aya', 'wife', 'ah-YAH'],
      ['àbúrò bàbá', 'uncle (father’s younger sibling)', 'ah-BOO-raw BAH-bah'],
      ['àbúrò ìyá', 'aunt (mother’s younger sibling)', 'ah-BOO-raw ee-YAH'],
      ['ọmọ ẹ̀gbọ́n', 'cousin', 'AW-maw eh-GBON'],
    ],
    teach: 'Family words use tone and underdots to preserve meaning. Yoruba distinguishes an older sibling, ẹ̀gbọ́n, from a younger sibling, àbúrò.',
    model: '“Ìyá mi” means “my mother”; mi comes after the family word to mean “my”.',
  },
  'Food and preferences': {
    words: [
      ['oúnjẹ', 'food', 'oh-OON-jeh'],
      ['omi', 'water', 'AW-mee'],
      ['ìrẹsì', 'rice', 'ee-REH-see'],
      ['iṣu', 'yam', 'ee-SHOO'],
      ['ẹ̀wà', 'beans', 'eh-WAH'],
      ['gààrí', 'cassava flakes / garri', 'gah-AH-ree'],
      ['ẹran', 'meat', 'eh-RAHN'],
      ['ẹja', 'fish', 'eh-JAH'],
      ['àkàrà', 'bean fritter', 'ah-kah-RAH'],
      ['èso', 'fruit', 'eh-SAW'],
      ['ewébẹ̀', 'vegetable', 'eh-weh-BEH'],
      ['Mo fẹ́ jẹ…', 'I want to eat…', 'moh FEH jeh'],
      ['Mo fẹ́ mu…', 'I want to drink…', 'moh FEH moo'],
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
      ['tẹ́wọ́gbà', 'receive or accept', 'teh-WAW-gbah'],
      ['ba', 'syllable example (mid tone)', 'BAH'],
      ['bá', 'syllable example (high tone)', 'BAH (high)'],
      ['bà', 'syllable example (low tone)', 'BAH (low)'],
    ],
    teach: 'Listen for Yoruba sounds that English does not mark in the same way: ṣ sounds like “sh”, and gb is one combined consonant. Tone remains part of the word.',
    model: 'In “Ṣé o fẹ́…?”, ṣé signals a yes-or-no question; it is not the same sound as plain s.',
  },
  'School and daily routine': {
    words: [
      ['ilé-ìwé', 'school', 'ee-LEH ee-WEH'],
      ['olùkọ́', 'teacher', 'oh-loo-KAW'],
      ['akẹ́kọ̀ọ́', 'student', 'ah-keh-KAW-aw'],
      ['Mo ń kẹ́kọ̀ọ́', 'I am studying', 'moh n keh-KAW-aw'],
      ['ìṣirò', 'maths', 'ee-SHEE-raw'],
      ['sáyẹ́ǹsì', 'science', 'sah-yehn-SEE'],
      ['èdè', 'language', 'eh-DEH'],
      ['Jọ̀ọ́, ràn mí lọ́wọ́.', 'Please help me.', 'jaw-AW rahn mee LAW-waw'],
    ],
    teach: 'The marker ń can show an action in progress. It appears before the verb phrase.',
    model: '“Mo ń kẹ́kọ̀ọ́ ní ilé-ìwé.” means “I am studying at school.”',
  },
  'Reading short texts': {
    words: [
      ['lónìí', 'today', 'loh-NEE'],
      ['lọ', 'go', 'LAW'],
      ['pẹ̀lú', 'with', 'peh-LOO'],
      ['ní', 'at/in', 'NEE'],
      ['ìjíròrò', 'dialogue', 'ee-jee-RAW-raw'],
    ],
    teach: 'When reading, use familiar time, action and place words to locate the main message before translating every word.',
    model: '“Lónìí, Àdé lọ sí ọjà pẹ̀lú ìyá rẹ̀.” means “Today, Ade went to the market with his mother.”',
  },
  'Conversations and opinions': {
    words: [
      ['Mo fẹ́ràn', 'I like', 'moh FEH-rahn'],
      ['Mi ò fẹ́ràn', 'I do not like', 'mee aw FEH-rahn'],
      ['nítorí pé', 'because', 'nee-toh-REE kpeh'],
      ['Kí ni?', 'What?', 'KEE nee'],
      ['ta ni?', 'Who?', 'TAH nee'],
      ['ìgbà wo?', 'When?', 'ee-gbah woh'],
      ['ńlá', 'big', 'NLAH'],
      ['kékeré', 'small', 'keh-keh-REH'],
    ],
    teach: 'State an opinion, then use nítorí pé to give a short reason. Listen to the other speaker before responding.',
    model: '“Mo fẹ́ràn orin nítorí pé ó dùn.” means “I like music because it is pleasant.”',
  },
  'Writing connected sentences': {
    words: [
      ['àti', 'and', 'ah-TEE'],
      ['ṣùgbọ́n', 'but', 'shoo-GBON'],
      ['nítorí pé', 'because', 'nee-toh-REE kpeh'],
      ['lẹ́yìn náà', 'after that', 'leh-YEEN nah-AH'],
      ['kọ́ ọ̀rọ̀', 'copy a word', 'KAW aw-RAW'],
      ['pẹ̀lú gbolohun', 'with a sentence', 'peh-LOO gbaw-law-HOON'],
      ['Mo jẹ́ ọmọ ọdún…', 'I am … years old', 'moh JEH AW-maw aw-DOON'],
    ],
    teach: 'Progress from copying marked words, to completing sentences, to writing a short paragraph about yourself. Connect clauses with àti, ṣùgbọ́n or nítorí pé and keep every tone mark.',
    model: '“Mo lọ sí ilé-ìwé, lẹ́yìn náà mo lọ sí ilé.” means “I went to school; after that I went home.”',
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
  'Days of the week': {
    words: [
      ['Ọjọ́ Àìkú', 'Sunday', 'aw-JAW eye-KOO'],
      ['Ọjọ́ Ajé', 'Monday', 'aw-JAW ah-JEH'],
      ['Ọjọ́ Ìṣẹ́gun', 'Tuesday', 'aw-JAW ee-SHEH-goon'],
      ['Ọjọ́rú', 'Wednesday', 'aw-JAW-roo'],
      ['Ọjọ́bọ', 'Thursday', 'aw-JAW-baw'],
      ['Ọjọ́ Ẹtì', 'Friday', 'aw-JAW eh-TEE'],
      ['Ọjọ́ Àbámẹ́ta', 'Saturday', 'aw-JAW ah-bah-MEH-tah'],
      ['Ọjọ́ wo ni ó jẹ́?', 'What day is it?', 'aw-JAW woh nee aw JEH'],
      ['Ọjọ́ Ajé ni.', 'It is Monday.', 'aw-JAW ah-JEH nee'],
    ],
    teach: 'This pack uses the seven-day Gregorian week names documented in Yorùbá Yé Mi and Unicode CLDR. Yorùbá also has a traditional four-day cycle, which should be taught separately as culture rather than mixed into this beginner sequence.',
    model: '“Ọjọ́ wo ni ó jẹ́?” — “Ọjọ́ Ajé ni.” means “What day is it?” — “It is Monday.”',
  },
  'Months of the year': {
    words: [
      ['Oṣù Ṣẹ́rẹ́', 'January', 'aw-SHOO sheh-REH-reh'],
      ['Oṣù Èrèlè', 'February', 'aw-SHOO eh-reh-LEH'],
      ['Oṣù Ẹrẹ̀nà', 'March', 'aw-SHOO eh-reh-NAH'],
      ['Oṣù Ìgbé', 'April', 'aw-SHOO ee-BEH'],
      ['Oṣù Ẹ̀bìbí', 'May', 'aw-SHOO eh-BEE-bee'],
      ['Oṣù Òkúdu', 'June', 'aw-SHOO aw-KOO-doo'],
      ['Oṣù Agẹmọ', 'July', 'aw-SHOO ah-geh-MAW'],
      ['Oṣù Ògún', 'August', 'aw-SHOO aw-GOON'],
      ['Oṣù Owewe', 'September', 'aw-SHOO aw-weh-weh'],
      ['Oṣù Ọ̀wàrà', 'October', 'aw-SHOO aw-WAH-rah'],
      ['Oṣù Bélú', 'November', 'aw-SHOO beh-LOO'],
      ['Oṣù Ọ̀pẹ̀', 'December', 'aw-SHOO aw-PEH'],
      ['Oṣù wo ni a wà?', 'Which month are we in?', 'aw-SHOO woh nee ah wah'],
    ],
    teach: 'Use Oṣù before a month name in full dates. The forms here follow the Gregorian month names recorded in Unicode CLDR and Yorùbá Yé Mi.',
    model: '“Oṣù wo ni a wà?” — “Oṣù Ṣẹ́rẹ́ ni.” means “Which month are we in?” — “It is January.”',
  },
  'Animals and nature': {
    words: [
      ['ẹranko', 'animal', 'eh-RAHN-kaw'],
      ['ajá', 'dog', 'ah-JAH'],
      ['ológbò', 'cat', 'aw-LAW-gbaw'],
      ['ẹṣin', 'horse', 'eh-SHEEN'],
      ['màlúù', 'cow', 'mah-LOO'],
      ['àgùtàn', 'sheep', 'ah-goo-TAHN'],
      ['adìẹ', 'chicken', 'ah-dee-EH'],
      ['ẹyẹ', 'bird', 'eh-YEH'],
      ['ẹja', 'fish', 'eh-JAH'],
      ['kínìún', 'lion', 'kee-NEE-oon'],
      ['erin', 'elephant', 'eh-REEN'],
      ['kokoro', 'insect', 'kaw-KAW-raw'],
      ['igi', 'tree', 'ee-GEE'],
      ['odò', 'river', 'aw-DAW'],
      ['òkun', 'sea', 'aw-KOON'],
      ['òkè', 'hill / mountain', 'aw-KEH'],
    ],
    teach: 'Begin with familiar animals and places in nature. Keep the underdots and tone marks because they distinguish Yoruba words.',
    model: '“Ajá wà ní ilé.” means “There is a dog at home.”',
  },
  'Weather and seasons': {
    words: [
      ['òjò', 'rain', 'aw-JAW'],
      ['òjò ń rọ̀', 'it is raining', 'aw-JAW n raw'],
      ['ìgbà òjò', 'rainy season', 'ee-gbah aw-JAW'],
      ['ìgbà ooru', 'hot season', 'ee-gbah aw-ROO'],
      ['ooru', 'heat / hot weather', 'aw-ROO'],
      ['òtútù', 'cold weather', 'aw-TOO-too'],
      ['afẹ́fẹ́', 'wind', 'ah-feh-FEH'],
      ['hámátàn', 'harmattan', 'hah-mah-TAHN'],
      ['àwọ̀sánmà', 'cloud', 'ah-WAW-sahn-MAH'],
      ['oorun ń ràn', 'the sun is shining', 'aw-ROON n rahn'],
      ['afẹ́fẹ́ ń fẹ́', 'the wind is blowing', 'ah-feh-FEH n feh'],
      ['ìgbà ooru àti òtútù', 'hot and cold seasons', 'ee-gbah aw-ROO ah-TEE aw-TOO-too'],
    ],
    teach: 'Yorùbá descriptions often use ìgbà (“season/time”) with a weather word. Some regional terms vary, so keep the common learner forms here and allow later native-speaker corrections.',
    model: '“Òjò ń rọ̀ lónìí.” means “It is raining today.”',
  },
  'Body and health': {
    words: [
      ['ara', 'body', 'ah-RAH'],
      ['orí', 'head', 'aw-REE'],
      ['ojú', 'eye / face', 'aw-JOO'],
      ['etí', 'ear', 'eh-TEE'],
      ['imu', 'nose', 'ee-MOO'],
      ['ẹnu', 'mouth', 'eh-NOO'],
      ['eyín', 'tooth / teeth', 'eh-YEEN'],
      ['ọwọ́', 'hand', 'aw-WAW'],
      ['ẹsẹ̀', 'leg / foot', 'eh-SEH'],
      ['irun', 'hair', 'ee-ROON'],
      ['ìrora', 'pain', 'ee-RAW-rah'],
      ['àìsàn', 'illness', 'eye-SAHN'],
      ['oníṣègùn', 'doctor', 'aw-nee-SHEH-goon'],
      ['ilé ìwòsàn', 'hospital', 'ee-LEH ee-WAW-sahn'],
      ['Ara mi kò yá.', 'I am not well.', 'ah-RAH mee kaw YAH'],
    ],
    teach: 'This is everyday body and health vocabulary, not medical advice. Use a trusted adult or healthcare professional for real symptoms.',
    model: '“Ara mi dára.” means “I am well.”',
  },
  'Home and everyday objects': {
    words: [
      ['yàrá', 'room', 'yah-RAH'],
      ['ibi ìdáná', 'kitchen', 'ee-bee ee-DAH-nah'],
      ['balùwẹ̀', 'bathroom', 'bah-loo-WEH'],
      ['ilẹ̀kùn', 'door', 'ee-LEH-koon'],
      ['ibùsùn', 'bed', 'ee-BOO-soon'],
      ['àga', 'chair', 'ah-GAH'],
      ['àwòrán', 'picture', 'ah-WAW-rahn'],
      ['tẹlifóònù', 'telephone', 'teh-lee-FAW-noo'],
      ['kóòmù', 'comb', 'KAW-moo'],
      ['aṣọ', 'clothes', 'ah-SHAW'],
      ['ilé wa', 'our house', 'ee-LEH wah'],
      ['fọ aṣọ', 'wash clothes', 'faw ah-SHAW'],
      ['wẹ̀ ilé', 'clean the house', 'weh ee-LEH'],
      ['se oúnjẹ', 'cook food', 'seh oh-OON-jeh'],
      ['gbá ilẹ̀', 'sweep the floor', 'GBAH ee-LEH'],
    ],
    teach: 'Use short home phrases before introducing longer descriptions. Yoruba possessive words commonly follow the noun, as in ilé wa (“our house”).',
    model: '“Àga wà nínú yàrá.” means “There is a chair in the room.”',
  },
  'Alphabet and pronunciation': {
    words: [
      ['Ẹ', 'open e with underdot', 'EH'],
      ['Ọ', 'open o with underdot', 'AW'],
      ['Ṣ', 's with a dot', 'SH'],
      ['gb', 'combined gb sound', 'GB'],
      ['ẹja', 'fish', 'eh-JAH'],
      ['ọ̀rọ̀', 'word / speech', 'aw-RAW'],
      ['ṣé', 'question marker', 'SHEH'],
      ['gbà', 'receive / take', 'GBAH'],
    ],
    teach: 'The Yoruba alphabet is a, b, d, e, ẹ, f, g, gb, h, i, j, k, l, m, n, o, ọ, p, r, s, ṣ, t, u, w and y. The underdots and three tone levels are part of the spelling, not decoration.',
    model: 'Say the contrast slowly: “ẹ — e”, “ọ — o”, and “ṣ — s”, then practise the marked words in the list.',
  },
  'Clothing': {
    words: [
      ['aṣọ', 'clothes / cloth', 'ah-SHAW'],
      ['ẹ̀wù', 'dress / clothing', 'eh-WOO'],
      ['ṣòkòtò', 'trousers', 'shaw-KAW-taw'],
      ['bàtà', 'shoes', 'bah-TAH'],
      ['fìlà', 'cap / hat', 'fee-LAH'],
      ['ìró', 'wrapper', 'ee-RAW'],
      ['aṣọ pupa', 'red clothes', 'ah-SHAW KPOO-kpah'],
      ['Mo wọ aṣọ.', 'I am wearing clothes.', 'moh WAW ah-SHAW'],
    ],
    teach: 'Use wọ̀ (“wear/put on”) with clothing. Colours can follow the noun phrase, as in aṣọ pupa (“red clothes”).',
    model: '“Mo wọ aṣọ búlúù.” means “I am wearing blue clothes.”',
  },
  'Time and calendar': {
    words: [
      ['lónìí', 'today', 'loh-NEE'],
      ['àná', 'yesterday', 'ah-NAH'],
      ['ọ̀la', 'tomorrow', 'aw-LAH'],
      ['ọjọ́', 'day', 'aw-JAW'],
      ['ọ̀sẹ̀', 'week', 'aw-SHEH'],
      ['oṣù', 'month', 'aw-SHOO'],
      ['ọdún', 'year', 'aw-DOON'],
      ['àago', 'clock / time', 'ah-AH-gaw'],
      ['ìṣẹ́jú', 'minute', 'ee-SHEH-joo'],
    ],
    teach: 'Use lónìí, àná and ọ̀la for today, yesterday and tomorrow. The dedicated weekday and month units provide the full calendar names.',
    model: '“Àná ni mo lọ sí ilé-ìwé; lónìí ni mo wà ní ilé.” means “I went to school yesterday; today I am at home.”',
  },
  'Transport and road safety': {
    words: [
      ['ọkọ̀ ayọ́kẹ́lẹ́', 'car', 'aw-KAW ah-YAW-keh-LEH'],
      ['ọkọ̀ akérò', 'bus / passenger vehicle', 'aw-KAW ah-KEH-raw'],
      ['kẹ̀kẹ́', 'bicycle', 'keh-KEH'],
      ['rin', 'walk', 'REEN'],
      ['ọ̀nà', 'road / way', 'aw-NAH'],
      ['awakọ̀', 'driver', 'ah-wah-KAW'],
      ['Dúró!', 'Stop!', 'DOO-raw'],
      ['Wo ọ̀nà.', 'Watch the road.', 'WAW aw-NAH'],
    ],
    teach: 'Road-safety phrases are for supervised learning only. Look, listen and follow a trusted adult or teacher when crossing a road.',
    model: '“Wo ọ̀nà kí o tó kọjá.” means “Look at the road before you cross.”',
  },
  'Places and directions': {
    words: [
      ['níbo?', 'where?', 'NEE-baw'],
      ['ní ọ̀tún', 'on the right', 'nee aw-TOON'],
      ['ní òsì', 'on the left', 'nee aw-SEE'],
      ['níwájú', 'in front / ahead', 'nee-wah-JOO'],
      ['lẹ́yìn', 'behind / after', 'leh-YEEN'],
      ['nítòsí', 'near', 'nee-TAW-see'],
      ['jìnnà', 'far', 'JEEN-nah'],
      ['Ọjà wà ní ọ̀tún.', 'The market is on the right.', 'aw-JAH wah nee aw-TOON'],
    ],
    teach: 'Ask níbo? (“where?”) and combine direction words with familiar places such as ilé, ilé-ìwé and ọjà.',
    model: '“Ilé-ìwé wà nítòsí.” means “The school is nearby.”',
  },
  'Shopping and money': {
    words: [
      ['ọjà', 'market', 'aw-JAH'],
      ['owó', 'money', 'aw-WAW'],
      ['ra', 'buy', 'RAH'],
      ['ta', 'sell', 'TAH'],
      ['Eélòó?', 'How much?', 'EH-law-aw'],
      ['owó mélòó ni?', 'How much money?', 'aw-WAW meh-LAW nee'],
      ['ẹ̀wẹ̀', 'change / small money', 'eh-WEH'],
      ['Jọ̀ọ́, fún mi ní…', 'Please give me…', 'jaw-AW foon mee nee'],
    ],
    teach: 'Practise asking a price politely and naming one item at a time. Real purchases should be made with a trusted adult.',
    model: '“Eélòó ni ìrẹsì yìí?” means “How much is this rice?”',
  },
  'Hobbies and free time': {
    words: [
      ['eré bọ́ọ̀lù', 'football', 'eh-REH baw-LOO'],
      ['kàwé', 'read', 'kah-WEH'],
      ['orin', 'music / song', 'aw-REEN'],
      ['jó', 'dance', 'JAW'],
      ['ya àwòrán', 'draw a picture', 'YAH ah-WAW-rahn'],
      ['wẹ̀', 'swim / bathe', 'WEH'],
      ['ṣeré', 'play', 'sheh-REH'],
      ['Mo fẹ́ràn orin.', 'I like music.', 'moh FEH-rahn aw-REEN'],
    ],
    teach: 'Use Mo fẹ́ràn… (“I like…”) to talk about hobbies, and add a reason with nítorí pé when ready.',
    model: '“Mo fẹ́ràn eré bọ́ọ̀lù nítorí pé ó dùn.” means “I like football because it is enjoyable.”',
  },
  'Community and public places': {
    words: [
      ['ọlọ́pàá', 'police officer', 'aw-law-PAH'],
      ['oníṣègùn', 'doctor', 'aw-nee-SHEH-goon'],
      ['panápaná', 'firefighter / fire station', 'pah-NAH-pah-NAH'],
      ['ilé ìwòsàn', 'hospital', 'ee-LEH ee-WAW-sahn'],
      ['ilé-ìkàwé', 'library', 'ee-LEH ee-kah-WEH'],
      ['ilé ìfìwéránṣẹ́', 'post office', 'ee-LEH ee-fee-weh-RAHN-sheh'],
      ['ilé ìfowópamọ́sí', 'bank', 'ee-LEH ee-faw-waw-PAW-maw-SHEE'],
      ['Jọ̀ọ́, ràn mí lọ́wọ́.', 'Please help me.', 'jaw-AW rahn mee LAW-waw'],
    ],
    teach: 'Learn who works in a community and how to ask a trusted adult or public helper for help. Never approach an emergency situation alone.',
    model: '“Mo nílò ìrànlọ́wọ́.” means “I need help.”',
  },
  'Yoruba culture and identity': {
    words: [
      ['orúkọ', 'name', 'aw-ROO-kaw'],
      ['àṣà', 'culture', 'ah-SHAH'],
      ['ìkíni', 'greeting / salutation', 'ee-KEE-nee'],
      ['ọdún egúngún', 'masquerade festival', 'aw-DOON eh-GOON-goon'],
      ['ìyì', 'respect / honour', 'ee-YEE'],
      ['aṣọ ìbílẹ̀', 'traditional clothing', 'ah-SHAW ee-BEE-leh'],
      ['oúnjẹ ìbílẹ̀', 'traditional food', 'oh-OON-jeh ee-BEE-leh'],
      ['òwe', 'proverb', 'aw-WEH'],
      ['orin', 'song', 'aw-REEN'],
      ['ijó', 'dance', 'ee-JAW'],
      ['Àgbà kì í wà lójú ọ̀nà kí orí ọmọ tuntun wọ́.', 'An elder does not watch a young child fall.', 'ah-gbah kee ee wah law-JOO aw-NAH kee aw-REE aw-maw toon-TOON WAW'],
    ],
    teach: 'Culture is diverse. Learn names, greetings, music, food, clothing, respect and proverbs as living practices, not stereotypes.',
    model: '“Àṣà Yorùbá yàtọ̀ sí àṣà míì.” means “Yoruba culture is different from other cultures.”',
  },
  'Grammar and sentence patterns': {
    words: [
      ['mo', 'I', 'MOH'],
      ['o', 'you', 'OH'],
      ['ó', 'he / she', 'OH (high tone)'],
      ['àwa', 'we', 'AH-wah'],
      ['ẹ̀yin', 'you all / respectful you', 'eh-YEEN'],
      ['wọ́n', 'they', 'WAWN'],
      ['kò', 'not', 'KAW'],
      ['ṣé', 'question marker', 'SHEH'],
      ['jẹ́', 'to be', 'JEH'],
      ['fẹ́', 'to want / like', 'FEH'],
      ['kan', 'one / a (singular marker)', 'KAHN'],
      ['ọ̀pọ̀', 'many / much (plural quantity)', 'aw-PAW'],
    ],
    teach: 'Build short sentences with a pronoun, a verb and a familiar noun. Use kò for a simple negative and ṣé to begin a yes-or-no question.',
    model: '“Ṣé o fẹ́ràn ìrẹsì?” — “Bẹ́ẹ̀ ni, mo fẹ́ràn.” means “Do you like rice?” — “Yes, I do.”',
  },
  'Reading stories, poems and songs': {
    words: [
      ['ìtàn', 'story', 'ee-TAHN'],
      ['ewì', 'poem', 'eh-WEE'],
      ['orin', 'song', 'aw-REEN'],
      ['kà', 'read', 'KAH'],
      ['gbọ́', 'listen / hear', 'GBAW'],
      ['ìbéèrè', 'question', 'ee-beh-EH-reh'],
      ['ìdáhùn', 'answer', 'ee-DAH-hoon'],
      ['Kí ni ó ṣẹlẹ̀?', 'What happened?', 'kee nee aw sheh-LEH'],
    ],
    teach: 'Read short, marked texts for meaning first. Then notice repeated words, tone marks, dialogue and the sequence of events.',
    model: 'After a short story, answer “Kí ni ó ṣẹlẹ̀?” with one simple Yoruba sentence.',
  },
  'Listening and dictation': {
    words: [
      ['gbọ́', 'listen / hear', 'GBAW'],
      ['gbọ́ dáadáa', 'listen carefully', 'GBAW dah-AH-dah'],
      ['sọ', 'say / tell', 'SAW'],
      ['tún sọ', 'say again', 'toon SAW'],
      ['kọ́', 'learn', 'KAW'],
      ['kọ̀wé', 'write', 'kaw-WEH'],
      ['dáhùn', 'answer', 'DAH-hoon'],
      ['Dákẹ́ kí o gbọ́.', 'Be quiet so you can listen.', 'dah-KEH kee aw GBAW'],
      ['gbọ́ àṣẹ', 'listen to an instruction', 'GBAW ah-SHEH'],
    ],
    teach: 'Short audio, repetition and dictation should preserve every underdot and tone mark. The teacher or approved audio should model each phrase first.',
    model: '“Tún sọ ọ́, jọ̀ọ́.” means “Please say it again.”',
  },
  'Speaking and presentations': {
    words: [
      ['sọ̀rọ̀', 'speak / talk', 'shaw-RAW'],
      ['béèrè', 'ask', 'beh-EH-reh'],
      ['dáhùn', 'answer', 'DAH-hoon'],
      ['àlàyé', 'explain / describe', 'ah-lah-YEH'],
      ['pàdé', 'meet', 'pah-DEH'],
      ['fí ara rẹ̀ hàn', 'introduce / present yourself', 'fee ah-RAH reh hahn'],
      ['Mo fẹ́ sọ̀rọ̀ nípa…', 'I want to talk about…', 'moh FEH shaw-RAW NEE-pah'],
      ['Ẹ gbọ́ mi, jọ̀ọ́.', 'Please listen to me.', 'eh GBAW mee jaw-AW'],
    ],
    teach: 'Use role-play, question-and-answer, picture description and short presentations. Learners may plan in English first, then deliver a short marked Yoruba version.',
    model: '“Orúkọ mi ni… Mo fẹ́ sọ̀rọ̀ nípa ìdílé mi.” means “My name is… I want to talk about my family.”',
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

const getYorubaTonePattern = (text: string): string => {
  const tones: string[] = [];
  const characters = [...text.normalize('NFD')];
  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    if (/[́̀]/u.test(character) && tones.length > 0) {
      tones[tones.length - 1] = character === '́' ? 'H' : 'L';
      continue;
    }
    if (/[aeiou]/iu.test(character)) tones.push('M');
    if (/[nN]/u.test(character) && /[́̀]/u.test(characters[index + 1] ?? '')) tones.push('M');
  }
  return tones.length > 0 ? `tones: ${tones.join('–')}` : 'tone-marked spelling';
};

const getPack = (subject: string, topic: string): LanguageUnitPack | null => {
  if (subject !== 'Yoruba' && subject !== 'Romanian') return null;
  return PACKS[subject][topic] ?? null;
};

export const getReviewedLanguageQuestions = (subject: string, topic: string, age: number): BankQuestion[] => {
  const pack = getPack(subject, topic);
  if (!pack) return [];
  const options = pack.words.map(([target]) => target);
  return pack.words.map(([target, english], index) => {
    const distractors = options.filter((option) => option !== target);
    const offset = distractors.length > 0 ? (index * 3) % distractors.length : 0;
    const rotated = [...distractors.slice(offset), ...distractors.slice(0, offset)];
    const questionOptions = [target, ...rotated.slice(0, 3)];
    const answerOffset = index % questionOptions.length;

    return {
      id: `reviewed-${subject.toLowerCase()}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`,
      subject,
      topic,
      ageGroup: [age],
      difficulty: index < 2 ? Difficulty.Easy : Difficulty.Medium,
      question: `Which ${subject} word or phrase means “${english}”?`,
      options: [...questionOptions.slice(answerOffset), ...questionOptions.slice(0, answerOffset)],
      correctAnswer: target,
      explanation: `${target} means “${english}”.`,
      questionType: QuestionType.MultipleChoice,
      cognitiveLevel: index < 2 ? CognitiveLevel.Remember : CognitiveLevel.Understand,
    };
  });
};

export const getReviewedLanguageVocabulary = (subject: string, topic: string): Array<{
  word: string;
  english: string;
  phonetic: string;
}> => {
  const pack = getPack(subject, topic);
  if (!pack) return [];
  return pack.words.map(([word, english, pronunciation]) => ({
    word,
    english,
    phonetic: subject === 'Yoruba' ? getYorubaTonePattern(word) : pronunciation,
  }));
};

export const getReviewedLanguageLesson = (subject: string, topic: string, age: number): string | null => {
  const pack = getPack(subject, topic);
  const unit = getCurriculumUnit(subject, topic, age);
  if (!pack || !unit) return null;
  const vocabulary = pack.words
    .map(([target, english, pronunciation]) => {
      const guide = subject === 'Yoruba' ? getYorubaTonePattern(target) : pronunciation;
      return `* ${target} (${guide}) — ${english}`;
    })
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
