import { useState, useCallback, useEffect } from 'react';
import { playPronunciation } from '../services/ttsService';
import { speakWithGoogleCloud, initializeGoogleCloudTTS } from '../services/googleCloudTTS';

type TTSProvider = 'web-speech' | 'google-cloud';

interface UseTTSEnhancedOptions {
  provider?: TTSProvider;
  googleCloudApiKey?: string;
  preferGoogleCloud?: boolean;
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

/**
 * Enhanced TTS hook supporting both Web Speech API and Google Cloud TTS
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
  const [activeProvider, setActiveProvider] = useState<TTSProvider>(
    options?.provider || 'web-speech'
  );
  const [googleCloudAvailable, setGoogleCloudAvailable] = useState(false);

  // Initialize Google Cloud TTS if API key provided
  useEffect(() => {
    if (options?.googleCloudApiKey) {
      try {
        initializeGoogleCloudTTS(options.googleCloudApiKey);
        setGoogleCloudAvailable(true);

        // Switch to Google Cloud if preferred and available
        if (options.preferGoogleCloud) {
          setActiveProvider('google-cloud');
        }
      } catch (error) {
        console.error('Failed to initialize Google Cloud TTS:', error);
        setGoogleCloudAvailable(false);
      }
    }
  }, [options?.googleCloudApiKey, options?.preferGoogleCloud]);

  const speak = useCallback(
    async (text: string, provider?: TTSProvider) => {
      const { label } = resolveLocale(language);
      const cleanText = text.replace(/[*#_`]/g, '');
      const effectiveProvider = provider || activeProvider;

      setIsLoading(true);
      setProgress(10);
      setErrorMessage(null);
      setNeedsGesture(false);

      try {
        if (effectiveProvider === 'google-cloud' && googleCloudAvailable) {
          // Use Google Cloud TTS
          setProgress(30);

          const success = await speakWithGoogleCloud(cleanText, label, {
            gender: 'FEMALE',
            speakingRate: 0.95,
            pitch: 0
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
            setErrorMessage('Failed to generate Google Cloud audio');

            // Fallback to Web Speech API
            if (googleCloudAvailable) {
              await playPronunciation(cleanText, label);
            }
          }
        } else {
          // Use Web Speech API (default fallback)
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
        }
      } catch (error) {
        console.error('TTS error:', error);
        setIsLoading(false);
        setProgress(null);
        setErrorMessage(String(error));
      }
    },
    [language, activeProvider, googleCloudAvailable]
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

  const switchProvider = useCallback((provider: TTSProvider) => {
    if (provider === 'google-cloud' && !googleCloudAvailable) {
      setErrorMessage('Google Cloud TTS not available');
      return;
    }
    setActiveProvider(provider);
  }, [googleCloudAvailable]);

  return {
    speak,
    cancel,
    switchProvider,
    isSpeaking,
    isLoading,
    progress,
    errorMessage,
    needsGesture,
    setNeedsGesture,
    activeProvider,
    googleCloudAvailable,
    availableProviders: ['web-speech', ...(googleCloudAvailable ? ['google-cloud'] : [])] as TTSProvider[]
  };
};

// Keep the original useTTS hook for backward compatibility
export const useTTS = (language?: string) => {
  return useTTSEnhanced(language, { provider: 'web-speech' });
};

export default useTTSEnhanced;
