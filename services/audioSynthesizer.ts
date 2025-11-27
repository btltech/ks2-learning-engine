/**
 * Audio Synthesizer Service
 * Generates high-quality game sounds using Web Audio API
 * No external files needed - smaller bundle, instant playback
 */

// Singleton AudioContext (created on first user interaction)
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

// Master volume control
let masterVolume = 0.5;

export const setMasterVolume = (volume: number) => {
  masterVolume = Math.max(0, Math.min(1, volume));
};

export const getMasterVolume = () => masterVolume;

/**
 * Play a pleasant "correct answer" sound
 * Rising major chord arpeggio - cheerful and rewarding
 */
export const playCorrectSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Create master gain
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = masterVolume * 0.4;

  // Rising arpeggio: C5 -> E5 -> G5 (C major chord)
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const startTime = now + i * 0.08;
    const duration = 0.25;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.8, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  });

  // Add a subtle sparkle/shimmer
  const sparkle = ctx.createOscillator();
  const sparkleGain = ctx.createGain();
  sparkle.connect(sparkleGain);
  sparkleGain.connect(masterGain);
  
  sparkle.type = 'sine';
  sparkle.frequency.value = 1568; // G6 - high sparkle
  sparkleGain.gain.setValueAtTime(0, now + 0.2);
  sparkleGain.gain.linearRampToValueAtTime(0.3, now + 0.22);
  sparkleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  
  sparkle.start(now + 0.2);
  sparkle.stop(now + 0.6);
};

/**
 * Play an "incorrect answer" sound
 * Gentle descending tone - not harsh or punishing
 */
export const playIncorrectSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = masterVolume * 0.3;

  // Soft descending minor second - gentle "oops"
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();
  
  osc1.connect(gain1);
  osc2.connect(gain2);
  gain1.connect(masterGain);
  gain2.connect(masterGain);
  
  // Soft triangle waves for gentler sound
  osc1.type = 'triangle';
  osc2.type = 'triangle';
  
  // E4 -> Eb4 (gentle descending semitone)
  osc1.frequency.value = 329.63; // E4
  osc2.frequency.value = 311.13; // Eb4
  
  // First note
  gain1.gain.setValueAtTime(0, now);
  gain1.gain.linearRampToValueAtTime(0.6, now + 0.02);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  
  // Second note (slightly delayed)
  gain2.gain.setValueAtTime(0, now + 0.12);
  gain2.gain.linearRampToValueAtTime(0.5, now + 0.14);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
  
  osc1.start(now);
  osc1.stop(now + 0.3);
  osc2.start(now + 0.12);
  osc2.stop(now + 0.45);
};

/**
 * Play a "success/celebration" sound
 * Triumphant fanfare - for completing quizzes, achievements
 */
export const playSuccessSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = masterVolume * 0.35;

  // Triumphant fanfare: C4 -> E4 -> G4 -> C5 (ascending C major)
  const notes = [
    { freq: 261.63, time: 0, duration: 0.15 },     // C4
    { freq: 329.63, time: 0.12, duration: 0.15 },  // E4
    { freq: 392.00, time: 0.24, duration: 0.15 },  // G4
    { freq: 523.25, time: 0.36, duration: 0.4 },   // C5 (held longer)
  ];

  notes.forEach(({ freq, time, duration }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    // Mix of sine and triangle for richer tone
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const startTime = now + time;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.7, startTime + 0.015);
    gain.gain.setValueAtTime(0.7, startTime + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  });

  // Add harmonic overtone on final note for richness
  const overtone = ctx.createOscillator();
  const overtoneGain = ctx.createGain();
  overtone.connect(overtoneGain);
  overtoneGain.connect(masterGain);
  
  overtone.type = 'sine';
  overtone.frequency.value = 1046.5; // C6 (octave above final note)
  
  overtoneGain.gain.setValueAtTime(0, now + 0.36);
  overtoneGain.gain.linearRampToValueAtTime(0.25, now + 0.38);
  overtoneGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
  
  overtone.start(now + 0.36);
  overtone.stop(now + 0.9);

  // Sparkle effect
  playSparkle(now + 0.5, 0.15);
};

/**
 * Play a UI click sound
 * Short, subtle pop - for buttons, selections
 */
