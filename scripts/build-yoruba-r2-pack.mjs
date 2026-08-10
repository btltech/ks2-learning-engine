#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const auditPath = path.join(root, 'audio/yoruba/f5-450-audit/audit-report.json');
const asrPath = path.join(root, 'audio/yoruba/f5-450-audit/asr-report-after-repair.json');
const packDir = path.join(root, 'audio/yoruba/r2-pack-curated-450');
const prefix = process.env.YORUBA_R2_PREFIX || 'audio/yoruba/curated-450-v1';
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
const asr = JSON.parse(fs.readFileSync(asrPath, 'utf8'));
const asrByText = new Map(asr.rows.map((row) => [row.text, row]));
const sha = (text) => crypto.createHash('sha256').update(text.normalize('NFC')).digest('hex').slice(0, 32);

fs.mkdirSync(packDir, { recursive: true });
const entries = [];
for (const [index, row] of audit.rows.entries()) {
  if (!row.audioPath) throw new Error(`Missing audio path for ${row.text}`);
  const source = path.join(root, row.audioPath);
  if (!fs.existsSync(source)) throw new Error(`Missing source audio: ${row.audioPath}`);
  const hash = sha(row.text);
  const filename = `${hash}.mp3`;
  const output = path.join(packDir, filename);
  if (!fs.existsSync(output) || fs.statSync(output).size === 0) {
    const result = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', source, '-codec:a', 'libmp3lame', '-q:a', '3', output], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(`ffmpeg failed for ${row.text}: ${result.stderr || 'unknown error'}`);
  }
  const asrRow = asrByText.get(row.text) || {};
  entries.push({
    index: index + 1,
    text: row.text,
    english: row.english,
    hash,
    objectKey: `${prefix}/${filename}`,
    file: path.relative(root, output),
    contentType: 'audio/mpeg',
    corrected: Boolean(row.corrected || asrRow.autoRepaired),
    asrStatus: asrRow.asrStatus || null,
    provider: asrRow.autoRepaired ? (asrRow.audioPath?.includes('yarngpt') ? 'yarngpt-idera' : 'f5-tts') : 'f5-tts',
  });
  if ((index + 1) % 25 === 0) console.log(`Prepared ${index + 1}/${audit.rows.length}`);
}
const manifest = {
  language: 'yo',
  version: 'curated-450-v1',
  prefix,
  generatedAt: new Date().toISOString(),
  total: entries.length,
  note: 'Full local 450-entry Yoruba pack. Originals and unresolved variants remain in the repository; this manifest points to the current canonical selection.',
  entries,
};
fs.writeFileSync(path.join(packDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ pack: path.relative(root, packDir), total: entries.length, bytes: entries.reduce((sum, entry) => sum + fs.statSync(path.join(root, entry.file)).size, 0) }, null, 2));
