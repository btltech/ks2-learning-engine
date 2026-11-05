async () => {
 await document.fonts.ready;
 if(!window.axe) await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='/node_modules/axe-core/axe.min.js';s.onload=resolve;s.onerror=reject;document.head.append(s)});
 const audit=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}});
 const visible=e=>!!(e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');
 return {url:location.href,width:innerWidth,documentWidth:document.documentElement.scrollWidth,text:document.body.innerText.slice(0,120),axeVersion:axe.version,violations:audit.violations,incomplete:audit.incomplete,passes:audit.passes.map(p=>p.id),overflow:[...document.querySelectorAll('main *')].filter(e=>visible(e)&&e.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(e=>({tag:e.tagName,class:e.className,right:e.getBoundingClientRect().right})),smallTargets:[...document.querySelectorAll('button,a,input,select')].filter(e=>visible(e)&&!e.disabled&&(e.getBoundingClientRect().height<48||e.getBoundingClientRect().width<48)).map(e=>({label:e.getAttribute('aria-label')||e.innerText.slice(0,60),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,class:e.className}))};
}
