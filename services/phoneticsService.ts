/**
 * Phonetics Service - Helps students learn pronunciation
 * 
 * Features:
 * - Phonetic transcription (IPA-like simplified for kids)
 * - Syllable breakdown
 * - Slow pronunciation mode
 * - Common word pronunciation guides
 */

// Simplified phonetic guides for common words in each language
// Using kid-friendly phonetic spelling instead of strict IPA

const FRENCH_PHONETICS: Record<string, { phonetic: string; syllables: string[] }> = {
  'bonjour': { phonetic: 'bon-ZHOOR', syllables: ['bon', 'jour'] },
  'merci': { phonetic: 'mehr-SEE', syllables: ['mer', 'ci'] },
  'oui': { phonetic: 'WEE', syllables: ['oui'] },
  'non': { phonetic: 'NON', syllables: ['non'] },
  'salut': { phonetic: 'sah-LOO', syllables: ['sa', 'lut'] },
  'au revoir': { phonetic: 'oh ruh-VWAHR', syllables: ['au', 're', 'voir'] },
  "s'il vous plaît": { phonetic: 'seel voo PLEH', syllables: ['sil', 'vous', 'plaît'] },
  'je': { phonetic: 'ZHUH', syllables: ['je'] },
  'tu': { phonetic: 'TOO', syllables: ['tu'] },
  'il': { phonetic: 'EEL', syllables: ['il'] },
  'elle': { phonetic: 'EL', syllables: ['elle'] },
  'nous': { phonetic: 'NOO', syllables: ['nous'] },
  'vous': { phonetic: 'VOO', syllables: ['vous'] },
  'comment': { phonetic: 'koh-MAHN', syllables: ['com', 'ment'] },
  'pourquoi': { phonetic: 'poor-KWAH', syllables: ['pour', 'quoi'] },
  'école': { phonetic: 'ay-KOL', syllables: ['é', 'cole'] },
  'maison': { phonetic: 'meh-ZON', syllables: ['mai', 'son'] },
  'famille': { phonetic: 'fah-MEE-yuh', syllables: ['fa', 'mille'] },
  'ami': { phonetic: 'ah-MEE', syllables: ['a', 'mi'] },
  'manger': { phonetic: 'mahn-ZHAY', syllables: ['man', 'ger'] },
  'boire': { phonetic: 'BWAHR', syllables: ['boire'] },
  'dormir': { phonetic: 'dor-MEER', syllables: ['dor', 'mir'] },
  'jouer': { phonetic: 'zhoo-AY', syllables: ['jou', 'er'] },
  'un': { phonetic: 'UHN', syllables: ['un'] },
  'deux': { phonetic: 'DUH', syllables: ['deux'] },
  'trois': { phonetic: 'TRWAH', syllables: ['trois'] },
  'quatre': { phonetic: 'KAT-ruh', syllables: ['quat', 're'] },
  'cinq': { phonetic: 'SANK', syllables: ['cinq'] },
};

const SPANISH_PHONETICS: Record<string, { phonetic: string; syllables: string[] }> = {
  'hola': { phonetic: 'OH-lah', syllables: ['ho', 'la'] },
  'gracias': { phonetic: 'GRAH-see-ahs', syllables: ['gra', 'cias'] },
  'sí': { phonetic: 'SEE', syllables: ['sí'] },
  'no': { phonetic: 'NOH', syllables: ['no'] },
  'por favor': { phonetic: 'por fah-VOR', syllables: ['por', 'fa', 'vor'] },
  'adiós': { phonetic: 'ah-dee-OHS', syllables: ['a', 'diós'] },
  'buenos días': { phonetic: 'BWEH-nohs DEE-ahs', syllables: ['bue', 'nos', 'dí', 'as'] },
  'buenas noches': { phonetic: 'BWEH-nahs NOH-ches', syllables: ['bue', 'nas', 'no', 'ches'] },
  'cómo': { phonetic: 'KOH-moh', syllables: ['có', 'mo'] },
  'qué': { phonetic: 'KEH', syllables: ['qué'] },
  'dónde': { phonetic: 'DOHN-deh', syllables: ['dón', 'de'] },
  'cuándo': { phonetic: 'KWAHN-doh', syllables: ['cuán', 'do'] },
  'escuela': { phonetic: 'ehs-KWEH-lah', syllables: ['es', 'cue', 'la'] },
  'casa': { phonetic: 'KAH-sah', syllables: ['ca', 'sa'] },
  'familia': { phonetic: 'fah-MEE-lee-ah', syllables: ['fa', 'mi', 'lia'] },
  'amigo': { phonetic: 'ah-MEE-goh', syllables: ['a', 'mi', 'go'] },
  'comer': { phonetic: 'koh-MEHR', syllables: ['co', 'mer'] },
  'beber': { phonetic: 'beh-BEHR', syllables: ['be', 'ber'] },
  'uno': { phonetic: 'OO-noh', syllables: ['u', 'no'] },
  'dos': { phonetic: 'DOHS', syllables: ['dos'] },
  'tres': { phonetic: 'TREHS', syllables: ['tres'] },
  'cuatro': { phonetic: 'KWAH-troh', syllables: ['cua', 'tro'] },
  'cinco': { phonetic: 'SEEN-koh', syllables: ['cin', 'co'] },
};

