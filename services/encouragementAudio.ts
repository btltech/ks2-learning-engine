export type EncouragementCategory =
  | 'correct'
  | 'effort'
  | 'retry'
  | 'quiz_complete'
  | 'high_score'
  | 'perfect_score'
  | 'lesson_complete'
  | 'daily_challenge'
  | 'streak'
  | 'achievement';

interface EncouragementEntry {
  id: string;
  category: EncouragementCategory;
  text: string;
  hash: string;
  contentType: string;
}

interface EncouragementManifest {
  version: string;
  entries: EncouragementEntry[];
}

let manifestPromise: Promise<EncouragementManifest> | null = null;
let activeAudio: HTMLAudioElement | null = null;
let activeFinish: ((played: boolean) => void) | null = null;
const lastPlayedByCategory = new Map<EncouragementCategory, string>();

const isManifest = (value: unknown): value is EncouragementManifest => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<EncouragementManifest>;
  return typeof candidate.version === 'string'
    && Array.isArray(candidate.entries)
    && candidate.entries.every((entry) =>
      entry
      && typeof entry.id === 'string'
      && typeof entry.category === 'string'
      && typeof entry.text === 'string'
      && /^[a-f0-9]{32}$/i.test(entry.hash));
};

const loadManifest = async (): Promise<EncouragementManifest> => {
  if (!manifestPromise) {
    manifestPromise = fetch('/api/encouragement-audio?manifest=1', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Encouragement manifest returned ${response.status}`);
        const value: unknown = await response.json();
        if (!isManifest(value)) throw new Error('Encouragement manifest is invalid');
        return value;
      })
      .catch((error) => {
        manifestPromise = null;
        throw error;
      });
  }
  return manifestPromise;
};

const chooseEntry = (entries: EncouragementEntry[], category: EncouragementCategory): EncouragementEntry | undefined => {
  const matching = entries.filter((entry) => entry.category === category);
  if (!matching.length) return undefined;
  const lastPlayed = lastPlayedByCategory.get(category);
  const choices = matching.length > 1 ? matching.filter((entry) => entry.hash !== lastPlayed) : matching;
  const selected = choices[Math.floor(Math.random() * choices.length)];
  if (selected) lastPlayedByCategory.set(category, selected.hash);
  return selected;
};

export const playEncouragementAudio = async (category: EncouragementCategory): Promise<boolean> => {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return false;

  try {
    const manifest = await loadManifest();
    const entry = chooseEntry(manifest.entries, category);
    if (!entry) return false;

    stopEncouragementAudio();
    const audio = new Audio(`/api/encouragement-audio?hash=${encodeURIComponent(entry.hash)}`);
    activeAudio = audio;
    audio.preload = 'auto';

    return await new Promise<boolean>((resolve) => {
      let settled = false;
      const finish = (played: boolean) => {
        if (settled) return;
        settled = true;
        if (activeAudio === audio) activeAudio = null;
        if (activeFinish === finish) activeFinish = null;
        resolve(played);
      };
      activeFinish = finish;
      audio.addEventListener('ended', () => finish(true), { once: true });
      audio.addEventListener('error', () => finish(false), { once: true });
      audio.play().catch(() => finish(false));
    });
  } catch (error) {
    console.warn('Cached encouragement audio unavailable:', error);
    return false;
  }
};

export const stopEncouragementAudio = (): void => {
  if (!activeAudio) return;
  const audio = activeAudio;
  const finish = activeFinish;
  activeAudio = null;
  activeFinish = null;
  audio.pause();
  audio.currentTime = 0;
  finish?.(false);
};

export const pauseEncouragementAudio = (): void => activeAudio?.pause();
export const resumeEncouragementAudio = (): void => { void activeAudio?.play(); };

export const resetEncouragementAudioCacheForTests = (): void => {
  manifestPromise = null;
  lastPlayedByCategory.clear();
  stopEncouragementAudio();
};
