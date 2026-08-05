export interface YorubaAudioEntry {
  text: string;
  english?: string;
  hash: string;
  objectKey: string;
  contentType?: string;
}

interface YorubaAudioManifest { version?: string; entries?: YorubaAudioEntry[]; }

const MANIFEST_URL = '/api/yoruba-audio?manifest=1';
let entriesPromise: Promise<YorubaAudioEntry[]> | null = null;
let manifestPromise: Promise<Map<string, YorubaAudioEntry>> | null = null;
let currentAudio: HTMLAudioElement | null = null;

const normalizeText = (value: string): string => value.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('yo-NG');
const manifestKeyVariants = (value: string): string[] => {
  const normalized = normalizeText(value);
  const withoutTerminalPunctuation = normalized.replace(/[.!?]+$/u, '').trim();
  return withoutTerminalPunctuation && withoutTerminalPunctuation !== normalized ? [normalized, withoutTerminalPunctuation] : [normalized];
};

async function loadEntries(): Promise<YorubaAudioEntry[]> {
  const response = await fetch(MANIFEST_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Yoruba audio manifest unavailable (${response.status})`);
  const manifest = await response.json() as YorubaAudioManifest;
  return (manifest.entries || []).filter((entry) => entry && typeof entry.text === 'string' && /^[a-f0-9]{32}$/i.test(entry.hash));
}

export async function getYorubaAudioEntries(): Promise<YorubaAudioEntry[]> {
  if (!entriesPromise) entriesPromise = loadEntries().catch((error) => { entriesPromise = null; throw error; });
  return entriesPromise;
}

function getManifestIndex(): Promise<Map<string, YorubaAudioEntry>> {
  if (!manifestPromise) {
    manifestPromise = getYorubaAudioEntries().then((entries) => {
      const index = new Map<string, YorubaAudioEntry>();
      for (const entry of entries) {
        for (const key of manifestKeyVariants(entry.text)) if (!index.has(key)) index.set(key, entry);
      }
      return index;
    }).catch((error) => { manifestPromise = null; throw error; });
  }
  return manifestPromise;
}

export async function findYorubaAudio(text: string): Promise<YorubaAudioEntry | null> {
  if (!text.trim()) return null;
  try {
    const index = await getManifestIndex();
    for (const key of manifestKeyVariants(text)) {
      const entry = index.get(key);
      if (entry) return entry;
    }
  } catch { /* Before deployment/local development: use the normal TTS fallback. */ }
  return null;
}

export async function playYorubaAudio(text: string, playbackRate = 1): Promise<boolean> {
  const entry = await findYorubaAudio(text);
  if (!entry) return false;
  stopYorubaAudio();
  const audio = new Audio(`/api/yoruba-audio?hash=${encodeURIComponent(entry.hash)}`);
  audio.preload = 'auto';
  audio.playbackRate = Math.max(0.5, Math.min(2, playbackRate));
  currentAudio = audio;
  try {
    await audio.play();
    await new Promise<void>((resolve) => {
      const finish = () => { audio.removeEventListener('ended', finish); audio.removeEventListener('pause', finish); if (currentAudio === audio) currentAudio = null; resolve(); };
      audio.addEventListener('ended', finish, { once: true });
      audio.addEventListener('pause', finish, { once: true });
    });
    return true;
  } catch {
    if (currentAudio === audio) currentAudio = null;
    return false;
  }
}

export function pauseYorubaAudio(): void { currentAudio?.pause(); }
export function resumeYorubaAudio(): void { void currentAudio?.play().catch(() => undefined); }
export function stopYorubaAudio(): void { if (!currentAudio) return; currentAudio.pause(); currentAudio.src = ''; currentAudio = null; }
