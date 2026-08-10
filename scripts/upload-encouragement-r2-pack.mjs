#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bucket = process.env.APP_AUDIO_R2_BUCKET || 'demiwuraks2-app-audio';
const manifestPath = path.join(root, process.env.APP_AUDIO_R2_MANIFEST || 'audio/encouragement/gemini-v1/manifest.json');
const concurrency = Number(process.env.APP_AUDIO_R2_CONCURRENCY || 6);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const put = (objectKey, file, contentType, cacheControl, attempt = 1) => new Promise((resolve, reject) => {
  const child = spawn('wrangler', [
    'r2', 'object', 'put', `${bucket}/${objectKey}`,
    '--file', file,
    '--content-type', contentType,
    '--cache-control', cacheControl,
    '--remote',
  ], {
    cwd: root,
    env: { ...process.env, WRANGLER_LOG_PATH: '/tmp/wrangler-app-audio-upload.log' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.on('close', (code) => {
    if (code === 0) resolve();
    else if (attempt < 3) setTimeout(() => put(objectKey, file, contentType, cacheControl, attempt + 1).then(resolve, reject), attempt * 1000);
    else reject(new Error(`${objectKey}: exit ${code}: ${stderr.slice(-500)}`));
  });
});

let next = 0;
let completed = 0;
const worker = async () => {
  while (true) {
    const index = next++;
    if (index >= manifest.entries.length) return;
    const entry = manifest.entries[index];
    await put(entry.objectKey, path.join(root, entry.file), entry.contentType || 'audio/mpeg', 'public,max-age=31536000,immutable');
    completed += 1;
    if (completed % 10 === 0 || completed === manifest.entries.length) console.log(`Uploaded ${completed}/${manifest.entries.length}`);
  }
};

await Promise.all(Array.from({ length: Math.min(concurrency, manifest.entries.length) }, worker));
await put(`${manifest.prefix}/manifest.json`, manifestPath, 'application/json; charset=utf-8', 'public,max-age=300,must-revalidate');
console.log(JSON.stringify({ bucket, uploaded: manifest.entries.length, prefix: manifest.prefix, manifest: true }, null, 2));