const GERMAN_PHONETICS: Record<string, { phonetic: string; syllables: string[] }> = {
  'hallo': { phonetic: 'HAH-loh', syllables: ['hal', 'lo'] },
  'danke': { phonetic: 'DAHN-kuh', syllables: ['dan', 'ke'] },
  'ja': { phonetic: 'YAH', syllables: ['ja'] },
  'nein': { phonetic: 'NINE', syllables: ['nein'] },
  'bitte': { phonetic: 'BIT-uh', syllables: ['bit', 'te'] },
  'auf wiedersehen': { phonetic: 'owf VEE-dehr-zay-en', syllables: ['auf', 'wie', 'der', 'se', 'hen'] },
  'guten morgen': { phonetic: 'GOO-ten MOR-gen', syllables: ['gu', 'ten', 'mor', 'gen'] },
  'guten tag': { phonetic: 'GOO-ten TAHK', syllables: ['gu', 'ten', 'tag'] },
  'wie': { phonetic: 'VEE', syllables: ['wie'] },
  'was': { phonetic: 'VAHS', syllables: ['was'] },
  'wo': { phonetic: 'VOH', syllables: ['wo'] },
  'wann': { phonetic: 'VAHN', syllables: ['wann'] },
  'schule': { phonetic: 'SHOO-luh', syllables: ['schu', 'le'] },
  'haus': { phonetic: 'HOUSE', syllables: ['haus'] },
  'familie': { phonetic: 'fah-MEE-lee-uh', syllables: ['fa', 'mi', 'lie'] },
  'freund': { phonetic: 'FROYNT', syllables: ['freund'] },
  'essen': { phonetic: 'ES-sen', syllables: ['es', 'sen'] },
  'trinken': { phonetic: 'TRINK-en', syllables: ['trin', 'ken'] },
  'eins': { phonetic: 'INES', syllables: ['eins'] },
  'zwei': { phonetic: 'TSVYE', syllables: ['zwei'] },
  'drei': { phonetic: 'DRY', syllables: ['drei'] },
  'vier': { phonetic: 'FEER', syllables: ['vier'] },
  'fünf': { phonetic: 'FOONF', syllables: ['fünf'] },
};

const ROMANIAN_PHONETICS: Record<string, { phonetic: string; syllables: string[] }> = {
  'bună': { phonetic: 'BOO-nuh', syllables: ['bu', 'nă'] },
  'mulțumesc': { phonetic: 'mool-tsoo-MESK', syllables: ['mul', 'țu', 'mesc'] },
  'da': { phonetic: 'DAH', syllables: ['da'] },
  'nu': { phonetic: 'NOO', syllables: ['nu'] },
  'te rog': { phonetic: 'teh ROG', syllables: ['te', 'rog'] },
  'la revedere': { phonetic: 'lah reh-veh-DEH-reh', syllables: ['la', 're', 've', 'de', 're'] },
  'bună dimineața': { phonetic: 'BOO-nuh dee-mee-NYAH-tsah', syllables: ['bu', 'nă', 'di', 'mi', 'nea', 'ța'] },
  'bună seara': { phonetic: 'BOO-nuh SYAH-rah', syllables: ['bu', 'nă', 'sea', 'ra'] },
  'cum': { phonetic: 'KOOM', syllables: ['cum'] },
  'ce': { phonetic: 'CHEH', syllables: ['ce'] },
  'unde': { phonetic: 'OON-deh', syllables: ['un', 'de'] },
  'când': { phonetic: 'KUHND', syllables: ['când'] },
  'școală': { phonetic: 'SHKO-ah-luh', syllables: ['școa', 'lă'] },
  'casă': { phonetic: 'KAH-suh', syllables: ['ca', 'să'] },
  'familie': { phonetic: 'fah-MEE-lee-eh', syllables: ['fa', 'mi', 'lie'] },
  'prieten': { phonetic: 'pree-EH-ten', syllables: ['pri', 'e', 'ten'] },
  'unu': { phonetic: 'OO-noo', syllables: ['u', 'nu'] },
  'doi': { phonetic: 'DOY', syllables: ['doi'] },
  'trei': { phonetic: 'TRAY', syllables: ['trei'] },
  'patru': { phonetic: 'PAH-troo', syllables: ['pa', 'tru'] },
  'cinci': { phonetic: 'CHEENCH', syllables: ['cinci'] },
};

