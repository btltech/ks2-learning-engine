import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PronunciationHelper from './PronunciationHelper';
import { speakPronunciation } from '../services/naturalTTS';
import { playYorubaAudio, stopYorubaAudio } from '../services/yorubaAudio';
vi.mock('../services/naturalTTS', () => ({ speakPronunciation: vi.fn(async () => {}) }));
vi.mock('../services/yorubaAudio', () => ({ playYorubaAudio: vi.fn(async () => true), stopYorubaAudio: vi.fn() }));
beforeEach(() => { vi.clearAllMocks(); });
afterEach(cleanup);
describe('language pronunciation presentation', () => {
  it.each([['bonjour','French','fr','jour'],['hola','Spanish','es','ho']])('retains playback and marks %s and its syllables with the language tag', async (word, language, tag, stressedPart) => {
    const view = render(<PronunciationHelper word={word} language={language} />);
    expect(screen.getByText(word)).toHaveAttribute('lang', tag);
    expect(screen.getByRole('button', {name: stressedPart})).toHaveAttribute('data-stressed', 'true');
    let finish!: () => void;
    vi.mocked(speakPronunciation).mockReturnValueOnce(new Promise<void>(resolve => { finish = resolve; }));
    fireEvent.click(screen.getByTitle('Hear pronunciation'));
    expect(speakPronunciation).toHaveBeenCalledWith(word, language);
    expect(screen.getByTitle('Hear pronunciation')).toBeDisabled();
    await act(async () => { finish(); });
    expect(screen.getByTitle('Hear pronunciation')).toBeEnabled();
    fireEvent.click(screen.getByRole('button', {name: stressedPart}));
    await act(async () => {});
    expect(speakPronunciation).toHaveBeenLastCalledWith(stressedPart, language);
    expect(view.container.querySelector('[data-playing="true"]')).toBeNull();
  });
  it('keeps reviewed Yoruba playback rates, tone guidance and cleanup', async () => {
    const view = render(<PronunciationHelper word="báwo" language="Yoruba" showRules />);
    expect(screen.getByText('báwo')).toHaveAttribute('lang', 'yo');
    expect(screen.getByText('↑ HIGH')).toBeInTheDocument();
    expect(screen.getByText('→ MID')).toBeInTheDocument();
    expect(screen.getByText('↓ LOW')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Hear pronunciation'));
    await act(async () => {});
    expect(playYorubaAudio).toHaveBeenLastCalledWith('báwo', 0.8);
    fireEvent.click(screen.getByTitle('Slow speed'));
    fireEvent.click(screen.getByTitle('Hear pronunciation'));
    await act(async () => {});
    expect(playYorubaAudio).toHaveBeenLastCalledWith('báwo', 1);
    expect(speakPronunciation).not.toHaveBeenCalled();
    view.unmount();
    expect(stopYorubaAudio).toHaveBeenCalled();
  });
  it('shows a meaning only when the caller supplies its existing translation', () => {
    render(<PronunciationHelper word="casă" language="Romanian" meaning="house" />);
    expect(screen.getByText('house')).toBeInTheDocument();
    expect(screen.getByText('casă')).toHaveAttribute('lang', 'ro');
  });
});
