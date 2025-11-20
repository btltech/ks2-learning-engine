// Free, high-quality TTS using Transformers.js (runs in browser, no API needed)
// Now using Web Worker to prevent UI freezing

let worker: Worker | null = null;
let isLoading = false;
const progressListeners = new Set<(progress: { file?: string; progress?: number; status?: string }) => void>();
const errorListeners = new Set<(err: string) => void>();
const embeddingListeners = new Set<(count: number) => void>();
let embeddingCount = 0;
let selectedSpeakerIndex = 0;

/**
 * Initialize the TTS worker
 */
export const initCoquiTTS = async (): Promise<boolean> => {
  if (worker) return true;
  
  try {
    console.log('Initializing TTS Worker...');
    worker = new Worker(new URL('./tts.worker.ts', import.meta.url), { type: 'module' });
    
    worker.onmessage = (event) => {
      const { type, data, error } = event.data;
      if (type === 'embeddings_info' && typeof event.data.count === 'number') {
        embeddingCount = event.data.count;
        embeddingListeners.forEach(cb => cb(embeddingCount));
      }
      if (type === 'progress') {
        if (data.status === 'progress') {
          const pct = Math.round(data.progress || 0);
          console.log(`Worker loading model: ${data.file} - ${pct}%`);
          progressListeners.forEach((cb) => cb({ file: data.file, progress: pct, status: 'loading' }));
        }
      } else if (type === 'error') {
        console.error('Worker error:', error);
        errorListeners.forEach((cb) => cb(error));
      }
    };
    
    return true;
  } catch (error) {
    console.error('Failed to initialize TTS worker:', error);
    return false;
  }
};

/**
 * Generate audio using the TTS model via Worker
 * @param text - Text to speak
 * @returns Audio URL or null if failed
 */
export const generateCoquiAudio = async (text: string, options?: { speakerIndex?: number }): Promise<string | null> => {
  if (!worker) {
    await initCoquiTTS();
  }
  
  if (!worker) {
    console.error('TTS Worker not initialized');
    return null;
  }

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.error('TTS Worker timed out');
      errorListeners.forEach(cb => cb('TTS request timed out: the network may be slow.'));
      resolve(null);
    }, 30000); // 30s timeout

    const handleMessage = (event: MessageEvent) => {
      const { type, buffer, error } = event.data;
      
      if (type === 'complete') {
        clearTimeout(timeoutId);
        worker!.removeEventListener('message', handleMessage);
        
        try {
          const blob = new Blob([buffer], { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          console.log('Audio generated successfully via Worker');
          resolve(url);
        } catch (e) {
          console.error('Error creating blob from worker data:', e);
          resolve(null);
        }
      } else if (type === 'error') {
        clearTimeout(timeoutId);
        worker!.removeEventListener('message', handleMessage);
        console.error('Worker reported error:', error);
        errorListeners.forEach(cb => cb(error));
        resolve(null);
      }
    };

    worker!.addEventListener('message', handleMessage);
    worker!.postMessage({ type: 'speak', text, speakerIndex: options?.speakerIndex ?? selectedSpeakerIndex });
  });
};

export const onProgress = (cb: (progress: { file?: string; progress?: number; status?: string }) => void) => {
  progressListeners.add(cb);
  return () => progressListeners.delete(cb);
};

export const onError = (cb: (err: string) => void) => {
  errorListeners.add(cb);
  return () => errorListeners.delete(cb);
};

export const onEmbeddingsCount = (cb: (count: number) => void) => {
  embeddingListeners.add(cb);
  // Immediately notify current count, if known
  if (embeddingCount) cb(embeddingCount);
  return () => embeddingListeners.delete(cb);
};

export const setSpeakerIndex = (idx: number) => {
  selectedSpeakerIndex = idx;
};

export const getEmbeddingsCount = () => embeddingCount;

/**
 * Check if TTS is ready
 */
export const isCoquiReady = (): boolean => {
  return worker !== null;
};

/**
 * Check if TTS is currently loading
 */
export const isCoquiLoading = (): boolean => {
  return isLoading;
};

/**
 * Reset the TTS worker (for testing purposes)
 */
export const resetCoquiTTS = () => {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  isLoading = false;
  progressListeners.clear();
  errorListeners.clear();
  embeddingListeners.clear();
  embeddingCount = 0;
  selectedSpeakerIndex = 0;
};
