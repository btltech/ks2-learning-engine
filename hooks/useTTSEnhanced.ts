import { useState, useCallback, useEffect } from 'react';
import { playPronunciation } from '../services/ttsService';

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
 * Simple TTS hook using Web Speech API
 */
export const useTTSEnhanced = (language?: string) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsGesture, setNeedsGesture] = useState(false);

  const speak = useCallback(
    async (text: string) => {
      const { label } = resolveLocale(language);
      const cleanText = text.replace(/[*#_`]/g, '');

      setIsLoading(true);
      setProgress(10);
      setErrorMessage(null);
      setNeedsGesture(false);

      try {
        setProgress(30);
        await playPronunciation(cleanText, label);
        setIsSpeaking(true);
        setProgress(90);
        setIsLoading(false);

        const estimatedDuration = Math.max(2000, cleanText.length * 50);
        setTimeout(() => {
          setIsSpeaking(false);
          setProgress(null);
        }, estimatedDuration);
      } catch (error) {
        console.error('TTS error:', error);
        setIsLoading(false);
        setProgress(null);
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          setNeedsGesture(true);
        } else {
          setErrorMessage(String(error));
        }
      }
    },
    [language]
  );

  const cancel = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setProgress(null);
    setErrorMessage(null);
    setNeedsGesture(false);
  }, []);

  return {
    speak,
    cancel,
    isSpeaking,
    isLoading,
    progress,
    errorMessage,
    needsGesture,
    setNeedsGesture
  };
};

// Keep the original useTTS hook for backward compatibility
export const useTTS = (language?: string) => {
  return useTTSEnhanced(language);
};

export default useTTSEnhanced;
