import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportArg = process.argv.find((arg) => arg.startsWith('--report='));
const outputArg = process.argv.find((arg) => arg.startsWith('--output='));
const reportPath = reportArg
  ? path.resolve(projectRoot, reportArg.slice('--report='.length))
  : path.join(projectRoot, 'audio', 'yoruba', 'generation-report.json');
const manifestPath = path.join(projectRoot, 'data', 'audio', 'yoruba-audio-manifest.json');
const translationsPath = path.join(projectRoot, 'data', 'audio', 'yoruba-f5-review-translations.json');
const outputPath = outputArg
  ? path.resolve(projectRoot, outputArg.slice('--output='.length))
  : path.join(projectRoot, 'audio', 'yoruba', 'review.html');

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));
const byId = new Map(manifest.entries.map((entry) => [entry.id, entry]));
const rows = report.generated.map((item, index) => {
  const entry = byId.get(item.id) || item;
  const text = entry.text || item.text;
  const english = entry.english || item.english || translations[text] || '';
  const relativeAudio = path.relative(path.dirname(outputPath), path.resolve(projectRoot, item.path));
  return `
    <article class="card" data-id="${escapeHtml(item.id)}">
      <div class="number">${index + 1}</div>
      <div class="content">
        <h2>${escapeHtml(text)}</h2>
        <p>${escapeHtml(english || 'Translation missing — do not approve this recording')}</p>
        <audio controls preload="none" src="${escapeHtml(relativeAudio)}"></audio>
        <label>Result
          <select data-field="result">
            <option value="unreviewed">Unreviewed</option>
            <option value="good">Good</option>
            <option value="needs-correction">Needs correction</option>
            <option value="replace-recording">Replace recording</option>
          </select>
        </label>
        <label>Notes <input data-field="notes" placeholder="Optional pronunciation note"></label>
      </div>
    </article>`;
});

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Yoruba audio review</title>
<style>
body{font:16px system-ui,sans-serif;max-width:900px;margin:0 auto;padding:24px;background:#f8fafc;color:#172033}
h1{margin-bottom:6px}.intro{color:#475569}.toolbar{position:sticky;top:0;background:#f8fafc;padding:12px 0;display:flex;gap:10px;flex-wrap:wrap}
button{padding:10px 14px;border:0;border-radius:8px;background:#0f766e;color:#fff;cursor:pointer}.card{display:flex;gap:14px;background:#fff;border:1px solid #dbe3ed;border-radius:12px;padding:16px;margin:12px 0;box-shadow:0 1px 2px #0000000d}.number{font-weight:700;color:#64748b}.content{flex:1}h2{margin:0 0 4px;font-size:20px}.content p{margin:0 0 12px;color:#475569}.content audio{width:100%;margin-bottom:12px}label{display:block;margin-top:8px;font-size:14px;color:#475569}select,input{display:block;width:100%;box-sizing:border-box;padding:8px;margin-top:4px;border:1px solid #cbd5e1;border-radius:6px;background:#fff}
</style></head><body>
<h1>Yorùbá audio review</h1><p class="intro">Listen to each phrase as a fluent speaker. Save your review locally, then export it for correction.</p>
<div class="toolbar"><button id="save">Save locally</button><button id="export">Export review JSON</button><span id="count"></span></div>
${rows.join('\n')}
<script>
const key='demiwuraks-yoruba-review-v1';
const cards=[...document.querySelectorAll('.card')];
const load=()=>{try{const data=JSON.parse(localStorage.getItem(key)||'{}');cards.forEach(card=>{const item=data[card.dataset.id]||{};card.querySelector('[data-field=result]').value=item.result||'unreviewed';card.querySelector('[data-field=notes]').value=item.notes||''})}catch{}};
const collect=()=>Object.fromEntries(cards.map(card=>[card.dataset.id,{result:card.querySelector('[data-field=result]').value,notes:card.querySelector('[data-field=notes]').value}]));
const save=()=>{const data=collect();localStorage.setItem(key,JSON.stringify(data));document.querySelector('#count').textContent=Object.values(data).filter(x=>x.result!=='unreviewed').length+' reviewed';};
document.querySelector('#save').onclick=save;document.querySelector('#export').onclick=()=>{save();const blob=new Blob([JSON.stringify(collect(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='yoruba-audio-review.json';a.click();URL.revokeObjectURL(a.href)};cards.forEach(card=>card.querySelectorAll('select,input').forEach(el=>el.addEventListener('change',save)));load();save();
</script></body></html>`;

fs.writeFileSync(outputPath, html);
console.log(`Wrote local review page: ${path.relative(projectRoot, outputPath)}`);
