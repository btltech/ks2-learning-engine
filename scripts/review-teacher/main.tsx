import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import '../../tailwind.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '../../components/sunny/sunny.css';
import { UISettingsProvider } from '../../context/UISettingsContext';
import Header from '../../components/Header';
import Home from '../../components/TeacherHomeView';
import { TeacherDashboard as Dashboard } from '../../components/TeacherDashboard';
import Enhanced from '../../components/EnhancedTeacherDashboard';
import Classroom from '../../components/ClassroomMode';
import { teacher } from './fixtures';
const q=new URLSearchParams(location.search), screen=q.get('screen')||'dashboard', theme=q.get('theme');
const noop=()=>{};
localStorage.setItem('ks2_ui_mode_manual','true');
localStorage.setItem('ks2_ui_settings',JSON.stringify({mode:'standard',largerText:q.has('large'),highContrast:theme==='contrast',reducedAnimations:q.has('motion')}));
if(theme==='dark'||theme==='calm')document.documentElement.classList.add('appearance-'+theme);
const content=screen==='home'?<Home onOpenTeacherDashboard={noop} onOpenClassroom={noop} onOpenQuestionQuality={noop} onOpenAnalytics={noop} onOpenCurriculumCoverage={noop}/>:screen==='enhanced'?<Enhanced teacherId={teacher.id} onClose={noop}/>:screen==='classroom'||screen==='pupil'?<Classroom userId={screen==='pupil'?'synthetic-pupil-0':teacher.id} userName={screen==='pupil'?'Sample Learner':teacher.name} isTeacher={screen!=='pupil'} onExit={noop}/>:<Dashboard onClose={noop}/>;
createRoot(document.getElementById('root')!).render(<MemoryRouter initialEntries={['/teacher-dashboard'+(q.get('tab')?'?tab='+q.get('tab'):'')]}><UISettingsProvider userAge={35}>
{screen==='home'&&<Header user={teacher as any} onHomeClick={noop} onOpenStore={noop} onOpenParentDashboard={noop} onOpenLeaderboard={noop} onOpenProgress={noop} onOpenUISettings={noop} onLogout={noop}/>}
<main>{screen==='enhanced'&&<h1 className="sr-only">Teacher analytics review</h1>}{content}</main>
</UISettingsProvider></MemoryRouter>);