const JAPANESE_PHONETICS: Record<string, { phonetic: string; syllables: string[] }> = {
  'こんにちは': { phonetic: 'kon-NEE-chee-wah', syllables: ['kon', 'ni', 'chi', 'wa'] },
  'ありがとう': { phonetic: 'ah-ree-GAH-toh', syllables: ['a', 'ri', 'ga', 'tou'] },
  'はい': { phonetic: 'HAI', syllables: ['hai'] },
  'いいえ': { phonetic: 'ee-EH', syllables: ['i', 'i', 'e'] },
  'おねがいします': { phonetic: 'oh-neh-GAI-shee-mahs', syllables: ['o', 'ne', 'gai', 'shi', 'ma', 'su'] },
  'さようなら': { phonetic: 'sah-YOH-nah-rah', syllables: ['sa', 'you', 'na', 'ra'] },
  'おはよう': { phonetic: 'oh-HAH-yoh', syllables: ['o', 'ha', 'you'] },
  'こんばんは': { phonetic: 'kon-BAHN-wah', syllables: ['kon', 'ban', 'wa'] },
  'なに': { phonetic: 'NAH-nee', syllables: ['na', 'ni'] },
  'どこ': { phonetic: 'DOH-koh', syllables: ['do', 'ko'] },
  'いつ': { phonetic: 'EE-tsoo', syllables: ['i', 'tsu'] },
  'がっこう': { phonetic: 'gahk-KOH', syllables: ['gak', 'kou'] },
  'いえ': { phonetic: 'ee-EH', syllables: ['i', 'e'] },
  'かぞく': { phonetic: 'kah-ZOH-koo', syllables: ['ka', 'zo', 'ku'] },
  'ともだち': { phonetic: 'toh-moh-DAH-chee', syllables: ['to', 'mo', 'da', 'chi'] },
  'いち': { phonetic: 'EE-chee', syllables: ['i', 'chi'] },
  'に': { phonetic: 'NEE', syllables: ['ni'] },
  'さん': { phonetic: 'SAHN', syllables: ['san'] },
  'よん': { phonetic: 'YOHN', syllables: ['yon'] },
  'ご': { phonetic: 'GOH', syllables: ['go'] },
};

const MANDARIN_PHONETICS: Record<string, { phonetic: string; syllables: string[] }> = {
  '你好': { phonetic: 'nee-HOW', syllables: ['nǐ', 'hǎo'] },
  '谢谢': { phonetic: 'shyeh-SHYEH', syllables: ['xiè', 'xie'] },
  '是': { phonetic: 'SHUR', syllables: ['shì'] },
  '不': { phonetic: 'BOO', syllables: ['bù'] },
  '请': { phonetic: 'CHING', syllables: ['qǐng'] },
  '再见': { phonetic: 'zai-JEE-en', syllables: ['zài', 'jiàn'] },
  '早上好': { phonetic: 'zow-shahng-HOW', syllables: ['zǎo', 'shang', 'hǎo'] },
  '晚安': { phonetic: 'wahn-AHN', syllables: ['wǎn', 'ān'] },
  '什么': { phonetic: 'shum-MUH', syllables: ['shén', 'me'] },
  '哪里': { phonetic: 'nah-LEE', syllables: ['nǎ', 'lǐ'] },
  '学校': { phonetic: 'shweh-SHYOW', syllables: ['xué', 'xiào'] },
  '家': { phonetic: 'JYA', syllables: ['jiā'] },
  '朋友': { phonetic: 'pung-YOH', syllables: ['péng', 'you'] },
  '一': { phonetic: 'EE', syllables: ['yī'] },
  '二': { phonetic: 'ARE', syllables: ['èr'] },
  '三': { phonetic: 'SAHN', syllables: ['sān'] },
  '四': { phonetic: 'SUH', syllables: ['sì'] },
  '五': { phonetic: 'WOO', syllables: ['wǔ'] },
};

