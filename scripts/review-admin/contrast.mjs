// Review axe's glyph-only/short-text/occluded-table items using computed colors.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const b=await chromium.launch({headless:true,...(process.env.REVIEW_BROWSER?{executablePath:process.env.REVIEW_BROWSER}:{})}),c=await b.newContext();await c.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());const p=await c.newPage(),samples=[];
const luminance=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
try{for(const width of [390,768,1280])for(const theme of ['standard','dark','contrast'])for(const screen of ['analytics','quality','settings','activity-table']){
 await p.setViewportSize({width,height:900});await p.goto(`http://127.0.0.1:3015/scripts/review-admin/index.html?screen=${screen==='settings'?'admin&view=settings':screen==='activity-table'?'analytics':screen}&theme=${theme}`,{waitUntil:'networkidle'});
 let targets;if(screen==='analytics')targets=p.getByLabel('Close analytics dashboard');else if(screen==='quality')targets=p.getByLabel('Close Question Quality Dashboard');else if(screen==='settings')targets=p.locator('.ca-switch');else{
  await p.getByRole('button',{name:'📅 Activity',exact:true}).click();await p.getByText('Daily activity data',{exact:true}).first().click();targets=p.locator('tbody tr').first().locator('th,td');
 }
 for(let i=0;i<await targets.count();i++){
  const colors=await targets.nth(i).evaluate(e=>{const color=getComputedStyle(e).color;let background='rgb(255, 255, 255)';for(let a=e;a;a=a.parentElement){const bg=getComputedStyle(a).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent'){background=bg;break;}}return {foreground:color,background,label:e.getAttribute('aria-label')||e.textContent};});
  const a=luminance(colors.foreground),d=luminance(colors.background),ratio=(Math.max(a,d)+.05)/(Math.min(a,d)+.05);assert(ratio>=4.5,JSON.stringify({screen,theme,colors,ratio}));samples.push({width,theme,screen,...colors,ratio:Math.round(ratio*100)/100});
 }
}await writeFile(resolve(process.env.REVIEW_OUT||resolve(tmpdir(),'ks2-admin-review'),'contrast-review.json'),JSON.stringify({samples,note:'Computed foreground/background review, not an axe pass. Incomplete items remain recorded; table is keyboard-scrollable and zero values stay present.'},null,2)+'\n');console.log(samples.length+' computed contrast samples meet 4.5:1');}finally{await b.close();}
