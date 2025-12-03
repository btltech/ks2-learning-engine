/**
 * Natural TTS Service - Exciting & Natural Voices for Students
 * 
 * This module provides enhanced Text-to-Speech with:
 * - Google Cloud TTS (high quality neural voices) when API key is available
 * - Context-aware expression (excitement, encouragement, calmness)
 * - Kid-friendly pacing and pronunciation
 * - Natural prosody with pitch and rate variations
 * - Smart voice selection preferring neural/natural voices
 */

import { initializeGoogleCloudTTS, isGoogleCloudConfigured, speakWithGoogleCloud } from './googleCloudTTS';

// Initialize Google Cloud TTS if API key is available
const GOOGLE_TTS_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLOUD_TTS_API_KEY) || '';
if (GOOGLE_TTS_API_KEY) {
  initializeGoogleCloudTTS(GOOGLE_TTS_API_KEY);
  console.log('✅ Google Cloud TTS initialized with API key');
}

// Language to BCP47 mapping
const LANGUAGE_MAP: Record<string, string> = {
  English: 'en-GB',
  French: 'fr-FR',
  Spanish: 'es-ES',
  German: 'de-DE',
  Japanese: 'ja-JP',
  Mandarin: 'zh-CN',
  Romanian: 'ro-RO',
  Yoruba: 'yo-NG',
  Italian: 'it-IT',
  Arabic: 'ar-SA',
  Portuguese: 'pt-BR',
  Russian: 'ru-RU',
  Korean: 'ko-KR',
  Hindi: 'hi-IN',
  Turkish: 'tr-TR',
  Greek: 'el-GR',
  Latin: 'la-VA',
};

// Voice quality scoring for natural sounding voices
const scoreVoice = (voice: SpeechSynthesisVoice): number => {
  const name = (voice.name || '').toLowerCase();
  let score = 0;

  // PRIORITY 1: Cloud/Remote voices (highest quality)
  if (voice.localService === false) score += 100;

  // PRIORITY 2: Neural/Natural voices
  if (name.includes('neural')) score += 90;
  if (name.includes('natural')) score += 85;
  if (name.includes('enhanced')) score += 80;
  if (name.includes('premium')) score += 75;

  // PRIORITY 3: Named high-quality voices
  // macOS
  if (name.includes('samantha') && !name.includes('compact')) score += 70;
  if (name.includes('daniel') && !name.includes('compact')) score += 68;
  if (name.includes('karen')) score += 65;
  if (name.includes('moira')) score += 63;
  
  // Google
  if (name.includes('google') && !name.includes('espeak')) score += 75;
  if (name.includes('wavenet')) score += 85;
  
  // Microsoft
  if (name.includes('aria')) score += 72;
  if (name.includes('jenny')) score += 70;
  if (name.includes('zira')) score += 65;
  if (name.includes('microsoft') && !name.includes('david')) score += 55;
  
  // Apple Siri
  if (name.includes('siri') && !name.includes('compact')) score += 68;

  // PENALTIES: Avoid robotic voices
  if (name.includes('compact')) score -= 200;
  if (name.includes('espeak')) score -= 180;
  if (name.includes('mbrola')) score -= 150;
  if (name.includes('festival')) score -= 150;
  if (name.includes('flite')) score -= 150;
  if (name.includes('pico')) score -= 120;
  if (name.includes('default')) score -= 50;
  
  return score;
};

// Cache for best voice per language
const voiceCache = new Map<string, SpeechSynthesisVoice>();

/**
 * Get the best available voice for a language
 */
const getBestVoice = (locale: string): SpeechSynthesisVoice | null => {
  if (voiceCache.has(locale)) {
    return voiceCache.get(locale)!;
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Find voices for this language
  const baseLocale = locale.split('-')[0];
  let candidates = voices.filter(v => v.lang === locale);
  
  if (!candidates.length) {
    candidates = voices.filter(v => v.lang.startsWith(baseLocale));
  }

  if (!candidates.length) {
    // Fallback to English
    candidates = voices.filter(v => v.lang.startsWith('en-'));
  }

  if (!candidates.length) {
    return voices[0] || null;
  }

  // Score and sort
  candidates.sort((a, b) => scoreVoice(b) - scoreVoice(a));
  const best = candidates[0];
  
  voiceCache.set(locale, best);
  return best;
};

// Clear cache when voices change
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    voiceCache.clear();
  });
}

