import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const api=vi.hoisted(()=>{
 const learner={studentId:'synthetic-pupil',studentName:'Sample Learner',age:9,points:120,streak:2,totalQuizzes:3,averageScore:50,subjectMastery:{Maths:60},lastActive:'2026-11-06T10:00:00Z'};
 const group={classId:'synthetic-class',className:'Sample Class',grade:'Year 4',joinCode:'DEMO-ONLY',studentIds:[learner.studentId],students:[learner]};
 return {learner,group,getClasses:vi.fn(),getHomework:vi.fn(),createClass:vi.fn(),removeStudent:vi.fn(),createHomework:vi.fn(),exportReport:vi.fn(),getAnalytics:vi.fn()};
});
vi.mock('../context/UserContext',()=>({useUser:()=>({user:{id:'synthetic-teacher',name:'Sample Teacher',role:'teacher'}})}));
vi.mock('../services/teacherWorkspaceService',()=>({teacherWorkspaceService:api,homeworkStats:()=>({submitted:0,pending:1,averageScore:0})}));
vi.mock('../services/teacherAnalyticsService',()=>({teacherAnalyticsService:{getClasses:()=>[{...api.group,students:[api.learner.studentId]}],getClassAnalytics:api.getAnalytics,exportClassReport:api.exportReport}}));
vi.mock('../services/homeworkService',()=>({homeworkService:{getTeacherHomework:()=>[],getHomeworkStats:vi.fn(),isOverdue:()=>false}}));
import { TeacherDashboard } from './TeacherDashboard';
import Home from './TeacherHomeView';
import Enhanced from './EnhancedTeacherDashboard';
const dashboard=(tab='overview')=>render(<MemoryRouter initialEntries={['/teacher-dashboard?tab='+tab]}><TeacherDashboard onClose={vi.fn()}/></MemoryRouter>);
const home=()=>{const actions=Array.from({length:5},()=>vi.fn());render(<Home onOpenTeacherDashboard={actions[0]} onOpenClassroom={actions[1]} onOpenQuestionQuality={actions[2]} onOpenAnalytics={actions[3]} onOpenCurriculumCoverage={actions[4]}/>);return actions;};
beforeEach(()=>{
 vi.clearAllMocks();api.getClasses.mockResolvedValue([api.group]);api.getHomework.mockResolvedValue([]);api.removeStudent.mockResolvedValue(undefined);
 api.createClass.mockResolvedValue({...api.group,classId:'new-class',className:'New class',students:[],studentIds:[]});
 api.createHomework.mockImplementation(async details=>({...details,homeworkId:'new-homework',topics:[details.topic],submissions:[]}));
 api.getAnalytics.mockReturnValue({totalStudents:1,averageScore:50,totalQuizzes:3,totalTimeSpent:60,subjectPerformance:{Maths:{averageScore:60,quizzesCompleted:3}},topPerformers:[],needingHelp:[{...api.learner,grade:'4',strengths:[],weaknesses:['Maths']}]});
});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
describe('Clear Path teacher presentation preserves actions and data',()=>{
 it('keeps teacher home data, retry and tool destinations',async()=>{
  api.getClasses.mockRejectedValueOnce(Error('Synthetic unavailable'));
  const actions=home();await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button',{name:'Retry'}));
  await waitFor(()=>expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  expect(screen.getByText('50%')).toBeVisible();
  fireEvent.click(screen.getByRole('button',{name:'Open Class Dashboard'}));
  fireEvent.click(screen.getByRole('button',{name:'Start Live Session'}));
  fireEvent.click(screen.getByRole('button',{name:/Question Quality Review/}));
  expect(actions[0]).toHaveBeenCalledOnce();expect(actions[1]).toHaveBeenCalledOnce();expect(actions[2]).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByLabelText('Dismiss welcome message'));
  expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Welcome back, Sample Teacher!');
 });
 it('keeps class creation and route-backed keyboard navigation',async()=>{
  dashboard();await screen.findByText('DEMO-ONLY');
  fireEvent.change(screen.getByLabelText('Create Class'),{target:{value:' New class '}});
  fireEvent.change(screen.getByLabelText('Year'),{target:{value:'Year 4'}});
  fireEvent.click(screen.getByRole('button',{name:'Create Class'}));
  await waitFor(()=>expect(screen.getByLabelText('Active Class')).toHaveValue('new-class'));
  expect(api.createClass).toHaveBeenCalledExactlyOnceWith('New class','Year 4');
  fireEvent.keyDown(screen.getByRole('tab',{name:'📊 Overview'}),{key:'End'});
  expect(screen.getByRole('tab',{name:'📈 Reports'})).toHaveFocus();
  expect(screen.getByRole('button',{name:'Export as CSV'})).toBeVisible();
  fireEvent.keyDown(screen.getByRole('tab',{name:'📈 Reports'}),{key:'Home'});
  fireEvent.keyDown(screen.getByRole('tab',{name:'📊 Overview'}),{key:'ArrowRight'});
  expect(screen.getByRole('tab',{name:'👨‍🎓 Students'})).toHaveAttribute('aria-selected','true');
 });
 it('makes learner cards keyboard reachable and preserves removal confirmation/payload',async()=>{
  const confirm=vi.spyOn(window,'confirm').mockReturnValue(false);
  dashboard('students');const card=await screen.findByRole('button',{name:"View Sample Learner's progress"});
  card.focus();fireEvent.keyDown(card,{key:'Enter'});
  expect(screen.getByRole('heading',{name:'Sample Learner'})).toBeVisible();
  fireEvent.click(screen.getByRole('button',{name:'Remove from this class'}));
  expect(confirm).toHaveBeenCalledWith('Remove this learner from the selected class?');expect(api.removeStudent).not.toHaveBeenCalled();
  confirm.mockReturnValue(true);fireEvent.click(screen.getByRole('button',{name:'Remove from this class'}));
  await waitFor(()=>expect(screen.queryByRole('heading',{name:'Sample Learner'})).not.toBeInTheDocument());
  expect(api.removeStudent).toHaveBeenCalledExactlyOnceWith('synthetic-class','synthetic-pupil');
 });
 it('keeps assignment fields and exact shared API payload',async()=>{
  dashboard('assignments');await screen.findByText('DEMO-ONLY');
  fireEvent.change(screen.getByLabelText('Title'),{target:{value:' New fractions '}});
  fireEvent.change(screen.getByLabelText('Instructions (optional)'),{target:{value:' Take your time '}});
  fireEvent.change(screen.getByLabelText('Due Date'),{target:{value:'2027-01-10'}});
  fireEvent.click(screen.getByRole('button',{name:'Publish to Whole Class'}));
  await screen.findByText('Assignment published to the class.');
  expect(api.createHomework).toHaveBeenCalledExactlyOnceWith({title:'New fractions',description:'Take your time',subject:'Maths',topic:'Fractions',difficulty:'Medium',questionCount:10,dueDate:new Date('2027-01-10T23:59:00').toISOString(),assignedClassIds:['synthetic-class']});
  expect(screen.getByRole('heading',{name:'New fractions'})).toBeVisible();
 });
 it('keeps CSV, JSON and print exports using the real class numbers',async()=>{
  const urls=vi.fn(()=> 'blob:synthetic'),revoke=vi.fn(),click=vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{}),print=vi.spyOn(window,'print').mockImplementation(()=>{});
  vi.stubGlobal('URL',Object.assign(URL,{createObjectURL:urls,revokeObjectURL:revoke}));
  dashboard('reports');await screen.findByText('DEMO-ONLY');
  await waitFor(()=>expect(screen.getByText('50%')).toBeVisible());
  fireEvent.click(screen.getByRole('button',{name:'Export as CSV'}));fireEvent.click(screen.getByRole('button',{name:'Export as JSON'}));fireEvent.click(screen.getByRole('button',{name:'Print Report'}));
  expect(urls).toHaveBeenCalledTimes(2);expect(urls.mock.calls[0][0].type).toBe('text/csv');expect(urls.mock.calls[1][0].type).toBe('application/json');expect(click).toHaveBeenCalledTimes(2);expect(revoke).toHaveBeenCalledTimes(2);expect(print).toHaveBeenCalledOnce();
 });
 it('keeps enhanced analytics, export and accessible dialog dismissal',()=>{
  api.exportReport.mockReturnValue('{"synthetic":true}');
  const close=vi.fn();vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});URL.createObjectURL=vi.fn(()=> 'blob:synthetic');URL.revokeObjectURL=vi.fn();
  render(<Enhanced teacherId="synthetic-teacher" onClose={close}/>);
  expect(screen.getByRole('dialog',{name:'📊 Teacher Dashboard'})).toBeVisible();
  expect(api.getAnalytics).toHaveBeenCalledWith('synthetic-teacher','synthetic-class');
  expect(screen.getByRole('region',{name:'Class analytics'})).toHaveAttribute('tabindex','0');
  expect(screen.getByLabelText('Close teacher dashboard')).toHaveFocus();
  fireEvent.click(screen.getByRole('button',{name:'📥 Export Report'}));
  expect(api.exportReport).toHaveBeenCalledExactlyOnceWith('synthetic-teacher','synthetic-class');
  fireEvent.keyDown(document,{key:'Escape'});expect(close).toHaveBeenCalledOnce();
 });
});
