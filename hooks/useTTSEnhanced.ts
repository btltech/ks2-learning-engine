import { useState, useCallback, useEffect, useRef } from 'react';
import { speakNaturally, stopSpeaking, speakCelebration, speakAsMiRa, pauseSpeaking, resumeSpeaking } from '../services/naturalTTS';
import { pauseYorubaAudio, playYorubaAudio, resumeYorubaAudio, stopYorubaAudio } from '../services/yorubaAudio';

const LANGUAGE_LOCALE_MAP: Record<string, { locale: string; label: string }> = {
  english: { locale: 'en-GB', label: 'English' },
  en: { locale: 'en-GB', label: 'English' },
  french: { locale: 'fr-FR', label: 'French' },
  spanish: { locale: 'es-ES', label: 'Spanish' },
  german: { locale: 'de-DE', label: 'German' },
  japanese: { locale: 'ja-JP', label: 'Japanese' },
  mandarin: { locale: 'zh-CN', label: 'Mandarin' },
  chinese: { locale: 'zh-CN', label: 'Mandarin' },
  romanian: { locale: 'ro-RO', label: 'Romanian' },
  yoruba: { locale: 'yo-NG', label: 'Yoruba' },
  italian: { locale: 'it-IT', label: 'Italian' },
  arabic: { locale: 'ar-SA', label: 'Arabic' },
  portuguese: { locale: 'pt-BR', label: 'Portuguese' },
  russian: { locale: 'ru-RU', label: 'Russian' },
  korean: { locale: 'ko-KR', label: 'Korean' },
  hindi: { locale: 'hi-IN', label: 'Hindi' },
  turkish: { locale: 'tr-TR', label: 'Turkish' },
  greek: { locale: 'el-GR', label: 'Greek' },
  latin: { locale: 'la-VA', label: 'Latin' }
};

const resolveLocale = (languageHint?: string) => {
  if (!languageHint) return { locale: 'en-GB', label: 'English' };
  const key = languageHint.toLowerCase().trim();
  return LANGUAGE_LOCALE_MAP[key] || { locale: 'en-GB', label: 'English' };
};

/**
 * Enhanced TTS hook with natural, expressive voices
 * 
 * Features:
 * - Context-aware expression (excitement, encouragement)
 * - Natural prosody and pacing
 * - Smart voice selection
 * - MiRa personality mode
 */
export const useTTSEnhanced = (language?: string, _options?: Record<string, unknown>) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsGesture, setNeedsGesture] = useState(false);
  const cancelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (cancelTimerRef.current) {
        clearTimeout(cancelTimerRef.current);
      }
      stopSpeaking();
    };
  }, []);

  const speak = useCallback(async (text: string, options?: { 
    celebratory?: boolean; 
    asMiRa?: boolean 
  }) => {
    const { label } = resolveLocale(language);
    const cleanText = text.replace(/[*#_`]/g, '');

    setIsLoading(true);
    setProgress(30);
    setErrorMessage(null);
    setNeedsGesture(false);
    setIsPaused(false);

    try {
      setProgress(50);
      setIsSpeaking(true);

      // Prefer the reviewed, tone-marked R2 recording for exact Yoruba entries.
      // Generated lesson text that is not in the pack continues through the
      // normal TTS fallback below.
      if (label === 'Yoruba') {
        const played = await playYorubaAudio(cleanText);
        if (played) {
          setProgress(100);
          setIsLoading(false);
          setIsSpeaking(false);
          setIsPaused(false);
          setProgress(null);
          return;
        }
      }
      
      // Choose speaking style based on options
      if (options?.asMiRa) {
        await speakAsMiRa(cleanText, label);
      } else if (options?.celebratory) {
        await speakCelebration(cleanText, label);
      } else {
        await speakNaturally(cleanText, label);
      }
      
      setProgress(100);
      setIsLoading(false);
      setIsSpeaking(false);
      setIsPaused(false);
      setProgress(null);
    } catch (error) {
      console.error('TTS error:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setNeedsGesture(true);
      }
      setIsLoading(false);
      setIsSpeaking(false);
      setIsPaused(false);
      setProgress(null);
      setErrorMessage(String(error));
    }
  }, [language]);

  const pause = useCallback(() => {
    if (isSpeaking && !isPaused) {
      pauseSpeaking();
      if (resolveLocale(language).label === 'Yoruba') pauseYorubaAudio();
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (isSpeaking && isPaused) {
      resumeSpeaking();
      if (resolveLocale(language).label === 'Yoruba') resumeYorubaAudio();
      setIsPaused(false);
    }
  }, [isSpeaking, isPaused]);

  const cancel = useCallback(() => {
    if (cancelTimerRef.current) {
      clearTimeout(cancelTimerRef.current);
      cancelTimerRef.current = null;
    }
    stopSpeaking();
    stopYorubaAudio();

    setIsSpeaking(false);
    setIsPaused(false);
    setProgress(null);
    setErrorMessage(null);
    setNeedsGesture(false);
  }, []);

  const switchProvider = useCallback((_provider: 'web-speech' | 'google-cloud' | 'piper') => {
    // Natural TTS uses enhanced Web Speech API
  }, []);

  return {
    speak,
    pause,
    resume,
    cancel,
    isSpeaking,
    isPaused,
    isLoading,
    progress,
    errorMessage,
    needsGesture,
    setNeedsGesture,
    googleCloudAvailable: false,
    activeProvider: 'web-speech' as const,
    availableProviders: ['web-speech'] as const,
    switchProvider
  };
};

export default useTTSEnhanced;
