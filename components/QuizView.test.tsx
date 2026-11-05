import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import QuizView from './QuizView';
import { Difficulty, QuestionType, type QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';
import { recordQuizAttempts } from '../services/questionPerformance';
vi.mock('../context/UserContext', () => ({ useUser: () => ({ user: null }) }));
vi.mock('../services/geminiService', () => ({ generateQuiz: vi.fn(), generateQuizHint: vi.fn() }));
vi.mock('../services/questionPerformance', () => ({ recordQuizAttempts: vi.fn() }));
vi.mock('../hooks/useTTSEnhanced', () => ({ useTTSEnhanced: () => ({ speak: vi.fn(), cancel: vi.fn(), isSpeaking: false }) }));
vi.mock('../hooks/useGameSounds', () => ({ useGameSounds: () => ({ playClick: vi.fn() }) }));
vi.mock('../hooks/useVoiceInput', () => ({ useVoiceInput: () => ({ isSupported: false }), parseAnswerOption: vi.fn() }));
const questions: QuizQuestion[] = [
  { question: 'Which number is even?', options: ['Two', 'Three'], correctAnswer: '0', explanation: 'Two splits into equal pairs.', questionType: QuestionType.MultipleChoice },
  { question: 'Which number is odd?', options: ['Four', 'Five'], correctAnswer: 'Five', explanation: 'Five has one left over.', questionType: QuestionType.MultipleChoice },
  { question: 'Two plus two?', options: ['Four', 'Six'], correctAnswer: 'Four', questionType: QuestionType.MultipleChoice },
];
const props = {subject: 'Maths', topic: 'Numbers', difficulty: Difficulty.Medium, studentAge: 9, onSubmit: vi.fn()};
afterEach(() => { cleanup(); vi.useRealTimers(); });
beforeEach(() => { vi.clearAllMocks(); vi.mocked(generateQuiz).mockResolvedValue(questions); });
describe('Sunny Owl quiz keeps the submission flow', () => {
  it('advances immediately, presents actual previous feedback and submits the unchanged scores once', async () => {
    render(<QuizView {...props}/>);
    const first = await screen.findByRole('radio', {name: 'Option: Two'});
    expect(screen.getByText('No timer')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Quiz progress' })).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByRole('button', {name: 'Go to next question'})).toBeDisabled();
    fireEvent.click(first);
    expect(screen.getByText('Your answer')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Go to next question'}));
    expect(screen.getByText('Which number is odd?')).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Which number is odd?'})).toHaveFocus();
    expect(screen.getByText('✓ Correct! Well done.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', {name: 'Option: Four'}));
    fireEvent.click(screen.getByRole('button', {name: 'Go to next question'}));
    expect(screen.getByText('↻ Worth another look')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', {name: 'Option: Four'}));
    fireEvent.click(screen.getByRole('button', {name: 'Finish quiz and see results'}));
    expect(props.onSubmit).toHaveBeenCalledOnce();
    const results = props.onSubmit.mock.calls[0][0];
    expect(results.map((r: {isCorrect: boolean}) => r.isCorrect)).toEqual([true, false, true]);
    expect(recordQuizAttempts).toHaveBeenCalledOnce();
  });
  it('lets keyboard users select and wrap radio answers without submitting', async () => {
    render(<QuizView {...props}/>);
    const first = await screen.findByRole('radio', {name: 'Option: Two'});
    const second = screen.getByRole('radio', {name: 'Option: Three'});
    first.focus();
    fireEvent.keyDown(first, {key: 'ArrowRight'});
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute('aria-checked', 'true');
    expect(first).toHaveAttribute('tabindex', '-1');
    fireEvent.keyDown(second, {key: 'ArrowDown'});
    expect(first).toHaveFocus();
    expect(first).toHaveAttribute('aria-checked', 'true');
    expect(props.onSubmit).not.toHaveBeenCalled();
  });
  it('keeps the opt-in speed timeout and timer-off controls working', async () => {
    vi.useFakeTimers();
    vi.mocked(generateQuiz).mockResolvedValue([questions[0]]);
    render(<QuizView {...props} mode="speed"/>);
    await act(async () => {});
    fireEvent.click(screen.getByRole('button', {name: '+30 seconds'}));
    expect(screen.getByText('45s')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Turn off timer'}));
    await act(async () => { vi.advanceTimersByTime(60000); });
    expect(props.onSubmit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name: 'Turn timer on'}));
    await act(async () => { vi.advanceTimersByTime(15001); });
    await act(async () => { vi.runOnlyPendingTimers(); });
    expect(props.onSubmit).toHaveBeenCalledOnce();
    expect(props.onSubmit.mock.calls[0][0][0]).toMatchObject({userAnswer: '', isCorrect: false});
  });
});
