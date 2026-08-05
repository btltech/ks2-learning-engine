import { describe, expect, it } from 'vitest';
import type { YorubaAudioEntry } from './yorubaAudio';
import { getYorubaLessonEntries } from './yorubaLessonContent';

const entry = (hash: string, topics: string[]): YorubaAudioEntry => ({
  text: hash,
  english: hash,
  hash: hash.padEnd(32, '0'),
  objectKey: `${hash}.mp3`,
  topics,
});

describe('Yoruba curriculum audio selection', () => {
  it('returns only recordings explicitly assigned to the selected topic', () => {
    const entries = [
      entry('greeting', ['Greetings and introductions']),
      entry('animal', ['Animals and nature']),
      entry('shared', ['Greetings and introductions', 'Speaking and presentations']),
    ];

    expect(getYorubaLessonEntries(entries, 'Greetings and introductions', 20).map(({ text }) => text))
      .toEqual(['greeting', 'shared']);
  });

  it('does not fill a lesson with unrelated recordings', () => {
    const entries = [entry('animal', ['Animals and nature'])];
    expect(getYorubaLessonEntries(entries, 'Places and directions', 20)).toEqual([]);
  });
});
