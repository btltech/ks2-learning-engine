// Pre-generated French and Spanish pronunciation audio (Kokoro, generated offline
// by scripts/generate-language-audio.py and served from R2 by /api/language-audio).
// When a word has no recording, callers fall back to browser speech.

export interface LanguageAudioEntry {
  id: string;
  text: string;
  language: 'fr' | 'es';
  english?: string;
  hash: string;
}

interface LanguageAudioManifest { version?: string; entries?: LanguageAudioEntry[]; }

const MANIFEST_URL = '/api/language-audio?manifest=1';
const LANGUAGE_CODES: Record<string, 'fr' | 'es'> = { french: 'fr', fr: 'fr', spanish: 'es', es: 'es' };

const RETRY_AFTER_FAILURE_MS = 60_000;

let indexPromise: Promise<Map<string, LanguageAudioEntry>> | null = null;
let lastFailureAt = 0;
let currentAudio: HTMLAudioElement | null = null;

const languageCode = (language: string) => LANGUAGE_CODES[language.trim().toLowerCase()];

/** Only French and Spanish have recordings. */
export const hasLanguageAudioFor = (language: string): boolean => languageCode(language) !== undefined;

const normalizeText = (value: string): string => value
  .normalize('NFC')
  .replace(/\s+/g, ' ')
  .replace(/[.!?…]+$/u, '')
  .trim()
  .toLocaleLowerCase('fr');

const loadIndex = async (): Promise<Map<string, LanguageAudioEntry>> => {
  const response = await fetch(MANIFEST_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Language audio manifest unavailable (${response.status})`);
  const manifest = await response.json() as LanguageAudioManifest;
  const index = new Map<string, LanguageAudioEntry>();
  for (const entry of manifest.entries || []) {
    if (!entry || typeof entry.text !== 'string' || !/^[a-f0-9]{32}$/i.test(entry.hash)) continue;
    const key = `${entry.language}:${normalizeText(entry.text)}`;
    if (!index.has(key)) index.set(key, entry);
  }
  return index;
};

export const findLanguageAudio = async (text: string, language: string): Promise<LanguageAudioEntry | null> => {
  const code = languageCode(language);
  if (!code || !text.trim()) return null;
  try {
    if (!indexPromise) {
      // Don't hammer a missing manifest on every tap before the audio is deployed.
      if (Date.now() - lastFailureAt < RETRY_AFTER_FAILURE_MS) return null;
      indexPromise = loadIndex().catch((error) => { indexPromise = null; lastFailureAt = Date.now(); throw error; });
    }
    return (await indexPromise).get(`${code}:${normalizeText(text)}`) ?? null;
  } catch {
    return null; // Before deployment or offline: use the normal TTS fallback.
  }
};

export const stopLanguageAudio = (): void => {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.src = '';
  currentAudio = null;
};

export const pauseLanguageAudio = (): void => { currentAudio?.pause(); };
export const resumeLanguageAudio = (): void => { void currentAudio?.play().catch(() => undefined); };

/** Resolves true if a recording was found and played, false if the caller should fall back. */
export const playLanguageAudio = async (text: string, language: string, playbackRate = 1): Promise<boolean> => {
  if (typeof Audio === 'undefined') return false;
  const entry = await findLanguageAudio(text, language);
  if (!entry) return false;

  stopLanguageAudio();
  const audio = new Audio(`/api/language-audio?hash=${encodeURIComponent(entry.hash)}`);
  audio.preload = 'auto';
  audio.playbackRate = Math.max(0.5, Math.min(2, playbackRate));
  currentAudio = audio;
  try {
    await audio.play();
    await new Promise<void>((resolve) => {
      const finish = () => {
        audio.removeEventListener('ended', finish);
        audio.removeEventListener('pause', finish);
        if (currentAudio === audio) currentAudio = null;
        resolve();
      };
      audio.addEventListener('ended', finish, { once: true });
      audio.addEventListener('pause', finish, { once: true });
    });
    return true;
  } catch {
    if (currentAudio === audio) currentAudio = null;
    return false;
  }
};

export const resetLanguageAudioCacheForTests = (): void => {
  indexPromise = null;
  lastFailureAt = 0;
  currentAudio = null;
};
