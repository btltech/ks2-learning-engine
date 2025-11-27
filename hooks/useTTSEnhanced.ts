import { useState, useCallback, useEffect } from 'react';
import { speakWithGoogleCloud, initializeGoogleCloudTTS } from '../services/googleCloudTTS';

type TTSProvider = 'google-cloud';

interface UseTTSEnhancedOptions {
  googleCloudApiKey?: string;
}

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

interface SpeakOptions {
  gender?: 'MALE' | 'FEMALE';
  speakingRate?: number;
  pitch?: number;
  volume?: number;
}

/**
 * Google Cloud TTS Only Hook - No fallbacks
 */
export const useTTSEnhanced = (
  language?: string,
  options?: UseTTSEnhancedOptions
) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [googleCloudAvailable, setGoogleCloudAvailable] = useState(false);

  // Initialize Google Cloud TTS if API key provided
  useEffect(() => {
    if (options?.googleCloudApiKey) {
      try {
        initializeGoogleCloudTTS(options.googleCloudApiKey);
        setGoogleCloudAvailable(true);
      } catch (error) {
        console.error('Failed to initialize Google Cloud TTS:', error);
        setGoogleCloudAvailable(false);
        setErrorMessage('Google Cloud TTS initialization failed. Check your API key.');
      }
    } else {
      setGoogleCloudAvailable(false);
      setErrorMessage('Google Cloud API key not provided');
    }
  }, [options?.googleCloudApiKey]);

  const speak = useCallback(
    async (text: string, speakOptions?: SpeakOptions) => {
      if (!googleCloudAvailable) {
        setErrorMessage('Google Cloud TTS not available. Please check your API key.');
        return;
      }

      const { label } = resolveLocale(language);
      const cleanText = text.replace(/[*#_`]/g, '');

      setIsLoading(true);
      setProgress(10);
      setErrorMessage(null);
      setNeedsGesture(false);

      try {
        // Use ONLY Google Cloud TTS - no fallbacks
        setProgress(30);

        const success = await speakWithGoogleCloud(cleanText, label, {
          gender: speakOptions?.gender || 'FEMALE',
          speakingRate: speakOptions?.speakingRate || 0.95,
          pitch: speakOptions?.pitch || 0
        });

        if (success) {
          setIsSpeaking(true);
          setProgress(90);
          setIsLoading(false);

          const estimatedDuration = Math.max(2000, cleanText.length * 50);
          setTimeout(() => {
            setIsSpeaking(false);
            setProgress(null);
          }, estimatedDuration);
        } else {
          setIsLoading(false);
          setErrorMessage('Failed to generate Google Cloud audio. Check your internet connection and API key.');
        }
      } catch (error) {
        console.error('Google Cloud TTS error:', error);
        setIsLoading(false);
        setProgress(null);
        setErrorMessage(`TTS Error: ${String(error)}`);
      }
    },
    [language, googleCloudAvailable]
  );

  const cancel = useCallback(() => {
    // Cancel any ongoing audio playback
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
    setNeedsGesture,
    googleCloudAvailable,
    availableProviders: ['google-cloud'] as TTSProvider[]
  };
};

// Keep the original useTTS hook for backward compatibility - but force Google Cloud
export const useTTS = (language?: string) => {
  const apiKey = (import.meta as unknown as { env: { VITE_GOOGLE_CLOUD_TTS_API_KEY?: string } }).env?.VITE_GOOGLE_CLOUD_TTS_API_KEY;
  return useTTSEnhanced(language, { googleCloudApiKey: apiKey });
};

export default useTTSEnhanced;
