import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import QuizView from './QuizView';
import { Difficulty, QuestionType, type QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';
import { recordQuizAttempts } from '../services/questionPerformance';
import { buildQuizResults } from '../services/quizScoring';

const voice = vi.hoisted(() => ({ transcript: '', onCommand: undefined as ((command: string) => void) | undefined }));
const hooks = vi.hoisted(() => ({ speak: vi.fn(), cancel: vi.fn(), playClick: vi.fn(), stopListening: vi.fn() }));
vi.mock('../context/UserContext', () => ({ useUser: () => ({ user: null }) }));
vi.mock('../services/geminiService', () => ({ generateQuiz: vi.fn(), generateQuizHint: vi.fn() }));
vi.mock('../services/questionPerformance', () => ({ recordQuizAttempts: vi.fn() }));
vi.mock('../services/quizScoring', async (original) => {
  const scoring = await original<typeof import('../services/quizScoring')>();
  return { ...scoring, buildQuizResults: vi.fn(scoring.buildQuizResults) };
});
vi.mock('../hooks/useTTSEnhanced', () => ({ useTTSEnhanced: () => ({ ...hooks, isSpeaking: false }) }));
vi.mock('../hooks/useGameSounds', () => ({ useGameSounds: () => hooks }));
vi.mock('../hooks/useVoiceInput', () => ({
  useVoiceInput: ({ onCommand }: { onCommand: (command: string) => void }) => {
    voice.onCommand = onCommand;
    return { isSupported: false, transcript: voice.transcript, stopListening: hooks.stopListening };
  },
  parseAnswerOption: (transcript: string) => transcript,
}));
// Canvas rendering is outside this flow test; exercise its existing save contract.
vi.mock('./DrawingCanvas', () => ({ DrawingCanvas: ({ onSave }: { onSave: (data: string) => void }) => <button onClick={() => onSave('data:image/png;base64,private-drawing')}>Submit Drawing</button> }));

const questions: QuizQuestion[] = [
  { question: 'Which number is even?', options: ['Two', 'Three'], correctAnswer: '0', explanation: 'Two splits into equal pairs.', questionType: QuestionType.MultipleChoice },
  { question: 'Which number is odd?', options: ['Four', 'Five'], correctAnswer: 'Five', explanation: 'Five has one left over.', questionType: QuestionType.MultipleChoice },
  { question: 'Two plus two?', options: ['Four', 'Six'], correctAnswer: 'Four', questionType: QuestionType.MultipleChoice },
];
const props = { subject: 'Maths', topic: 'Numbers', difficulty: Difficulty.Medium, studentAge: 9, onSubmit: vi.fn() };
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name, exact: true }));
const check = () => click('Check answer');
const feedback = () => screen.getByRole('status', { name: 'Answer feedback' });
afterEach(() => { cleanup(); vi.useRealTimers(); });
beforeEach(() => { voice.transcript = ''; voice.onCommand = undefined; vi.clearAllMocks(); vi.mocked(generateQuiz).mockResolvedValue(questions); });

