// Optimized Web Speech API for natural-sounding TTS (completely free, no external APIs)
// Uses advanced voice selection and natural speech parameters

const languageToBCP47Full: Record<string, string> = {
  French: 'fr-FR',
  Spanish: 'es-ES',
  German: 'de-DE',
  Japanese: 'ja-JP',
  Mandarin: 'zh-CN',
  Romanian: 'ro-RO',
  Yoruba: 'en-GB', // fallback for browser TTS
};

const getVoicesSafe = (): SpeechSynthesisVoice[] => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
};

export const pickVoice = (bcp47: string): SpeechSynthesisVoice | null => {
  const voices = getVoicesSafe();
  if (!voices.length) return null;

  // Prefer exact language match first
  let candidates = voices.filter(v => v.lang === bcp47);
  if (!candidates.length) {
    // Then any voice that starts with the same language code (e.g. fr-*, es-*)
    const base = bcp47.split('-')[0];
    candidates = voices.filter(v => v.lang.startsWith(base));
  }

  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    const name = (v.name || '').toLowerCase();
    let score = 0;

    // TIER 1: REMOTE/NEURAL VOICES (Best quality, absolutely not robotic)
    if (v.localService === false) score += 25; // Remote voices = professional quality
    
    // TIER 1: Neural/Natural designations
    if (name.includes('neural') || name.includes('natural')) score += 24;
    if (name.includes('enhanced')) score += 22;
    
    // TIER 2: Premium named voices known to be excellent across browsers
    // macOS: Victoria, Samantha, Karen, Moira, Fiona
    if (name.includes('victoria')) score += 20;
    if (name.includes('samantha') && !name.includes('compact')) score += 20;
    if (name.includes('karen')) score += 19;
    if (name.includes('moira')) score += 18;
    if (name.includes('fiona')) score += 17;
    
    // iOS: High-quality voices
    if (name.includes('siri') && !name.includes('compact')) score += 19;
    
    // Google Cloud / Android voices (very natural)
    if (name.includes('google')) score += 21;
    if (name.includes('wavenet')) score += 22;
    
    // Microsoft high-quality voices
    if (name.includes('mark') || name.includes('zira') || name.includes('david')) score += 18;
    if (name.includes('eva') || name.includes('guy')) score += 17;
    
    // Amazon Polly voices (if available)
    if (name.includes('polly') || name.includes('joanna') || name.includes('ivy')) score += 20;
    
    // Avoid robotic/low-quality voices AGGRESSIVELY
    if (name.includes('compact') || name.includes('samantha-compact')) score -= 50; // Completely avoid
    if (name.includes('fast') || name.includes('fast-speech')) score -= 30;
    if (name.includes('default')) score -= 25;
    if (name.includes('system') && !name.includes('system premium')) score -= 20;
    if (name.includes('voice 1') || name.includes('voice 2')) score -= 15; // Generic system voices
    if (name.includes('banish') || name.includes('disable') || name.includes('no-name')) score -= 40;
    
    // Slightly prefer non-default voices
    if (!v.default) score += 2;
    
    return score;
  };

  if (candidates.length) {
    const sorted = candidates.sort((a, b) => scoreVoice(b) - scoreVoice(a));
    console.log(`Top voice for ${bcp47}: ${sorted[0].name} (score: ${scoreVoice(sorted[0])})`);
    return sorted[0];
  }

  // Fallback to a clear English voice if nothing matches
  const englishVoices = voices.filter(v => v.lang.startsWith('en-'));
  if (englishVoices.length) {
    return englishVoices.sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
  }

  return voices[0];
};



export const playPronunciation = async (text: string, languageLabel: string) => {
  // Uses Web Speech API with OPTIMIZED parameters for NATURAL (not robotic) sound
  // Completely free, instant, uses system voices
  const browserLangCode = languageToBCP47Full[languageLabel] || 'en-GB';

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = browserLangCode;
    
    // ENHANCED SETTINGS FOR ULTRA-NATURAL SOUNDING SPEECH
    // These parameters work across Chrome, Safari, Brave, and Firefox
    utterance.rate = 0.85;        // 0.85 = slower, more deliberate and natural
    utterance.pitch = 1.08;       // Slightly warmer tone (less robotic)
    utterance.volume = 1.0;       // Full volume for clarity
    
    // Set voice BEFORE speaking (important for Safari)
    const voice = pickVoice(browserLangCode);
    if (voice) {
      utterance.voice = voice;
      console.log(`🎤 Voice: ${voice.name} | Remote: ${!voice.localService} | Lang: ${voice.lang}`);
    }
    
    utterance.onstart = () => {
      console.log(`🔊 Speaking in ${languageLabel}...`);
    };

    utterance.onend = () => {
      console.log(`✓ Speech complete`);
    };

    // Cancel any ongoing speech and start new
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Wait for voices to load if not ready (critical for Safari/Brave)
  if (!getVoicesSafe().length && typeof window !== 'undefined') {
    const handler = () => {
      speak();
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    window.speechSynthesis.getVoices(); // Trigger voice loading
  } else {
    speak();
  }
};
