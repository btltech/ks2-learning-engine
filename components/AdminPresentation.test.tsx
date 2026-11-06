import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const api=vi.hoisted(()=>({
 bank:vi.fn(),poor:vi.fn(),local:vi.fn(),search:vi.fn(),getToken:vi.fn(),getClaims:vi.fn(),resolve:vi.fn(),pending:vi.fn(),cloud:vi.fn(),save:vi.fn(),toast:vi.fn(),summary:vi.fn(),loggedIn:true,
 settings:{platformName:'Synthetic Workspace',maintenanceMode:false,questionsToUnlockGames:10,pointsPerCorrectAnswer:10,enableAIQuestions:true,qualityThreshold:70,safetyReviewEnabled:true,adminOnlyRoleChanges:true},
}));
vi.mock('../context/UserContext',()=>({useUser:()=>({user:{id:'synthetic-admin',name:'Sample Administrator',role:'admin'}})}));
vi.mock('./Toast',()=>({useToast:()=>({showToast:api.toast})}));
vi.mock('../services/questionPerformance',()=>({getQuestionBankStats:api.bank,getPoorlyPerformingQuestionsFromFirebase:api.poor,getPerformanceStats:api.local}));
vi.mock('../services/firebaseAuthService',()=>({auth:{get currentUser(){return api.loggedIn?{uid:'synthetic-admin',email:'sample-admin@example.invalid',getIdToken:api.getToken,getIdTokenResult:api.getClaims}:null;}},firebaseAuthService:{searchUsers:api.search}}));
vi.mock('../services/contentQualityService',()=>({contentQualityService:{getPendingFeedback:api.pending,resolveFeedback:api.resolve}}));
vi.mock('../services/settingsService',()=>({getAdminPlatformSettings:()=>({...api.settings}),saveAdminPlatformSettings:api.save}));
vi.mock('../services/cloudBankService',()=>({getCloudBankStats:api.cloud}));
vi.mock('../services/analyticsService',()=>({analyticsService:{getSummary:api.summary}}));
vi.mock('../services/streakRewardsService',()=>({streakRewardsService:{getStreak:()=>({currentStreak:3})}}));
import Admin from './AdminConsole';
import Analytics from './AnalyticsDashboard';
import Quality from './QuestionQualityDashboard';
import Cloud from './CloudBankMonitor';
import { CurriculumCoverageDashboard as Curriculum } from './CurriculumCoverageDashboard';
const bank={totalQuestions:120,displayableQuestions:100,publishedQuestions:85,questionsWithPerformanceData:40,questionsAttempted:50,totalAttempts:400,averageCorrectRate:.72,poorlyPerformingCount:1,wellPerformingCount:39};
const poor={id:'synthetic-question',question:'Synthetic question: three plus four?',correctRate:.1,timesShown:20,subject:'Maths',topic:'Addition'};
const feedback={id:'synthetic-feedback',contentId:'synthetic-question',reason:'Unclear wording',message:'Synthetic feedback only'};
const days=[{date:'2026-10-25',quizzesCompleted:2,questionsAnswered:20,correctAnswers:14,timeSpentMinutes:10,xpEarned:40,subjectsStudied:['Maths']},{date:'2026-10-26',quizzesCompleted:0,questionsAnswered:0,correctAnswers:0,timeSpentMinutes:0,xpEarned:0,subjectsStudied:[]}];
beforeEach(()=>{
 vi.clearAllMocks();api.loggedIn=true;api.bank.mockResolvedValue(bank);api.poor.mockResolvedValue([poor]);api.local.mockReturnValue({totalQuestions:10,averageEffectiveness:.7,poorlyPerformingCount:1,wellPerformingCount:9});
 api.getToken.mockResolvedValue('synthetic-test-token');api.getClaims.mockResolvedValue({claims:{admin:true,teacher:false}});api.search.mockResolvedValue([{id:'synthetic-user',name:'Sample Account',role:'teacher',roles:['teacher']}]);api.pending.mockReturnValue([feedback]);api.resolve.mockImplementation(()=>api.pending.mockReturnValue([]));api.save.mockImplementation(settings=>settings);
 api.cloud.mockResolvedValue({totalQuestions:120,averagePerDay:4,bySubject:{Maths:70,English:50},byDifficulty:{Easy:40,Medium:60,Hard:20},byAgeGroup:{9:120}});
 api.summary.mockReturnValue({totalQuizzes:2,totalQuestions:20,correctAnswers:14,overallAccuracy:70,totalTimeMinutes:10,topicPerformance:[{subject:'Maths',topic:'Fractions',totalAttempts:2,avgScore:70,bestScore:80,trend:'improving',masteryLevel:'proficient'}],dailyActivity:days,studyPattern:{preferredTime:'afternoon',avgSessionLength:5,mostActiveDay:'Sunday'},recommendations:[],weeklyReport:{weekStart:'2026-10-25',weekEnd:'2026-10-31',totalQuizzes:2,avgAccuracy:70,totalTimeMinutes:10,xpEarned:40,streakDays:1,topSubject:'Maths',struggleAreas:[],achievements:[],comparedToLastWeek:{quizzes:1,accuracy:-5,time:0}}});
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});
describe('Clear Path administration preserves existing behavior',()=>{
 it('keeps metric refresh and token-claim refresh arguments',async()=>{
  render(<Admin/>);await screen.findByText('120');await waitFor(()=>expect(api.getClaims).toHaveBeenCalledWith(false));
  fireEvent.click(screen.getByRole('button',{name:'Refresh Claims'}));await waitFor(()=>expect(api.getClaims).toHaveBeenLastCalledWith(true));
  fireEvent.click(screen.getByRole('button',{name:'Refresh metrics'}));await waitFor(()=>expect(api.bank).toHaveBeenLastCalledWith({forceRefresh:true}));
  expect(await screen.findByText('UID: synthetic-admin')).toBeVisible();expect(screen.getByText('sample-admin@example.invalid')).toBeVisible();
 });
 it('preserves role validation and the exact authenticated role-update request without adding confirmations',async()=>{
  const fetch=vi.fn().mockResolvedValue({ok:true,json:async()=>({ok:true})});vi.stubGlobal('fetch',fetch);const confirm=vi.spyOn(window,'confirm');
  render(<Admin initialView="users"/>);await screen.findByText('Sample Account');
  fireEvent.click(screen.getByRole('button',{name:'Update Roles'}));expect(api.toast).toHaveBeenLastCalledWith('error','Enter an email address');expect(fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Role management email'),{target:{value:' DEMO@EXAMPLE.INVALID '}});
  fireEvent.click(screen.getByLabelText('student'));fireEvent.click(screen.getByRole('button',{name:'Update Roles'}));expect(api.toast).toHaveBeenLastCalledWith('error','Select at least one role');
  fireEvent.click(screen.getByLabelText('teacher'));fireEvent.click(screen.getByRole('button',{name:'Update Roles'}));
  await waitFor(()=>expect(api.toast).toHaveBeenCalledWith('success','Roles updated. User must sign out/in.'));
  expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/admin/set-user-roles',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer synthetic-test-token'},body:JSON.stringify({email:'demo@example.invalid',roles:['teacher']})});
  expect(api.search).toHaveBeenCalledTimes(2);expect(confirm).not.toHaveBeenCalled();
 });
 it('retains the signed-in gate and server rejection behavior for role updates',async()=>{
  const fetch=vi.fn().mockResolvedValue({ok:false,json:async()=>({error:'Synthetic denied'})});vi.stubGlobal('fetch',fetch);
  render(<Admin initialView="users"/>);await screen.findByText('Sample Account');fireEvent.change(screen.getByLabelText('Role management email'),{target:{value:'demo@example.invalid'}});
  api.loggedIn=false;fireEvent.click(screen.getByRole('button',{name:'Update Roles'}));expect(api.toast).toHaveBeenLastCalledWith('error','You must be logged in');expect(fetch).not.toHaveBeenCalled();
  api.loggedIn=true;fireEvent.click(screen.getByRole('button',{name:'Update Roles'}));await waitFor(()=>expect(api.toast).toHaveBeenCalledWith('error','Synthetic denied'));expect(api.search).toHaveBeenCalledOnce();
 });
 it('preserves directory Enter search, filtering and the error state',async()=>{
  render(<Admin initialView="users"/>);await screen.findByText('Sample Account');
  fireEvent.change(screen.getByLabelText('Filter users by role'),{target:{value:'parent'}});expect(screen.queryByText('Sample Account')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Search users by name'),{target:{value:' Sample '}});api.search.mockRejectedValueOnce(Error('Synthetic denied'));
  fireEvent.keyDown(screen.getByLabelText('Search users by name'),{key:'Enter'});await screen.findByText('Directory access needs admin permission');expect(api.search).toHaveBeenLastCalledWith('Sample');expect(api.toast).toHaveBeenCalledWith('error','Synthetic denied');
 });
 it('keeps feedback resolution, navigation callbacks and moderation refresh exact',async()=>{
  const quality=vi.fn(),curriculum=vi.fn();render(<Admin initialView="content" onOpenQuestionQuality={quality} onOpenCurriculumCoverage={curriculum}/>);
  await screen.findByText('Synthetic feedback only');fireEvent.click(screen.getByRole('button',{name:'Mark Resolved'}));
  expect(api.resolve).toHaveBeenCalledExactlyOnceWith('synthetic-feedback');expect(api.toast).toHaveBeenCalledWith('success','Feedback marked resolved');expect(screen.queryByText('Synthetic feedback only')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Review Questions',exact:true}));fireEvent.click(screen.getByRole('button',{name:'View Curriculum Coverage'}));expect(quality).toHaveBeenCalledOnce();expect(curriculum).toHaveBeenCalledOnce();
 });
 it('preserves local settings values, callbacks and the 2500ms save message',async()=>{
  vi.useFakeTimers();render(<Admin initialView="settings"/>);await act(async()=>{});
  const toggle=screen.getByRole('button',{name:'Maintenance Mode'});expect(toggle).toHaveTextContent('Off');fireEvent.click(toggle);expect(toggle).toHaveAttribute('aria-pressed','true');expect(toggle).toHaveTextContent('✓On');
  fireEvent.change(screen.getByLabelText('Platform Name'),{target:{value:'Synthetic renamed workspace'}});fireEvent.change(screen.getByLabelText('Quality Threshold'),{target:{value:'80'}});
  fireEvent.click(screen.getByRole('button',{name:'Save Changes'}));expect(api.save).toHaveBeenCalledExactlyOnceWith({...api.settings,platformName:'Synthetic renamed workspace',maintenanceMode:true,qualityThreshold:80});
  expect(screen.getByText('Settings saved on this device.')).toBeVisible();act(()=>vi.advanceTimersByTime(2499));expect(screen.getByText('Settings saved on this device.')).toBeVisible();act(()=>vi.advanceTimersByTime(1));expect(screen.queryByText('Settings saved on this device.')).not.toBeInTheDocument();
 });
 it('keeps question-quality filters, minimum attempts, fallback, disclosure and close focus',async()=>{
  const close=vi.fn();render(<Quality onClose={close}/>);await screen.findByText(poor.question);
  expect(api.poor).toHaveBeenCalledWith(undefined,5);const details=screen.getByRole('button',{name:'View details'});details.focus();fireEvent.click(details);expect(details).toHaveAttribute('aria-expanded','true');expect(screen.getByText('Full Question:')).toBeVisible();
  fireEvent.change(screen.getByLabelText('Filter questions by subject'),{target:{value:'Maths'}});await waitFor(()=>expect(api.poor).toHaveBeenLastCalledWith('Maths',5));
  api.bank.mockRejectedValueOnce(Error('Synthetic offline'));vi.spyOn(console,'error').mockImplementation(()=>{});fireEvent.click(screen.getByLabelText('Refresh question quality data'));await screen.findByText('Failed to load data. Using local stats only.');expect(api.local).toHaveBeenLastCalledWith('Maths');
  fireEvent.keyDown(document,{key:'Escape'});expect(close).toHaveBeenCalledOnce();
 });
 it('keeps cloud refresh, error and original labelled numeric bar values',async()=>{
  const view=render(<Cloud/>);await screen.findByText('120',{selector:'p'});expect(screen.getByText('70')).toBeVisible();expect(view.container.querySelector('.ca-fill')).toHaveStyle({width:'58.333333333333336%'});
  api.cloud.mockRejectedValueOnce(Error('Synthetic cloud unavailable'));vi.spyOn(console,'error').mockImplementation(()=>{});fireEvent.click(screen.getByRole('button',{name:'🔄 Refresh'}));await screen.findByText('Synthetic cloud unavailable');expect(api.cloud).toHaveBeenCalledTimes(2);
 });
 it('exposes exactly the existing daily values in a table and adds non-colour activity signals',()=>{
  render(<Analytics onClose={vi.fn()}/>);fireEvent.click(screen.getByRole('button',{name:'📅 Activity'}));
  expect(screen.getByRole('img',{name:'2026-10-25: 2 quizzes'})).toBeInTheDocument();fireEvent.click(screen.getByText('Daily activity data',{exact:true}));
  const rows=within(screen.getByRole('table',{name:'Daily activity (all displayed days)'})).getAllByRole('row');expect(rows[1]).toHaveTextContent('2026-10-252201410Maths');expect(rows[2]).toHaveTextContent('2026-10-260000No activity');
  fireEvent.click(screen.getByRole('button',{name:'📈 Weekly'}));expect(screen.getByText('Active')).toBeInTheDocument();expect(screen.getAllByText('No quizzes')).toHaveLength(6);
  fireEvent.click(screen.getByRole('button',{name:'📚 Topics'}));expect(screen.getByText('improving')).toBeVisible();expect(screen.getByText('proficient')).toBeVisible();
 });
 it('keeps curriculum selectors, existing mock progress and strand disclosure',()=>{
  vi.spyOn(Math,'random').mockReturnValue(.9);render(<Curriculum studentName="Sample Learner" studentYear={5}/>);
  const strand=screen.getAllByRole('button').find(b=>b.textContent?.includes('objectives mastered'))!;expect(strand).toHaveAttribute('aria-expanded','false');fireEvent.click(strand);expect(strand).toHaveAttribute('aria-expanded','true');expect(screen.getAllByText('Mastered').length).toBeGreaterThan(1);
  fireEvent.change(screen.getByLabelText('Curriculum subject'),{target:{value:'English'}});expect(screen.getByLabelText('Curriculum subject')).toHaveValue('English');fireEvent.change(screen.getByLabelText('Curriculum year'),{target:{value:'4'}});expect(screen.getByLabelText('Curriculum year')).toHaveValue('4');
 });
});
