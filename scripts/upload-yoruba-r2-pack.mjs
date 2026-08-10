#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bucket = process.env.YORUBA_R2_BUCKET || 'demiwuraks2-yoruba-audio';
const manifestPath = path.join(root, process.env.YORUBA_R2_MANIFEST || 'audio/yoruba/r2-pack-curated-450/manifest.json');
const concurrency = Number(process.env.YORUBA_R2_CONCURRENCY || 6);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const entries = manifest.entries;

const upload = (entry, attempt = 1) => new Promise((resolve, reject) => {
  const file = path.join(root, entry.file);
  const args = [
    'r2', 'object', 'put', `${bucket}/${entry.objectKey}`,
    '--file', file,
    '--content-type', entry.contentType || 'audio/mpeg',
    '--cache-control', 'public,max-age=31536000,immutable',
    '--remote',
  ];
  const child = spawn('wrangler', args, {
    cwd: root,
    env: { ...process.env, WRANGLER_LOG_PATH: '/tmp/wrangler-r2-upload.log' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.on('close', (code) => {
    if (code === 0) resolve();
    else if (attempt < 3) setTimeout(() => upload(entry, attempt + 1).then(resolve, reject), attempt * 1000);
    else reject(new Error(`${entry.objectKey}: exit ${code}: ${stderr.slice(-500)}`));
  });
});

let next = 0;
let completed = 0;
const worker = async () => {
  while (true) {
    const index = next++;
    if (index >= entries.length) return;
    await upload(entries[index]);
    completed += 1;
    if (completed % 25 === 0 || completed === entries.length) console.log(`Uploaded ${completed}/${entries.length}`);
  }
};
await Promise.all(Array.from({ length: Math.min(concurrency, entries.length) }, worker));
console.log(JSON.stringify({ bucket, uploaded: entries.length, prefix: manifest.prefix }, null, 2));
