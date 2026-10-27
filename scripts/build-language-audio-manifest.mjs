#!/usr/bin/env node
// Builds the French and Spanish pronunciation-audio manifest for Kokoro.
//
// Sources (target-language words/phrases only; English prompts are never spoken):
//   - services/phoneticsService.ts  FRENCH_PHONETICS / SPANISH_PHONETICS keys
//   - data/questions/languages.ts   options and answers of 'French: ...' / 'Spanish: ...' questions
//
// Output: data/audio/language-audio-manifest.json. Generate audio from it with
// scripts/generate-language-audio.py, then upload with scripts/upload-language-audio-r2.mjs.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const phoneticsSource = fs.readFileSync(path.join(projectRoot, 'services', 'phoneticsService.ts'), 'utf8');
const questionSource = fs.readFileSync(path.join(projectRoot, 'data', 'questions', 'languages.ts'), 'utf8');
const outputPath = path.join(projectRoot, 'data', 'audio', 'language-audio-manifest.json');

const model = 'hexgrad/Kokoro-82M';
const modelVersion = 'v1.0';
const speed = 0.9;
const format = 'mp3';
const objectPrefix = 'audio/languages/kokoro-82m-v1.0';

// Kokoro lang codes: 'f' = French, 'e' = Spanish. ff_siwis is the only French voice.
const LANGUAGES = {
  French: { code: 'fr', kokoroLang: 'f', voice: 'ff_siwis', phoneticsConst: 'FRENCH_PHONETICS', topicPrefix: 'French:', locale: 'fr-FR' },
  Spanish: { code: 'es', kokoroLang: 'e', voice: 'ef_dora', phoneticsConst: 'SPANISH_PHONETICS', topicPrefix: 'Spanish:', locale: 'es-ES' },
};

// Trailing ellipses mark fill-in-the-blank options ('Hola...'); don't speak them.
const normalize = (value) => value.normalize('NFC').replace(/\s+/gu, ' ').replace(/\s*(?:\.{3}|…)$/u, '').trim();
const unescape = (value) => value.replace(/\\(['"])/gu, '$1');
const quoted = String.raw`(?:'((?:\\'|[^'])*)'|"((?:\\"|[^"])*)")`;
const pick = (match) => unescape(match[1] ?? match[2] ?? '');

const entries = new Map();
const addEntry = (languageName, text, source, metadata = {}) => {
  const lang = LANGUAGES[languageName];
  const normalizedText = normalize(text);
  if (!normalizedText) return;
  const mapKey = `${lang.code}:${normalizedText.toLocaleLowerCase(lang.locale)}`;
  const existing = entries.get(mapKey);
  if (existing) {
    existing.sources = [...new Set([...existing.sources, source])];
    if (metadata.english && !existing.english) existing.english = metadata.english;
    if (metadata.pronunciationGuide && !existing.pronunciationGuide) existing.pronunciationGuide = metadata.pronunciationGuide;
    return;
  }
  const hash = crypto.createHash('sha256')
    .update(JSON.stringify({ model, modelVersion, language: lang.code, voice: lang.voice, speed, format, text: normalizedText }))
    .digest('hex')
    .slice(0, 32);
  entries.set(mapKey, {
    id: `${lang.code}-${hash.slice(0, 16)}`,
    text: normalizedText,
    language: lang.code,
    languageName,
    kokoroLang: lang.kokoroLang,
    voice: lang.voice,
    model,
    speed,
    format,
    hash,
    objectKey: `${objectPrefix}/${hash}.mp3`,
    contentType: 'audio/mpeg',
    category: source === 'phonetics' ? 'vocabulary' : 'question-bank',
    source,
    sources: [source],
    status: 'pending',
    ...metadata,
  });
};

for (const [languageName, lang] of Object.entries(LANGUAGES)) {
  // Phonetics dictionary keys: 'word': { phonetic: 'guide', ... }
  const block = phoneticsSource.match(new RegExp(String.raw`const ${lang.phoneticsConst}:[\s\S]*?\n\};`, 'u'))?.[0] || '';
  const keyPattern = new RegExp(String.raw`^\s*${quoted}\s*:\s*\{\s*phonetic:\s*${quoted}`, 'gmu');
  for (const match of block.matchAll(keyPattern)) {
    addEntry(languageName, unescape(match[1] ?? match[2] ?? ''), 'phonetics', { pronunciationGuide: unescape(match[3] ?? match[4] ?? '') });
  }

  // Question bank: one question per line. The prompt is English; options/answer are the target language.
  for (const line of questionSource.split('\n')) {
    if (!line.includes(`topic: '${lang.topicPrefix}`)) continue;
    const english = line.match(new RegExp(String.raw`\bquestion:\s*${quoted}`, 'u'));
    const correct = line.match(new RegExp(String.raw`correctAnswer:\s*${quoted}`, 'u'));
    const options = line.match(/options:\s*\[([^\]]*)\]/u);
    if (options) {
      for (const option of options[1].matchAll(new RegExp(quoted, 'gu'))) addEntry(languageName, pick(option), 'question-bank');
    }
    if (correct) addEntry(languageName, pick(correct), 'question-bank', english ? { english: pick(english) } : {});
  }
}

const sortedEntries = [...entries.values()].sort((a, b) => a.language.localeCompare(b.language) || a.text.localeCompare(b.text, a.language));
const manifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  model,
  modelVersion,
  objectPrefix,
  speed,
  format,
  languages: Object.fromEntries(Object.entries(LANGUAGES).map(([name, l]) => [l.code, { name, voice: l.voice, kokoroLang: l.kokoroLang }])),
  entries: sortedEntries,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
const counts = sortedEntries.reduce((acc, entry) => ({ ...acc, [entry.language]: (acc[entry.language] || 0) + 1 }), {});
console.log(`Wrote ${sortedEntries.length} entries to ${path.relative(projectRoot, outputPath)}`, counts);
