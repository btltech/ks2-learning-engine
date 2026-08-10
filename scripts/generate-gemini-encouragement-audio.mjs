#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'data/audio/encouragement-lines.json');
const outputDir = path.join(root, 'audio/encouragement/gemini-v1');
const manifestPath = path.join(outputDir, 'manifest.json');
const model = process.env.ENCOURAGEMENT_TTS_MODEL || 'gemini-2.5-flash-preview-tts';
const voice = process.env.ENCOURAGEMENT_TTS_VOICE || 'Sulafat';
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : Number.POSITIVE_INFINITY;
const categoryArg = process.argv.find((arg) => arg.startsWith('--category='));
const selectedCategory = categoryArg?.split('=')[1];
const dryRun = process.argv.includes('--dry-run');
const sampleRate = 24_000;
const style = [
  'Speak as a warm, encouraging British primary-school tutor for children aged seven to eleven.',
  'Sound natural, sincere and upbeat, never exaggerated or babyish.',
  'Use a clear British English accent and an unhurried conversational pace.',
  'Speak only the transcript between the markers. Do not read the directions or markers aloud.',
].join(' ');

function parseEnv(contents) {
  return Object.fromEntries(contents.split(/\r?\n/).flatMap((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return [];
    const separator = trimmed.indexOf('=');
    if (separator < 1) return [];
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    return [[key, value]];
  }));
}

async function getApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const local = parseEnv(await fs.readFile(path.join(root, '.env.local'), 'utf8'));
    return local.GEMINI_API_KEY || local.VITE_GEMINI_API_KEY;
  } catch {
    return undefined;
  }
}

function stableHash(text, language) {
  return createHash('sha256')
    .update(JSON.stringify({ model, voice, language, style, text: text.normalize('NFC') }))
    .digest('hex')
    .slice(0, 32);
}

function wavBuffer(pcm) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited ${code}: ${stderr.slice(-800)}`)));
  });
}

async function generatePcm(apiKey, text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const prompt = `${style}\n\n<TRANSCRIPT>\n${text}\n</TRANSCRIPT>`;
  let lastError;
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        const error = new Error(payload?.error?.message || `Gemini returned HTTP ${response.status}`);
        error.status = response.status;
        error.retryAfter = response.headers.get('retry-after');
        throw error;
      }
      const part = payload?.candidates?.[0]?.content?.parts?.find((item) => item.inlineData?.data);
      if (!part?.inlineData?.data) throw new Error('Gemini returned no audio data');
      return { pcm: Buffer.from(part.inlineData.data, 'base64'), mimeType: part.inlineData.mimeType || 'audio/L16;codec=pcm;rate=24000' };
    } catch (error) {
      lastError = error;
      if (attempt < 8) {
        const messageDelay = Number(error.message.match(/retry in ([0-9.]+)s/i)?.[1] || 0) * 1000;
        const headerDelay = Number(error.retryAfter || 0) * 1000;
        const retryDelay = error.status === 429
          ? Math.max(5_000, messageDelay, headerDelay) + 1_000
          : attempt * 1_000;
        console.warn(`Gemini request failed (attempt ${attempt}); retrying in ${Math.ceil(retryDelay / 1000)}s.`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }
  throw lastError;
}

const source = JSON.parse(await fs.readFile(sourcePath, 'utf8'));
const entries = Object.entries(source.categories).flatMap(([category, lines]) => lines.map((text, index) => {
  const hash = stableHash(text, source.language);
  return {
    id: `${category}-${String(index + 1).padStart(2, '0')}`,
    category,
    text,
    language: source.language,
    model,
    voice,
    hash,
    objectKey: `audio/encouragement/gemini-v1/${hash}.mp3`,
    contentType: 'audio/mpeg',
    file: `audio/encouragement/gemini-v1/${hash}.mp3`,
  };
})).filter((entry) => !selectedCategory || entry.category === selectedCategory).slice(0, limit);

if (dryRun) {
  console.log(JSON.stringify({ model, voice, count: entries.length, categories: [...new Set(entries.map((entry) => entry.category))] }, null, 2));
  process.exit(0);
}

const apiKey = await getApiKey();
if (!apiKey) throw new Error('Set GEMINI_API_KEY or VITE_GEMINI_API_KEY in .env.local');
await fs.mkdir(outputDir, { recursive: true });

let generated = 0;
let reused = 0;
for (const [index, entry] of entries.entries()) {
  const mp3Path = path.join(root, entry.file);
  try {
    await fs.access(mp3Path);
    reused += 1;
  } catch {
    const { pcm } = await generatePcm(apiKey, entry.text);
    const wavPath = path.join(outputDir, `${entry.hash}.wav`);
    await fs.writeFile(wavPath, wavBuffer(pcm));
    await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', wavPath, '-af', 'apad=pad_dur=0.18', '-codec:a', 'libmp3lame', '-b:a', '96k', mp3Path]);
    await fs.unlink(wavPath);
    generated += 1;
  }
  console.log(`[${index + 1}/${entries.length}] ${entry.id}: ${entry.text}`);
}

const manifest = {
  version: source.version,
  generatedAt: new Date().toISOString(),
  prefix: 'audio/encouragement/gemini-v1',
  model,
  voice,
  language: source.language,
  style,
  entries,
};
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ generated, reused, total: entries.length, manifestPath }, null, 2));
