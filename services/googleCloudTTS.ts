// Google Cloud Text-to-Speech Service
// Provides high-quality neural voices for 17 languages with advanced features

interface GoogleCloudTTSConfig {
  apiKey: string;
  projectId?: string;
}

interface SynthesisRequest {
  input: { text?: string; ssml?: string };
  voice: {
    languageCode: string;
    name: string;
    ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  };
  audioConfig: {
    audioEncoding: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
    sampleRateHertz?: number;
    speakingRate?: number;
    pitch?: number;
    volumeGainDb?: number;
    effectsProfileUri?: string[];
  };
}

interface SynthesisResponse {
  audioContent: string;
  timepoints: Array<{
    timeSeconds: number;
    markName: string;
  }>;
}

// Google Cloud TTS voice mappings for 17 languages
const GOOGLE_CLOUD_VOICES: Record<string, {
  languageCode: string;
  voices: Array<{
    name: string;
    gender: 'MALE' | 'FEMALE' | 'NEUTRAL';
    naturalness: 'high' | 'medium' | 'low';
  }>;
}> = {
  English: {
    languageCode: 'en-GB',
    voices: [
      { name: 'en-GB-Studio-C', gender: 'FEMALE', naturalness: 'high' },
      { name: 'en-GB-Studio-B', gender: 'MALE', naturalness: 'high' },
      { name: 'en-GB-Neural2-C', gender: 'FEMALE', naturalness: 'high' },
      { name: 'en-GB-Neural2-B', gender: 'MALE', naturalness: 'high' }
    ]
  },
  French: {
    languageCode: 'fr-FR',
    voices: [
      { name: 'fr-FR-Neural2-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'fr-FR-Neural2-C', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Spanish: {
    languageCode: 'es-ES',
    voices: [
      { name: 'es-ES-Neural2-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'es-ES-Neural2-C', gender: 'MALE', naturalness: 'high' }
    ]
  },
  German: {
    languageCode: 'de-DE',
    voices: [
      { name: 'de-DE-Neural2-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'de-DE-Neural2-C', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Japanese: {
    languageCode: 'ja-JP',
    voices: [
      { name: 'ja-JP-Neural2-B', gender: 'FEMALE', naturalness: 'high' },
      { name: 'ja-JP-Neural2-C', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Mandarin: {
    languageCode: 'zh-CN',
    voices: [
      { name: 'zh-CN-Neural2-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'zh-CN-Neural2-C', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Romanian: {
    languageCode: 'ro-RO',
    voices: [
      { name: 'ro-RO-Neural2-A', gender: 'FEMALE', naturalness: 'high' }
    ]
  },
  Yoruba: {
    languageCode: 'yo-NG',
    voices: [
      { name: 'yo-NG-Neural2-A', gender: 'FEMALE', naturalness: 'high' }
    ]
  },
  Italian: {
    languageCode: 'it-IT',
    voices: [
      { name: 'it-IT-Neural2-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'it-IT-Neural2-C', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Arabic: {
    languageCode: 'ar-XA',
    voices: [
      { name: 'ar-XA-Neural2-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'ar-XA-Neural2-C', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Portuguese: {
    languageCode: 'pt-BR',
    voices: [
      { name: 'pt-BR-Neural2-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'pt-BR-Neural2-C', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Russian: {
    languageCode: 'ru-RU',
    voices: [
      { name: 'ru-RU-Neural2-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'ru-RU-Neural2-C', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Korean: {
    languageCode: 'ko-KR',
    voices: [
      { name: 'ko-KR-Neural2-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'ko-KR-Neural2-C', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Hindi: {
    languageCode: 'hi-IN',
    voices: [
      { name: 'hi-IN-Neural2-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'hi-IN-Neural2-C', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Turkish: {
    languageCode: 'tr-TR',
    voices: [
      { name: 'tr-TR-Neural2-A', gender: 'FEMALE', naturalness: 'high' }
    ]
  },
  Greek: {
    languageCode: 'el-GR',
    voices: [
      { name: 'el-GR-Neural2-A', gender: 'FEMALE', naturalness: 'high' }
    ]
  },
  Latin: {
    languageCode: 'la-VA',
    voices: [
      { name: 'la-VA-Neural2-C', gender: 'MALE', naturalness: 'high' }
    ]
  }
};

let googleCloudConfig: GoogleCloudTTSConfig | null = null;
const audioCache = new Map<string, string>();

/**
 * Initialize Google Cloud TTS service
 * @param apiKey - Google Cloud API key for TTS
 * @param projectId - Optional Google Cloud project ID
 */
export const initializeGoogleCloudTTS = (apiKey: string, projectId?: string) => {
  googleCloudConfig = { apiKey, projectId };
  console.log('Google Cloud TTS initialized');
};

/**
 * Get configured voice for language
 */
const getVoiceForLanguage = (language: string, gender: 'MALE' | 'FEMALE' = 'FEMALE') => {
  const voiceConfig = GOOGLE_CLOUD_VOICES[language];
  if (!voiceConfig) {
    return null;
  }

  // Find voice matching preferred gender
  let voice = voiceConfig.voices.find(v => v.gender === gender);
  if (!voice) {
    voice = voiceConfig.voices[0];
  }

  return {
    languageCode: voiceConfig.languageCode,
    name: voice.name,
    gender: voice.gender
  };
};

/**
 * Convert plain text to SSML with natural prosody for better speech quality
 */
const convertToSSML = (text: string): string => {
  // Clean up the text first
  let cleanText = text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[""]/g, '"') // Normalize quotes
    .trim();

  // Split into sentences for better prosody
  const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];

  const ssmlSentences = sentences.map((sentence: string, index: number) => {
    let trimmed = sentence.trim();

    // Add emphasis for questions
    if (trimmed.endsWith('?')) {
      trimmed = `<prosody pitch="+2st">${trimmed}</prosody>`;
    }

    // Add slight emphasis for exclamations
    if (trimmed.endsWith('!')) {
      trimmed = `<prosody volume="+1dB">${trimmed}</prosody>`;
    }

    // Wrap in sentence tag for natural pauses
    trimmed = `<s>${trimmed}</s>`;

    // Add appropriate break between sentences
    // Shorter break for questions, longer for statements
    const breakTime = trimmed.includes('<prosody pitch="+2st">') ? '300ms' : '400ms';
    return index < sentences.length - 1 ? `${trimmed}<break time="${breakTime}"/>` : trimmed;
  });

  // Add overall speak tag with natural speech settings
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">${ssmlSentences.join('')}</speak>`;
};

/**
 * Synthesize text to speech using Google Cloud TTS
 */
export const synthesizeGoogleCloudTTS = async (
  text: string,
  language: string,
  options?: {
    gender?: 'MALE' | 'FEMALE';
    speakingRate?: number;
    pitch?: number;
  }
): Promise<string | null> => {
  if (!googleCloudConfig?.apiKey) {
    console.warn('Google Cloud TTS not initialized. Provide an API key.');
    return null;
  }

  // Check cache - include gender in key to prevent wrong voice from being served
  const cacheKey = `${language}-${text}-${options?.gender || 'FEMALE'}-${options?.speakingRate || 1}-${options?.pitch || 0}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  try {
    const voice = getVoiceForLanguage(language, options?.gender);
    if (!voice) {
      console.error(`No voice found for language: ${language}`);
      return null;
    }

    // Use SSML for more natural speech prosody
    const ssml = convertToSSML(text);

    const request: SynthesisRequest = {
      input: { ssml },
      voice: {
        languageCode: voice.languageCode,
        name: voice.name,
        ssmlGender: voice.gender
      },
      audioConfig: {
        audioEncoding: 'MP3',
        sampleRateHertz: 24000,
        // Optimized settings for natural, human-like speech
        speakingRate: options?.speakingRate !== undefined ? options.speakingRate : 0.95, // Slightly slower for clarity
        pitch: options?.pitch !== undefined ? options.pitch : 0,
        volumeGainDb: 0,
        // Enhanced audio profiles for high-fidelity, natural playback
        effectsProfileUri: [
          'headphone-class-device',
          'small-bluetooth-speaker-class-device'
        ]
      }
    };

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleCloudConfig.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Google Cloud TTS error:', error);
      return null;
    }

    const data: SynthesisResponse = await response.json();
    const audioBase64 = data.audioContent;

    // Cache the result
    audioCache.set(cacheKey, audioBase64);

    return audioBase64;
  } catch (error) {
    console.error('Error synthesizing audio:', error);
    return null;
  }
};

/**
 * Play audio from base64 encoded MP3
 */
export const playGoogleCloudAudio = (audioBase64: string) => {
  try {
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    audio.playbackRate = 1;
    audio.play();

    // Clean up after playing
    audio.addEventListener('ended', () => {
      URL.revokeObjectURL(url);
    });

    return audio;
  } catch (error) {
    console.error('Error playing audio:', error);
    return null;
  }
};

/**
 * Synthesize and play text in one call
 */
export const speakWithGoogleCloud = async (
  text: string,
  language: string,
  options?: {
    gender?: 'MALE' | 'FEMALE';
    speakingRate?: number;
    pitch?: number;
  }
): Promise<boolean> => {
  try {
    const audioBase64 = await synthesizeGoogleCloudTTS(text, language, options);
    if (audioBase64) {
      playGoogleCloudAudio(audioBase64);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error in speakWithGoogleCloud:', error);
    return false;
  }
};

/**
 * Clear audio cache
 */
export const clearGoogleCloudCache = () => {
  audioCache.clear();
};

/**
 * Get supported languages
 */
export const getSupportedLanguages = () => {
  return Object.keys(GOOGLE_CLOUD_VOICES);
};

/**
 * Get available voices for a language
 */
export const getAvailableVoices = (language: string) => {
  const config = GOOGLE_CLOUD_VOICES[language];
  return config ? config.voices : [];
};

export default {
  initializeGoogleCloudTTS,
  synthesizeGoogleCloudTTS,
  playGoogleCloudAudio,
  speakWithGoogleCloud,
  clearGoogleCloudCache,
  getSupportedLanguages,
  getAvailableVoices
};
