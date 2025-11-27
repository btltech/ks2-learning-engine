import { useCallback, useEffect, useState } from 'react';
import {
  playCorrectSound,
  playIncorrectSound,
  playSuccessSound,
  playClickSound,
  playCoinSound,
  playLevelUpSound,
  playStreakSound,
  playNotificationSound,
  playTickSound,
  playWarningSound,
  playSparkle,
  initAudio,
  setMasterVolume,
} from '../services/audioSynthesizer';

/**
 * Custom hook for game sounds using Web Audio API synthesis
 * No external sound files needed - instant, lightweight, customizable
 */
export const useGameSounds = () => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('ks2_sound_enabled');
    return saved !== 'false'; // Default to enabled
  });
  
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('ks2_sound_volume');
    return saved ? parseFloat(saved) : 0.5;
  });

  // Initialize audio context on mount
  useEffect(() => {
    // Init on first user interaction
    const handleInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
    
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Sync volume with synthesizer
  useEffect(() => {
    setMasterVolume(soundEnabled ? volume : 0);
    localStorage.setItem('ks2_sound_enabled', String(soundEnabled));
    localStorage.setItem('ks2_sound_volume', String(volume));
  }, [soundEnabled, volume]);

  // Core game sounds
  const playCorrect = useCallback(() => {
    if (soundEnabled) playCorrectSound();
  }, [soundEnabled]);

  const playIncorrect = useCallback(() => {
    if (soundEnabled) playIncorrectSound();
  }, [soundEnabled]);

  const playSuccess = useCallback(() => {
    if (soundEnabled) playSuccessSound();
  }, [soundEnabled]);

  const playClick = useCallback(() => {
    if (soundEnabled) playClickSound();
  }, [soundEnabled]);

  // Extended sounds for enhanced UX
  const playCoin = useCallback(() => {
    if (soundEnabled) playCoinSound();
  }, [soundEnabled]);

  const playLevelUp = useCallback(() => {
    if (soundEnabled) playLevelUpSound();
  }, [soundEnabled]);

  const playStreak = useCallback(() => {
    if (soundEnabled) playStreakSound();
  }, [soundEnabled]);

  const playNotification = useCallback(() => {
    if (soundEnabled) playNotificationSound();
  }, [soundEnabled]);

  const playTick = useCallback(() => {
    if (soundEnabled) playTickSound();
  }, [soundEnabled]);

  const playWarning = useCallback(() => {
    if (soundEnabled) playWarningSound();
  }, [soundEnabled]);

  const playSparkleEffect = useCallback(() => {
    if (soundEnabled) playSparkle();
  }, [soundEnabled]);

  // Settings controls
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  const updateVolume = useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolume(clamped);
    setMasterVolume(clamped);
  }, []);

  return {
    // Core sounds (backwards compatible)
    playCorrect,
    playIncorrect,
    playSuccess,
    playClick,
    
    // Extended sounds
    playCoin,
    playLevelUp,
    playStreak,
    playNotification,
    playTick,
    playWarning,
    playSparkle: playSparkleEffect,
    
    // Settings
    soundEnabled,
    volume,
    toggleSound,
    setVolume: updateVolume,
  };
};
