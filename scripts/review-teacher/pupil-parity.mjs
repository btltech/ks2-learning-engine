// Read-only visual projection: the teacher stylesheet must not restyle pupils.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.REVIEW_BROWSER?{executablePath:process.env.REVIEW_BROWSER}:{})});
const context=await browser.newContext();await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());const page=await context.newPage(),samples=[];
const projection=async()=>page.evaluate(()=>[...document.querySelectorAll('.sunny-classroom,.sunny-classroom h1,.sunny-classroom p,.sunny-classroom button,.sunny-classroom input')].map(e=>{const s=getComputedStyle(e);return {tag:e.tagName,text:e.textContent,classes:e.className,font:s.fontFamily,fontSize:s.fontSize,color:s.color,background:s.backgroundColor,border:s.border,radius:s.borderRadius,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height};}));
try{for(const width of [390,768,1280])for(const theme of ['standard','dark','contrast']){
 await page.setViewportSize({width,height:900});const baseline=[];
 for(const port of [3014,3013]){
  await page.goto(`http://127.0.0.1:${port}/scripts/review-teacher/index.html?screen=pupil&theme=${theme}`,{waitUntil:'networkidle'});await page.evaluate(async()=>{await document.fonts.ready;});
  const menu=await projection();await page.getByRole('button',{name:/Join Session/}).click();const join=await projection();
  if(port===3014)baseline.push(menu,join);else{assert.deepEqual(menu,baseline[0]);assert.deepEqual(join,baseline[1]);}
 }
 samples.push({width,theme,menu:'identical computed presentation',join:'identical computed presentation'});
}await writeFile(resolve(process.env.REVIEW_OUT||resolve(tmpdir(),'ks2-teacher-review'),'pupil-parity.json'),JSON.stringify({samples},null,2)+'\n');console.log('9 pupil menu/join before/after presentation comparisons passed');}finally{await browser.close();}
