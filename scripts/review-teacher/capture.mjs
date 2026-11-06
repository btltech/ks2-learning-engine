// All full matrices stay outside git. Only --retained writes the approved 12.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const stage=process.argv[2]||'after', retained=process.argv.includes('--retained');
assert(!retained||stage==='after');
const out=retained?resolve('design/redesign-2026/review/teacher'):resolve(process.env.REVIEW_OUT||resolve(tmpdir(),'ks2-teacher-review'));
await mkdir(out,{recursive:true});
const cases=[
 ['home','screen=home'],['home-empty','screen=home&empty'],['home-error','screen=home&error'],
 ['dashboard','screen=dashboard'],['students','screen=dashboard&tab=students'],['student-detail','screen=dashboard&tab=students'],['assignments','screen=dashboard&tab=assignments'],['reports','screen=dashboard&tab=reports'],['dashboard-empty','screen=dashboard&empty'],
 ['enhanced','screen=enhanced'],['enhanced-students','screen=enhanced'],['enhanced-homework','screen=enhanced'],['enhanced-empty','screen=enhanced&empty'],
 ['classroom-menu','screen=classroom'],['classroom-create','screen=classroom'],['classroom-join','screen=classroom'],['classroom-waiting','screen=classroom'],['classroom-active','screen=classroom'],['classroom-results','screen=classroom'],
];
const shots=retained?[...['home','dashboard','enhanced','classroom-waiting','classroom-active'].flatMap(name=>[1280,390].map(width=>({name,width,theme:'standard'}))),...['dark','contrast'].map(theme=>({name:'dashboard',width:390,theme}))]
 :(process.env.REVIEW_WIDTHS?.split(',').map(Number)||(stage==='before'?[390,1280]:[390,768,1280])).flatMap(width=>(process.env.REVIEW_THEMES?.split(',')||['standard','dark','contrast']).flatMap(theme=>cases.filter(([name])=>!process.env.REVIEW_CASES||process.env.REVIEW_CASES.split(',').includes(name)).map(([name])=>({name,width,theme}))));
const browser=await chromium.launch({headless:true,...(process.env.REVIEW_BROWSER?{executablePath:process.env.REVIEW_BROWSER}:{})});
const context=await browser.newContext({deviceScaleFactor:1});
await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
const page=await context.newPage(),errors=[],audits=[];
page.on('pageerror',error=>errors.push(error.message));
const activate=async locator=>{await locator.focus();await page.keyboard.press('Enter');};
async function prepare(name,query,theme){
 await page.goto((process.env.REVIEW_URL||(stage==='before'?'http://127.0.0.1:3014':'http://127.0.0.1:3013'))+'/scripts/review-teacher/index.html?'+query+'&theme='+theme,{waitUntil:'networkidle'});
 await page.evaluate(async()=>{await document.fonts.ready;});
 if(name==='home'||name.startsWith('dashboard')||['students','student-detail','assignments','reports'].includes(name))await page.getByText('Loading shared classroom data…').waitFor({state:'hidden'});
 if(name==='student-detail'){await page.getByText('Sample Learner',{exact:true}).first().click();await page.getByRole('heading',{name:'Sample Learner',exact:true}).waitFor();}
 if(name==='enhanced-students')await activate(page.getByRole('button',{name:'👥 Students',exact:true}));
 if(name==='enhanced-homework')await activate(page.getByRole('button',{name:'📝 Homework',exact:true}));
 if(name==='classroom-join')await activate(page.getByRole('button',{name:/Join Session/}));
 if(name.startsWith('classroom-')&&!['classroom-menu','classroom-join'].includes(name)){
  await activate(page.getByRole('button',{name:/Create New Session/}));
  if(name==='classroom-create'){await page.getByRole('heading',{name:'Create Quiz Session',exact:true}).waitFor();return;}
  await page.getByPlaceholder('e.g., Year 5 Maths Quiz').fill('Sample live fractions');
  await activate(page.getByRole('button',{name:'Maths',exact:true}));
  await page.locator('select').first().selectOption('Fractions');
  await activate(page.getByRole('button',{name:'Create Session',exact:true}));
  await page.getByText('DEMO00',{exact:true}).waitFor();
  await page.waitForFunction(()=>window.__teacherSession.listenerCount()>0);
  if(name==='classroom-waiting')return;
  await activate(page.getByRole('button',{name:/Start Quiz/}));
  await page.getByRole('heading',{name:'Which fraction is equal to one half?',exact:true}).waitFor();
  if(name==='classroom-results'){
   await activate(page.getByRole('button',{name:'Next Question →',exact:true}));
   await page.getByRole('heading',{name:'What is 3 + 4?',exact:true}).waitFor();
   await activate(page.getByRole('button',{name:'Show Results',exact:true}));
   await page.getByRole('heading',{name:'🎉 Quiz Complete!',exact:true}).waitFor();
  }
 }
}
try{
 for(const {name,width,theme} of shots){
  await page.setViewportSize({width,height:Number(process.env.REVIEW_HEIGHT||900)});
  await prepare(name,cases.find(([candidate])=>candidate===name)[1],theme);
  if(retained&&['dashboard','enhanced'].includes(name)){
   // Fixed dashboards have their own scroller. Extend capture height to show its
   // complete contents; all accessibility/keyboard audits still use 900px height.
   const height=await page.evaluate(name=>{
    if(name==='dashboard'){const root=document.querySelector('.ct-dashboard > section');return root.querySelector('header').offsetHeight+root.lastElementChild.scrollHeight+4;}
    const dialog=document.querySelector('.ct-dialog');return Math.ceil(([...dialog.children].reduce((sum,e)=>sum+(e===dialog.lastElementChild?e.scrollHeight:e.offsetHeight),0)+4)/.9)+8;
   },name);await page.setViewportSize({width,height});
  }
  const filename=`${stage}-${name}-${theme}-${width}.jpg`;
  if((width!==768||retained)&&!process.env.REVIEW_NO_SHOTS)await page.screenshot({path:resolve(out,filename),type:'jpeg',quality:70,fullPage:name==='home'||name.startsWith('classroom-'),animations:'disabled',scale:'css'});
  if(stage==='after'&&!retained){
   await page.addScriptTag({path:process.env.REVIEW_AXE||resolve('node_modules/axe-core/axe.min.js')});
   const audit=await page.evaluate(async()=>{
    const a=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}});
    const visible=e=>!!e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
    return {violations:a.violations,incomplete:a.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),documentWidth:document.documentElement.scrollWidth,
     smallTargets:[...document.querySelectorAll('button,a,input,select,textarea')].filter(e=>visible(e)&&!e.disabled&&(e.getBoundingClientRect().width<48||e.getBoundingClientRect().height<48)).map(e=>({label:e.getAttribute('aria-label')||e.textContent.slice(0,70),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))};
   });audits.push({name,width,theme,...audit});console.log(`${name} ${theme} ${width}: ${audit.violations.length} violations; ${audit.smallTargets.length} small targets; width ${audit.documentWidth}`);
  }else console.log(filename);
 }
 if(!retained)await writeFile(resolve(out,stage+'-audits.json'),JSON.stringify({errors,audits},null,2)+'\n');
 assert.equal(errors.length,0,JSON.stringify(errors));
 for(const a of audits){assert.equal(a.violations.length,0,a.name+' '+a.theme+' '+a.width);assert.equal(a.smallTargets.length,0,a.name+' small targets');assert(a.documentWidth<=a.width,a.name+' overflow');}
}finally{await browser.close();}
