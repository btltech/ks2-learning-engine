import { pipeline, env, Tensor } from '@huggingface/transformers';

// Configure to use CDN models
env.allowLocalModels = false;
env.allowRemoteModels = true;

let synthesizer: any = null;
let speakerEmbeddings: any = null;
let speakerEmbeddingsList: Float32Array[] | null = null;

// Singleton initialization promise to handle concurrent requests
let initPromise: Promise<void> | null = null;

const getSpeakerEmbeddings = async () => {
  if (speakerEmbeddingsList) return speakerEmbeddingsList;
  
  const url = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin';
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch embeddings: ${response.statusText}`);
  
  const buffer = await response.arrayBuffer();
  const data = new Float32Array(buffer);
  // Some embedding files contain multiple vectors; parse them into chunks of 512 floats
  if (data.length < 512) {
    throw new Error('Speaker embeddings file is unexpectedly small');
  }
  if (data.length % 512 !== 0) {
    // Embeddings length is not exact 512*n; dropping trailing values
  }
  const totalVectors = Math.floor(data.length / 512);
  speakerEmbeddingsList = [];
  for (let i = 0; i < totalVectors; i++) {
    const start = i * 512;
    const vec = data.slice(start, start + 512);
    // Validate values
    for (let j = 0; j < vec.length; j++) {
      const v = vec[j];
      if (!isFinite(v) || Number.isNaN(v)) {
        throw new Error('Invalid value detected in speaker embeddings');
      }
    }
    speakerEmbeddingsList.push(vec);
  }
  // Notify main thread about how many embeddings are available
  // We can't postMessage unless self is defined; in workers it is available
  try {
    // @ts-ignore
    self.postMessage({ type: 'embeddings_info', count: speakerEmbeddingsList.length });
  } catch (e) {
    // Not fatal; ignore
  }
  return speakerEmbeddingsList;
};

const getSpeakerEmbeddingByIndex = async (idx: number) => {
  const list = await getSpeakerEmbeddings();
  if (idx < 0 || idx >= list.length) {
    idx = 0;
  }
  const embeddingVec = list[idx];
  // validate length
  if (embeddingVec.length !== 512) {
    throw new Error(`Speaker embedding vector length invalid: expected 512 got ${embeddingVec.length}`);
  }
  // Convert to Tensor
  return new Tensor('float32', embeddingVec, [1, 512]);
};

const initialize = async () => {
  if (synthesizer) return;
  
  try {
    synthesizer = await pipeline(
      'text-to-speech',
      'Xenova/speecht5_tts',
      {
        progress_callback: (data: any) => {
          self.postMessage({ type: 'progress', data });
        }
      }
    );
  } catch (err) {
    // Reset initPromise in the main thread so a retry is possible
    throw err;
  }
};

function createWavFile(audioData: Float32Array, sampleRate: number): ArrayBuffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const int16Data = new Int16Array(audioData.length);
  for (let i = 0; i < audioData.length; i++) {
    const s = Math.max(-1, Math.min(1, audioData[i]));
    int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const dataSize = int16Data.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  
  const offset = 44;
  for (let i = 0; i < int16Data.length; i++) {
    view.setInt16(offset + i * 2, int16Data[i], true);
  }
  
  return buffer;
}

self.addEventListener('message', async (event) => {
  const { type, text } = event.data;

  if (type === 'speak') {
    try {
      if (!initPromise) {
        initPromise = initialize();
      }
      await initPromise;

      const embeddings = await getSpeakerEmbeddingByIndex(typeof event.data.speakerIndex === 'number' ? event.data.speakerIndex : 0);
      
      const output = await synthesizer(text, { 
        speaker_embeddings: embeddings
      });

      let audioData = output.audio;
      if (audioData && typeof audioData.data !== 'undefined') {
          audioData = audioData.data;
      }
      
      const sampleRate = output.sampling_rate || 16000;
      const wavBuffer = createWavFile(audioData, sampleRate);
      
      // Send the buffer back to main thread
      // We use the second argument to transfer ownership of the buffer for performance
      // @ts-ignore - Worker postMessage signature is different from Window
      self.postMessage({ type: 'complete', buffer: wavBuffer }, [wavBuffer]);
      
    } catch (error: any) {
      // Clear the init promise so subsequent attempts can retry initialization
      initPromise = null;
      self.postMessage({ type: 'error', error: error.message || String(error) });
    }
  }
});
