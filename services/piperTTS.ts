/**
 * Piper TTS Service - Natural, free, runs in-browser
 * Uses hosted Piper models per language and caches them in OPFS after first load.
 */

import { download, predict, TtsSession, ONNX_BASE as PIPER_ONNX_BASE } from '@mintplex-labs/piper-tts-web';
import type { ProgressCallback, VoiceId } from '@mintplex-labs/piper-tts-web/dist/types';

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
let triedOnnxCdnFallback = false;

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
    const message = error instanceof Error ? error.message : String(error);
    if (!triedOnnxCdnFallback && /Failed to fetch|404|not found|Failed to fetch dynamically imported module/i.test(message)) {
      triedOnnxCdnFallback = true;
      try {
        const ONNX_CDN_BASE = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';
        if (typeof TtsSession !== 'undefined' && TtsSession && typeof TtsSession.WASM_LOCATIONS === 'object') {
          TtsSession.WASM_LOCATIONS = {
            ...TtsSession.WASM_LOCATIONS,
            onnxWasm: ONNX_CDN_BASE
          };
          console.info('Piper: Retrying download using ONNX CDN base', ONNX_CDN_BASE);
        }
        await download(voiceId, (progress => {
          onProgress?.(toProgressPct(progress));
        }) as ProgressCallback);
        downloadedVoices.add(voiceId);
        return true;
      } catch (inner) {
        console.warn('Piper: CDN fallback retry failed', inner);
      }
    }
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
    piperDisabled = 'Piper synthesis failed';
    return null;
  }
};

export const isPiperReady = (): boolean => downloadedVoices.size > 0;

export const resetPiper = () => {
  downloadedVoices.clear();
  piperDisabled = null;
};

// Override default ONNX CDN path to match the local installed onnxruntime-web version
try {
  // prefer CDN version 1.23.2 (matches local node_modules onnxruntime-web v1.23.2)
  const ONNX_CDN_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.23.2/';
  // If we're running locally in dev mode (vite), prefer the local node_modules path so Vite resolves files
  const LOCAL_ORT_BASE = '/@modules/onnxruntime-web/dist/';
  // If a TtsSession class is exported, set its WASM locations to a compatible ONNX base
  if (typeof TtsSession !== 'undefined' && TtsSession && typeof TtsSession.WASM_LOCATIONS === 'object') {
    const base = typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? LOCAL_ORT_BASE : 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';
    TtsSession.WASM_LOCATIONS = {
      ...TtsSession.WASM_LOCATIONS,
      onnxWasm: base,
    };
    console.info('Piper: Overriding ONNX base to', TtsSession.WASM_LOCATIONS.onnxWasm);
  } else {
    console.info('Piper: TtsSession WASM override not applied - TtsSession not defined');
  }
} catch (e) {
  console.error('Piper: Failed to set ONNX base override', e);
};
