import { useState, useEffect, useCallback, useRef } from 'react';
import { generateCoquiAudio, onProgress, onError } from '../services/coquiTTS';

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsGesture, setNeedsGesture] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speakingRef = useRef(false);

  const speak = useCallback(async (text: string, options?: { speakerIndex?: number }) => {
    // Strip markdown symbols for better reading
    const cleanText = text.replace(/[*#_`]/g, '');

    // Use Transformers.js TTS (High Quality, Free, Runs in Browser)
    setIsLoading(true);
    setProgress(null);
    setErrorMessage(null);
    setNeedsGesture(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const url = await generateCoquiAudio(cleanText, options);
      setIsLoading(false);

      if (url) {
        const audio = new Audio(url);
        audioRef.current = audio;
        // Ensure we clean up the object URL to avoid memory leaks
        const cleanup = () => {
          try {
            if (audioRef.current && audioRef.current.src.startsWith('blob:')) {
              URL.revokeObjectURL(audioRef.current.src);
            }
          } catch (e) {
            // ignore revoke errors
          }
          setIsSpeaking(false);
          audioRef.current = null;
        };

        audio.onended = cleanup;
        audio.onerror = () => {
          console.error('Audio playback error');
          cleanup();
        };
        
        setIsSpeaking(true);
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch((err: any) => {
            console.warn('Autoplay blocked, user gesture required', err);
            setNeedsGesture(true);
            setIsSpeaking(false);
          });
        }
        console.log('Using Transformers.js TTS');
      } else {
        console.error('Failed to generate audio with Transformers.js');
        setErrorMessage('Failed to generate voice. Please check your connection and try again.');
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsLoading(false);
      setErrorMessage(String(error));
    }
  }, []); 

  const cancel = useCallback(() => {
    speakingRef.current = false;

    // Stop audio
    if (audioRef.current) {
      try {
        if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(audioRef.current.src);
        }
      } catch (e) {
        // ignore revoke errors
      }
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setIsSpeaking(false);
    setProgress(null);
    setErrorMessage(null);
    setNeedsGesture(false);
  }, []);

  useEffect(() => {
    const sub = onProgress((p) => {
      setProgress(p.progress ?? null);
    });
    const unsubErr = onError((err) => {
      setErrorMessage(err);
      setIsLoading(false);
      setIsSpeaking(false);
      setProgress(null);
    });
    return () => {
      if (typeof sub === 'function') sub();
      if (typeof unsubErr === 'function') unsubErr();
    };
  }, []);

  return { speak, cancel, isSpeaking, isLoading, progress, errorMessage, needsGesture, setNeedsGesture };
};
