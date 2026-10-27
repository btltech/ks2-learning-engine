#!/usr/bin/env node
// Downloads the quantised Kokoro-82M ONNX model from Hugging Face (Apache-2.0
// repo metadata - confirm the licence before shipping) and uploads it to the
// private app-audio R2 bucket, where functions/api/kokoro-model serves it.
//
//   node scripts/upload-kokoro-model-r2.mjs            # download + upload
//   node scripts/upload-kokoro-model-r2.mjs --download-only
//
// Needs `wrangler` logged in for the upload step.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const bucket = process.env.APP_AUDIO_R2_BUCKET || 'demiwuraks2-app-audio';
const source = 'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main';
const prefix = 'models/kokoro-82m-v1.0';
const downloadOnly = process.argv.includes('--download-only');
const workDir = process.env.KOKORO_MODEL_DIR || path.join(os.tmpdir(), 'kokoro-82m-v1.0');

// Keep in sync with ALLOWED_FILES in functions/api/kokoro-model/[[path]].ts and VOICES in services/kokoroTTS.ts.
const files = [
  ['config.json', 'application/json'],
  ['tokenizer.json', 'application/json'],
  ['tokenizer_config.json', 'application/json'],
  ['onnx/model_quantized.onnx', 'application/octet-stream'],
  ...['bf_emma', 'bf_isabella'].map((voice) => [`voices/${voice}.bin`, 'application/octet-stream']),
];

const run = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: 'inherit' });
  child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`))));
});

for (const [file] of files) {
  const target = path.join(workDir, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (fs.existsSync(target)) continue;
  console.log(`Downloading ${file}`);
  const response = await fetch(`${source}/${file}`);
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
  fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
}

if (downloadOnly) {
  console.log(`Model files are in ${workDir}`);
  process.exit(0);
}

for (const [file, contentType] of files) {
  console.log(`Uploading ${file}`);
  await run('wrangler', [
    'r2', 'object', 'put', `${bucket}/${prefix}/${file}`,
    '--file', path.join(workDir, file),
    '--content-type', contentType,
    '--cache-control', 'public,max-age=31536000,immutable',
    '--remote',
  ]);
}
console.log(JSON.stringify({ bucket, prefix, uploaded: files.length }, null, 2));
