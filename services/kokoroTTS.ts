/**
 * Kokoro TTS provider - natural on-device English voice.
 *
 * Opt-in: the quantised model is ~90MB, so it is only downloaded after the
 * user enables it. It never blocks speech: until the model is ready,
 * speakWithKokoro() returns false and callers use the free Web Speech API.
 * Everything runs on-device, so no text leaves the browser and there is no
 * per-request cost.
 *
 * kokoro-js only phonemises English, so other languages always fall through
 * to Web Speech (or the pre-generated audio packs).
 */

import type { KokoroWorkerRequest, KokoroWorkerResponse } from './kokoro.worker';

export type KokoroStatus = 'off' | 'idle' | 'loading' | 'ready' | 'error';
export type KokoroStyle = 'lesson' | 'mira' | 'celebration' | 'pronunciation';

export interface KokoroState {
  status: KokoroStatus;
  /** 0..1 while loading */
  progress: number;
  error?: string;
}

const STORAGE_KEY = 'ks2.kokoroVoice.enabled';
const MODEL_BASE = import.meta.env?.VITE_KOKORO_MODEL_BASE || '/api/kokoro-model';

// British English voices (the app defaults to en-GB). Grades are from the Kokoro voice table.
const VOICES: Record<KokoroStyle, { voice: string; speed: number }> = {
  lesson: { voice: 'bf_emma', speed: 0.95 },
  mira: { voice: 'bf_isabella', speed: 0.95 },
  celebration: { voice: 'bf_emma', speed: 1.05 },
  pronunciation: { voice: 'bf_emma', speed: 0.8 },
};
const PRELOAD_VOICES = [...new Set(Object.values(VOICES).map((v) => v.voice))];

const SENTENCE_GAP_MS = 150;
const GENERATE_TIMEOUT_MS = 30_000;

let state: KokoroState = { status: 'off', progress: 0 };
const listeners = new Set<(state: KokoroState) => void>();
const setState = (next: Partial<KokoroState>) => {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener(state));
};

let worker: Worker | null = null;
let nextRequestId = 1;
const pending = new Map<number, { resolve: (audio: { samples: Float32Array; sampleRate: number }) => void; reject: (error: Error) => void }>();

let context: AudioContext | null = null;
let activeSource: AudioBufferSourceNode | null = null;
let activeFinish: (() => void) | null = null;
let playToken = 0;
let sentenceGapTimer: ReturnType<typeof setTimeout> | null = null;
let finishSentenceGap: (() => void) | null = null;

const readEnabled = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export const isKokoroSupported = (): boolean =>
  typeof Worker !== 'undefined'
  && typeof WebAssembly !== 'undefined'
  && typeof caches !== 'undefined'
  && (typeof AudioContext !== 'undefined' || typeof (globalThis as { webkitAudioContext?: unknown }).webkitAudioContext !== 'undefined');

/** Kokoro (via kokoro-js) can only speak English. */
export const isKokoroLanguage = (language: string): boolean => /^(english|en)(-|$)/i.test(language.trim());

export const getKokoroState = (): KokoroState => state;

export const subscribeKokoro = (listener: (state: KokoroState) => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const failWorker = (message: string) => {
  pending.forEach(({ reject }) => reject(new Error(message)));
  pending.clear();
  worker?.terminate();
  worker = null;
  setState({ status: 'error', error: message });
};

const handleMessage = (event: MessageEvent<KokoroWorkerResponse>) => {
  const message = event.data;
  switch (message.type) {
    case 'progress':
      setState({ progress: message.progress });
      break;
    case 'ready':
      setState({ status: 'ready', progress: 1, error: undefined });
      break;
    case 'audio': {
      const request = pending.get(message.id);
      pending.delete(message.id);
      request?.resolve({ samples: message.samples, sampleRate: message.sampleRate });
      break;
    }
    case 'error':
      if (message.id !== undefined) {
        const request = pending.get(message.id);
        pending.delete(message.id);
        request?.reject(new Error(message.message));
      } else {
        failWorker(message.message);
      }
      break;
  }
};

const send = (message: KokoroWorkerRequest) => worker?.postMessage(message);

/** Start downloading/initialising the model. Safe to call repeatedly. */
export const warmupKokoro = (): void => {
  if (state.status === 'loading' || state.status === 'ready') return;
  if (!isKokoroSupported()) {
    setState({ status: 'error', error: 'This browser cannot run the natural voice.' });
    return;
  }
  try {
    worker = new Worker(new URL('./kokoro.worker.ts', import.meta.url), { type: 'module' });
  } catch (error) {
    setState({ status: 'error', error: error instanceof Error ? error.message : 'Could not start the voice engine.' });
    return;
  }
  worker.onmessage = handleMessage;
  worker.onerror = (event) => failWorker(event.message || 'The voice engine crashed.');
  setState({ status: 'loading', progress: 0, error: undefined });
  send({ type: 'init', modelBase: MODEL_BASE, voices: PRELOAD_VOICES });
};

export const isKokoroEnabled = (): boolean => state.status !== 'off';

export const enableKokoro = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Private mode: works for this session only.
  }
  setState({ status: 'idle' });
  warmupKokoro();
};