/**
 * Analyze text content to determine expression style
 */
const analyzeContent = (text: string): {
  pitch: number;
  rate: number;
  emphasis: 'excited' | 'encouraging' | 'questioning' | 'explaining' | 'neutral';
} => {
  const lower = text.toLowerCase();
  
  // Celebration/excitement
  if (lower.includes('well done') || 
      lower.includes('excellent') || 
      lower.includes('amazing') ||
      lower.includes('correct') ||
      lower.includes('brilliant') ||
      lower.includes('fantastic') ||
      lower.includes('great job') ||
      lower.includes('perfect') ||
      text.includes('🎉') ||
      text.includes('⭐') ||
      text.includes('🏆')) {
    return { pitch: 1.15, rate: 1.05, emphasis: 'excited' };
  }
  
  // Question
  if (text.trim().endsWith('?')) {
    return { pitch: 1.08, rate: 0.92, emphasis: 'questioning' };
  }
  
  // Encouragement
  if (lower.includes('try again') ||
      lower.includes('keep going') ||
      lower.includes('you can') ||
      lower.includes('almost') ||
      lower.includes('close') ||
      lower.includes('good try') ||
      lower.includes('don\'t worry')) {
    return { pitch: 1.05, rate: 0.95, emphasis: 'encouraging' };
  }
  
  // Explanation
  if (lower.includes('because') ||
      lower.includes('this means') ||
      lower.includes('remember') ||
      lower.includes('important') ||
      lower.includes('the reason') ||
      lower.includes('for example')) {
    return { pitch: 1.0, rate: 0.85, emphasis: 'explaining' };
  }
  
  // Neutral/friendly
  return { pitch: 1.02, rate: 0.92, emphasis: 'neutral' };
};

/**
 * Prepare text for more natural speech
 */
const prepareText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')
    // Expand abbreviations
    .replace(/e\.g\./gi, 'for example,')
    .replace(/i\.e\./gi, 'that is,')
    .replace(/etc\./gi, 'and so on')
    // Numbers and percentages
    .replace(/(\d+)%/g, '$1 percent')
    .replace(/(\d+)\/(\d+)/g, '$1 out of $2')
    // Clean emojis for TTS
    .replace(/[🎉⭐🏆✨💫🌟]/g, '')
    .trim();
};

/**
 * Split text into sentences for better pacing
 */
const splitIntoSentences = (text: string): string[] => {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.length ? sentences : [text];
};

/**
 * Main speak function with natural expression
 * Uses Google Cloud TTS if available, falls back to Web Speech API
 */
export const speakNaturally = async (
  text: string, 
  language: string = 'English'
): Promise<void> => {
  // Try Google Cloud TTS first (highest quality)
  if (isGoogleCloudConfigured()) {
    try {
      const expression = analyzeContent(text);
      const success = await speakWithGoogleCloud(prepareText(text), language, {
        speakingRate: expression.rate,
        pitch: Math.round((expression.pitch - 1) * 10) // Convert to Google's scale
      });
      if (success) return;
    } catch (error) {
      console.warn('Google Cloud TTS failed, falling back to Web Speech:', error);
    }
  }

  // Fallback to Web Speech API
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not available');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const locale = LANGUAGE_MAP[language] || 'en-GB';
  const voice = getBestVoice(locale);
  const cleanText = prepareText(text);
  const sentences = splitIntoSentences(cleanText);

  // Speak sentences with natural expression
  for (const sentence of sentences) {
    await speakSentence(sentence, voice, locale);
    // Natural pause between sentences
    await new Promise(resolve => setTimeout(resolve, 200));
  }
};

