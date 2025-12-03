/**
 * Unified TTS Service - Natural & Exciting Voices for Students
 * 
 * This service provides multiple TTS backends with automatic fallback:
 * 1. Google Cloud TTS (if configured - highest quality)
 * 2. Enhanced Web Speech API (free, works everywhere)
 * 
 * Features:
 * - Context-aware speaking styles (lesson, quiz, celebration)
 * - Kid-friendly voice selection
 * - Natural prosody with SSML
 * - Caching for performance
 */

import { speakWithGoogleCloud, isGoogleCloudConfigured } from './googleCloudTTS';
import { speakWithEnhancedWebSpeech, speakAsMiRa, speakCelebration, stopSpeaking } from './edgeTTS';

// Speaking context affects voice style
export type SpeakingContext = 
  | 'lesson'       // Clear, friendly explanation
  | 'quiz'         // Encouraging, clear questions
  | 'feedback'     // Positive, warm response
  | 'celebration'  // Excited, congratulatory
  | 'mira'         // MiRa's personality
  | 'pronunciation'// Slow, clear for learning
  | 'story';       // Narrative, engaging

interface SpeakOptions {
  context?: SpeakingContext;
  language?: string;
  speed?: number;
  pitch?: number;
  useGoogleCloud?: boolean;
}

// Cache to prevent re-speaking the same text
const recentSpeech = new Map<string, number>();
const DEBOUNCE_MS = 500;

/**
 * Main speak function with automatic provider selection
 */
export const speak = async (
  text: string,
  options: SpeakOptions = {}
): Promise<boolean> => {
  const {
    context = 'lesson',
    language = 'English',
    speed,
    pitch,
    useGoogleCloud = true
  } = options;

  // Debounce rapid calls with same text
  const cacheKey = `${text}-${language}`;
  const lastSpoken = recentSpeech.get(cacheKey);
  if (lastSpoken && Date.now() - lastSpoken < DEBOUNCE_MS) {
    return true;
  }
  recentSpeech.set(cacheKey, Date.now());

  // Clean up old cache entries
  if (recentSpeech.size > 50) {
    const now = Date.now();
    for (const [key, time] of recentSpeech) {
      if (now - time > 5000) {
        recentSpeech.delete(key);
      }
    }
  }

  // Try Google Cloud TTS first (highest quality)
  if (useGoogleCloud && isGoogleCloudConfigured()) {
    try {
      const success = await speakWithGoogleCloud(text, language, {
        speakingRate: speed || getSpeedForContext(context),
        pitch: pitch
      });
      if (success) return true;
    } catch (error) {
      console.warn('Google Cloud TTS failed, falling back to Web Speech:', error);
    }
  }

  // Fall back to enhanced Web Speech API
  return speakWithEnhancedWebSpeech(text, {
    language,
    style: getStyleForContext(context),
    speed: speed || getSpeedForContext(context),
    pitch: pitch
  });
};

/**
 * Speak as MiRa (the AI guide)
 */
export const speakMiRa = async (
  text: string,
  language: string = 'English'
): Promise<boolean> => {
  // Try Google Cloud first for MiRa's voice
  if (isGoogleCloudConfigured()) {
    try {
      const success = await speakWithGoogleCloud(text, language, {
        speakingRate: 0.95,
        pitch: 2 // Slightly higher for friendly tone
      });
      if (success) return true;
    } catch (error) {
      console.warn('Google Cloud TTS failed for MiRa:', error);
    }
  }
  
  return speakAsMiRa(text, language);
};

/**
 * Celebrate an achievement with excited voice
 */
export const celebrate = async (
  text: string,
  language: string = 'English'
): Promise<boolean> => {
  if (isGoogleCloudConfigured()) {
    try {
      const success = await speakWithGoogleCloud(text, language, {
        speakingRate: 1.1,
        pitch: 4
      });
      if (success) return true;
    } catch (error) {
      console.warn('Google Cloud TTS failed for celebration:', error);
    }
  }
  
  return speakCelebration(text, language);
};

/**
 * Read pronunciation clearly for language learning
 */
export const pronounce = async (
  text: string,
  language: string
): Promise<boolean> => {
  if (isGoogleCloudConfigured()) {
    try {
      const success = await speakWithGoogleCloud(text, language, {
        speakingRate: 0.75, // Very slow
        pitch: 0
      });
      if (success) return true;
    } catch (error) {
      console.warn('Google Cloud TTS failed for pronunciation:', error);
    }
  }
  
  return speakWithEnhancedWebSpeech(text, {
    language,
    style: 'calm',
    speed: 0.75
  });
};

/**
 * Read a question during a quiz
 */
export const speakQuizQuestion = async (
  question: string,
  language: string = 'English'
): Promise<boolean> => {
  return speak(question, {
    context: 'quiz',
    language,
    speed: 0.9 // Slightly slower for comprehension
  });
};

/**
 * Give encouraging feedback
 */
export const speakFeedback = async (
  feedback: string,
  isPositive: boolean,
  language: string = 'English'
): Promise<boolean> => {
  if (isPositive) {
    return celebrate(feedback, language);
  }
  return speak(feedback, {
    context: 'feedback',
    language,
    speed: 0.95
  });
};

// Helper: Get speed based on context
const getSpeedForContext = (context: SpeakingContext): number => {
  switch (context) {
    case 'celebration':
      return 1.05;
    case 'pronunciation':
      return 0.75;
    case 'story':
      return 0.9;
    case 'quiz':
      return 0.9;
    default:
      return 0.95;
  }
};

// Helper: Get style based on context
const getStyleForContext = (context: SpeakingContext): 'cheerful' | 'friendly' | 'excited' | 'encouraging' | 'calm' | 'storytelling' => {
  switch (context) {
    case 'celebration':
      return 'excited';
    case 'mira':
      return 'cheerful';
    case 'quiz':
      return 'encouraging';
    case 'story':
      return 'storytelling';
    case 'pronunciation':
      return 'calm';
    default:
      return 'friendly';
  }
};

/**
 * Stop any ongoing speech
 */
export const stop = stopSpeaking;

/**
 * Legacy function for backward compatibility
 */
export const playPronunciation = async (text: string, language: string): Promise<void> => {
  await pronounce(text, language);
};

export default {
  speak,
  speakMiRa,
  celebrate,
  pronounce,
  speakQuizQuestion,
  speakFeedback,
  playPronunciation,
  stop
};
