import { useState, useCallback, useEffect, useRef } from 'react';
import { playPronunciation } from '../services/ttsService';
import { generatePiperAudio, initPiperTTS, type PiperPlayback } from '../services/piperTTS';

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
 * TTS hook that prefers Piper (hosted models, free) with Web Speech fallback.
 * Second parameter kept for compatibility; currently unused.
 */
export const useTTSEnhanced = (language?: string, _options?: Record<string, unknown>) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'piper' | 'web-speech'>('piper');
  const activePlaybackRef = useRef<PiperPlayback | null>(null);
  const cancelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (cancelTimerRef.current) {
        clearTimeout(cancelTimerRef.current);
      }
      if (activePlaybackRef.current) {
        activePlaybackRef.current.cleanup();
        activePlaybackRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(async (text: string) => {
    const { label } = resolveLocale(language);
    const cleanText = text.replace(/[*#_`]/g, '');

    setIsLoading(true);
    setProgress(10);
    setErrorMessage(null);
    setNeedsGesture(false);

    // Try Piper first (natural accent, hosted models cached locally)
    try {
      setProgress(20);
      const ready = await initPiperTTS(label, pct => setProgress(Math.max(20, Math.min(40, pct))));
      if (ready) {
        const playback = await generatePiperAudio(cleanText, label, pct => setProgress(Math.max(40, Math.min(85, pct))));
        if (playback) {
          activePlaybackRef.current = playback;
          setActiveProvider('piper');
          setIsSpeaking(true);
          setIsLoading(false);
          setProgress(95);

          playback.audio.addEventListener('ended', () => {
            setIsSpeaking(false);
            setProgress(null);
            activePlaybackRef.current = null;
          }, { once: true });
          return;
        }
      }
    } catch (error) {
      console.error('Piper TTS error:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setNeedsGesture(true);
      }
      setErrorMessage(String(error));
      setActiveProvider('web-speech');
    }

    // Fallback to Web Speech API
    try {
      setActiveProvider('web-speech');
      setProgress(70);
      await playPronunciation(cleanText, label);
      setIsSpeaking(true);
      setIsLoading(false);
      setProgress(95);

      const estimatedDuration = Math.max(2000, cleanText.length * 45);
      cancelTimerRef.current = setTimeout(() => {
        setIsSpeaking(false);
        setProgress(null);
      }, estimatedDuration);
    } catch (fallbackError) {
      console.error('Web Speech TTS error:', fallbackError);
      setIsLoading(false);
      setProgress(null);
      setErrorMessage(String(fallbackError));
    }
  }, [language]);

  const cancel = useCallback(() => {
    if (cancelTimerRef.current) {
      clearTimeout(cancelTimerRef.current);
      cancelTimerRef.current = null;
    }
    if (activePlaybackRef.current) {
      activePlaybackRef.current.cleanup();
      activePlaybackRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setProgress(null);
    setErrorMessage(null);
    setNeedsGesture(false);
  }, []);

  const switchProvider = useCallback((provider: 'piper' | 'web-speech' | 'google-cloud') => {
    if (provider === 'web-speech') {
      setActiveProvider('web-speech');
    } else {
      setActiveProvider('piper');
    }
  }, []);

  return {
    speak,
    cancel,
    isSpeaking,
    isLoading,
    progress,
    errorMessage,
    needsGesture,
    setNeedsGesture,
    googleCloudAvailable: false, // Legacy prop kept for compatibility
    activeProvider,
    availableProviders: ['piper', 'web-speech'] as const,
    switchProvider
  };
};

export default useTTSEnhanced;
