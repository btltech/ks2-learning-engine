#!/usr/bin/env node

// Generate a local YarnGPT Yoruba comparison set. This never uploads audio.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const projectRoot = process.cwd();
const manifestPath = path.resolve(projectRoot, process.env.YORUBA_MANIFEST || 'data/audio/yoruba-audio-manifest.json');
const voice = process.env.YARNGPT_VOICE || 'Idera';
const padMs = Number(process.env.YARNGPT_PAD_MS || 350);
const outputRoot = path.resolve(projectRoot, process.env.YORUBA_YARNGPT_OUTPUT || `audio/yoruba/yarngpt-${voice.toLowerCase()}/1.0`);
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice('--limit='.length)) : 20;
const entriesFileArg = process.argv.find((arg) => arg.startsWith('--entries-file='));

if (!Number.isInteger(limit) || limit < 1) throw new Error('--limit must be a positive integer');

const readEnvKey = () => {
  if (process.env.YARNGPT_API_KEY) return process.env.YARNGPT_API_KEY;
  const envPath = path.resolve(projectRoot, '.env.local');
  if (!fs.existsSync(envPath)) return null;
  const line = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).find((item) => item.startsWith('YARNGPT_API_KEY='));
  return line ? line.slice(line.indexOf('=') + 1).trim() : null;
};

const apiKey = readEnvKey();
if (!apiKey) throw new Error('YARNGPT_API_KEY is not configured. Add it to .env.local or the environment; never commit it.');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const entries = entriesFileArg
  ? JSON.parse(fs.readFileSync(path.resolve(projectRoot, entriesFileArg.slice('--entries-file='.length)), 'utf8')).slice(0, limit)
  : manifest.entries.slice(0, limit);
fs.mkdirSync(outputRoot, { recursive: true });
const generated = [];

for (const [index, entry] of entries.entries()) {
  if (entry.text.includes('/')) {
    throw new Error(`Slash-separated alternatives are not valid spoken text: ${entry.text}. Run scripts/normalize-yoruba-audio-text.mjs first.`);
  }
  const stableHash = entry.hash || createHash('sha256').update(`${entry.text}|${voice}|${padMs}`).digest('hex').slice(0, 20);
  const outputPath = path.join(outputRoot, `${stableHash}.mp3`);
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
    generated.push({ id: entry.id, text: entry.text, english: entry.english, path: outputPath, status: 'existing' });
    console.log(`[${index + 1}/${entries.length}] exists: ${entry.text}`);
    continue;
  }
  const response = await fetch('https://yarngpt.ai/api/v1/tts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({ text: entry.text, voice, response_format: 'mp3' }),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`YarnGPT failed for ${entry.id}: ${response.status} ${message.slice(0, 300)}`);
  }
  const rawPath = `${outputPath}.raw`;
  fs.writeFileSync(rawPath, Buffer.from(await response.arrayBuffer()));
  const ffmpeg = spawnSync('ffmpeg', [
    '-y', '-v', 'error', '-i', rawPath,
    '-af', `apad=pad_dur=${Math.max(0, padMs) / 1000}`,
    '-codec:a', 'libmp3lame', '-b:a', '96k', outputPath,
  ], { encoding: 'utf8' });
  fs.rmSync(rawPath, { force: true });
  if (ffmpeg.status !== 0) throw new Error(`ffmpeg failed for ${entry.id}: ${ffmpeg.stderr || 'unknown error'}`);
  generated.push({ id: entry.id, text: entry.text, english: entry.english, path: outputPath, status: 'generated' });
  console.log(`[${index + 1}/${entries.length}] generated: ${entry.text}`);
}

const reportPath = path.join(outputRoot, 'generation-report.json');
fs.writeFileSync(reportPath, `${JSON.stringify({ provider: 'yarngpt', voice, language: 'yo', padMs, generated }, null, 2)}\n`);
console.log(`Wrote ${generated.length} local samples to ${path.relative(projectRoot, outputRoot)}`);
