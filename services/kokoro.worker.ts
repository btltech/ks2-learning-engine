/// <reference lib="webworker" />
// Kokoro-82M text-to-speech worker. Runs the model off the main thread.
//
// The app CSP only allows 'self' for connect-src/script-src, so nothing is
// fetched from huggingface.co or a CDN: model files come from MODEL_BASE
// (served by functions/api/kokoro-model from R2), and the ONNX wasm runtime
// comes from /onnxruntime (already in public/).

import { env } from '@huggingface/transformers';
import { KokoroTTS } from 'kokoro-js';

type KokoroVoice = NonNullable<NonNullable<Parameters<KokoroTTS['generate']>[1]>['voice']>;

export type KokoroWorkerRequest =
  | { type: 'init'; modelBase: string; voices: string[] }
  | { type: 'generate'; id: number; text: string; voice: string; speed: number };

export type KokoroWorkerResponse =
  | { type: 'progress'; progress: number }
  | { type: 'ready' }
  | { type: 'error'; id?: number; message: string }
  | { type: 'audio'; id: number; samples: Float32Array; sampleRate: number };

// kokoro-js hardcodes this URL for voice embeddings and checks Cache Storage
// under this name before fetching, so we seed the cache from our own origin.
const KOKORO_VOICE_CACHE = 'kokoro-voices';
const KOKORO_VOICE_URL = (voice: string) =>
  `https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices/${voice}.bin`;
const MODEL_ID = 'v1.0';

let tts: KokoroTTS | null = null;
const post = (message: KokoroWorkerResponse, transfer: Transferable[] = []) =>
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(message, transfer);

const seedVoice = async (modelBase: string, voice: string) => {
  const cache = await caches.open(KOKORO_VOICE_CACHE);
  const key = KOKORO_VOICE_URL(voice);
  if (await cache.match(key)) return;
  const response = await fetch(`${modelBase}/${MODEL_ID}/voices/${voice}.bin`);
  if (!response.ok) throw new Error(`Voice ${voice} unavailable (${response.status})`);
  await cache.put(key, response);
};

const init = async (modelBase: string, voices: string[]) => {
  env.allowRemoteModels = false;
  env.allowLocalModels = true;
  env.localModelPath = `${modelBase}/`;
  if (env.backends.onnx.wasm) {
    env.backends.onnx.wasm.wasmPaths = '/onnxruntime/';
    // Cross-origin isolation is not enabled on the site, so threads are unavailable.
    env.backends.onnx.wasm.numThreads = 1;
  }

  const files = new Map<string, { loaded: number; total: number }>();
  tts = await KokoroTTS.from_pretrained(MODEL_ID, {
    dtype: 'q8',
    device: 'wasm',
    progress_callback: (info: { status?: string; file?: string; loaded?: number; total?: number }) => {
      if (info.status !== 'progress' || !info.file || !info.total) return;
      files.set(info.file, { loaded: info.loaded ?? 0, total: info.total });
      let loaded = 0;
      let total = 0;
      for (const f of files.values()) {
        loaded += f.loaded;
        total += f.total;
      }
      post({ type: 'progress', progress: total ? loaded / total : 0 });
    },
  });
  await Promise.all(voices.map((voice) => seedVoice(modelBase, voice)));
  post({ type: 'ready' });
};

self.onmessage = async (event: MessageEvent<KokoroWorkerRequest>) => {
  const message = event.data;
  try {
    if (message.type === 'init') {
      await init(message.modelBase, message.voices);
    } else if (message.type === 'generate') {
      if (!tts) throw new Error('Kokoro is not initialised');
      // kokoro-js types the voice as a literal union of its voice ids.
      const audio = await tts.generate(message.text, {
        voice: message.voice as KokoroVoice,
        speed: message.speed,
      });
      post({ type: 'audio', id: message.id, samples: audio.audio, sampleRate: audio.sampling_rate }, [audio.audio.buffer]);
    }
  } catch (error) {
    post({
      type: 'error',
      id: message.type === 'generate' ? message.id : undefined,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
