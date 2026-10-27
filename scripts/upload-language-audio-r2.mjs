#!/usr/bin/env node
// Uploads reviewed French/Spanish pronunciation MP3s to the private app-audio R2 bucket.
// Run scripts/generate-language-audio.py first and LISTEN to the files.
//
//   node scripts/upload-language-audio-r2.mjs                       # everything in the generated manifest
//   node scripts/upload-language-audio-r2.mjs --approved-ids a,b,c  # only these ids (manifest is trimmed to match)

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bucket = process.env.APP_AUDIO_R2_BUCKET || 'demiwuraks2-app-audio';
const audioDir = path.join(root, process.env.LANGUAGE_AUDIO_DIR || 'audio/languages/kokoro-82m-v1.0');
const manifestPath = path.join(audioDir, 'manifest.json');
const concurrency = Number(process.env.APP_AUDIO_R2_CONCURRENCY || 6);

const approvedArg = process.argv.indexOf('--approved-ids');
const approved = approvedArg > -1 ? new Set(process.argv[approvedArg + 1].split(',').map((id) => id.trim()).filter(Boolean)) : null;

if (!fs.existsSync(manifestPath)) throw new Error(`Missing ${manifestPath}. Run scripts/generate-language-audio.py first.`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (approved) {
  const unknown = [...approved].filter((id) => !manifest.entries.some((entry) => entry.id === id));
  if (unknown.length) throw new Error(`Unknown approved id(s): ${unknown.join(', ')}`);
  manifest.entries = manifest.entries.filter((entry) => approved.has(entry.id));
}
if (!manifest.entries.length) throw new Error('Nothing to upload.');

const put = (objectKey, file, contentType, cacheControl, attempt = 1) => new Promise((resolve, reject) => {
  const child = spawn('wrangler', [
    'r2', 'object', 'put', `${bucket}/${objectKey}`,
    '--file', file, '--content-type', contentType, '--cache-control', cacheControl, '--remote',
  ], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
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
    const entry = manifest.entries[next++];
    if (!entry) return;
    await put(entry.objectKey, path.join(audioDir, `${entry.hash}.mp3`), entry.contentType || 'audio/mpeg', 'public,max-age=31536000,immutable');
    completed += 1;
    if (completed % 10 === 0 || completed === manifest.entries.length) console.log(`Uploaded ${completed}/${manifest.entries.length}`);
  }
};
await Promise.all(Array.from({ length: Math.min(concurrency, manifest.entries.length) }, worker));

// Manifest last, so the app never lists audio that has not finished uploading.
const trimmedPath = path.join(audioDir, 'manifest.upload.json');
fs.writeFileSync(trimmedPath, `${JSON.stringify(manifest, null, 2)}\n`);
await put(`audio/languages/${manifest.version}/manifest.json`, trimmedPath, 'application/json; charset=utf-8', 'public,max-age=300,must-revalidate');
console.log(JSON.stringify({ bucket, uploaded: manifest.entries.length, manifest: true }, null, 2));
