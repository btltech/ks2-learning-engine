import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LessonView from './LessonView';
import { Difficulty, QuestionType } from '../types';
import { generateLesson } from '../services/geminiService';
import { getCanonicalQuestionsForCurriculumUnit } from '../services/cloudQuestionRepository';

const tts = vi.hoisted(() => ({
  speak: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  cancel: vi.fn(),
  isSpeaking: false,
  isPaused: false,
  isLoading: false,
  errorMessage: null,
  needsGesture: false,
  setNeedsGesture: vi.fn(),
}));
vi.mock('../hooks/useTTSEnhanced', () => ({ useTTSEnhanced: () => tts }));
vi.mock('../hooks/useGameSounds', () => ({
  useGameSounds: () => ({ playClick: vi.fn() }),
}));
vi.mock('../services/geminiService', () => ({ generateLesson: vi.fn() }));
vi.mock('../services/cloudQuestionRepository', () => ({
  getCanonicalQuestionsForCurriculumUnit: vi.fn(),
}));
vi.mock('../services/yorubaAudio', () => ({
  getYorubaAudioEntries: vi.fn(async () => []),
}));
const content =
  '# Teach\nShare the number equally.\n# Key Vocabulary\n* Equal — the same amount.\n# Modelled Example\nTwo groups of three.\n# Independent Check\nExplain your answer.';
const props = {
  subject: 'Maths',
  topic: 'Fractions, decimals and percentages',
  difficulty: Difficulty.Medium,
  studentAge: 9,
  onStartQuiz: vi.fn(),
  onBack: vi.fn(),
};
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(tts, {
    isSpeaking: false,
    isPaused: false,
    isLoading: false,
    errorMessage: null,
    needsGesture: false,
  });
  vi.mocked(generateLesson).mockResolvedValue(content);
  vi.mocked(getCanonicalQuestionsForCurriculumUnit).mockResolvedValue([]);
});
describe('storybook lesson presentation', () => {
  it('preserves lesson words, list semantics, HTML sanitization and navigation', async () => {
    vi.mocked(generateLesson).mockResolvedValue(
      content +
        '\n<img src="x" onerror="window.bad=true"><script>window.bad=true</script>',
    );
    const { container } = render(<LessonView {...props} />);
    await screen.findByText('Share the number equally.');
    expect(screen.getByText('Equal — the same amount.').tagName).toBe('LI');
    expect(screen.getByText('Two groups of three.')).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('[onerror]')).toBeNull();
    fireEvent.click(
      screen.getByRole('button', { name: 'Go back to topic selection' }),
    );
    expect(props.onBack).toHaveBeenCalledOnce();
    fireEvent.click(
      screen.getByRole('button', { name: 'Start the quiz for this lesson' }),
    );
    expect(props.onStartQuiz).toHaveBeenCalledWith('standard');
    fireEvent.click(
      screen.getByRole('button', { name: 'Start a speed challenge' }),
    );
    expect(props.onStartQuiz).toHaveBeenCalledWith('speed');
  });
  it('keeps read, pause, resume and double-click stop connected to the existing speech hook', async () => {
    const view = render(<LessonView {...props} />);
    await screen.findByText('Share the number equally.');
    fireEvent.click(screen.getByRole('button', { name: 'Read lesson aloud' }));
    expect(tts.speak).toHaveBeenCalledWith(
      'Teach. Share the number equally.. Key Vocabulary.  Equal — the same amount.. Modelled Example. Two groups of three.. Independent Check. Explain your answer.',
    );
    tts.isSpeaking = true;
    view.rerender(<LessonView {...props} />);
    expect(screen.getByRole('button', { name: 'Pause reading' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Pause reading' }));
    expect(tts.pause).toHaveBeenCalledOnce();
    tts.isPaused = true;
    view.rerender(<LessonView {...props} />);
    expect(
      screen.getByRole('button', { name: 'Resume reading' }),
    ).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Resume reading' }));
    expect(tts.resume).toHaveBeenCalledOnce();
    tts.cancel.mockClear();
    fireEvent.doubleClick(screen.getByRole('button', { name: 'Resume reading' }));
    expect(tts.cancel).toHaveBeenCalledOnce();
  });
  it('keeps both quiz actions disabled until every guided-practice question is answered', async () => {
    vi.mocked(getCanonicalQuestionsForCurriculumUnit).mockResolvedValue([
      {
        id: 'practice',
        subject: 'Maths',
        topic: props.topic,
        type: QuestionType.MultipleChoice,
        question: 'Which pair is equal?',
        options: ['Two and two', 'Two and three'],
        correctAnswer: 'Two and two',
        explanation: 'Equal means the same amount.',
        difficulty: Difficulty.Medium,
        ageGroup: [9],
      },
    ]);
    render(<LessonView {...props} />);
    const answer = await screen.findByRole('radio', { name: 'Two and two' });
    expect(
      screen.getByRole('button', { name: 'Start the quiz for this lesson' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Start a speed challenge' }),
    ).toBeDisabled();
    fireEvent.click(answer);
    expect(
      screen.getByRole('button', { name: 'Start the quiz for this lesson' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Start a speed challenge' }),
    ).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Correct — well reasoned.',
    );
  });
});
