import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = path.join(root, 'audio', 'yoruba', 'f5-450-audit', 'asr-report.json');
const mapPath = path.join(root, 'audio', 'yoruba', 'f5-auto-repair', 'replacement-map.json');
const providerMapPath = path.join(root, 'audio', 'yoruba', 'f5-provider-repair', 'provider-replacement-map.json');
const outputPath = path.join(root, 'audio', 'yoruba', 'f5-450-audit', 'asr-report-after-repair.json');

const plain = (value) => String(value ?? '').normalize('NFD').toLowerCase()
  .replaceAll('ẹ', 'e').replaceAll('ọ', 'o').replaceAll('ṣ', 's')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const report = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const providerMap = fs.existsSync(providerMapPath) ? JSON.parse(fs.readFileSync(providerMapPath, 'utf8')) : { accepted: [] };
const accepted = new Map((map.accepted || []).map((item) => [item.text, item]));
for (const item of providerMap.accepted || []) accepted.set(item.text, item);
const rows = report.rows.map((row) => {
  const replacement = accepted.get(row.text);
  if (!replacement) return row;
  const transcript = replacement.replacementAsr?.transcript || row.transcript;
  const normalizedExpected = plain(row.text);
  const normalizedTranscript = plain(transcript);
  const expectedTokens = normalizedExpected.split(/\s+/).filter(Boolean);
  const observedTokens = normalizedTranscript.split(/\s+/).filter(Boolean);
  return {
    ...row,
    audioPath: replacement.replacementAudio,
    asrStatus: replacement.replacementAsr?.status || row.asrStatus,
    transcript,
    normalizedExpected,
    normalizedTranscript,
    characterSimilarity: replacement.replacementAsr?.similarity ?? row.characterSimilarity,
    firstTokenMatch: Boolean(expectedTokens[0] && observedTokens[0] && expectedTokens[0] === observedTokens[0]),
    autoRepaired: true,
    originalAudioPath: replacement.originalAudio,
  };
});
const statuses = ['likely-failure', 'review', 'likely-match', 'missing-audio'];
const counts = Object.fromEntries(statuses.map((status) => [status, rows.filter((row) => row.asrStatus === status).length]));
fs.writeFileSync(outputPath, `${JSON.stringify({ ...report, source: 'after-auto-repair', counts, rows }, null, 2)}\n`);
console.log(JSON.stringify({ output: path.relative(root, outputPath), counts, repaired: rows.filter((row) => row.autoRepaired).length }, null, 2));
