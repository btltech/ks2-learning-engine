import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const map = JSON.parse(fs.readFileSync(path.join(root, 'audio/yoruba/f5-auto-repair/replacement-map.json'), 'utf8'));
const report = JSON.parse(fs.readFileSync(path.join(root, 'audio/yoruba/f5-450-audit/asr-report.json'), 'utf8'));
const english = new Map(report.rows.map((row) => [row.text, row.english || '']));
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice('--limit='.length)) : 80;
const entries = map.unresolved.slice(0, limit).map((row, index) => ({
  id: `provider-repair-${String(index + 1).padStart(3, '0')}`,
  text: row.text,
  english: english.get(row.text) || '',
}));
if (entries.some((entry) => !entry.english)) throw new Error('Every repair entry must have an English translation');
const output = path.join(root, 'audio/yoruba/f5-provider-repair/yarngpt-entries.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(entries, null, 2)}\n`);
console.log(JSON.stringify({ output: path.relative(root, output), entries: entries.length, remaining: map.unresolved.length - entries.length }, null, 2));
