import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportArg = process.argv.find((arg) => arg.startsWith('--report='));
const outputArg = process.argv.find((arg) => arg.startsWith('--output='));
const reportPath = reportArg
  ? path.resolve(projectRoot, reportArg.slice('--report='.length))
  : path.join(projectRoot, 'audio', 'yoruba', 'f5-450-audit', 'asr-report.json');
const outputPath = outputArg
  ? path.resolve(projectRoot, outputArg.slice('--output='.length))
  : path.join(projectRoot, 'audio', 'yoruba', 'f5-450-audit', 'asr-review.html');

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const rows = report.rows.filter((row) => row.asrStatus === 'likely-failure' || row.asrStatus === 'review');
const relativeAudio = (audioPath) => path.relative(path.dirname(outputPath), path.join(projectRoot, audioPath));

const cards = rows.map((row, index) => `
<article class="card ${escapeHtml(row.asrStatus)}" data-status="${escapeHtml(row.asrStatus)}">
  <div class="num">${index + 1}</div>
  <div class="body">
    <h2>${escapeHtml(row.text)}</h2>
    <p class="english">${escapeHtml(row.english || 'Translation missing')}</p>
    <div class="meta"><b>${escapeHtml(row.asrStatus)}</b> · ASR similarity ${Math.round((row.characterSimilarity || 0) * 100)}% · ${escapeHtml(row.durationSeconds)}s</div>
    <audio controls preload="none" src="${escapeHtml(relativeAudio(row.audioPath))}"></audio>
    <div class="transcript"><b>Expected:</b> ${escapeHtml(row.text)}<br><b>ASR heard:</b> ${escapeHtml(row.transcript || '(no transcript)')}</div>
    <label>Result<select data-field="result"><option value="unreviewed">Unreviewed</option><option value="good">Good</option><option value="needs-correction">Needs correction</option><option value="replace-recording">Replace recording</option></select></label>
    <label>Notes<input data-field="notes" placeholder="What is missing or mispronounced?"></label>
  </div>
</article>`).join('\n');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Yorùbá ASR pronunciation check</title>
<style>
body{font:16px system-ui,sans-serif;max-width:1000px;margin:auto;padding:24px;background:#f8fafc;color:#172033}h1{margin-bottom:6px}.intro{color:#475569}.toolbar{position:sticky;top:0;background:#f8fafc;padding:12px 0;z-index:2;display:flex;gap:8px;flex-wrap:wrap}button{padding:9px 12px;border:0;border-radius:7px;background:#0f766e;color:#fff;cursor:pointer}button.active{background:#172033}.card{display:flex;gap:14px;background:#fff;border:1px solid #dbe3ed;border-radius:10px;padding:14px;margin:10px 0}.card.likely-failure{border-left:5px solid #dc2626}.card.review{border-left:5px solid #d97706}.num{font-weight:700;color:#64748b}.body{flex:1}h2{margin:0 0 3px;font-size:18px}.english{margin:0 0 8px;color:#475569}.meta{font-size:13px;color:#475569;margin-bottom:8px}.body audio{width:100%;margin-bottom:8px}.transcript{background:#f1f5f9;border-radius:6px;padding:8px;font-size:14px;line-height:1.5}.transcript b{color:#334155}label{display:block;margin-top:8px;font-size:14px;color:#475569}select,input{display:block;width:100%;box-sizing:border-box;padding:8px;margin-top:4px;border:1px solid #cbd5e1;border-radius:6px;background:#fff}
</style></head><body>
<h1>Yorùbá pronunciation check</h1>
<p class="intro">This is a speech-recognition triage of the generated clips. It can detect missing words, repeated audio and clear substitutions, but it cannot certify Yoruba tones. Listen before approving a clip.</p>
<div class="toolbar"><button data-filter="all">Flagged (${rows.length})</button><button data-filter="likely-failure">Likely failure (${rows.filter((r) => r.asrStatus === 'likely-failure').length})</button><button data-filter="review">Review (${rows.filter((r) => r.asrStatus === 'review').length})</button><button id="save">Save locally</button><button id="export">Export review JSON</button><span id="count"></span></div>
${cards}
<script>
const key='demiwuraks-yoruba-asr-review-v1';
const cards=[...document.querySelectorAll('.card')];
const load=()=>{try{const data=JSON.parse(localStorage.getItem(key)||'{}');cards.forEach(card=>{const item=data[card.querySelector('h2').textContent]||{};card.querySelector('[data-field=result]').value=item.result||'unreviewed';card.querySelector('[data-field=notes]').value=item.notes||''})}catch{}};
const collect=()=>Object.fromEntries(cards.map(card=>[card.querySelector('h2').textContent,{result:card.querySelector('[data-field=result]').value,notes:card.querySelector('[data-field=notes]').value}]));
const save=()=>{const data=collect();localStorage.setItem(key,JSON.stringify(data));document.querySelector('#count').textContent=Object.values(data).filter(x=>x.result!=='unreviewed').length+' reviewed';};
document.querySelector('#save').onclick=save;document.querySelector('#export').onclick=()=>{save();const blob=new Blob([JSON.stringify(collect(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='yoruba-asr-review.json';a.click();URL.revokeObjectURL(a.href)};
document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));button.classList.add('active');const filter=button.dataset.filter;cards.forEach(card=>card.hidden=filter!=='all'&&card.dataset.status!==filter)});cards.forEach(card=>card.querySelectorAll('select,input').forEach(el=>el.addEventListener('change',save)));load();save();document.querySelector('[data-filter=all]').classList.add('active');
</script></body></html>`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html);
console.log(`Wrote ASR review page: ${path.relative(projectRoot, outputPath)}`);
