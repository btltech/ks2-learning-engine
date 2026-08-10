import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = JSON.parse(fs.readFileSync(path.join(root, 'audio/yoruba/f5-450-audit/asr-report-after-repair.json'), 'utf8'));
const provider = JSON.parse(fs.readFileSync(path.join(root, 'audio/yoruba/f5-provider-repair/yarngpt-asr-report.json'), 'utf8'));
const providerAudio = JSON.parse(fs.readFileSync(path.join(root, 'audio/yoruba/yarngpt-idera/1.0/generation-report.json'), 'utf8'));
const baseByText = new Map(base.rows.map((row) => [row.text, row]));
const audioByText = new Map(providerAudio.generated.map((row) => [row.text, row.path]));
const score = (row) => {
  const expected = String(row.normalizedExpected || '').trim();
  const observed = String(row.normalizedTranscript || '').trim();
  let value = Number(row.characterSimilarity || 0) + (row.firstTokenMatch ? 0.12 : 0);
  if (expected && observed.length > expected.length * 1.45) value -= 0.35;
  if (row.asrStatus === 'likely-match') value += 0.18;
  else if (row.asrStatus === 'review') value += 0.05;
  return value;
};
const accepted = [];
const unresolved = [];
for (const candidate of provider.rows) {
  const original = baseByText.get(candidate.text);
  if (!original) continue;
  if (score(candidate) > score(original) + 0.05) {
    accepted.push({
      text: candidate.text,
      english: candidate.english,
      originalAudio: original.audioPath,
      replacementAudio: path.relative(root, audioByText.get(candidate.text)),
      originalAsr: { status: original.asrStatus, transcript: original.transcript, similarity: original.characterSimilarity },
      replacementAsr: { status: candidate.asrStatus, transcript: candidate.transcript, similarity: candidate.characterSimilarity },
    });
  } else {
    unresolved.push({ text: candidate.text, originalAsr: { status: original.asrStatus, similarity: original.characterSimilarity }, providerAsr: { status: candidate.asrStatus, similarity: candidate.characterSimilarity } });
  }
}
const output = path.join(root, 'audio/yoruba/f5-provider-repair/provider-replacement-map.json');
fs.writeFileSync(output, `${JSON.stringify({ provider: 'yarngpt-Idera', sourceCount: provider.rows.length, acceptedCount: accepted.length, unresolvedCount: unresolved.length, accepted, unresolved, note: 'Only candidates with a measurable ASR improvement over the current canonical clip are selected automatically.' }, null, 2)}\n`);
console.log(JSON.stringify({ output: path.relative(root, output), source: provider.rows.length, accepted: accepted.length, unresolved: unresolved.length }, null, 2));
