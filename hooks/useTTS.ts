import { useState, useEffect, useCallback, useRef } from 'react';
import { generatePiperAudio, initPiperTTS } from '../services/piperTTS';

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsGesture, setNeedsGesture] = useState(false);

  const speak = useCallback(async (text: string) => {
    // Strip markdown symbols for better reading
    const cleanText = text.replace(/[*#_`]/g, '');

    // Use optimized Web Speech API TTS (FREE, NATURAL, INSTANT)
    setIsLoading(true);
    setProgress(10);
    setErrorMessage(null);
    setNeedsGesture(false);

    try {
      // Initialize TTS service
      const initialized = await initPiperTTS();
      if (!initialized) {
        setErrorMessage('TTS not available');
        setIsLoading(false);
        return;
      }

      setProgress(30);

      // Generate audio with fallback Web Speech API
      const result = await generatePiperAudio(cleanText);
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
  }, []);

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