export const disableKokoro = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  stopKokoro();
  failWorkerQuietly();
  setState({ status: 'off', progress: 0, error: undefined });
};

const failWorkerQuietly = () => {
  pending.forEach(({ reject }) => reject(new Error('Kokoro disabled')));
  pending.clear();
  worker?.terminate();
  worker = null;
};

/** Restore the saved preference. Call once at app start; it does not download anything by itself unless enabled. */
export const initKokoroFromPreference = (): void => {
  if (state.status === 'off' && readEnabled()) {
    setState({ status: 'idle' });
    warmupKokoro();
  }
};

const generate = (text: string, style: KokoroStyle): Promise<{ samples: Float32Array; sampleRate: number }> =>
  new Promise((resolve, reject) => {
    const id = nextRequestId++;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error('Kokoro timed out'));
    }, GENERATE_TIMEOUT_MS);
    pending.set(id, {
      resolve: (audio) => { clearTimeout(timer); resolve(audio); },
      reject: (error) => { clearTimeout(timer); reject(error); },
    });
    const { voice, speed } = VOICES[style];
    send({ type: 'generate', id, text, voice, speed });
  });

const getContext = (): AudioContext => {
  if (!context) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    context = new Ctor();
  }
  return context;
};

const playSamples = (samples: Float32Array, sampleRate: number): Promise<void> =>
  new Promise((resolve) => {
    const ctx = getContext();
    const buffer = ctx.createBuffer(1, samples.length, sampleRate);
    buffer.copyToChannel(samples, 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    activeSource = source;
    activeFinish = resolve;
    source.onended = () => {
      if (activeSource === source) {
        activeSource = null;
        activeFinish = null;
      }
      resolve();
    };
    source.start();
  });

const sentenceGap = () => new Promise<void>((resolve) => {
  const finish = () => {
    if (finishSentenceGap === finish) { sentenceGapTimer = null; finishSentenceGap = null; }
    resolve();
  };
  finishSentenceGap = finish;
  sentenceGapTimer = setTimeout(finish, SENTENCE_GAP_MS);
});

/**
 * Speak pre-split sentences with Kokoro. Resolves true if speech was produced
 * (or deliberately stopped), false if Kokoro cannot be used right now and the
 * caller should fall back to Web Speech.
 */
export const speakWithKokoro = async (
  sentences: string[],
  language: string,
  style: KokoroStyle = 'lesson',
): Promise<boolean> => {
  if (!isKokoroLanguage(language) || sentences.length === 0) return false;
  if (state.status === 'idle') warmupKokoro();
  if (state.status !== 'ready' || !worker) return false;

  stopKokoro();
  const token = ++playToken;
  // Create/resume inside the caller's user gesture so autoplay rules are satisfied.
  const ctx = getContext();
  // Queue resume even if a preceding pause has not updated state yet.
  void ctx.resume();

  let upcoming: Promise<{ samples: Float32Array; sampleRate: number }>;
  try {
    upcoming = generate(sentences[0], style);
    await upcoming;
  } catch {
    return token !== playToken;
  }

  try {
    for (let i = 0; i < sentences.length; i++) {
      if (token !== playToken) return true;
      const audio = await upcoming;
      if (token !== playToken) return true;
      if (i + 1 < sentences.length) {
        // Synthesise the next sentence while this one plays.
        upcoming = generate(sentences[i + 1], style);
        upcoming.catch(() => undefined);
      }
      await playSamples(audio.samples, audio.sampleRate);
      if (token !== playToken) return true;
      if (i + 1 < sentences.length) await sentenceGap();
    }
  } catch {
    // Mid-speech failure: the first sentence already played, so don't double-speak via fallback.
  }
  return true;
};

export const stopKokoro = (): void => {
  playToken++;
  if (sentenceGapTimer !== null) clearTimeout(sentenceGapTimer);
  sentenceGapTimer = null;
  const settleGap = finishSentenceGap;
  finishSentenceGap = null;
  settleGap?.();
  // Discard generated/prefetched audio and its timeouts, keeping the model loaded.
  pending.forEach(({ reject }) => reject(new Error('Kokoro playback stopped')));
  pending.clear();
  const finish = activeFinish;
  try {
    activeSource?.stop();
  } catch {
    // already stopped
  }
  activeSource = null;
  activeFinish = null;
  finish?.();
};

export const pauseKokoro = (): void => {
  if (context && context.state !== 'closed') void context.suspend();
};

export const resumeKokoro = (): void => {
  if (context && context.state !== 'closed') void context.resume();
};

export const isKokoroSpeaking = (): boolean => activeSource !== null;

/** Test helper: reset module state. */
export const __resetKokoroForTests = (): void => {
  failWorkerQuietly();
  stopKokoro();
  context = null;
  state = { status: 'off', progress: 0 };
  listeners.clear();
};
