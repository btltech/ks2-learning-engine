import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClassroomSession } from '../services/classroomService';
const api=vi.hoisted(()=>({createSession:vi.fn(),startSession:vi.fn(),nextQuestion:vi.fn(),endSession:vi.fn(),submitAnswer:vi.fn(),generate:vi.fn(),unsubscribe:vi.fn(),subscribe:vi.fn(),listener:null as null|((s:ClassroomSession)=>void)}));
vi.mock('../services/classroomService',()=>({classroomService:{...api,subscribeToSession:(id:string,listener:(s:ClassroomSession)=>void)=>{api.subscribe(id);api.listener=listener;return api.unsubscribe;},getLeaderboard:(s:ClassroomSession)=>Object.values(s.students)}}));
vi.mock('../services/geminiService',()=>({generateQuiz:api.generate}));
import ClassroomMode from './ClassroomMode';
const questions=[{question:'Which is one half?',options:['2/4','1/4'],correctAnswer:'2/4',explanation:'Two quarters.'},{question:'Three plus four?',options:['7','8'],correctAnswer:'7',explanation:'Seven.'}];
const waiting:ClassroomSession={id:'synthetic-session',sessionCode:'DEMO00',teacherId:'synthetic-teacher',teacherName:'Sample Teacher',title:'Fractions',subject:'Maths',topic:'Fractions',difficulty:'Medium',status:'waiting',questions,currentQuestionIndex:0,timePerQuestion:30,students:{},createdAt:0,settings:{showLeaderboardDuringQuiz:true,showCorrectAnswers:true,allowLateJoin:true,randomizeQuestions:false,randomizeOptions:false}};
beforeEach(()=>{vi.clearAllMocks();api.listener=null;api.createSession.mockResolvedValue(waiting);api.generate.mockResolvedValue(questions);api.startSession.mockResolvedValue(undefined);api.nextQuestion.mockResolvedValue(true);api.endSession.mockResolvedValue(undefined);});
afterEach(()=>{cleanup();vi.useRealTimers();});
async function create(){
 const exit=vi.fn();const view=render(<ClassroomMode userId="synthetic-teacher" userName="Sample Teacher" isTeacher onExit={exit}/>);
 fireEvent.click(screen.getByRole('button',{name:/Create New Session/}));
 fireEvent.change(screen.getByLabelText('Session Title'),{target:{value:'Fractions'}});
 fireEvent.click(screen.getByRole('button',{name:'Maths',exact:true}));
 fireEvent.change(screen.getByLabelText('Topic'),{target:{value:'Fractions'}});
 fireEvent.click(screen.getByRole('button',{name:'Create Session',exact:true}));
 await screen.findByText('DEMO00');
 // A waiting view can paint before the subscription effect; never emit before readiness.
 await waitFor(()=>expect(api.listener).not.toBeNull());
 return {...view,exit};
}
describe('Clear Path teacher classroom preserves realtime behavior',()=>{
 it('preserves create, live membership, teacher timer, next and completion without submitting answers',async()=>{
  const view=await create();
  expect(api.generate).toHaveBeenCalledExactlyOnceWith('Maths','Fractions','Medium',10);
  expect(api.createSession).toHaveBeenCalledExactlyOnceWith('synthetic-teacher','Sample Teacher','Fractions','Maths','Fractions','Medium',questions);
  expect(screen.getByRole('button',{name:/Start Quiz/})).toBeDisabled();
  const student={id:'synthetic-pupil',name:'Sample Learner',avatarColor:'#1E55C8',score:150,answers:[],joinedAt:0};
  await act(async()=>api.listener?.({...waiting,students:{'synthetic-pupil':student}}));
  fireEvent.click(screen.getByRole('button',{name:/Start Quiz/}));expect(api.startSession).toHaveBeenCalledExactlyOnceWith(waiting.id);
  // Only the realtime event moves the teacher from waiting to active.
  expect(screen.queryByRole('heading',{name:'Which is one half?'})).toBeNull();
  vi.useFakeTimers();const started=Date.now();
  await act(async()=>api.listener?.({...waiting,students:{'synthetic-pupil':student},status:'active',questionStartTime:started}));
  expect(screen.getByRole('heading',{name:'Which is one half?'})).toBeVisible();
  const subscriptions=api.subscribe.mock.calls.length;
  act(()=>vi.advanceTimersByTime(31_000));
  expect(api.subscribe).toHaveBeenCalledTimes(subscriptions);expect(api.submitAnswer).not.toHaveBeenCalled();
  expect(screen.getByRole('button',{name:/A\.\s*2\/4/})).toBeDisabled();
  fireEvent.click(screen.getByRole('button',{name:'Next Question →'}));
  expect(api.nextQuestion).toHaveBeenCalledExactlyOnceWith(waiting.id);
  await act(async()=>api.listener?.({...waiting,status:'active',questionStartTime:Date.now(),currentQuestionIndex:1}));
  expect(screen.getByRole('heading',{name:'Three plus four?'})).toBeVisible();
  api.nextQuestion.mockResolvedValue(false);fireEvent.click(screen.getByRole('button',{name:'Show Results'}));
  await act(async()=>{});expect(api.nextQuestion).toHaveBeenCalledTimes(2);
  expect(screen.getByRole('heading',{name:'🎉 Quiz Complete!'})).toBeVisible();
  expect(api.submitAnswer).not.toHaveBeenCalled();view.unmount();expect(api.unsubscribe).toHaveBeenCalledTimes(api.subscribe.mock.calls.length);
 });
 it('keeps cancel/end and remote completion events working',async()=>{
  const view=await create();fireEvent.click(screen.getByRole('button',{name:'Cancel'}));
  await waitFor(()=>expect(view.exit).toHaveBeenCalledOnce());expect(api.endSession).toHaveBeenCalledExactlyOnceWith(waiting.id);
  await act(async()=>api.listener?.({...waiting,status:'completed'}));expect(screen.getByRole('heading',{name:'🎉 Quiz Complete!'})).toBeVisible();
 });
});