// Yoruba phonetics with tone markers
// Yoruba is a TONAL language with 3 tones:
// - HIGH tone (´) = raise your voice like asking a question
// - MID tone (no mark) = normal speaking voice
// - LOW tone (`) = lower your voice like ending a statement
const YORUBA_PHONETICS: Record<string, { phonetic: string; syllables: string[]; tones?: string }> = {
  // Greetings
  'bawo': { phonetic: 'BAH-woh', syllables: ['ba', 'wo'], tones: 'mid-mid' },
  'e kaaro': { phonetic: 'eh KAH-roh', syllables: ['e', 'kaa', 'ro'], tones: 'mid-high-mid' },
  'e kaasan': { phonetic: 'eh kah-AH-sahn', syllables: ['e', 'kaa', 'san'], tones: 'mid-high-low' },
  'e kaale': { phonetic: 'eh KAH-leh', syllables: ['e', 'kaa', 'le'], tones: 'mid-high-low' },
  'o dabo': { phonetic: 'oh DAH-boh', syllables: ['o', 'da', 'bo'], tones: 'mid-low-mid' },
  'e se': { phonetic: 'eh SHEH', syllables: ['e', 'se'], tones: 'mid-low' },
  'e ku ojo': { phonetic: 'eh koo OH-joh', syllables: ['e', 'ku', 'o', 'jo'], tones: 'mid-low-mid-low' },
  'kaaro': { phonetic: 'KAH-roh', syllables: ['kaa', 'ro'], tones: 'high-mid' },
  'kaasan': { phonetic: 'kah-AH-sahn', syllables: ['kaa', 'san'], tones: 'high-low' },
  'kaale': { phonetic: 'KAH-leh', syllables: ['kaa', 'le'], tones: 'high-low' },
  
  // Family
  'iya': { phonetic: 'ee-YAH', syllables: ['i', 'ya'], tones: 'mid-low' },
  'baba': { phonetic: 'BAH-bah', syllables: ['ba', 'ba'], tones: 'low-low' },
  'omo': { phonetic: 'OH-moh', syllables: ['o', 'mo'], tones: 'mid-mid' },
  'egbon': { phonetic: 'EHG-bohn', syllables: ['eg', 'bon'], tones: 'mid-low' },
  'aburo': { phonetic: 'ah-BOO-roh', syllables: ['a', 'bu', 'ro'], tones: 'low-low-mid' },
  'ore': { phonetic: 'OH-reh', syllables: ['o', 're'], tones: 'mid-low' },
  'ebi': { phonetic: 'EH-bee', syllables: ['e', 'bi'], tones: 'mid-high' },
  'iya agba': { phonetic: 'ee-YAH AHG-bah', syllables: ['i', 'ya', 'ag', 'ba'], tones: 'mid-low-mid-low' },
  'baba agba': { phonetic: 'BAH-bah AHG-bah', syllables: ['ba', 'ba', 'ag', 'ba'], tones: 'low-low-mid-low' },
  
  // Numbers
  'okan': { phonetic: 'OH-kahn', syllables: ['o', 'kan'], tones: 'mid-low' },
  'eji': { phonetic: 'EH-jee', syllables: ['e', 'ji'], tones: 'low-low' },
  'eta': { phonetic: 'EH-tah', syllables: ['e', 'ta'], tones: 'low-low' },
  'erin': { phonetic: 'EH-reen', syllables: ['e', 'rin'], tones: 'low-low' },
  'arun': { phonetic: 'ah-ROON', syllables: ['a', 'run'], tones: 'low-mid' },
  'efa': { phonetic: 'EH-fah', syllables: ['e', 'fa'], tones: 'low-low' },
  'eje': { phonetic: 'EH-jeh', syllables: ['e', 'je'], tones: 'low-low' },
  'ejo': { phonetic: 'EH-joh', syllables: ['e', 'jo'], tones: 'low-low' },
  'esan': { phonetic: 'EH-sahn', syllables: ['e', 'san'], tones: 'low-low' },
  'ewa': { phonetic: 'EH-wah', syllables: ['e', 'wa'], tones: 'low-low' },
  
  // Common words
  'omi': { phonetic: 'OH-mee', syllables: ['o', 'mi'], tones: 'mid-low' },
  'ounje': { phonetic: 'oh-OON-jeh', syllables: ['o', 'un', 'je'], tones: 'mid-low-low' },
  'ile': { phonetic: 'ee-LEH', syllables: ['i', 'le'], tones: 'mid-low' },
  'iwe': { phonetic: 'ee-WEH', syllables: ['i', 'we'], tones: 'mid-low' },
  'ile-iwe': { phonetic: 'ee-LEH-ee-WEH', syllables: ['i', 'le', 'i', 'we'], tones: 'mid-low-mid-low' },
  'ojo': { phonetic: 'OH-joh', syllables: ['o', 'jo'], tones: 'mid-low' },
  'oru': { phonetic: 'OH-roo', syllables: ['o', 'ru'], tones: 'mid-low' },
  'osan': { phonetic: 'oh-SAHN', syllables: ['o', 'san'], tones: 'mid-low' },
  'ale': { phonetic: 'ah-LEH', syllables: ['a', 'le'], tones: 'low-low' },
  'beeni': { phonetic: 'BEH-nee', syllables: ['bee', 'ni'], tones: 'mid-low' },
  'rara': { phonetic: 'RAH-rah', syllables: ['ra', 'ra'], tones: 'low-low' },
  'jowo': { phonetic: 'JOH-woh', syllables: ['jo', 'wo'], tones: 'mid-mid' },
  'mo fe': { phonetic: 'moh FEH', syllables: ['mo', 'fe'], tones: 'mid-low' },
  'se o ye': { phonetic: 'sheh oh YEH', syllables: ['se', 'o', 'ye'], tones: 'low-mid-low' },
  
  // Actions
  'jeun': { phonetic: 'JEH-oon', syllables: ['je', 'un'], tones: 'low-low' },
  'mu': { phonetic: 'MOO', syllables: ['mu'], tones: 'mid' },
  'sun': { phonetic: 'SOON', syllables: ['sun'], tones: 'mid' },
  'rin': { phonetic: 'REEN', syllables: ['rin'], tones: 'mid' },
  'fo': { phonetic: 'FOH', syllables: ['fo'], tones: 'mid' },
  'ka': { phonetic: 'KAH', syllables: ['ka'], tones: 'mid' },
  'ko': { phonetic: 'KOH', syllables: ['ko'], tones: 'mid' },
  'gbo': { phonetic: 'GBOH', syllables: ['gbo'], tones: 'mid' },
  'wo': { phonetic: 'WOH', syllables: ['wo'], tones: 'mid' },
  'so': { phonetic: 'SOH', syllables: ['so'], tones: 'mid' },
  
  // Colors
  'pupa': { phonetic: 'POO-pah', syllables: ['pu', 'pa'], tones: 'mid-low' },
  'funfun': { phonetic: 'FOON-foon', syllables: ['fun', 'fun'], tones: 'mid-mid' },
  'dudu': { phonetic: 'DOO-doo', syllables: ['du', 'du'], tones: 'mid-mid' },
  'alawoewe': { phonetic: 'ah-lah-woh-EH-weh', syllables: ['a', 'la', 'wo', 'e', 'we'], tones: 'low-low-mid-low-low' },
  
  // Body parts
  'ori': { phonetic: 'OH-ree', syllables: ['o', 'ri'], tones: 'mid-low' },
  'oju': { phonetic: 'OH-joo', syllables: ['o', 'ju'], tones: 'mid-low' },
  'eti': { phonetic: 'EH-tee', syllables: ['e', 'ti'], tones: 'low-low' },
  'enu': { phonetic: 'EH-noo', syllables: ['e', 'nu'], tones: 'low-mid' },
  'imu': { phonetic: 'ee-MOO', syllables: ['i', 'mu'], tones: 'mid-mid' },
  'owo': { phonetic: 'oh-WOH', syllables: ['o', 'wo'], tones: 'mid-mid' },
  'ese': { phonetic: 'eh-SEH', syllables: ['e', 'se'], tones: 'low-low' },
};