export const playClickSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = masterVolume * 0.2;

  // Short percussive click using noise + filter
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  
  osc.type = 'sine';
  osc.frequency.value = 800;
  
  filter.type = 'bandpass';
  filter.frequency.value = 1000;
  filter.Q.value = 1;
  
  gain.gain.setValueAtTime(0.8, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
  
  osc.start(now);
  osc.stop(now + 0.06);
};

/**
 * Play a sparkle/shimmer effect
 * Used for achievements, special moments
 */
export const playSparkle = (startTime?: number, volume: number = 0.25) => {
  const ctx = getAudioContext();
  const now = startTime ?? ctx.currentTime;
  
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = masterVolume * volume;

  // Multiple high-frequency tones for sparkle effect
  const sparkleFreqs = [2093, 2637, 3136, 2349]; // C7, E7, G7, D7
  
  sparkleFreqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const delay = i * 0.04;
    
    gain.gain.setValueAtTime(0, now + delay);
    gain.gain.linearRampToValueAtTime(0.4, now + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.15);
    
    osc.start(now + delay);
    osc.stop(now + delay + 0.2);
  });
};

/**
 * Play a coin/reward collection sound
 * Classic arcade-style coin pickup
 */
export const playCoinSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = masterVolume * 0.3;

  // Quick ascending pitch bend - classic coin sound
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(masterGain);
  
  osc.type = 'square'; // Classic 8-bit feel
  osc.frequency.setValueAtTime(987.77, now); // B5
  osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6
  
  gain.gain.setValueAtTime(0.5, now);
  gain.gain.setValueAtTime(0.5, now + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  
  osc.start(now);
  osc.stop(now + 0.2);
};

/**
 * Play a level-up/achievement unlocked sound
 * Majestic ascending scale with harmonics
 */
export const playLevelUpSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = masterVolume * 0.35;

  // Ascending scale: C4 -> D4 -> E4 -> F4 -> G4 -> A4 -> B4 -> C5
  const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const startTime = now + i * 0.07;
    const duration = 0.12;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.5, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  });

  // Final chord (C major)
  const chordNotes = [523.25, 659.25, 783.99]; // C5, E5, G5
  chordNotes.forEach((freq, _i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const startTime = now + 0.56;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6);
    
    osc.start(startTime);
    osc.stop(startTime + 0.7);
  });

  // Sparkle finale
  playSparkle(now + 0.7, 0.2);
};

/**
 * Play a streak milestone sound
 * Exciting ascending arpeggios
 */
export const playStreakSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = masterVolume * 0.3;

  // Double arpeggio - exciting!
  const arpeggio1 = [392, 493.88, 587.33, 783.99]; // G4, B4, D5, G5
  const arpeggio2 = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  
  // First arpeggio
  arpeggio1.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const startTime = now + i * 0.06;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.5, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
    
    osc.start(startTime);
    osc.stop(startTime + 0.2);
  });

  // Second arpeggio (slightly delayed)
  arpeggio2.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const startTime = now + 0.25 + i * 0.06;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.6, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
    
    osc.start(startTime);
    osc.stop(startTime + 0.25);
  });
};

/**
 * Play a notification/alert sound
 * Gentle chime to get attention
 */
export const playNotificationSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = masterVolume * 0.25;

  // Two-note chime: G5 -> C6
  const notes = [783.99, 1046.5];
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const startTime = now + i * 0.15;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.6, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
    
    osc.start(startTime);
    osc.stop(startTime + 0.35);
  });
};

/**
 * Play a countdown tick sound
 * For timed quizzes
 */
export const playTickSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = masterVolume * 0.15;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(masterGain);
  
  osc.type = 'sine';
  osc.frequency.value = 1000;
  
  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
  
  osc.start(now);
  osc.stop(now + 0.04);
};

/**
 * Play a warning sound (time running out)
 */
export const playWarningSound = () => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.value = masterVolume * 0.25;

  // Two quick descending notes
  [880, 659.25].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.type = 'triangle';
    osc.frequency.value = freq;
    
    const startTime = now + i * 0.12;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.7, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
    
    osc.start(startTime);
    osc.stop(startTime + 0.15);
  });
};

/**
 * Initialize audio context on user interaction
 * Call this on first user click/tap to enable audio
 */
export const initAudio = () => {
  getAudioContext();
};
