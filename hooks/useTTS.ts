import { useState, useCallback } from 'react';
import { generatePiperAudio, initPiperTTS } from '../services/piperTTS';
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

  const speak = useCallback(async (text: string) => {
    const { locale, label } = resolveLocale(language);
    // Strip markdown symbols for better reading
    const cleanText = text.replace(/[*#_`]/g, '');

    // Use optimized Web Speech API TTS (FREE, NATURAL, INSTANT)
    setIsLoading(true);
    setProgress(10);
    setErrorMessage(null);
    setNeedsGesture(false);

    try {
      // Initialize TTS service
      const initialized = await initPiperTTS(locale);
      if (!initialized) {
        setErrorMessage('TTS not available');
        setIsLoading(false);
        return;
      }

      setProgress(30);

      // Generate audio with enhanced language support
      const result = await generatePiperAudio(cleanText, locale);
      setProgress(70);

      if (result) {
        setIsSpeaking(true);
        setProgress(90);
        setIsLoading(false);

        // Web Speech API handles audio playback internally
        // Set a timeout to mark speaking as done after estimated speech duration
        const estimatedDuration = Math.max(2000, cleanText.length * 50);
        setTimeout(() => {
          setIsSpeaking(false);
          setProgress(null);
        }, estimatedDuration);
      } else {
        setIsLoading(false);
        setErrorMessage('Failed to generate audio');
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsLoading(false);
      setProgress(null);
      setErrorMessage(String(error));
    }
  }, [language]);

  const cancel = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setProgress(null);
    setErrorMessage(null);
    setNeedsGesture(false);
  }, []);

  return { speak, cancel, isSpeaking, isLoading, progress, errorMessage, needsGesture, setNeedsGesture };
};
