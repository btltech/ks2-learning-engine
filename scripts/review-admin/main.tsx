import React from 'react';
import {MemoryRouter} from 'react-router-dom';
import Header from '../../components/Header';
import { createRoot } from 'react-dom/client';
import '../../tailwind.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '../../components/sunny/sunny.css';
import { UISettingsProvider } from '../../context/UISettingsContext';
import { ToastProvider } from '../../components/Toast';
import Admin from '../../components/AdminConsole';
import Analytics from '../../components/AnalyticsDashboard';
import Quality from '../../components/QuestionQualityDashboard';
import { CurriculumCoverageDashboard as Curriculum } from '../../components/CurriculumCoverageDashboard';
import Cloud from '../../components/CloudBankMonitor';
import { record,user } from './fixtures';
const q=new URLSearchParams(location.search),screen=q.get('screen')||'admin',theme=q.get('theme');
localStorage.setItem('ks2_ui_mode_manual','true');localStorage.setItem('ks2_ui_settings',JSON.stringify({mode:'standard',largerText:q.has('large'),highContrast:theme==='contrast',reducedAnimations:q.has('motion')}));
if(theme==='dark'||theme==='calm')document.documentElement.classList.add('appearance-'+theme);
// The curriculum component already uses random mock progress in the app. A seeded
// RNG makes screenshots reproducible; production source and calculations stay exact.
let seed=41;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const fetchOriginal=window.fetch.bind(window);window.fetch=async(input,options)=>{if(String(input)==='/api/admin/set-user-roles'){record('setUserRoles',{method:options?.method,body:options?.body});return new Response(JSON.stringify(q.has('roleerror')?{error:'Synthetic role update rejected'}:{ok:true}),{status:q.has('roleerror')?403:200,headers:{'Content-Type':'application/json'}});}return fetchOriginal(input,options);};
const close=()=>record('close'),content=screen==='analytics'?<Analytics onClose={close}/>:screen==='quality'?<Quality onClose={close}/>:screen==='curriculum'?<div className="fixed inset-0 z-50 overflow-y-auto bg-white"><div className="relative min-h-screen"><button onClick={close} className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100" aria-label="Close curriculum coverage"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button><Curriculum studentName="Sample Learner" studentYear={5}/></div></div>:screen==='cloud'?<><h1 className="sr-only">Synthetic Cloud Bank review</h1><h2 className="sr-only">Cloud Bank statistics</h2><Cloud/></>:<Admin initialView={(q.get('view')||'dashboard') as any} onOpenQuestionQuality={()=>record('openQuality')} onOpenCurriculumCoverage={()=>record('openCurriculum')}/>;
createRoot(document.getElementById('root')!).render(<MemoryRouter><UISettingsProvider userAge={35}><ToastProvider>{screen==='admin'&&<Header user={user as any} onHomeClick={()=>record('home')} onOpenStore={()=>record('store')} onOpenParentDashboard={()=>record('parent')} onOpenLeaderboard={()=>record('leaderboard')} onOpenProgress={()=>record('progress')} onOpenUISettings={()=>record('displaySettings')} onOpenQuestionQuality={()=>record('openQuality')} onLogout={()=>record('logout')}/>}<main>{screen==='quality'&&<h1 className="sr-only">Synthetic quality review</h1>}{content}</main></ToastProvider></UISettingsProvider></MemoryRouter>);
