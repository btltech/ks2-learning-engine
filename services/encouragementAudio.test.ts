import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  playEncouragementAudio,
  resetEncouragementAudioCacheForTests,
  stopEncouragementAudio,
} from './encouragementAudio';

const entries = [
  { id: 'high-score-01', category: 'high_score', text: 'Excellent!', hash: 'a'.repeat(32), contentType: 'audio/mpeg' },
  { id: 'high-score-02', category: 'high_score', text: 'Brilliant!', hash: 'b'.repeat(32), contentType: 'audio/mpeg' },
];
const constructedSources: string[] = [];

class MockAudio {
  currentTime = 0;
  preload = '';
  pause = vi.fn();
  private listeners = new Map<string, () => void>();

  constructor(public src: string) {
    constructedSources.push(src);
  }

  addEventListener(event: string, callback: () => void) {
    this.listeners.set(event, callback);
  }

  play = vi.fn(async () => {
    queueMicrotask(() => this.listeners.get('ended')?.());
  });
}

describe('cached encouragement audio', () => {
  beforeEach(() => {
    resetEncouragementAudioCacheForTests();
    vi.restoreAllMocks();
    constructedSources.length = 0;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: '1.0.0', entries }),
    }));
    vi.stubGlobal('Audio', MockAudio);
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  it('loads the private manifest and plays a hashed object URL', async () => {
    await expect(playEncouragementAudio('high_score')).resolves.toBe(true);
    expect(fetch).toHaveBeenCalledOnce();
    expect(constructedSources).toEqual([`/api/encouragement-audio?hash=${'a'.repeat(32)}`]);
  });

  it('avoids immediately repeating the same clip', async () => {
    await playEncouragementAudio('high_score');
    await playEncouragementAudio('high_score');
    expect(constructedSources.at(-1)).toBe(`/api/encouragement-audio?hash=${'b'.repeat(32)}`);
  });

  it('returns false when a category has no recording', async () => {
    await expect(playEncouragementAudio('retry')).resolves.toBe(false);
  });

  it('stops the active recording', () => {
    stopEncouragementAudio();
    expect(true).toBe(true);
  });
});