// All phonetics by language
const PHONETICS_BY_LANGUAGE: Record<string, Record<string, { phonetic: string; syllables: string[] }>> = {
  French: FRENCH_PHONETICS,
  Spanish: SPANISH_PHONETICS,
  German: GERMAN_PHONETICS,
  Romanian: ROMANIAN_PHONETICS,
  Japanese: JAPANESE_PHONETICS,
  Mandarin: MANDARIN_PHONETICS,
  Yoruba: YORUBA_PHONETICS,
};

// Pronunciation rules by language (for words not in dictionary)
const PRONUNCIATION_RULES: Record<string, Array<{ pattern: RegExp; guide: string; example: string }>> = {
  French: [
    { pattern: /ou/g, guide: 'oo (like "food")', example: 'jour → zhoor' },
    { pattern: /oi/g, guide: 'wa (like "wah")', example: 'moi → mwah' },
    { pattern: /eau?/g, guide: 'oh', example: 'beau → boh' },
    { pattern: /ai/g, guide: 'eh', example: 'maison → meh-zon' },
    { pattern: /ch/g, guide: 'sh', example: 'chat → shah' },
    { pattern: /j/g, guide: 'zh (soft j)', example: 'je → zhuh' },
    { pattern: /r/g, guide: 'r (from throat)', example: 'rouge → roozh' },
    { pattern: /gn/g, guide: 'ny (like Spanish ñ)', example: 'montagne → mon-tah-nyuh' },
    { pattern: /tion$/g, guide: 'see-on', example: 'nation → nah-see-on' },
    { pattern: /ille$/g, guide: 'ee-yuh', example: 'fille → fee-yuh' },
  ],
  Spanish: [
    { pattern: /ll/g, guide: 'y (like "yes")', example: 'llamar → yah-mar' },
    { pattern: /ñ/g, guide: 'ny (like "canyon")', example: 'niño → nee-nyo' },
    { pattern: /j/g, guide: 'h (strong)', example: 'jugar → hoo-gar' },
    { pattern: /h/g, guide: 'silent', example: 'hola → oh-lah' },
    { pattern: /v/g, guide: 'b (soft)', example: 'vivir → bee-beer' },
    { pattern: /qu/g, guide: 'k', example: 'que → keh' },
    { pattern: /rr/g, guide: 'rolled r', example: 'perro → peh-rro' },
    { pattern: /z/g, guide: 's (or th in Spain)', example: 'zapato → sah-pah-toh' },
    { pattern: /ge|gi/g, guide: 'he/hi', example: 'gente → hen-teh' },
    { pattern: /gue|gui/g, guide: 'geh/gee', example: 'guitarra → gee-tah-rra' },
  ],
  German: [
    { pattern: /ch/g, guide: 'ch (back of throat)', example: 'ich → ikh' },
    { pattern: /sch/g, guide: 'sh', example: 'schön → shurn' },
    { pattern: /sp/g, guide: 'shp (at start)', example: 'sprechen → shpreh-khen' },
    { pattern: /st/g, guide: 'sht (at start)', example: 'Stadt → shtaht' },
    { pattern: /w/g, guide: 'v', example: 'wasser → vah-ser' },
    { pattern: /v/g, guide: 'f', example: 'vater → fah-ter' },
    { pattern: /z/g, guide: 'ts', example: 'zeit → tsait' },
    { pattern: /ü/g, guide: 'ew (lips rounded)', example: 'über → ew-ber' },
    { pattern: /ö/g, guide: 'ur (lips rounded)', example: 'schön → shurn' },
    { pattern: /ä/g, guide: 'eh', example: 'mädchen → mehd-khen' },
    { pattern: /ei/g, guide: 'eye', example: 'mein → mine' },
    { pattern: /ie/g, guide: 'ee', example: 'sie → zee' },
  ],
  Romanian: [
    { pattern: /ă/g, guide: 'uh (short)', example: 'fată → fah-tuh' },
    { pattern: /â|î/g, guide: 'uh (deep)', example: 'în → uhn' },
    { pattern: /ș/g, guide: 'sh', example: 'și → shee' },
    { pattern: /ț/g, guide: 'ts', example: 'țară → tsah-ruh' },
    { pattern: /ce|ci/g, guide: 'che/chee', example: 'cinci → cheench' },
    { pattern: /ge|gi/g, guide: 'je/jee', example: 'geam → jahm' },
    { pattern: /che|chi/g, guide: 'ke/kee', example: 'cheie → keh-yeh' },
    { pattern: /ghe|ghi/g, guide: 'ge/gee', example: 'ghete → geh-teh' },
  ],
  Yoruba: [
    { pattern: /gb/g, guide: 'gb (say g and b together as one sound)', example: 'gba → gbah' },
    { pattern: /ṣ|sh/g, guide: 'sh (like "ship")', example: 'ṣe → sheh' },
    { pattern: /ọ/g, guide: 'aw (like "or")', example: 'ọjọ → aw-jaw' },
    { pattern: /ẹ/g, guide: 'eh (like "bed")', example: 'ẹ̀ṣẹ́ → eh-sheh' },
    { pattern: /n(?=[aeiouọẹ])/g, guide: 'n (nasalizes the vowel)', example: 'ẹn → ehn' },
    { pattern: /à|á/g, guide: 'LOW/HIGH tone a', example: 'bàbá → BAH-bah (low-high)' },
    { pattern: /è|é/g, guide: 'LOW/HIGH tone e', example: 'ẹ̀sẹ́ → eh-SHEH (low-high)' },
    { pattern: /ì|í/g, guide: 'LOW/HIGH tone i', example: 'ìyá → ee-YAH (low-high)' },
    { pattern: /ò|ó/g, guide: 'LOW/HIGH tone o', example: 'ọmọ → aw-maw' },
    { pattern: /ù|ú/g, guide: 'LOW/HIGH tone u', example: 'ọrùn → aw-roon' },
    { pattern: /p/g, guide: 'kp (say k and p together)', example: 'pupa → kpoo-kpah' },
  ],
};

