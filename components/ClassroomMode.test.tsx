import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClassroomSession } from '../services/classroomService';
const api=vi.hoisted(()=>({joinSession:vi.fn(),submitAnswer:vi.fn(),unsubscribe:vi.fn(),listener:null as null|((session:ClassroomSession)=>void)}));
vi.mock('../services/classroomService',()=>({classroomService:{
  joinSession:api.joinSession,submitAnswer:api.submitAnswer,getLeaderboard:()=>[],
  subscribeToSession:(_id:string,callback:(session:ClassroomSession)=>void)=>{api.listener=callback;return api.unsubscribe;},
}}));
vi.mock('../services/geminiService',()=>({generateQuiz:vi.fn()}));
import ClassroomMode from './ClassroomMode';
const waiting:ClassroomSession={id:'local-session',sessionCode:'ABC123',teacherId:'teacher',teacherName:'Teacher',title:'Fractions practice',subject:'Maths',topic:'Fractions',difficulty:'Medium',status:'waiting',questions:[{question:'Which is the same as one half?',options:['2/4','1/4','2/3','3/4'],correctAnswer:'2/4',explanation:'Two quarters make one half.'}],currentQuestionIndex:0,timePerQuestion:30,students:{},createdAt:0,settings:{showLeaderboardDuringQuiz:false,showCorrectAnswers:true,allowLateJoin:true,randomizeQuestions:false,randomizeOptions:false}};
beforeEach(()=>{vi.clearAllMocks();api.listener=null;api.joinSession.mockResolvedValue(waiting);api.submitAnswer.mockResolvedValue(undefined);});
async function joinAndStart() {
  render(<ClassroomMode userId="pupil" userName="Casey" isTeacher={false} onExit={vi.fn()}/>);
  fireEvent.click(screen.getByRole('button',{name:/Join Session/}));
  expect(screen.getByRole('button',{name:'Join'})).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Class code'),{target:{value:'abc1234'}});
  expect(screen.getByLabelText('Class code')).toHaveValue('ABC123');
  fireEvent.click(screen.getByRole('button',{name:'Join'}));
  await screen.findByText(/Waiting for teacher/);
  // The realtime subscription is set up in an effect that can run just after the waiting view paints.
  await waitFor(()=>expect(api.listener).not.toBeNull());
  await act(async()=>api.listener?.({...waiting,status:'active',questionStartTime:Date.now()}));
}
describe('pupil classroom presentation preserves realtime actions',()=>{
  it('keeps the join payload, subscription, one-answer gate and successful delivery status',async()=>{
    let sent!:()=>void;
    api.submitAnswer.mockReturnValueOnce(new Promise<void>(resolve=>{sent=resolve;}));
    await joinAndStart();
    expect(api.joinSession).toHaveBeenCalledWith('ABC123','pupil','Casey',expect.stringMatching(/^#/));
    const answer=screen.getByRole('button',{name:/A\.\s*2\/4/});
    fireEvent.click(answer);
    expect(api.submitAnswer).toHaveBeenCalledWith('local-session','pupil',0,true,expect.any(Number));
    expect(answer).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Sending your answer');
    expect(screen.queryByText('✓ Answer sent!')).toBeNull();
    await act(async()=>sent());
    expect(screen.getByRole('status')).toHaveTextContent('✓ Answer sent!');
    expect(screen.getByText(/Names and scores can appear/)).toBeVisible();
  });
  it('shows delivery failure without claiming success or changing the original answer gate',async()=>{
    api.submitAnswer.mockRejectedValueOnce(new Error('offline'));
    await joinAndStart();
    fireEvent.click(screen.getByRole('button',{name:/B\.\s*1\/4/}));
    await screen.findByText(/could not be sent/);
    expect(api.submitAnswer).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button',{name:/B\.\s*1\/4/})).toBeDisabled();
    expect(screen.queryByText('✓ Answer sent!')).toBeNull();
  });
  it('keeps invalid-code feedback and does not enter a session',async()=>{
    api.joinSession.mockResolvedValueOnce(null);
    render(<ClassroomMode userId="pupil" userName="Casey" isTeacher={false} onExit={vi.fn()}/>);
    fireEvent.click(screen.getByRole('button',{name:/Join Session/}));
    fireEvent.change(screen.getByLabelText('Class code'),{target:{value:'bad123'}});
    fireEvent.click(screen.getByRole('button',{name:'Join'}));
    expect(await screen.findByText('Session not found or no longer accepting players')).toBeVisible();
    expect(api.listener).toBeNull();
  });
  it('leaves teacher controls outside the pupil restyle',()=>{
    const view=render(<ClassroomMode userId="teacher" userName="Teacher" isTeacher onExit={vi.fn()}/>);
    expect(screen.getByRole('button',{name:/Create New Session/})).toBeVisible();
    expect(view.container.querySelector('.sunny-classroom')).toBeNull();
  });
});
