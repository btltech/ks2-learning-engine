import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FeedbackModal from './FeedbackModal';
import { QuestionType, type QuizResult } from '../types';
import { speakCelebration } from '../services/naturalTTS';
const prefs = vi.hoisted(() => ({ soundEnabled: true, reducedAnimations: false, osReduce: false }));
const sounds = vi.hoisted(() => ({ playSuccess: vi.fn(), playIncorrect: vi.fn() }));
vi.mock('../hooks/useGameSounds', () => ({ useGameSounds: () => ({...sounds, soundEnabled: prefs.soundEnabled}) }));
vi.mock('../context/UISettingsContext', () => ({ useUISettings: () => ({settings: {reducedAnimations: prefs.reducedAnimations}}) }));
vi.mock('../services/naturalTTS', () => ({ speakCelebration: vi.fn(), speakNaturally: vi.fn(), stopSpeaking: vi.fn() }));
vi.mock('../services/geminiService', () => ({ generateFeedback: vi.fn(async () => [{question: 'Odd?', explanation: 'Five is odd.'}]) }));
const results: QuizResult[] = [
  {question: 'Even?', options: ['Two', 'Three'], correctAnswer: 'Two', userAnswer: 'Two', isCorrect: true},
  {question: 'Odd?', options: ['Four', 'Five'], correctAnswer: 'Five', userAnswer: 'Four', isCorrect: false},
  {question: 'Draw', options: [], correctAnswer: '', userAnswer: 'Drawing submitted', questionType: QuestionType.Drawing, isScored: false, isCorrect: false},
];
const props = {quizResults: results, studentAge: 9, pointsEarned: 17, onRetry: vi.fn(), onNewTopic: vi.fn()};
beforeEach(() => { vi.clearAllMocks(); Object.assign(prefs, {soundEnabled: true, reducedAnimations: false, osReduce: false}); vi.stubGlobal('matchMedia', () => ({matches: prefs.osReduce})); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('Sunny Owl results', () => {
  it('uses real scored totals and points, keeps creative work separate and preserves the dialog actions', async () => {
    render(<FeedbackModal {...props}/>);
    expect(await screen.findByText('Five is odd.')).toBeInTheDocument();
    expect(screen.getByRole('group', {name: 'Quiz summary'})).toHaveFocus();
    expect(screen.getByLabelText('Your score: 1 out of 2 correct')).toBeInTheDocument();
    expect(screen.getByLabelText('You earned 17 points')).toBeInTheDocument();
    expect(screen.getByText(/1 creative task was completed/)).toBeInTheDocument();
    expect(screen.getByText('✓ Correct')).toBeInTheDocument();
    expect(screen.getByText('↻ Try again')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Retry the quiz'}));
    expect(props.onRetry).toHaveBeenCalledOnce();
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(props.onNewTopic).toHaveBeenCalledOnce();
  });
  it.each(['soundEnabled', 'reducedAnimations', 'osReduce'] as const)('suppresses automatic celebration for %s', async key => {
    vi.useFakeTimers();
    prefs[key] = key !== 'soundEnabled';
    render(<FeedbackModal {...props}/>);
    await act(async () => { vi.advanceTimersByTime(500); });
    expect(speakCelebration).not.toHaveBeenCalled();
    expect(sounds.playSuccess).not.toHaveBeenCalled();
    expect(sounds.playIncorrect).not.toHaveBeenCalled();
  });
  it('cancels delayed celebration when the dialog closes', async () => {
    vi.useFakeTimers();
    const view = render(<FeedbackModal {...props}/>);
    await act(async () => {});
    view.unmount();
    await act(async () => { vi.advanceTimersByTime(500); });
    expect(speakCelebration).not.toHaveBeenCalled();
  });
});
