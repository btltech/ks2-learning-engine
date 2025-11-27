/**
 * Piper TTS Service - Natural, free, runs in-browser
 * Uses hosted Piper models per language and caches them in OPFS after first load.
 */

import { download, predict } from '@mintplex-labs/piper-tts-web';
import type { ProgressCallback, VoiceId } from '@mintplex-labs/piper-tts-web/dist/types';

// Configure ONNX Runtime for cross-origin isolation
if (typeof window !== 'undefined' && 'crossOriginIsolated' in window) {
  // Set ONNX Runtime environment for threading when cross-origin isolated
  if ((window as any).crossOriginIsolated) {
    (window as any).ort = {
      env: {
        wasm: {
          numThreads: 4, // Use 4 threads when cross-origin isolated
        }
      }
    };
  } else {
    // Disable threading when not cross-origin isolated
    (window as any).ort = {
      env: {
        wasm: {
          numThreads: 1, // Single thread fallback
        }
      }
    };
  }
}

export type PiperPlayback = {
  audio: HTMLAudioElement;
  cleanup: () => void;
};

type ProgressListener = (progress: number) => void;

// Map friendly language labels to Piper voice IDs (choose clear, neutral voices)
const LANGUAGE_VOICE_MAP: Record<string, VoiceId> = {
  english: 'en_GB-southern_english_female-low',
  'en-gb': 'en_GB-southern_english_female-low',
  'en-us': 'en_US-amy-medium',
  french: 'fr_FR-siwis-medium',
  spanish: 'es_ES-carlfm-x_low',
  german: 'de_DE-kerstin-low',
  italian: 'it_IT-riccardo-x_low',
  portuguese: 'pt_BR-edresson-low',
  mandarin: 'zh_CN-huayan-medium',
  chinese: 'zh_CN-huayan-medium',
  russian: 'ru_RU-irina-medium',
  arabic: 'ar_JO-kareem-low',
  turkish: 'tr_TR-fettah-medium',
  romanian: 'ro_RO-mihai-medium',
  ukrainian: 'uk_UA-ukrainian_tts-medium',
  vietnamese: 'vi_VN-vais1000-medium',
  dutch: 'nl_NL-mls-medium',
  polish: 'pl_PL-gosia-medium',
};

const FALLBACK_VOICE: VoiceId = 'en_GB-southern_english_female-low';

const downloadedVoices = new Set<VoiceId>();
let piperDisabled: string | null = null;

// Check if WebAssembly threading is supported
const checkWebAssemblySupport = (): boolean => {
  try {
    if (typeof WebAssembly !== 'object') return false;
    if (!WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]))) return false;
    return true;
  } catch {
    return false;
  }
};

// Initialize Piper compatibility check
const initializePiperCompatibility = () => {
  if (!checkWebAssemblySupport()) {
    piperDisabled = 'WebAssembly not supported';
    return;
  }

  // Check if we're in a secure context (required for some WebAssembly features)
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    piperDisabled = 'Secure context required for WebAssembly';
    return;
  }
};

// Run compatibility check
initializePiperCompatibility();

const toProgressPct = (progress: { total: number; loaded: number }) => {
  if (!progress.total) return 0;
  return Math.min(99, Math.round((progress.loaded / progress.total) * 100));
};

const resolveVoice = (languageLabel?: string): VoiceId => {
  if (!languageLabel) return FALLBACK_VOICE;
  const key = languageLabel.toLowerCase();
  return LANGUAGE_VOICE_MAP[key] || FALLBACK_VOICE;
};

const ensureVoiceDownloaded = async (voiceId: VoiceId, onProgress?: ProgressListener) => {
  if (piperDisabled) {
    console.warn('Piper TTS disabled:', piperDisabled);
    return false;
  }
  if (downloadedVoices.has(voiceId)) return true;
  try {
    await download(voiceId, (progress => {
      onProgress?.(toProgressPct(progress));
    }) as ProgressCallback);
    downloadedVoices.add(voiceId);
    return true;
  } catch (error) {
    console.error('Piper download failed:', error);
    piperDisabled = `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    return false;
  }
};

export const initPiperTTS = async (languageLabel?: string, onProgress?: ProgressListener): Promise<boolean> => {
  if (piperDisabled) return false;
  const voiceId = resolveVoice(languageLabel);
  return ensureVoiceDownloaded(voiceId, onProgress);
};

/**
 * Generate and play Piper audio. Returns playback handle so callers can stop/cleanup.
 */
export const generatePiperAudio = async (
  text: string,
  languageLabel?: string,
  onProgress?: ProgressListener
): Promise<PiperPlayback | null> => {
  if (piperDisabled) return null;

  const voiceId = resolveVoice(languageLabel);
  const ready = await ensureVoiceDownloaded(voiceId, onProgress);
  if (!ready) return null;

  try {
    const blob = await predict({ text, voiceId }, (progress => {
      onProgress?.(toProgressPct(progress));
    }) as ProgressCallback);

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.playbackRate = 1;

    await audio.play();

    const cleanup = () => {
      audio.pause();
      URL.revokeObjectURL(url);
    };

    audio.addEventListener('ended', cleanup, { once: true });

    return { audio, cleanup };
  } catch (error) {
    console.error('Piper synthesis failed:', error);
    piperDisabled = `Synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    return null;
  }
};

export const isPiperReady = (): boolean => downloadedVoices.size > 0;

export const resetPiper = () => {
  downloadedVoices.clear();
  piperDisabled = null;
};
