#!/usr/bin/env node

/**
 * Audit the canonical local Yoruba F5 review packs without uploading audio.
 * The audit is deliberately conservative: it can prove file/metadata health,
 * but it does not claim that an online TTS/reference has the correct tone.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultReports = [
  'audio/yoruba/f5-user-batch-25/generation-report.json',
  'audio/yoruba/f5-user-batch-50/generation-report.json',
  'audio/yoruba/f5-user-batch-75-unique/generation-report.json',
  'audio/yoruba/f5-user-batch-125-unique/generation-report.json',
  'audio/yoruba/f5-user-batch-225-unique/generation-report.json',
  'audio/yoruba/f5-user-batch-325-unique/generation-report.json',
  'audio/yoruba/f5-user-batch-450-unique/generation-report.json',
];
const outputDir = path.join(projectRoot, 'audio', 'yoruba', 'f5-450-audit');
const translations = JSON.parse(fs.readFileSync(
  path.join(projectRoot, 'data', 'audio', 'yoruba-f5-review-translations.json'),
  'utf8',
));
const manifest = JSON.parse(fs.readFileSync(
  path.join(projectRoot, 'data', 'audio', 'yoruba-audio-manifest.json'),
  'utf8',
));

const key = (value) => String(value ?? '').normalize('NFC').trim().casefold?.() || String(value ?? '').normalize('NFC').trim().toLocaleLowerCase('yo');
const entriesByKey = new Map(manifest.entries.map((entry) => [key(entry.text), entry]));

const readReport = (reportPath) => JSON.parse(fs.readFileSync(reportPath, 'utf8')).generated || [];

// Corrections already approved during the first two batches. Keep originals
// intact; the audit points at the corrected local clip as the canonical one.
const correctionReports = [
  'audio/yoruba/f5-user-corrections-1/generation-report.json',
  'audio/yoruba/f5-user-corrections-2/generation-report.json',
  'audio/yoruba/f5-user-corrections-3/generation-report.json',
];
const correctionByText = new Map();
// Automatically selected replacements are kept separate from the original
// packs. They become the canonical path only after the ASR comparison has
// shown a measurable improvement; approved human recordings below still win.
const autoRepairMapPath = path.join(projectRoot, 'audio', 'yoruba', 'f5-auto-repair', 'replacement-map.json');
if (fs.existsSync(autoRepairMapPath)) {
  const autoRepair = JSON.parse(fs.readFileSync(autoRepairMapPath, 'utf8'));
  for (const item of autoRepair.accepted || []) {
    correctionByText.set(key(item.text), path.join(projectRoot, item.replacementAudio));
  }
}
for (const report of correctionReports) {
  if (!fs.existsSync(path.join(projectRoot, report))) continue;
  for (const item of readReport(path.join(projectRoot, report))) correctionByText.set(key(item.text), item.path);
}
const approvedMapPath = path.join(projectRoot, 'audio/yoruba/f5-user-batch-50/approved-corrections.json');
if (fs.existsSync(approvedMapPath)) {
  const approved = JSON.parse(fs.readFileSync(approvedMapPath, 'utf8'));
  for (const item of approved.corrections || []) correctionByText.set(key(item.text), path.join(projectRoot, item.approved));
}
// A small YarnGPT fallback set is allowed to override an F5 replacement only
// when its independent ASR score improved. Human-approved recordings remain
// protected because the provider queue excludes them.
const providerRepairMapPath = path.join(projectRoot, 'audio', 'yoruba', 'f5-provider-repair', 'provider-replacement-map.json');
if (fs.existsSync(providerRepairMapPath)) {
  const providerRepair = JSON.parse(fs.readFileSync(providerRepairMapPath, 'utf8'));
  for (const item of providerRepair.accepted || []) {
    correctionByText.set(key(item.text), path.join(projectRoot, item.replacementAudio));
  }
}
// The original first-batch report used Adé without the initial À. The approved
// correction is stored under the correctly marked spelling.
correctionByText.set(key('Lónìí, Adé lọ sí ọjà pẹ̀lú ìyá rẹ̀.'), correctionByText.get(key('Lónìí, Àdé lọ sí ọjà pẹ̀lú ìyá rẹ̀.')));

const ffprobeDuration = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) return null;
  const result = spawnSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', filePath,
  ], { encoding: 'utf8' });
  const value = Number.parseFloat(result.stdout?.trim());
  return Number.isFinite(value) ? value : null;
};

const reports = process.argv.slice(2).length > 0 ? process.argv.slice(2) : defaultReports;
const seen = new Map();
const rows = [];
for (const relativeReport of reports) {
  const reportPath = path.resolve(projectRoot, relativeReport);
  if (!fs.existsSync(reportPath)) throw new Error(`Missing report: ${relativeReport}`);
  for (const item of readReport(reportPath)) {
    const normalized = key(item.text);
    const manifestEntry = entriesByKey.get(normalized) || {};
    const correctionPath = correctionByText.get(normalized);
    const audioPath = correctionPath || item.path;
    const duration = ffprobeDuration(audioPath);
    const english = item.english || translations[item.text] || manifestEntry.english || '';
    const tokens = item.text.trim().split(/\s+/).filter(Boolean);
    const phraseLike = tokens.length >= 3 || /[.!?;:…]/u.test(item.text);
    const flags = [];
    if (seen.has(normalized)) flags.push('duplicate-text');
    if (!english.trim()) flags.push('missing-english');
    if (!audioPath || !fs.existsSync(audioPath)) flags.push('missing-audio');
    if (duration === null) flags.push('unreadable-audio');
    else if (duration < 0.3) flags.push('too-short');
    if (!phraseLike) flags.push('word-or-short-fragment');
    if (!manifestEntry.pronunciationGuide && !phraseLike) flags.push('no-pronunciation-guide');
    const status = flags.some((flag) => ['missing-english', 'missing-audio', 'unreadable-audio', 'too-short', 'duplicate-text'].includes(flag))
      ? 'needs-fix'
      : flags.length > 0 ? 'human-review' : 'auto-pass';
    const row = {
      text: item.text,
      english,
      status,
      flags,
      durationSeconds: duration === null ? null : Number(duration.toFixed(2)),
      audioPath: audioPath ? path.relative(projectRoot, path.resolve(audioPath)) : null,
      sourceReport: relativeReport,
      corrected: Boolean(correctionPath),
      pronunciationGuide: manifestEntry.pronunciationGuide || null,
      externalReferences: {
        forvo: `https://forvo.com/languages/yo/`,
        uclaPhonetics: 'https://archive.phonetics.ucla.edu/Language/YOR/yor.html',
        yorubaDico: 'https://www.yorubadico.com/',
      },
    };
    rows.push(row);
    seen.set(normalized, row);
  }
}

const counts = rows.reduce((result, row) => {
  result[row.status] = (result[row.status] || 0) + 1;
  return result;
}, {});
const report = {
  generatedAt: new Date().toISOString(),
  scope: 'canonical local Yoruba F5 packs 1–450',
  note: 'auto-pass means structural checks passed; it is not a claim that Yoruba tone/prosody is native-perfect.',
  externalReferenceSources: [
    { name: 'UCLA Phonetics Archive', url: 'https://archive.phonetics.ucla.edu/Language/YOR/yor.html', use: 'word-list audio comparison' },
    { name: 'Forvo Yoruba', url: 'https://forvo.com/languages/yo/', use: 'community pronunciation reference; verify reuse rights' },
    { name: 'YorùbáDico', url: 'https://www.yorubadico.com/', use: 'tone-marked definitions and listening reference' },
  ],
  counts,
  rows,
};
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'audit-report.json'), `${JSON.stringify(report, null, 2)}\n`);

const escape = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const cards = rows.map((row, index) => {
  const audio = row.audioPath ? path.relative(outputDir, path.join(projectRoot, row.audioPath)) : '';
  return `<article class="card ${row.status}" data-status="${escape(row.status)}"><div class="num">${index + 1}</div><div class="body"><h2>${escape(row.text)}</h2><p>${escape(row.english || 'Missing translation')}</p><div class="meta">${escape(row.status)} · ${row.durationSeconds ?? '—'}s${row.corrected ? ' · approved correction' : ''}</div>${audio ? `<audio controls preload="none" src="${escape(audio)}"></audio>` : ''}<small>${escape(row.flags.join(', ') || 'structural checks passed')}</small></div></article>`;
}).join('\n');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Yorùbá 450 automatic triage</title><style>body{font:16px system-ui,sans-serif;max-width:1000px;margin:auto;padding:24px;background:#f8fafc;color:#172033}.toolbar{position:sticky;top:0;background:#f8fafc;padding:12px 0;z-index:2;display:flex;gap:8px;flex-wrap:wrap}button{padding:9px 12px;border:0;border-radius:7px;background:#0f766e;color:#fff}button.active{background:#172033}.card{display:flex;gap:14px;background:#fff;border:1px solid #dbe3ed;border-radius:10px;padding:14px;margin:10px 0}.card.human-review{border-left:5px solid #d97706}.card.needs-fix{border-left:5px solid #dc2626}.card.auto-pass{border-left:5px solid #16a34a}.num{font-weight:700;color:#64748b}.body{flex:1}h2{margin:0 0 3px;font-size:18px}.body p{margin:0 0 8px;color:#475569}.meta{font-size:13px;color:#475569;margin-bottom:8px}.body audio{width:100%}small{color:#64748b}.sources{color:#475569}</style></head><body><h1>Yorùbá 450 automatic triage</h1><p class="sources">Green clips passed structural checks. Amber clips are the smaller human-review queue. Red clips need correction. This does not replace native tone judgement.</p><div class="toolbar"><button data-filter="all">All (${rows.length})</button><button data-filter="human-review">Human review (${counts['human-review'] || 0})</button><button data-filter="needs-fix">Needs fix (${counts['needs-fix'] || 0})</button><button data-filter="auto-pass">Auto-pass (${counts['auto-pass'] || 0})</button><a href="audit-report.json">JSON report</a></div>${cards}<script>const cards=[...document.querySelectorAll('.card')];document.querySelectorAll('button').forEach(b=>b.onclick=()=>{document.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');const f=b.dataset.filter;cards.forEach(c=>c.hidden=f!=='all'&&c.dataset.status!==f)});document.querySelector('[data-filter=human-review]').click();</script></body></html>`;
fs.writeFileSync(path.join(outputDir, 'review.html'), html);
console.log(JSON.stringify({ output: path.relative(projectRoot, outputDir), total: rows.length, counts }, null, 2));
