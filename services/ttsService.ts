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
  English: 'en-GB',
};

const getVoicesSafe = (): SpeechSynthesisVoice[] => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
};

// Cache for best voices to avoid re-scoring each time
const voiceCache = new Map<string, SpeechSynthesisVoice>();

export const pickVoice = (bcp47: string): SpeechSynthesisVoice | null => {
  // Return cached voice if available
  if (voiceCache.has(bcp47)) {
    return voiceCache.get(bcp47)!;
  }
  
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

    // TIER 1: REMOTE/CLOUD VOICES (Best quality - NOT robotic at all)
    if (v.localService === false) score += 50; // Remote/cloud voices are premium quality
    
    // TIER 1: Neural/Natural/Enhanced voices (excellent quality)
    if (name.includes('neural')) score += 45;
    if (name.includes('natural')) score += 44;
    if (name.includes('enhanced')) score += 43;
    if (name.includes('premium')) score += 42;
    
    // TIER 2: High-quality named voices by platform
    // macOS premium voices (very natural sounding)
    if (name.includes('samantha') && !name.includes('compact')) score += 38;
    if (name.includes('victoria')) score += 37;
    if (name.includes('karen')) score += 36;
    if (name.includes('moira')) score += 35;
    if (name.includes('fiona')) score += 34;
    if (name.includes('daniel') && !name.includes('compact')) score += 33;
    if (name.includes('alex')) score += 32;
    
    // Google Cloud voices (top tier)
    if (name.includes('google') && !name.includes('espeak')) score += 40;
    if (name.includes('wavenet')) score += 45;
    if (name.includes('standard')) score += 30;
    
    // Microsoft Azure voices
    if (name.includes('aria')) score += 38;
    if (name.includes('jenny')) score += 37;
    if (name.includes('guy')) score += 36;
    if (name.includes('microsoft online')) score += 35;
    if (name.includes('microsoft')) score += 25;
    
    // iOS Siri voices (excellent on Apple devices)
    if (name.includes('siri') && !name.includes('compact')) score += 36;
    
    // Amazon Polly voices
    if (name.includes('polly')) score += 38;
    if (name.includes('joanna')) score += 36;
    if (name.includes('matthew')) score += 35;
    if (name.includes('ivy')) score += 34;
    
    // Safari/Apple TTS voices
    if (name.includes('aaron')) score += 30;
    if (name.includes('nicky')) score += 29;
    if (name.includes('tom')) score += 28;
    
    // Chrome TTS voices
    if (name.includes('uk english') && !name.includes('compact')) score += 32;
    if (name.includes('us english') && !name.includes('compact')) score += 31;
    
    // PENALTIES: Avoid robotic/low-quality voices aggressively
    if (name.includes('compact')) score -= 100; // Compact voices are VERY robotic
    if (name.includes('espeak')) score -= 90;   // eSpeak is extremely robotic
    if (name.includes('mbrola')) score -= 85;   // Old synthesizer
    if (name.includes('festival')) score -= 80; // Old synthesizer
    if (name.includes('flite')) score -= 80;    // Very robotic
    if (name.includes('pico')) score -= 75;     // Basic TTS
    if (name.includes('kal')) score -= 70;      // Very robotic
    if (name.includes('awb')) score -= 70;      // Very robotic
    if (name.includes('slt')) score -= 70;      // Very robotic
    if (name.includes('rms')) score -= 70;      // Very robotic
    if (name.includes('fast') || name.includes('fast-speech')) score -= 50;
    if (name.includes('default')) score -= 40;
    if (name.includes('system') && !name.includes('premium')) score -= 35;
    if (name.includes('voice 1') || name.includes('voice 2')) score -= 30;
    if (name.includes('test')) score -= 50;
    
    // Slight preference for non-default
    if (!v.default) score += 2;
    
    return score;
  };

  if (candidates.length) {
    const sorted = candidates.sort((a, b) => scoreVoice(b) - scoreVoice(a));
    const bestVoice = sorted[0];
    voiceCache.set(bcp47, bestVoice);
    return bestVoice;
  }

  // Fallback to best available English voice
  const englishVoices = voices.filter(v => v.lang.startsWith('en-'));
  if (englishVoices.length) {
    const sorted = englishVoices.sort((a, b) => scoreVoice(b) - scoreVoice(a));
    voiceCache.set(bcp47, sorted[0]);
    return sorted[0];
  }

  return voices[0];
};

// Clear voice cache when voices change
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    voiceCache.clear();
  });
}



export const playPronunciation = async (text: string, languageLabel: string) => {
  // Uses Web Speech API with OPTIMIZED parameters for NATURAL (not robotic) sound
  // Completely free, instant, uses system voices
  const browserLangCode = languageToBCP47Full[languageLabel] || 'en-GB';

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Pre-process text for more natural reading
  const processTextForSpeech = (input: string): string => {
    let processed = input
      // Add pauses after sentences
      .replace(/\. /g, '. ... ')
      .replace(/\? /g, '? ... ')
      .replace(/! /g, '! ... ')
      // Add slight pauses after commas
      .replace(/, /g, ', .. ')
      // Handle numbers for natural reading
      .replace(/(\d+)/g, ' $1 ')
      // Handle common abbreviations
      .replace(/e\.g\./gi, 'for example')
      .replace(/i\.e\./gi, 'that is')
      .replace(/etc\./gi, 'etcetera')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
    
    return processed;
  };

  const speak = () => {
    const processedText = processTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(processedText);
    utterance.lang = browserLangCode;
    
    // ENHANCED SETTINGS FOR ULTRA-NATURAL SOUNDING SPEECH
    // Tuned for children's educational content
    utterance.rate = 0.88;        // Slightly slower for clarity (0.88 sweet spot)
    utterance.pitch = 1.05;       // Slightly warmer, friendlier tone
    utterance.volume = 1.0;       // Full volume for clarity
    
    // Set voice BEFORE speaking (important for Safari)
    const voice = pickVoice(browserLangCode);
    if (voice) {
      utterance.voice = voice;
      
      // Adjust rate based on voice type (remote voices handle faster rates better)
      if (!voice.localService) {
        // Remote/cloud voices sound good at normal speed
        utterance.rate = 0.92;
      } else if (voice.name.toLowerCase().includes('compact')) {
        // If we somehow get a compact voice, slow it way down
        utterance.rate = 0.75;
        utterance.pitch = 1.0;
      }
    }
    
    utterance.onerror = (event) => {
      // Only log actual errors, not cancellations
      if (event.error !== 'canceled') {
        console.error('Speech error:', event.error);
      }
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
