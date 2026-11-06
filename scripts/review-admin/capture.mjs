// Full before/after matrices default to temporary storage. Only --retained writes 12 images.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const stage=process.argv[2]||'after',retained=process.argv.includes('--retained');assert(!retained||stage==='after');
const out=retained?resolve('design/redesign-2026/review/admin'):resolve(process.env.REVIEW_OUT||resolve(tmpdir(),'ks2-admin-review'));await mkdir(out,{recursive:true});
const cases=[['admin','screen=admin'],['user-menu','screen=admin'],['users','screen=admin&view=users'],['users-empty','screen=admin&view=users&empty'],['users-error','screen=admin&view=users&directoryerror'],['content','screen=admin&view=content'],['content-empty','screen=admin&view=content&empty'],['platform','screen=admin&view=analytics'],['settings','screen=admin&view=settings'],['admin-error','screen=admin&error'],['analytics','screen=analytics'],['topics','screen=analytics'],['activity','screen=analytics'],['activity-table','screen=analytics'],['weekly','screen=analytics'],['analytics-empty','screen=analytics&empty'],['quality','screen=quality'],['quality-detail','screen=quality'],['quality-filter','screen=quality'],['quality-empty','screen=quality&empty'],['quality-error','screen=quality&error'],['curriculum','screen=curriculum'],['curriculum-expanded','screen=curriculum'],['curriculum-other','screen=curriculum'],['cloud','screen=cloud'],['cloud-empty','screen=cloud&empty'],['cloud-error','screen=cloud&clouderror']];
const shots=retained?[...['admin','activity','quality-detail','curriculum-expanded','cloud'].flatMap(name=>[1280,390].map(width=>({name,width,theme:'standard'}))),...['dark','contrast'].map(theme=>({name:'admin',width:390,theme}))]:(process.env.REVIEW_WIDTHS?.split(',').map(Number)||(stage==='before'?[390,1280]:[390,768,1280])).flatMap(width=>(process.env.REVIEW_THEMES?.split(',')||['standard','dark','contrast']).flatMap(theme=>cases.filter(([name])=>!process.env.REVIEW_CASES||process.env.REVIEW_CASES.split(',').includes(name)).map(([name])=>({name,width,theme}))));
const browser=await chromium.launch({headless:true,...(process.env.REVIEW_BROWSER?{executablePath:process.env.REVIEW_BROWSER}:{})});const context=await browser.newContext();
const external=[];await context.route('**/*',r=>{if(new URL(r.request().url()).hostname==='127.0.0.1')return r.continue();external.push(r.request().url());return r.abort();});
const page=await context.newPage(),errors=[],audits=[];page.on('pageerror',e=>errors.push(e.message));
const activate=async locator=>{await locator.focus();await page.keyboard.press('Enter');};
async function prepare(name,query,theme){
 await page.goto((process.env.REVIEW_URL||(stage==='before'?'http://127.0.0.1:3016':'http://127.0.0.1:3015'))+'/scripts/review-admin/index.html?'+query+'&theme='+theme,{waitUntil:'networkidle'});await page.evaluate(async()=>{await document.fonts.ready;});
 for(const text of ['Loading system stats...','Loading user directory…','Loading Cloud Bank stats...','Loading questions...'])await page.getByText(text,{exact:true}).waitFor({state:'hidden'});
 if(name==='user-menu')await activate(page.getByRole('button',{name:'User menu',exact:true}));
 if(name==='topics')await activate(page.getByRole('button',{name:'📚 Topics',exact:true}));
 if(name==='activity'||name==='activity-table'){
  await activate(page.getByRole('button',{name:'📅 Activity',exact:true}));
  // The baseline did not have a table alternative. Capture its original activity view.
  if(name==='activity-table'&&stage==='after')await activate(page.getByText('Daily activity data',{exact:true}).first());
 }
 if(name==='weekly')await activate(page.getByRole('button',{name:'📈 Weekly',exact:true}));
 if(name==='quality-detail')await activate(page.getByRole('button',{name:'View details',exact:true}).first());
 if(name==='quality-filter')await page.locator('select').selectOption('Maths');
 if(name==='curriculum-expanded')await activate(page.getByRole('button').filter({hasText:'objectives mastered'}).first());
 if(name==='curriculum-other')await page.locator('select').first().selectOption('English');
}
try{for(const {name,width,theme}of shots){
 await page.setViewportSize({width,height:900});await prepare(name,cases.find(([n])=>n===name)[1],theme);
 if(retained&&name==='curriculum-expanded'){const height=await page.locator('.ca-curriculum').evaluate(e=>e.scrollHeight);await page.setViewportSize({width,height});}
 if(retained&&name==='quality-detail'){
  const height=await page.evaluate(()=>{const d=document.querySelector('[role="dialog"]');return Math.ceil(([...d.children].reduce((sum,e)=>sum+(e===d.lastElementChild?e.scrollHeight:e.offsetHeight),0)+4)/.9)+8;});await page.setViewportSize({width,height});
 }
 const filename=`${stage}-${name}-${theme}-${width}.jpg`;
 if((width!==768||retained)&&!process.env.REVIEW_NO_SHOTS)await page.screenshot({path:resolve(out,filename),type:'jpeg',quality:70,fullPage:!name.startsWith('quality'),scale:'css',animations:'disabled'});
 if(stage==='after'&&!retained){
  await page.addScriptTag({path:process.env.REVIEW_AXE||resolve('node_modules/axe-core/axe.min.js')});
  const a=await page.evaluate(async()=>{
   const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}});
   return {violations:r.violations,incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),documentWidth:document.documentElement.scrollWidth,
    smallTargets:[...document.querySelectorAll('button,a,input,select,textarea,summary,[role="button"]')].filter(e=>e.getClientRects().length&&!e.disabled&&getComputedStyle(e).visibility!=='hidden').map(e=>e.matches('input[type="checkbox"]')?e.closest('label')||e:e).filter(e=>e.getBoundingClientRect().width<48||e.getBoundingClientRect().height<48).map(e=>({label:e.getAttribute('aria-label')||e.textContent.slice(0,80),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))};
  });audits.push({name,width,theme,...a});console.log(`${name} ${theme} ${width}: ${a.violations.length} violations; ${a.smallTargets.length} small targets; width ${a.documentWidth}`);
 }else console.log(filename);
}
 if(!retained)await writeFile(resolve(out,stage+'-audits.json'),JSON.stringify({errors,externalRequests:external,audits},null,2)+'\n');
 assert.equal(errors.length,0,JSON.stringify(errors));assert.equal(external.length,0);
 for(const a of audits){assert.equal(a.violations.length,0,a.name+' '+a.theme+' '+a.width);assert.equal(a.smallTargets.length,0,a.name+' small targets');assert(a.documentWidth<=a.width,a.name+' overflow');}
}finally{await browser.close();}
