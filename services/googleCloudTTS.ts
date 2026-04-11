// Google Cloud Text-to-Speech Service
// Provides high-quality neural voices for 17 languages with advanced features

import { getAuth } from 'firebase/auth';

// Use proxy in production to keep API keys server-side
const USE_TTS_PROXY = import.meta.env.PROD;
const TTS_PROXY_URL = '/api/tts';

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

// Google Cloud TTS voice mappings for supported languages
// See: https://cloud.google.com/text-to-speech/docs/voices
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
      { name: 'en-GB-Neural2-C', gender: 'FEMALE', naturalness: 'high' },
      { name: 'en-GB-Neural2-B', gender: 'MALE', naturalness: 'high' },
    ]
  },
  French: {
    languageCode: 'fr-FR',
    voices: [
      { name: 'fr-FR-Neural2-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'fr-FR-Neural2-B', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Spanish: {
    languageCode: 'es-ES',
    voices: [
      { name: 'es-ES-Neural2-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'es-ES-Neural2-B', gender: 'MALE', naturalness: 'high' }
    ]
  },
  German: {
    languageCode: 'de-DE',
    voices: [
      { name: 'de-DE-Neural2-C', gender: 'FEMALE', naturalness: 'high' },
      { name: 'de-DE-Neural2-B', gender: 'MALE', naturalness: 'high' }
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
    languageCode: 'cmn-CN',
    voices: [
      { name: 'cmn-CN-Wavenet-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'cmn-CN-Wavenet-B', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Romanian: {
    languageCode: 'ro-RO',
    voices: [
      { name: 'ro-RO-Wavenet-A', gender: 'FEMALE', naturalness: 'high' }
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
      { name: 'ar-XA-Wavenet-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'ar-XA-Wavenet-B', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Portuguese: {
    languageCode: 'pt-BR',
    voices: [
      { name: 'pt-BR-Neural2-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'pt-BR-Neural2-B', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Russian: {
    languageCode: 'ru-RU',
    voices: [
      { name: 'ru-RU-Wavenet-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'ru-RU-Wavenet-B', gender: 'MALE', naturalness: 'high' }
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
      { name: 'hi-IN-Neural2-B', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Turkish: {
    languageCode: 'tr-TR',
    voices: [
      { name: 'tr-TR-Wavenet-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'tr-TR-Wavenet-B', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Greek: {
    languageCode: 'el-GR',
    voices: [
      { name: 'el-GR-Wavenet-A', gender: 'FEMALE', naturalness: 'high' }
    ]
  },
  Dutch: {
    languageCode: 'nl-NL',
    voices: [
      { name: 'nl-NL-Wavenet-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'nl-NL-Wavenet-B', gender: 'MALE', naturalness: 'high' }
    ]
  },
  Polish: {
    languageCode: 'pl-PL',
    voices: [
      { name: 'pl-PL-Wavenet-A', gender: 'FEMALE', naturalness: 'high' },
      { name: 'pl-PL-Wavenet-B', gender: 'MALE', naturalness: 'high' }
    ]
  },
  // Yoruba - using US English Neural voices as closest available
  // Google Cloud TTS doesn't have native Yoruba voices
  Yoruba: {
    languageCode: 'en-US',
    voices: [
      { name: 'en-US-Neural2-C', gender: 'FEMALE', naturalness: 'high' },
      { name: 'en-US-Neural2-D', gender: 'MALE', naturalness: 'high' }
    ]
  }
};

let googleCloudConfig: GoogleCloudTTSConfig | null = null;
const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

const getFirebaseIdToken = async (): Promise<string | null> => {
  const user = getAuth().currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
};

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
 * Check if Google Cloud TTS has been configured with an API key
 */
export const isGoogleCloudConfigured = () => Boolean(googleCloudConfig?.apiKey);

/**
 * Check if a language is supported by Google Cloud TTS
 */
export const isLanguageSupportedByGoogleCloud = (language: string): boolean => {
  // Only Latin is truly unsupported
  const unsupportedLanguages = ['Latin'];
  return !unsupportedLanguages.includes(language);
};

/**
 * Get configured voice for language
 * Falls back to English if language not supported
 */
const getVoiceForLanguage = (language: string, gender: 'MALE' | 'FEMALE' = 'FEMALE') => {
  let voiceConfig = GOOGLE_CLOUD_VOICES[language];
  
  // Fallback to English for unsupported languages
  if (!voiceConfig) {
    console.log(`[GoogleCloudTTS] Language "${language}" not supported, falling back to English`);
    voiceConfig = GOOGLE_CLOUD_VOICES['English'];
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
 * Clean text for TTS - remove special characters that cause issues
 */
const cleanTextForTTS = (text: string): string => {
  const cleaned = text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[""'']/g, '') // Remove smart quotes
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/&/g, 'and') // Replace ampersand
    .replace(/[^\w\s.,!?'-]/g, '') // Remove other special chars, keep basic punctuation
    .trim()
    .substring(0, 5000); // Google Cloud TTS supports up to 5000 characters
  
  console.log('🧹 Cleaned text for TTS:', cleaned.substring(0, 50) + '... (length: ' + cleaned.length + ')');
  return cleaned;
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
    console.warn('❌ Google Cloud TTS not initialized. Provide an API key.');
    return null;
  }

  // Check cache - include gender in key to prevent wrong voice from being served
  const cacheKey = `${language}-${text}-${options?.gender || 'FEMALE'}-${options?.speakingRate || 1}-${options?.pitch || 0}`;
  if (audioCache.has(cacheKey)) {
    console.log('📦 Using cached audio for:', text.substring(0, 30));
    return audioCache.get(cacheKey)!;
  }

  try {
    const voice = getVoiceForLanguage(language, options?.gender);
    
    // Clean text - use plain text instead of SSML to avoid parsing issues
    const cleanText = cleanTextForTTS(text);
    console.log('🌐 Calling Google Cloud TTS API with voice:', voice.name, 'text length:', cleanText.length);

    const request: SynthesisRequest = {
      input: { text: cleanText },
      voice: {
        languageCode: voice.languageCode,
        name: voice.name,
        ssmlGender: voice.gender
      },
      audioConfig: {
        audioEncoding: 'MP3',
        sampleRateHertz: 24000,
        speakingRate: options?.speakingRate !== undefined ? options.speakingRate : 0.95,
        pitch: options?.pitch !== undefined ? options.pitch : 0,
        volumeGainDb: 0
      }
    };
    
    console.log('📤 Sending TTS request:', JSON.stringify(request).substring(0, 200));

    // Add timeout to prevent hanging (15 seconds for longer texts)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    // Use proxy in production to keep API key server-side
    const apiUrl = USE_TTS_PROXY 
      ? TTS_PROXY_URL 
      : `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleCloudConfig.apiKey}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (USE_TTS_PROXY) {
      const token = await getFirebaseIdToken();
      if (!token) {
        console.warn('❌ Not signed in. TTS proxy requires authentication.');
        return null;
      }
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      apiUrl,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google Cloud TTS API error:', response.status, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Error details:', errorJson?.error?.message || errorJson);
      } catch {
        // Already logged the text
      }
      return null;
    }

    const data: SynthesisResponse = await response.json();
    const audioBase64 = data.audioContent;
    console.log('✅ Google Cloud TTS API returned audio, length:', audioBase64?.length || 0);

    // Cache the result
    audioCache.set(cacheKey, audioBase64);

    return audioBase64;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ Google Cloud TTS timed out after 15 seconds');
    } else {
      console.error('❌ Error synthesizing audio:', error);
    }
    return null;
  }
};

/**
 * Play audio from base64 encoded MP3
 */
export const playGoogleCloudAudio = async (audioBase64: string) => {
  try {
    // Stop any currently playing audio first
    stopGoogleCloudAudio();
    
    console.log('🎵 Decoding audio base64, length:', audioBase64.length);
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);
    console.log('🔗 Created blob URL:', url);

    const audio = new Audio(url);
    audio.playbackRate = 1;
    currentAudio = audio;

    // Await playback so callers can detect autoplay/gesture failures
    await audio.play();
    console.log('▶️ Audio play() succeeded');

    // Clean up after playing
    audio.addEventListener('ended', () => {
      console.log('⏹️ Audio playback ended');
      URL.revokeObjectURL(url);
      if (currentAudio === audio) {
        currentAudio = null;
      }
    });

    return audio;
  } catch (error) {
    console.error('❌ Error playing audio:', error);
    // Check for autoplay restrictions
    if (error instanceof Error && error.name === 'NotAllowedError') {
      console.error('🚫 Autoplay blocked - user interaction required');
    }
    return null;
  }
};

/**
 * Stop currently playing Google Cloud TTS audio
 */
export const stopGoogleCloudAudio = () => {
  if (currentAudio) {
    console.log('⏹️ Stopping Google Cloud TTS audio');
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};

/**
 * Pause currently playing Google Cloud TTS audio
 */
export const pauseGoogleCloudAudio = () => {
  if (currentAudio) {
    console.log('⏸️ Pausing Google Cloud TTS audio');
    currentAudio.pause();
  }
};

/**
 * Resume currently playing Google Cloud TTS audio
 */
export const resumeGoogleCloudAudio = () => {
  if (currentAudio) {
    console.log('▶️ Resuming Google Cloud TTS audio');
    currentAudio.play().catch(err => console.error('Error resuming audio:', err));
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
  console.log('🔊 speakWithGoogleCloud called:', { text: text.substring(0, 30), language, options });
  
  if (!googleCloudConfig?.apiKey) {
    console.error('❌ Google Cloud TTS not configured - no API key');
    return false;
  }
  
  try {
    const audioBase64 = await synthesizeGoogleCloudTTS(text, language, options);
    if (audioBase64) {
      console.log('🎵 Got audio data, attempting playback...');
      const audio = await playGoogleCloudAudio(audioBase64);
      if (audio) {
        console.log('✅ Audio playback started');
        
        // Wait for playback to finish or be stopped
        await new Promise<void>((resolve) => {
          const onEnd = () => {
            audio.removeEventListener('ended', onEnd);
            audio.removeEventListener('pause', onEnd);
            resolve();
          };
          
          audio.addEventListener('ended', onEnd);
          audio.addEventListener('pause', onEnd); // Resolve on pause (stop) too
        });

        return true;
      } else {
        console.error('❌ Audio playback failed');
        return false;
      }
    }
    console.error('❌ No audio data returned from synthesis');
    return false;
  } catch (error) {
    console.error('❌ Error in speakWithGoogleCloud:', error);
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

/**
 * Direct test function - call from console: testGoogleTTS()
 */
export const testGoogleTTS = async () => {
  console.log('🧪 Testing Google Cloud TTS...');
  
  if (!USE_TTS_PROXY && !googleCloudConfig?.apiKey) {
    console.error('❌ No API key configured');
    return false;
  }
  
  console.log('✅ TTS configured');
  
  try {
    // Simple request without SSML
    const request = {
      input: { text: "Hello! This is a test of Google Cloud Text to Speech." },
      voice: {
        languageCode: 'en-GB',
        name: 'en-GB-Neural2-C',
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3'
      }
    };
    
    console.log('📤 Sending request...');
    const startTime = Date.now();
    
    // Use proxy in production to keep API key server-side
    const apiUrl = USE_TTS_PROXY 
      ? TTS_PROXY_URL 
      : `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleCloudConfig.apiKey}`;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (USE_TTS_PROXY) {
      const token = await getFirebaseIdToken();
      if (!token) {
        console.error('❌ Not signed in. TTS proxy requires authentication.');
        return false;
      }
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(
      apiUrl,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      }
    );
    
    console.log('📥 Response received in', Date.now() - startTime, 'ms, status:', response.status);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API error:', error);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Got audio content, length:', data.audioContent?.length || 0);
    
    if (!data.audioContent) {
      console.error('❌ No audioContent in response');
      return false;
    }
    
    // Decode and play
    console.log('🎵 Decoding audio...');
    const binaryString = atob(data.audioContent);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);
    console.log('🔗 Blob URL:', url);
    
    const audio = new Audio(url);
    console.log('▶️ Playing audio...');
    
    await audio.play();
    console.log('🎉 SUCCESS! Audio is playing');
    
    audio.onended = () => {
      console.log('⏹️ Audio finished');
      URL.revokeObjectURL(url);
    };
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Make test function available globally for console testing
if (typeof window !== 'undefined') {
  (window as unknown as { testGoogleTTS: typeof testGoogleTTS }).testGoogleTTS = testGoogleTTS;
}

export default {
  initializeGoogleCloudTTS,
  isGoogleCloudConfigured,
  synthesizeGoogleCloudTTS,
  playGoogleCloudAudio,
  stopGoogleCloudAudio,
  speakWithGoogleCloud,
  clearGoogleCloudCache,
  getSupportedLanguages,
  getAvailableVoices,
  testGoogleTTS
};
