import { describe, expect, it } from 'vitest';
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
