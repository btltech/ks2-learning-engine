#!/usr/bin/env node

// Remove slash-separated alternatives from spoken Yoruba entries. A slash is
// useful in a vocabulary table, but it is not text a learner should hear.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(projectRoot, 'data', 'audio', 'yoruba-audio-manifest.json');
const queuePath = path.join(projectRoot, 'data', 'audio', 'yoruba-expansion-review-queue.json');

const splitVariants = (text) => String(text).split('/').map((part) => part.trim()).filter(Boolean);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const model = manifest.model;
const speed = Number(manifest.speed || 1);
const format = manifest.format || 'mp3';
const hashFor = (text) => crypto.createHash('sha256')
  .update(JSON.stringify({ model, language: 'yo', speed, format, text }))
  .digest('hex');

const nextEntries = new Map();
for (const entry of manifest.entries) {
  const variants = entry.text.includes('/') ? splitVariants(entry.text) : [entry.text];
  for (const text of variants) {
    const hash = hashFor(text);
    const normalized = {
      ...entry,
      id: `yo-${hash.slice(0, 16)}`,
      text,
      hash,
      objectKey: `audio/yoruba/facebook-mms-tts-yor/${speed.toFixed(1)}/${hash}.mp3`,
      reviewNotes: entry.text.includes('/')
        ? [...new Set([...(entry.reviewNotes || []), 'Split from slash-separated source alternatives; review synonym independently'])]
        : entry.reviewNotes,
    };
    if (!nextEntries.has(text)) nextEntries.set(text, normalized);
  }
}
manifest.generatedAt = new Date().toISOString();
manifest.entries = [...nextEntries.values()].sort((a, b) => a.text.localeCompare(b.text, 'yo'));
manifest.expansionStatus = 'owner-approved-for-generation-pending-review';
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
const nextQueue = [];
for (const entry of queue.entries) {
  const variants = entry.text.includes('/') ? splitVariants(entry.text) : [entry.text];
  for (const text of variants) {
    nextQueue.push({
      ...entry,
      text,
      reviewNotes: entry.text.includes('/')
        ? [...new Set([...(entry.reviewNotes || []), 'Split from slash-separated source alternatives; review synonym independently'])]
        : entry.reviewNotes,
    });
  }
}
queue.entries = nextQueue;
queue.pendingCandidateEntries = nextQueue.length;
queue.status = 'pending-native-review';
fs.writeFileSync(queuePath, `${JSON.stringify(queue, null, 2)}\n`);

console.log(`Normalised manifest to ${manifest.entries.length} spoken entries.`);
console.log(`Normalised review queue to ${queue.entries.length} entries.`);