describe('QuizView check then next', () => {
  it('checks the current question, freezes its answer, then advances without scoring again', async () => {
    render(<QuizView {...props} />);
    const first = await screen.findByRole('radio', { name: 'Option: Two' });
    expect(screen.getByText('No timer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled();
    fireEvent.click(first);
    check();
    expect(screen.getByRole('heading', { name: questions[0].question })).toBeInTheDocument();
    expect(feedback()).toHaveTextContent("✓ Hooray! That's correct");
    expect(feedback()).toHaveFocus();
    expect(first).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'Option: Three' }));
    expect(first).toHaveAttribute('aria-checked', 'true');
    expect(props.onSubmit).not.toHaveBeenCalled();
    expect(recordQuizAttempts).not.toHaveBeenCalled();
    expect(buildQuizResults).toHaveBeenCalledTimes(1);
    // The first enabled, sequentially focusable control after feedback is Next.
    const next = screen.getByRole('button', { name: 'Next question' });
    const following = [...document.querySelectorAll<HTMLElement>('button,input,[tabindex]')]
      .filter(el => Boolean(feedback().compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING))
      .filter(el => el.tabIndex >= 0 && !el.matches(':disabled'));
    expect(following[0]).toBe(next);
    fireEvent.click(next);
    expect(buildQuizResults).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status', { name: 'Answer feedback' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: questions[1].question })).toHaveFocus();
    fireEvent.click(screen.getByRole('radio', { name: 'Option: Four' }));
    check();
    expect(feedback()).toHaveTextContent('→ Worth another look');
    expect(feedback()).toHaveTextContent('Five has one left over.');
    expect(feedback()).toHaveTextContent('Correct answer: Five');
    fireEvent.click(screen.getByRole('radio', { name: 'Option: Five' }));
    click('Next question');
    fireEvent.click(screen.getByRole('radio', { name: 'Option: Four' }));
    check();
    expect(props.onSubmit).not.toHaveBeenCalled();
    click('Finish Quiz');
    click('Finish Quiz');
    expect(props.onSubmit).toHaveBeenCalledOnce();
    expect(recordQuizAttempts).toHaveBeenCalledOnce();
    expect(buildQuizResults).toHaveBeenCalledTimes(3);
    expect(props.onSubmit.mock.calls[0][0].map((r: { isCorrect: boolean }) => r.isCorrect)).toEqual([true, false, true]);
  });

  it('guards same-render rapid taps, double clicks and held Enter/Space without skipping feedback', async () => {
    render(<QuizView {...props} />);
    fireEvent.click(await screen.findByRole('radio', { name: 'Option: Two' }));
    const button = screen.getByRole('button', { name: 'Check answer' });
    act(() => { button.click(); button.click(); button.click(); });
    fireEvent.click(button, { detail: 2 });
    expect(buildQuizResults).toHaveBeenCalledOnce();
    expect(feedback()).toHaveFocus();
    for (const key of ['Enter', ' ']) {
      expect(fireEvent.keyDown(button, { key, repeat: true })).toBe(false);
    }
    expect(screen.getByRole('heading', { name: questions[0].question })).toBeInTheDocument();
    act(() => { button.click(); button.click(); });
    expect(screen.getByRole('heading', { name: questions[1].question })).toHaveFocus();
    expect(buildQuizResults).toHaveBeenCalledOnce();
  });


  it('locks voice answers and repeated submit commands, and ignores transcripts received during feedback', async () => {
    const { rerender } = render(<QuizView {...props} />);
    await screen.findByRole('radio', { name: 'Option: Two' });
    act(() => voice.onCommand?.('selectA'));
    act(() => voice.onCommand?.('submit'));
    act(() => { voice.onCommand?.('selectB'); voice.onCommand?.('submit'); });
    expect(buildQuizResults).toHaveBeenCalledOnce();
    expect(hooks.stopListening).toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'Option: Two' })).toHaveAttribute('aria-checked', 'true');
    voice.transcript = 'B';
    rerender(<QuizView {...props} />);
    act(() => voice.onCommand?.('next'));
    expect(screen.getByRole('heading', { name: questions[1].question })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled();
    expect(buildQuizResults).toHaveBeenCalledOnce();
  });

  it('lets keyboard users select and wrap radio answers without submitting', async () => {
    render(<QuizView {...props} />);
    const first = await screen.findByRole('radio', { name: 'Option: Two' });
    const second = screen.getByRole('radio', { name: 'Option: Three' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute('aria-checked', 'true');
    expect(first).toHaveAttribute('tabindex', '-1');
    fireEvent.keyDown(second, { key: 'ArrowDown' });
    expect(first).toHaveFocus();
    expect(first).toHaveAttribute('aria-checked', 'true');
    expect(buildQuizResults).not.toHaveBeenCalled();
  });

  const kinds: Array<{ type: QuestionType; question: Partial<QuizQuestion>; choose: () => void; answer: string; correct: boolean; expected?: string }> = [
    { type: QuestionType.TrueFalse, question: { options: ['True', 'False'], correctAnswer: 'False' }, choose: () => fireEvent.click(screen.getByRole('radio', { name: 'Option: True' })), answer: 'True', correct: false, expected: 'False' },
    { type: QuestionType.FillInBlank, question: { correctAnswer: 'colour', acceptableAnswers: ['color'] }, choose: () => fireEvent.change(screen.getByRole('textbox'), { target: { value: ' color ' } }), answer: 'color', correct: true },
    { type: QuestionType.Matching, question: { matchingPairs: [{ left: 'cat', right: 'gato' }, { left: 'dog', right: 'perro' }] }, choose: () => { click('cat'); click('perro'); click('dog'); click('gato'); }, answer: JSON.stringify({ cat: 'perro', dog: 'gato' }), correct: false, expected: 'cat → gato; dog → perro' },
    { type: QuestionType.DragAndDrop, question: { dragItems: ['Apple', 'Carrot'], dropZones: ['Fruit', 'Vegetables'] }, choose: () => { click('Select Apple'); click('Place selected item in Fruit'); click('Select Carrot'); click('Place selected item in Vegetables'); }, answer: JSON.stringify({ 'item-0': 'Fruit', 'item-1': 'Vegetables' }), correct: true },
    { type: QuestionType.Ordering, question: { options: ['Two', 'One'], correctOrder: ['One', 'Two'] }, choose: () => click('Move Two down'), answer: JSON.stringify(['One', 'Two']), correct: true },
    { type: QuestionType.Drawing, question: {}, choose: () => click('Submit Drawing'), answer: 'Drawing submitted', correct: false },
  ];
  it.each(kinds)('uses the shared flow for $type, preserving the canonical score and recorded answer', async ({ type, question, choose, answer, correct, expected }) => {
    const q = { ...questions[0], ...question, questionType: type };
    vi.mocked(generateQuiz).mockResolvedValue([q]);
    render(<QuizView {...props} />);
    await screen.findByRole('heading', { name: q.question });
    expect(screen.queryByRole('button', { name: 'Check Answers' })).not.toBeInTheDocument();
    choose();
    check();
    expect(feedback()).toHaveFocus();
    if (expected) expect(feedback()).toHaveTextContent(`Correct answer: ${expected}`);
    if (type === QuestionType.Drawing) expect(feedback()).toHaveTextContent('Creative task complete');
    const fieldset = screen.getByRole('group', { name: 'Your answer' });
    expect(fieldset).toBeDisabled();
    expect(props.onSubmit).not.toHaveBeenCalled();
    click('Finish Quiz');
    expect(buildQuizResults).toHaveBeenCalledOnce();
    expect(props.onSubmit).toHaveBeenCalledOnce();
    expect(props.onSubmit.mock.calls[0][0][0]).toMatchObject({ userAnswer: answer, isCorrect: correct, isScored: type !== QuestionType.Drawing });
  });

  it('preserves a reordered answer across quiz re-renders, speed timer ticks and Check', async () => {
    vi.useFakeTimers();
    vi.mocked(generateQuiz).mockResolvedValue([{ ...questions[0], options: ['Two', 'One'], correctOrder: ['One', 'Two'], questionType: QuestionType.Ordering }]);
    const { rerender } = render(<QuizView {...props} mode="speed" />);
    await act(async () => {});
    click('Move Two down');
    const visibleOrder = () => screen.getAllByRole('listitem').map(item => item.children[1].textContent);
    expect(visibleOrder()).toEqual(['One', 'Two']);
    rerender(<QuizView {...props} studentName="Casey" mode="speed" />);
    expect(visibleOrder()).toEqual(['One', 'Two']);
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText('12s')).toBeInTheDocument();
    expect(visibleOrder()).toEqual(['One', 'Two']);
    check();
    expect(visibleOrder()).toEqual(['One', 'Two']);
    expect(feedback()).toHaveTextContent("Hooray! That's correct");
    act(() => vi.advanceTimersByTime(30000));
    expect(visibleOrder()).toEqual(['One', 'Two']);
    click('Finish Quiz');
    expect(buildQuizResults).toHaveBeenCalledOnce();
    expect(props.onSubmit).toHaveBeenCalledOnce();
    expect(props.onSubmit.mock.calls[0][0][0]).toMatchObject({ userAnswer: '["One","Two"]', isCorrect: true });
  });

  it('checks fill-in answers with Enter once; repeats cannot advance or change the locked answer', async () => {
    vi.mocked(generateQuiz).mockResolvedValue([{ ...questions[0], questionType: QuestionType.FillInBlank, correctAnswer: 'Two' }]);
    render(<QuizView {...props} />);
    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'wrong' } });
    fireEvent.keyDown(input, { key: 'Enter', repeat: true });
    expect(buildQuizResults).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'Enter', repeat: true });
    expect(feedback()).toHaveFocus();
    expect(feedback()).toHaveTextContent('Worth another look');
    expect(input).toBeDisabled();
    click('Finish Quiz');
    expect(props.onSubmit.mock.calls[0][0][0]).toMatchObject({ userAnswer: 'wrong', isCorrect: false });
    expect(buildQuizResults).toHaveBeenCalledOnce();
  });

  it('resets child state between consecutive matching questions', async () => {
    const q = { ...questions[0], questionType: QuestionType.Matching, matchingPairs: [{ left: 'cat', right: 'gato' }] };
    vi.mocked(generateQuiz).mockResolvedValue([q, { ...q, question: 'Match again' }]);
    render(<QuizView {...props} />);
    await screen.findByRole('button', { name: 'cat' });
    click('cat'); click('gato'); check(); click('Next question');
    expect(screen.getByRole('heading', { name: 'Match again' })).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Remove match for cat' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled();
    click('cat'); click('gato'); check(); click('Finish Quiz');
    expect(props.onSubmit.mock.calls[0][0].map((r: { isCorrect: boolean }) => r.isCorrect)).toEqual([true, true]);
  });

  it('times out once, keeps the current question, waits for Next and excludes feedback reading time', async () => {
    vi.useFakeTimers();
    vi.mocked(generateQuiz).mockResolvedValue(questions.slice(0, 2));
    render(<QuizView {...props} mode="speed" />);
    await act(async () => {});
    fireEvent.click(screen.getByRole('radio', { name: 'Option: Two' }));
    act(() => vi.advanceTimersByTime(15000));
    expect(feedback()).toHaveTextContent('Time’s up');
    expect(feedback()).toHaveTextContent('Correct answer: Two');
    expect(feedback()).toHaveFocus();
    expect(screen.getByRole('heading', { name: questions[0].question })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(60000));
    expect(buildQuizResults).toHaveBeenCalledOnce();
    expect(props.onSubmit).not.toHaveBeenCalled();
    click('Next question');
    expect(screen.getByText('15s')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(3000));
    fireEvent.click(screen.getByRole('radio', { name: 'Option: Five' })); check();
    act(() => vi.advanceTimersByTime(60000));
    click('Finish Quiz');
    expect(props.onSubmit).toHaveBeenCalledOnce();
    expect(props.onSubmit.mock.calls[0][0][0]).toMatchObject({ userAnswer: '', isCorrect: false });
    expect(vi.mocked(recordQuizAttempts).mock.calls[0][0].map(r => r.timeToAnswer)).toEqual([15, 3]);
    expect(buildQuizResults).toHaveBeenCalledTimes(2);
  });

  it('preserves extra time and timer-off preference across questions', async () => {
    vi.useFakeTimers();
    render(<QuizView {...props} mode="speed" />);
    await act(async () => {});
    click('+30 seconds');
    expect(screen.getByText('45s')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(20000));
    expect(buildQuizResults).not.toHaveBeenCalled();
    click('Turn off timer');
    act(() => vi.advanceTimersByTime(60000));
    fireEvent.click(screen.getByRole('radio', { name: 'Option: Two' })); check(); click('Next question');
    expect(screen.getByText('No time limit')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(60000));
    expect(buildQuizResults).toHaveBeenCalledOnce();
    click('Turn timer on');
    act(() => vi.advanceTimersByTime(15000));
    expect(feedback()).toHaveTextContent('Time’s up');
    expect(buildQuizResults).toHaveBeenCalledTimes(2);
  });

  it('does not run a timer in standard mode and stops a speed timer immediately after Check', async () => {
    vi.useFakeTimers();
    const { unmount } = render(<QuizView {...props} />);
    await act(async () => {});
    act(() => vi.advanceTimersByTime(120000));
    expect(buildQuizResults).not.toHaveBeenCalled();
    unmount();
    render(<QuizView {...props} mode="speed" />);
    await act(async () => {});
    act(() => vi.advanceTimersByTime(14999));
    fireEvent.click(screen.getByRole('radio', { name: 'Option: Two' })); check();
    act(() => vi.advanceTimersByTime(30000));
    expect(feedback()).toHaveTextContent("Hooray! That's correct");
    expect(buildQuizResults).toHaveBeenCalledOnce();
  });
});
