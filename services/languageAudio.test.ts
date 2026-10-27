import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  findLanguageAudio,
  hasLanguageAudioFor,
  playLanguageAudio,
  resetLanguageAudioCacheForTests,
} from './languageAudio';

const entries = [
  { id: 'fr-1', text: 'Sœur', language: 'fr', hash: 'a'.repeat(32), english: 'Sister' },
  { id: 'es-1', text: '¿Cómo estás?', language: 'es', hash: 'b'.repeat(32) },
  { id: 'fr-bad', text: 'Mère', language: 'fr', hash: 'not-a-hash' },
];
const constructed: string[] = [];

class MockAudio {
  preload = '';
  playbackRate = 1;
  pause = vi.fn();
  private listeners = new Map<string, () => void>();
  constructor(public src: string) { constructed.push(src); }
  addEventListener(event: string, callback: () => void) { this.listeners.set(event, callback); }
  removeEventListener() {}
  play = vi.fn(async () => { setTimeout(() => this.listeners.get("ended")?.(), 0); });
}

describe('language audio', () => {
  beforeEach(() => {
    resetLanguageAudioCacheForTests();
    constructed.length = 0;
    vi.stubGlobal('Audio', MockAudio);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ version: 'v', entries }) }));
  });

  it('only covers French and Spanish', () => {
    expect(hasLanguageAudioFor('French')).toBe(true);
    expect(hasLanguageAudioFor('Spanish')).toBe(true);
    expect(hasLanguageAudioFor('Yoruba')).toBe(false);
    expect(hasLanguageAudioFor('English')).toBe(false);
  });

  it('matches ignoring case, accents composition and trailing punctuation', async () => {
    expect((await findLanguageAudio('sœur', 'French'))?.id).toBe('fr-1');
    expect((await findLanguageAudio('¿Cómo estás', 'Spanish'))?.id).toBe('es-1');
    expect((await findLanguageAudio('¿Cómo estás?', 'Spanish'))?.id).toBe('es-1');
  });

  it('does not match across languages or invalid hashes', async () => {
    expect(await findLanguageAudio('Sœur', 'Spanish')).toBeNull();
    expect(await findLanguageAudio('Mère', 'French')).toBeNull();
  });

  it('plays the recording at the requested rate', async () => {
    expect(await playLanguageAudio('Sœur', 'French', 0.9)).toBe(true);
    expect(constructed).toEqual([`/api/language-audio?hash=${'a'.repeat(32)}`]);
  });

  it('returns false so the caller can fall back when there is no recording', async () => {
    expect(await playLanguageAudio('chat', 'French')).toBe(false);
    expect(constructed).toHaveLength(0);
  });

  it('returns false and backs off when the manifest is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    expect(await playLanguageAudio('Sœur', 'French')).toBe(false);
    expect(await playLanguageAudio('Sœur', 'French')).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
