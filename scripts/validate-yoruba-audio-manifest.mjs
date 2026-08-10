import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(projectRoot, 'data', 'audio', 'yoruba-audio-manifest.json');
const queuePath = path.join(projectRoot, 'data', 'audio', 'yoruba-expansion-review-queue.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const queue = fs.existsSync(queuePath) ? JSON.parse(fs.readFileSync(queuePath, 'utf8')) : null;

const errors = [];
const warnings = [];
const seen = new Set();
const toneOrUnderdot = /[ẸẹỌọṢṣÀàÁáÈèÉéÌìÍíÒòÓóÙùÚú]/u;
const mojibake = /[�]|Ã.|Â.|Ð.|Ñ./u;

for (const [index, entry] of manifest.entries.entries()) {
  const label = `entries[${index}]`;
  if (typeof entry.text !== 'string' || !entry.text.trim()) errors.push(`${label}: missing text`);
  if (entry.text !== entry.text.normalize('NFC')) errors.push(`${label}: text is not NFC-normalized`);
  if (seen.has(entry.text)) errors.push(`${label}: duplicate exact text`);
  seen.add(entry.text);
  if (!entry.sources?.length) errors.push(`${label}: missing source`);
  if (!entry.category) errors.push(`${label}: missing category`);
  if (entry.text && !toneOrUnderdot.test(entry.text)) warnings.push(`${label}: no Yoruba tone/underdot character (${entry.text})`);
  if (entry.text && mojibake.test(entry.text)) errors.push(`${label}: possible mojibake in text`);
}

const pendingCount = queue?.entries?.length || 0;
const combinedCount = manifest.entries.length >= (manifest.targetUniqueEntries || 450)
  ? manifest.entries.length
  : manifest.entries.length + pendingCount;
if (combinedCount < 400) {
  warnings.push(`Expansion target not reached: ${combinedCount}/${manifest.targetUniqueEntries || 450} combined entries`);
}

if (errors.length) {
  console.error(`Yoruba manifest validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Yoruba production manifest passed structural validation: ${manifest.entries.length} unique entries`);
  if (queue) console.log(`Pending expansion queue: ${pendingCount}; combined Phase 1 inventory: ${combinedCount}/${manifest.targetUniqueEntries || 450}`);
}
if (warnings.length) {
  console.warn(`Warnings (${warnings.length}):`);
  for (const warning of warnings.slice(0, 20)) console.warn(`- ${warning}`);
  if (warnings.length > 20) console.warn(`- ...and ${warnings.length - 20} more`);
}
