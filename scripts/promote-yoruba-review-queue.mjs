import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(projectRoot, 'data', 'audio', 'yoruba-audio-manifest.json');
const queuePath = path.join(projectRoot, 'data', 'audio', 'yoruba-expansion-review-queue.json');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
const model = manifest.model || 'facebook/mms-tts-yor';
const speed = Number(manifest.speed || 1);
const format = manifest.format || 'mp3';
const entries = new Map(manifest.entries.map((entry) => [entry.text, entry]));

for (const candidate of queue.entries) {
  if (entries.has(candidate.text)) continue;
  const hash = crypto.createHash('sha256')
    .update(JSON.stringify({ model, language: 'yo', speed, format, text: candidate.text }))
    .digest('hex');
  entries.set(candidate.text, {
    id: `yo-${hash.slice(0, 16)}`,
    text: candidate.text,
    language: 'yo',
    model,
    speed,
    format,
    hash,
    category: candidate.category,
    source: candidate.source,
    sources: [candidate.source],
    sourceLicense: candidate.sourceLicense,
    english: candidate.english,
    objectKey: `audio/yoruba/facebook-mms-tts-yor/${speed.toFixed(1)}/${hash}.mp3`,
    contentType: 'audio/mpeg',
    status: 'pending-audio-review',
    reviewed: false,
    ownerApproved: true,
    ownerApprovalNote: 'Approved by project owner for initial generation; revisit pronunciation/content as needed.',
    reviewNotes: candidate.reviewNotes,
  });
}

const promotedEntries = [...entries.values()].sort((a, b) => a.text.localeCompare(b.text, 'yo'));
const promotedManifest = {
  ...manifest,
  generatedAt: new Date().toISOString(),
  targetUniqueEntries: 450,
  expansionStatus: 'owner-approved-for-generation-pending-review',
  entries: promotedEntries,
};

fs.writeFileSync(manifestPath, `${JSON.stringify(promotedManifest, null, 2)}\n`);
console.log(`Promoted ${promotedEntries.length} Yoruba entries into the production manifest.`);
