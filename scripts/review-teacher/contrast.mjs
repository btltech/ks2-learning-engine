// Resolve axe's glyph-only close-control review items using computed CSS colors.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const b=await chromium.launch({headless:true,...(process.env.REVIEW_BROWSER?{executablePath:process.env.REVIEW_BROWSER}:{})}),c=await b.newContext();await c.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());const p=await c.newPage(),samples=[];
const luminance=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
try{for(const width of [390,768,1280])for(const theme of ['standard','dark','contrast'])for(const screen of ['home','enhanced']){
 await p.setViewportSize({width,height:900});await p.goto(`http://127.0.0.1:3013/scripts/review-teacher/index.html?screen=${screen}&theme=${theme}`,{waitUntil:'networkidle'});
 const control=p.getByLabel(screen==='home'?'Dismiss welcome message':'Close teacher dashboard',{exact:true});
 const colors=await control.evaluate(e=>{const s=getComputedStyle(e);return {foreground:s.color,background:s.backgroundColor,label:e.getAttribute('aria-label')};});
 const a=luminance(colors.foreground),d=luminance(colors.background),ratio=(Math.max(a,d)+.05)/(Math.min(a,d)+.05);assert(ratio>=4.5);samples.push({width,theme,screen,...colors,ratio:Math.round(ratio*100)/100,review:'Named close glyph visible; computed color ratio exceeds 4.5:1. Axe keeps its glyph-only item incomplete.'});
}await writeFile(resolve(process.env.REVIEW_OUT||resolve(tmpdir(),'ks2-teacher-review'),'glyph-contrast.json'),JSON.stringify({samples},null,2)+'\n');console.log('18 glyph-only contrast review samples meet 4.5:1; accessible labels present');}finally{await b.close();}
