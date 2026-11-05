import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import YorubaAudioLibrary from './YorubaAudioLibrary';
import { getYorubaAudioEntries, playYorubaAudio, stopYorubaAudio } from '../services/yorubaAudio';
vi.mock('../services/yorubaAudio', () => ({ getYorubaAudioEntries: vi.fn(), playYorubaAudio: vi.fn(), stopYorubaAudio: vi.fn() }));
import type { YorubaAudioEntry } from '../services/yorubaAudio';
import { filterYorubaEntries } from './YorubaAudioLibrary';

const entry = (
  text: string,
  english: string,
  category: string,
  topics: string[] = [],
): YorubaAudioEntry => ({
  text,
  english,
  category,
  topics,
  hash: text.codePointAt(0)?.toString(16).padEnd(32, '0') || '0'.repeat(32),
  objectKey: `${text}.mp3`,
});

const entries = [
  entry('Ẹ káàárọ̀', 'Good morning', 'greetings', ['Greetings and introductions']),
  entry('Ìyá', 'Mother', 'family', ['Family and people']),
  entry('Ilé-ìwé', 'School', 'school', ['School and daily routine']),
];

describe('Yorùbá audio library filtering', () => {
  it('searches both Yorùbá and English without requiring tone marks', () => {
    expect(filterYorubaEntries(entries, 'kaaro', '')).toEqual([entries[0]]);
    expect(filterYorubaEntries(entries, 'mother', '')).toEqual([entries[1]]);
  });

  it('filters by a category or assigned curriculum topic', () => {
    expect(filterYorubaEntries(entries, '', 'family')).toEqual([entries[1]]);
    expect(filterYorubaEntries(entries, '', 'School and daily routine')).toEqual([entries[2]]);
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getYorubaAudioEntries).mockResolvedValue(entries);
  vi.mocked(playYorubaAudio).mockResolvedValue(true);
});
afterEach(cleanup);

describe('Yorùbá library presentation preserves its controls', () => {
  it('keeps search, the full topic selector and back navigation', async () => {
    const onBack = vi.fn();
    render(<YorubaAudioLibrary onBack={onBack} />);
    await screen.findByRole('button', {name: 'Play Ìyá: Mother'});
    expect(screen.getByText('Ìyá')).toHaveAttribute('lang', 'yo');
    fireEvent.change(screen.getByLabelText('Search Yorùbá or English'), {target: {value: 'mother'}});
    expect(screen.getByRole('button', {name: 'Play Ìyá: Mother'})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Play Ẹ káàárọ̀: Good morning'})).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search Yorùbá or English'), {target: {value: ''}});
    fireEvent.click(screen.getByRole('button', {name: 'Family and people'}));
    expect(screen.getByLabelText('Topic')).toHaveValue('Family and people');
    expect(screen.queryByRole('button', {name: 'Play Ilé-ìwé: School'})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'All topics'}));
    expect(screen.getByRole('button', {name: 'Play Ilé-ìwé: School'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /Back to Yorùbá topics/}));
    expect(onBack).toHaveBeenCalledOnce();
    expect(getYorubaAudioEntries).toHaveBeenCalledOnce();
  });
  it('shows only the active recording, retains the playback gate, and clears waves on failure', async () => {
    let finish!: (value: boolean) => void;
    vi.mocked(playYorubaAudio).mockReturnValueOnce(new Promise<boolean>(resolve => { finish = resolve; }));
    const view = render(<YorubaAudioLibrary onBack={vi.fn()} />);
    const play = await screen.findByRole('button', {name: 'Play Ẹ káàárọ̀: Good morning'});
    expect(view.container.querySelector('.sunny-language-sound')).toBeNull();
    fireEvent.click(play);
    expect(playYorubaAudio).toHaveBeenCalledWith('Ẹ káàárọ̀');
    expect(screen.getByText('Playing now')).toBeInTheDocument();
    expect(view.container.querySelectorAll('[data-playing="true"]')).toHaveLength(1);
    expect(screen.getByRole('button', {name: 'Play Ìyá: Mother'})).toBeDisabled();
    await act(async () => { finish(false); });
    expect(screen.getByRole('alert')).toHaveTextContent('That recording could not be played. Please try again.');
    expect(view.container.querySelector('.sunny-language-sound')).toBeNull();
    expect(play).toBeEnabled();
    view.unmount();
    expect(stopYorubaAudio).toHaveBeenCalled();
  });
});
