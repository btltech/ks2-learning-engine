import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LessonView from './LessonView';
import { Difficulty } from '../types';
import { generateLesson } from '../services/geminiService';
const tts = vi.hoisted(() => ({ speak: vi.fn(), cancel: vi.fn(), pause: vi.fn(), resume: vi.fn(), isSpeaking: true, isPaused: false, isLoading: true, errorMessage: null, needsGesture: false, setNeedsGesture: vi.fn() }));
vi.mock('../hooks/useTTSEnhanced', () => ({ useTTSEnhanced: () => tts }));
vi.mock('../hooks/useGameSounds', () => ({ useGameSounds: () => ({ playClick: vi.fn() }) }));
vi.mock('../services/geminiService', () => ({ generateLesson: vi.fn() }));
vi.mock('../services/cloudQuestionRepository', () => ({ getCanonicalQuestionsForCurriculumUnit: vi.fn(async () => []) }));
const props = { subject:'PSHE', topic:'Money choices', studentAge:8, difficulty:Difficulty.Medium, onBack:vi.fn(), onStartQuiz:vi.fn() };
afterEach(cleanup);
beforeEach(() => { vi.clearAllMocks(); Object.assign(tts,{isSpeaking:true,isPaused:false,isLoading:true}); vi.mocked(generateLesson).mockResolvedValue('# Teach\nBudget lesson.'); });
describe('lesson speech controls', () => {
  it('keeps Pause and Resume enabled while the speech promise is pending, and exposes Stop', async () => {
    const view=render(<LessonView {...props}/>); await screen.findByText('Budget lesson.'); await act(async () => {}); tts.cancel.mockClear();
    expect(screen.getByRole('button',{name:'Pause reading'})).toBeEnabled(); fireEvent.click(screen.getByRole('button',{name:'Pause reading'})); expect(tts.pause).toHaveBeenCalledOnce();
    tts.isPaused=true; view.rerender(<LessonView {...props}/>);
    expect(screen.getByRole('button',{name:'Resume reading'})).toBeEnabled(); fireEvent.click(screen.getByRole('button',{name:'Resume reading'})); expect(tts.resume).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button',{name:'Stop reading'})); expect(tts.cancel).toHaveBeenCalledOnce();
  });
  it('cancels immediately when switching lesson, before new content has loaded', async () => {
    const view=render(<LessonView {...props}/>); await screen.findByText('Budget lesson.'); await act(async () => {}); tts.cancel.mockClear();
    vi.mocked(generateLesson).mockReturnValueOnce(new Promise<string>(()=>{}));
    view.rerender(<LessonView {...props} topic="Conflict and repair"/>); await act(async () => {});
    expect(tts.cancel).toHaveBeenCalled(); expect(screen.queryByText('Budget lesson.')).not.toBeInTheDocument();
  });
  it('cancels when leaving the lesson page', async () => {
    const view=render(<LessonView {...props}/>); await screen.findByText('Budget lesson.'); await act(async () => {}); tts.cancel.mockClear(); view.unmount(); expect(tts.cancel).toHaveBeenCalled();
  });
});
