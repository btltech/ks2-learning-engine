// Keyboard and display-preference checks use fresh synthetic browser storage only.
import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.REVIEW_BROWSER?{executablePath:process.env.REVIEW_BROWSER}:{})});
const context=await browser.newContext(),external=[];
await context.route('**/*',r=>{if(new URL(r.request().url()).hostname==='127.0.0.1')return r.continue();external.push(r.request().url());return r.abort();});
const page=await context.newPage(),keyboard=[],preferences=[],audits=[];
const out=resolve(process.env.REVIEW_OUT||resolve(tmpdir(),'ks2-teacher-review'));await mkdir(out,{recursive:true});
const go=async query=>{await page.goto('http://127.0.0.1:3013/scripts/review-teacher/index.html?'+query,{waitUntil:'networkidle'});await page.evaluate(async()=>{await document.fonts.load('600 20px Lexend');await document.fonts.load('700 20px Lexend');await document.fonts.ready;});};
const tabTo=async locator=>{for(let n=0;n<100;n++){if(await locator.evaluate(e=>e===document.activeElement))return;await page.keyboard.press('Tab');}throw Error('Tab target unreachable: '+await locator.textContent());};
const activate=async locator=>{await tabTo(locator);await page.keyboard.press('Enter');};
const audit=async(name,width)=>{await page.addScriptTag({path:process.env.REVIEW_AXE||resolve('node_modules/axe-core/axe.min.js')});const a=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}});return {violations:r.violations,incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),documentWidth:document.documentElement.scrollWidth};});audits.push({name,width,...a});assert.equal(a.violations.length,0,name);assert(a.documentWidth<=width,name+' horizontal overflow');};
try{
 for(const width of [390,768,1280]){
  await page.setViewportSize({width,height:900});await go('screen=dashboard');
  await tabTo(page.getByRole('tab',{name:'📊 Overview',exact:true}));await page.keyboard.press('ArrowRight');
  const students=page.getByRole('tab',{name:'👨‍🎓 Students',exact:true});assert(await students.evaluate(e=>e===document.activeElement));
  await activate(page.getByRole('button',{name:"View Sample Learner's progress"}));
  await page.getByRole('heading',{name:'Sample Learner',exact:true}).waitFor();
  let confirmation;
  page.once('dialog',async dialog=>{confirmation={type:dialog.type(),message:dialog.message()};await dialog.dismiss();});
  await activate(page.getByRole('button',{name:'Remove from this class',exact:true}));
  assert.deepEqual(confirmation,{type:'confirm',message:'Remove this learner from the selected class?'});assert.deepEqual(await page.evaluate(()=>window.__teacherCalls||[]),[]);
  await tabTo(students);await page.keyboard.press('End');assert(await page.getByRole('tab',{name:'📈 Reports',exact:true}).evaluate(e=>e===document.activeElement));await page.keyboard.press('Home');
  const className=page.getByLabel('Create Class',{exact:true});await tabTo(className);await page.keyboard.type('Synthetic new class');
  await activate(page.getByRole('button',{name:'Create Class',exact:true}));await page.waitForFunction(()=>document.querySelector('#teacher-active-class').value==='synthetic-new-class');
  assert.deepEqual(await page.evaluate(()=>window.__teacherCalls),['createClass']);
  await go('screen=dashboard&tab=assignments');await tabTo(page.getByLabel('Title',{exact:true}));await page.keyboard.type('Synthetic keyboard practice');
  await activate(page.getByRole('button',{name:'Publish to Whole Class',exact:true}));await page.getByText('Assignment published to the class.').waitFor();await audit('assignment-published',width);
  await go('screen=enhanced');const close=page.getByLabel('Close teacher dashboard',{exact:true});assert(await close.evaluate(e=>e===document.activeElement));
  await page.keyboard.press('Shift+Tab');assert(await page.getByRole('region',{name:'Class analytics'}).evaluate(e=>e===document.activeElement));await page.keyboard.press('Tab');assert(await close.evaluate(e=>e===document.activeElement));
  await activate(page.getByRole('button',{name:'👥 Students',exact:true}));await page.getByRole('heading',{name:'Student Progress',exact:true}).waitFor();
  await go('screen=classroom');await activate(page.getByRole('button',{name:/Create New Session/}));
  await tabTo(page.getByLabel('Session Title',{exact:true}));await page.keyboard.type('Synthetic live practice');await activate(page.getByRole('button',{name:'Maths',exact:true}));
  await tabTo(page.getByLabel('Topic',{exact:true}));await page.keyboard.press('f');await page.keyboard.press('Enter');assert.equal(await page.getByLabel('Topic',{exact:true}).inputValue(),'Fractions');await audit('classroom-selected-subject',width);
  await activate(page.getByRole('button',{name:'Create Session',exact:true}));await page.getByText('DEMO00',{exact:true}).waitFor();await page.waitForFunction(()=>window.__teacherSession.listenerCount()>0);
  await activate(page.getByRole('button',{name:/Start Quiz/}));await page.getByRole('heading',{name:'Which fraction is equal to one half?',exact:true}).waitFor();
  assert(await page.getByRole('button',{name:/A\.\s*2\/4/}).isDisabled());
  await activate(page.getByRole('button',{name:'Next Question →',exact:true}));await page.getByRole('heading',{name:'What is 3 + 4?',exact:true}).waitFor();
  await activate(page.getByRole('button',{name:'Show Results',exact:true}));await page.getByRole('heading',{name:'🎉 Quiz Complete!',exact:true}).waitFor();assert.deepEqual(await page.evaluate(()=>window.__teacherCalls),['createSession','startSession','nextQuestion','nextQuestion']);
  keyboard.push({width,passed:['Tab reaches all dashboard tabs; arrow/Home/End preserve focus and routing','learner card Enter; removal confirmation dismissed without API mutation','class creation and homework publishing via keyboard','enhanced dialog traps forward and reverse Tab; analytics tabs reachable','teacher session creation/start/next/results via keyboard; answers disabled; no submitAnswer']});
  for(const screen of ['home','dashboard','enhanced','classroom'])for(const preference of ['ui-motion','os-motion','large','calm']){
   await page.emulateMedia({reducedMotion:preference==='os-motion'?'reduce':'no-preference'});
   await go('screen='+screen+(preference==='ui-motion'?'&motion':preference==='large'?'&large':preference==='calm'?'&theme=calm':''));
   const sample=await page.evaluate(()=>{
    const root=document.querySelector('.clear-path-teacher'),heading=root.querySelector('h1,h2'),body=root.querySelector('p'),logo=root.querySelector('.sunny-logo svg g[transform]');
    return {headingFont:getComputedStyle(heading).fontFamily,headingWeight:getComputedStyle(heading).fontWeight,bodyFont:getComputedStyle(body).fontFamily,bodySize:getComputedStyle(body).fontSize,localFontsReady:document.fonts.check('600 20px Lexend')&&document.fonts.check('700 20px Lexend'),logoStaticTransform:logo?getComputedStyle(logo).transform:null,animations:[...root.querySelectorAll('*')].filter(e=>getComputedStyle(e).animationName!=='none').map(e=>e.tagName),pageColor:getComputedStyle(root).getPropertyValue('--ct-page'),focusWidth:(()=>{const b=root.querySelector('button');b.focus();return getComputedStyle(b).outlineWidth;})()};
   });
   assert.match(sample.headingFont,/Lexend/);assert.match(sample.bodyFont,/Atkinson/);assert(sample.localFontsReady);assert.equal(sample.focusWidth,'4px',screen+' '+preference+' '+width);assert(['600','700'].includes(sample.headingWeight));if(sample.logoStaticTransform)assert.notEqual(sample.logoStaticTransform,'none');
   if(preference.endsWith('motion'))assert.equal(sample.animations.length,0);
   if(preference==='large')assert(Number.parseFloat(sample.bodySize)>=18);
   if(preference==='calm')assert.notEqual(sample.pageColor.trim(),'#F6F7FB');
   await audit(screen+'-'+preference,width);preferences.push({width,screen,preference,...sample});
  }
 }
 assert.equal(external.length,0);
 await writeFile(resolve(out,'keyboard-preferences.json'),JSON.stringify({keyboard,preferences,audits,externalRequests:external},null,2)+'\n');console.log('Keyboard flows at 3 widths; 48 display preference/font/logo checks and 54 axe checks passed; zero external requests');
}finally{await browser.close();}
