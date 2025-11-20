// Simple KS2-friendly text-to-speech helper using the Web Speech API

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

    // Penalize "compact" voices (often robotic system defaults on macOS/iOS)
    if (name.includes('compact')) score -= 5;

    // Prioritize high-quality browser voices
    if (name.includes('google')) score += 5; 
    if (name.includes('premium') || name.includes('enhanced')) score += 4;
    if (name.includes('natural') || name.includes('neural')) score += 4;
    
    // Specific high-quality macOS/iOS voices
    if (name.includes('ava') || name.includes('serena') || name.includes('tom') || name.includes('kate') || name.includes('daniel')) score += 3;

    if (!v.default) score += 1; 
    // Female voices often sound slightly softer/clearer for this age group
    if (name.includes('female') || name.includes('samantha') || name.includes('karen')) score += 2;
    
    return score;
  };

  if (candidates.length) {
    return candidates.sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
  }

  // Fallback to a clear English voice if nothing matches
  const englishVoices = voices.filter(v => v.lang.startsWith('en-'));
  if (englishVoices.length) {
    return englishVoices.sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
  }

  return voices[0];
};



export const playPronunciation = async (text: string, languageLabel: string) => {
  // For short pronunciation, we'll rely on Transformers.js in the calling component
  // This function is kept as a simple browser fallback
  const browserLangCode = languageToBCP47Full[languageLabel] || 'en-GB';

  // Fallback to Browser Speech
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = browserLangCode;
    utterance.rate = 1.0; 
    utterance.pitch = 1.0; 

    const voice = pickVoice(browserLangCode);
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  if (!getVoicesSafe().length && typeof window !== 'undefined') {
    const handler = () => {
      speak();
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    window.speechSynthesis.getVoices();
  } else {
    speak();
  }
};