/**
 * Get phonetic guide for a word
 */
export const getPhonetics = (word: string, language: string): { 
  phonetic: string; 
  syllables: string[];
  found: boolean;
} | null => {
  const languagePhonetics = PHONETICS_BY_LANGUAGE[language];
  if (!languagePhonetics) return null;

  const lowerWord = word.toLowerCase().trim();
  const entry = languagePhonetics[lowerWord];
  
  if (entry) {
    return { ...entry, found: true };
  }

  // Not found in dictionary - return null to indicate we need to use TTS
  return null;
};

/**
 * Get pronunciation rules for a language
 */
export const getPronunciationRules = (language: string): Array<{ 
  pattern: RegExp; 
  guide: string; 
  example: string 
}> | null => {
  return PRONUNCIATION_RULES[language] || null;
};

/**
 * Get all common words with phonetics for a language (for study/flashcards)
 */
export const getCommonWords = (language: string): Array<{
  word: string;
  phonetic: string;
  syllables: string[];
}> => {
  const languagePhonetics = PHONETICS_BY_LANGUAGE[language];
  if (!languagePhonetics) return [];

  return Object.entries(languagePhonetics).map(([word, data]) => ({
    word,
    phonetic: data.phonetic,
    syllables: data.syllables,
  }));
};

/**
 * Break a word into approximate syllables (for any word)
 */
export const breakIntoSyllables = (word: string): string[] => {
  // Simple syllable breaking - split on vowel groups
  const vowels = /[aeiouáéíóúàèìòùäëïöüâêîôûãõ]/i;
  const syllables: string[] = [];
  let currentSyllable = '';

  for (let i = 0; i < word.length; i++) {
    currentSyllable += word[i];
    
    // Check if we should break
    if (vowels.test(word[i]) && i < word.length - 1) {
      // If next char is consonant and char after is vowel, break after next consonant
      if (!vowels.test(word[i + 1]) && i + 2 < word.length && vowels.test(word[i + 2])) {
        currentSyllable += word[i + 1];
        i++;
      }
      syllables.push(currentSyllable);
      currentSyllable = '';
    }
  }

  if (currentSyllable) {
    syllables.push(currentSyllable);
  }

  return syllables.length > 0 ? syllables : [word];
};

/**
 * Get supported languages for phonetics
 */
export const getSupportedLanguages = (): string[] => {
  return Object.keys(PHONETICS_BY_LANGUAGE);
};

export default {
  getPhonetics,
  getPronunciationRules,
  getCommonWords,
  breakIntoSyllables,
  getSupportedLanguages,
};
