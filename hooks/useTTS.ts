import { useState, useCallback } from 'react';
import { speakNaturally, stopSpeaking, speakCelebration } from '../services/naturalTTS';

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
};

const resolveLocale = (languageHint?: string) => {
  if (!languageHint) return { locale: 'en-GB', label: 'English' };
  const key = languageHint.toLowerCase().trim();
  return LANGUAGE_LOCALE_MAP[key] || { locale: 'en-GB', label: 'English' };
};

export const useTTS = (language?: string) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsGesture, setNeedsGesture] = useState(false);

  const speak = useCallback(async (text: string, celebratory?: boolean) => {
    const { label } = resolveLocale(language);
    // Strip markdown symbols for better reading
    const cleanText = text.replace(/[*#_`]/g, '');

    setIsLoading(true);
    setProgress(30);
    setErrorMessage(null);
    setNeedsGesture(false);

    try {
      setProgress(50);
      setIsSpeaking(true);
      
      // Use celebration voice for positive feedback
      if (celebratory) {
        await speakCelebration(cleanText, label);
      } else {
        await speakNaturally(cleanText, label);
      }
      
      setProgress(100);
      setIsLoading(false);
      setIsSpeaking(false);
      setProgress(null);
    } catch (error) {
      console.error('TTS error:', error);
      setIsLoading(false);
      setIsSpeaking(false);
      setProgress(null);
      setErrorMessage(String(error));
    }
  }, [language]);

  const cancel = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setProgress(null);
    setErrorMessage(null);
    setNeedsGesture(false);
  }, []);

  return { speak, cancel, isSpeaking, isLoading, progress, errorMessage, needsGesture, setNeedsGesture };
};