/**
 * Speak a single sentence with expression
 */
const speakSentence = (
  text: string, 
  voice: SpeechSynthesisVoice | null, 
  locale: string
): Promise<void> => {
  return new Promise((resolve) => {
    const expression = analyzeContent(text);
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.lang = locale;
    if (voice) utterance.voice = voice;
    
    // Apply expression with slight random variation for naturalness
    const jitter = () => (Math.random() * 0.04) - 0.02;
    utterance.rate = Math.max(0.6, Math.min(1.5, expression.rate + jitter()));
    utterance.pitch = Math.max(0.5, Math.min(2.0, expression.pitch + jitter()));
    utterance.volume = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Speak as MiRa - warm, friendly, encouraging
 * Uses Google Cloud TTS for best quality
 */
export const speakAsMiRa = async (
  text: string, 
  language: string = 'English'
): Promise<void> => {
  // Try Google Cloud TTS first
  if (isGoogleCloudConfigured()) {
    try {
      const success = await speakWithGoogleCloud(prepareText(text), language, {
        speakingRate: 0.95,
        pitch: 2 // Slightly higher for friendly tone
      });
      if (success) return;
    } catch (error) {
      console.warn('Google Cloud TTS failed for MiRa:', error);
    }
  }

  // Fallback to Web Speech API
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const locale = LANGUAGE_MAP[language] || 'en-GB';
  const voice = getBestVoice(locale);
  const cleanText = prepareText(text);

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = locale;
  if (voice) utterance.voice = voice;
  
  // MiRa's personality: warm, slightly upbeat
  utterance.rate = 0.95;
  utterance.pitch = 1.1;
  utterance.volume = 1.0;

  return new Promise((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Celebrate achievement - excited and happy!
 * Uses Google Cloud TTS for best quality
 */
export const speakCelebration = async (
  text: string, 
  language: string = 'English'
): Promise<void> => {
  // Try Google Cloud TTS first
  if (isGoogleCloudConfigured()) {
    try {
      const success = await speakWithGoogleCloud(prepareText(text), language, {
        speakingRate: 1.1,
        pitch: 4 // Higher pitch for excitement
      });
      if (success) return;
    } catch (error) {
      console.warn('Google Cloud TTS failed for celebration:', error);
    }
  }

  // Fallback to Web Speech API
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const locale = LANGUAGE_MAP[language] || 'en-GB';
  const voice = getBestVoice(locale);
  const cleanText = prepareText(text);

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = locale;
  if (voice) utterance.voice = voice;
  
  // Celebration: higher pitch, slightly faster
  utterance.rate = 1.08;
  utterance.pitch = 1.2;
  utterance.volume = 1.0;

  return new Promise((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Read pronunciation slowly and clearly
 * Uses Google Cloud TTS for best quality
 */
export const speakPronunciation = async (
  text: string, 
  language: string = 'English'
): Promise<void> => {
  // Try Google Cloud TTS first
  if (isGoogleCloudConfigured()) {
    try {
      const success = await speakWithGoogleCloud(text, language, {
        speakingRate: 0.75, // Very slow for pronunciation
        pitch: 0
      });
      if (success) return;
    } catch (error) {
      console.warn('Google Cloud TTS failed for pronunciation:', error);
    }
  }

  // Fallback to Web Speech API
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const locale = LANGUAGE_MAP[language] || 'en-GB';
  const voice = getBestVoice(locale);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  if (voice) utterance.voice = voice;
  
  // Pronunciation: slower, clear
  utterance.rate = 0.75;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  return new Promise((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Stop all speech
 */
export const stopSpeaking = (): void => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Check if currently speaking
 */
export const isSpeaking = (): boolean => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
};

// Legacy export for backward compatibility
export const playPronunciation = speakNaturally;

export default {
  speakNaturally,
  speakAsMiRa,
  speakCelebration,
  speakPronunciation,
  stopSpeaking,
  isSpeaking,
  playPronunciation
};
