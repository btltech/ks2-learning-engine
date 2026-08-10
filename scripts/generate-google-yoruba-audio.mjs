#!/usr/bin/env node

// Generate a small local Google Cloud TTS comparison set.
// This calls Google only for the requested samples and never uploads audio.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const manifestPath = path.resolve(projectRoot, process.env.YORUBA_MANIFEST || 'data/audio/yoruba-audio-manifest.json');
const outputRoot = path.resolve(projectRoot, process.env.YORUBA_GOOGLE_OUTPUT || 'audio/yoruba/google-en-US-Neural2-C/1.0');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice('--limit='.length)) : 20;
const voiceName = process.env.GOOGLE_YORUBA_VOICE || 'en-US-Neural2-C';
const languageCode = process.env.GOOGLE_YORUBA_LANGUAGE || 'en-US';

if (!Number.isInteger(limit) || limit < 1) throw new Error('--limit must be a positive integer');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const entries = manifest.entries.slice(0, limit);
if (!entries.length) throw new Error('No manifest entries found');

const readEnvKey = () => {
  const envKey = process.env.VITE_GOOGLE_CLOUD_TTS_API_KEY;
  if (envKey) return envKey;
  const envPath = path.resolve(projectRoot, '.env.local');
  if (!fs.existsSync(envPath)) return null;
  const line = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).find((item) => item.startsWith('VITE_GOOGLE_CLOUD_TTS_API_KEY='));
  return line ? line.slice(line.indexOf('=') + 1).trim() : null;
};

const apiKey = readEnvKey();
if (!apiKey) throw new Error('VITE_GOOGLE_CLOUD_TTS_API_KEY is not configured');

fs.mkdirSync(outputRoot, { recursive: true });
const generated = [];
for (const [index, entry] of entries.entries()) {
  const outputPath = path.join(outputRoot, `${entry.hash}.mp3`);
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
    generated.push({ id: entry.id, text: entry.text, english: entry.english, path: outputPath, status: 'existing' });
    console.log(`[${index + 1}/${entries.length}] exists: ${entry.text}`);
    continue;
  }
  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text: entry.text },
      voice: { languageCode, name: voiceName, ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3', sampleRateHertz: 24000, speakingRate: 0.9, pitch: 0 },
    }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.audioContent) {
    throw new Error(`Google TTS failed for ${entry.id}: ${response.status} ${payload?.error?.message || 'missing audio'}`);
  }
  fs.writeFileSync(outputPath, Buffer.from(payload.audioContent, 'base64'));
  generated.push({ id: entry.id, text: entry.text, english: entry.english, path: outputPath, status: 'generated' });
  console.log(`[${index + 1}/${entries.length}] generated: ${entry.text}`);
}

const reportPath = path.join(outputRoot, 'generation-report.json');
fs.writeFileSync(reportPath, `${JSON.stringify({ provider: 'google-cloud-tts', voiceName, languageCode, language: 'yo', generated }, null, 2)}\n`);
console.log(`Wrote ${generated.length} local samples to ${path.relative(projectRoot, outputRoot)}`);
console.log(`Report: ${path.relative(projectRoot, reportPath)}`);
