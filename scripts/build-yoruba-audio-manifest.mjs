import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reviewedPath = path.join(projectRoot, 'data', 'reviewedLanguageContent.ts');
const questionPath = path.join(projectRoot, 'data', 'questions', 'languages.ts');
const phoneticsPath = path.join(projectRoot, 'services', 'phoneticsService.ts');
const outputPath = path.join(projectRoot, 'data', 'audio', 'yoruba-audio-manifest.json');
const model = 'facebook/mms-tts-yor';
const speed = 1;
const format = 'mp3';

const reviewedSource = fs.readFileSync(reviewedPath, 'utf8');
const questionSource = fs.readFileSync(questionPath, 'utf8');
const phoneticsSource = fs.readFileSync(phoneticsPath, 'utf8');

const normalize = (value) => value.normalize('NFC').replace(/\s+/gu, ' ').trim();
const unescape = (value) => value.replace(/\\'/gu, "'").replace(/\\"/gu, '"');

const entries = new Map();
const addEntry = (text, source, metadata = {}) => {
  const normalizedText = normalize(text);
  if (!normalizedText) return;

  const hash = crypto.createHash('sha256')
    .update(JSON.stringify({ model, language: 'yo', speed, format, text: normalizedText }))
    .digest('hex');

  const existing = entries.get(normalizedText);
  if (existing) {
    existing.sources = [...new Set([...existing.sources, source])];
    if (metadata.english && !existing.english) existing.english = metadata.english;
    if (metadata.pronunciationGuide && !existing.pronunciationGuide) existing.pronunciationGuide = metadata.pronunciationGuide;
    return;
  }

  entries.set(normalizedText, {
    id: `yo-${hash.slice(0, 16)}`,
    text: normalizedText,
    language: 'yo',
    model,
    speed,
    format,
    hash,
    category: source === 'reviewed-vocabulary' ? 'lesson-vocabulary' : 'question-bank',
    source,
    sources: [source],
    objectKey: `audio/yoruba/facebook-mms-tts-yor/${speed.toFixed(1)}/${hash}.mp3`,
    contentType: 'audio/mpeg',
    status: 'pending',
    ...metadata,
  });
};

// Extract the reviewed vocabulary pack. These entries retain the source-audited
// underdots and tone marks used by the lessons.
const yorubaPack = reviewedSource.match(/const YORUBA:[\s\S]*?\n\};\n\nconst ROMANIAN:/u)?.[0] || '';
const vocabularyPattern = /\[\s*'((?:\\'|[^'])*)'\s*,\s*'((?:\\'|[^'])*)'\s*,\s*'((?:\\'|[^'])*)'\s*\]/gu;
for (const match of yorubaPack.matchAll(vocabularyPattern)) {
  addEntry(unescape(match[1]), 'reviewed-vocabulary', { english: unescape(match[2]), pronunciationGuide: unescape(match[3]) });
}

// Extract marked Yoruba example sentences from the reviewed lesson prose. Do
// not synthesize the surrounding English explanation; only the quoted Yoruba
// phrase is useful to the learner.
const yorubaCharacterPattern = /[ẸẹỌọṢṣÀàÁáÈèÉéÌìÍíÒòÓóÙùÚú]/u;
const reviewedExamplePattern = /“([^”]*[ẸẹỌọṢṣÀàÁáÈèÉéÌìÍíÒòÓóÙùÚú][^”]*)”/gu;
for (const match of reviewedSource.matchAll(reviewedExamplePattern)) {
  addEntry(match[1], 'reviewed-example');
}

// The pronunciation service contains additional source-audited tone practice
// entries. Ignore its intentionally unmarked legacy spellings (okan, eji, ...)
// because Yoruba audio must retain tone marks and underdots.
const phoneticsBlock = phoneticsSource.match(/const YORUBA_PHONETICS:[\s\S]*?\n\};/u)?.[0] || '';
const phoneticsKeyPattern = /^\s*'((?:\\'|[^'])+)'\s*:/gmu;
for (const match of phoneticsBlock.matchAll(phoneticsKeyPattern)) {
  const text = unescape(match[1]);
  if (yorubaCharacterPattern.test(text)) addEntry(text, 'phonetics-tone-practice');
}

// Extract every Yoruba option and answer from the legacy question bank as well.
// Question prompts are English; only the Yoruba text should be spoken by the
// Yoruba voice. This also catches valid options not yet present in the reviewed pack.
const yorubaQuestions = questionSource.match(/\/\/ ===== YORUBA =====[\s\S]*?\/\/ ===== ROMANIAN =====/u)?.[0] || '';
const optionsPattern = /options:\s*\[([^\]]*)\]/gu;
const quotedTextPattern = /'((?:\\'|[^'])*)'/gu;
for (const question of yorubaQuestions.matchAll(optionsPattern)) {
  for (const option of question[1].matchAll(quotedTextPattern)) {
    addEntry(unescape(option[1]), 'question-bank-option');
  }
}

const sortedEntries = [...entries.values()].sort((a, b) => a.text.localeCompare(b.text, 'yo'));
const manifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  language: 'yo',
  languageName: 'Yorùbá',
  targetUniqueEntries: 450,
  expansionStatus: 'phase-1-source-and-review',
  model,
  speed,
  format,
  outputFormat: 'wav',
  requiresToneMarks: true,
  entries: sortedEntries,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${sortedEntries.length} unique Yoruba audio entries to ${path.relative(projectRoot, outputPath)}`);
