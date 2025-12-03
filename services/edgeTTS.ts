/**
 * Edge TTS Service - Natural Sounding Free TTS
 * 
 * Uses Microsoft Edge's neural voices which are FREE and sound very natural.
 * These are the same voices used by Edge browser's "Read Aloud" feature.
 * 
 * For kids' learning apps, these voices are:
 * - Warm and friendly
 * - Clear pronunciation
 * - Good pacing for learning
 * - Support many languages
 */

// Voice options optimized for children's education
export interface EdgeVoice {
  name: string;
  shortName: string;
  locale: string;
  gender: 'Male' | 'Female';
  friendlyName: string;
  personality: 'warm' | 'energetic' | 'calm' | 'professional';
  ageGroup: 'child' | 'young-adult' | 'adult';
}

// Kid-friendly voices for each language
export const EDGE_VOICES: Record<string, EdgeVoice[]> = {
  English: [
    { 
      name: 'en-GB-SoniaNeural', 
      shortName: 'Sonia', 
      locale: 'en-GB', 
      gender: 'Female',
      friendlyName: 'Sonia (British - Friendly)',
      personality: 'warm',
      ageGroup: 'young-adult'
    },
    { 
      name: 'en-GB-RyanNeural', 
      shortName: 'Ryan', 
      locale: 'en-GB', 
      gender: 'Male',
      friendlyName: 'Ryan (British - Encouraging)',
      personality: 'energetic',
      ageGroup: 'young-adult'
    },
    { 
      name: 'en-US-AriaNeural', 
      shortName: 'Aria', 
      locale: 'en-US', 
      gender: 'Female',
      friendlyName: 'Aria (American - Cheerful)',
      personality: 'energetic',
      ageGroup: 'young-adult'
    },
    {
      name: 'en-US-AnaNeural',
      shortName: 'Ana',
      locale: 'en-US',
      gender: 'Female',
      friendlyName: 'Ana (Kid Voice)',
      personality: 'warm',
      ageGroup: 'child'
    }
  ],
  French: [
    { 
      name: 'fr-FR-DeniseNeural', 
      shortName: 'Denise', 
      locale: 'fr-FR', 
      gender: 'Female',
      friendlyName: 'Denise (French - Warm)',
      personality: 'warm',
      ageGroup: 'young-adult'
    },
    { 
      name: 'fr-FR-HenriNeural', 
      shortName: 'Henri', 
      locale: 'fr-FR', 
      gender: 'Male',
      friendlyName: 'Henri (French - Friendly)',
      personality: 'warm',
      ageGroup: 'adult'
    }
  ],
  Spanish: [
    { 
      name: 'es-ES-ElviraNeural', 
      shortName: 'Elvira', 
      locale: 'es-ES', 
      gender: 'Female',
      friendlyName: 'Elvira (Spanish - Cheerful)',
      personality: 'energetic',
      ageGroup: 'young-adult'
    },
    { 
      name: 'es-MX-DaliaNeural', 
      shortName: 'Dalia', 
      locale: 'es-MX', 
      gender: 'Female',
      friendlyName: 'Dalia (Mexican - Warm)',
      personality: 'warm',
      ageGroup: 'young-adult'
    }
  ],
  German: [
    { 
      name: 'de-DE-KatjaNeural', 
      shortName: 'Katja', 
      locale: 'de-DE', 
      gender: 'Female',
      friendlyName: 'Katja (German - Friendly)',
      personality: 'warm',
      ageGroup: 'young-adult'
    },
    { 
      name: 'de-DE-ConradNeural', 
      shortName: 'Conrad', 
      locale: 'de-DE', 
      gender: 'Male',
      friendlyName: 'Conrad (German - Clear)',
      personality: 'calm',
      ageGroup: 'adult'
    }
  ],
  Japanese: [
    { 
      name: 'ja-JP-NanamiNeural', 
      shortName: 'Nanami', 
      locale: 'ja-JP', 
      gender: 'Female',
      friendlyName: 'Nanami (Japanese - Gentle)',
      personality: 'calm',
      ageGroup: 'young-adult'
    }
  ],
  Mandarin: [
    { 
      name: 'zh-CN-XiaoxiaoNeural', 
      shortName: 'Xiaoxiao', 
      locale: 'zh-CN', 
      gender: 'Female',
      friendlyName: 'Xiaoxiao (Chinese - Cheerful)',
      personality: 'energetic',
      ageGroup: 'young-adult'
    }
  ],
  Italian: [
    { 
      name: 'it-IT-ElsaNeural', 
      shortName: 'Elsa', 
      locale: 'it-IT', 
      gender: 'Female',
      friendlyName: 'Elsa (Italian - Warm)',
      personality: 'warm',
      ageGroup: 'young-adult'
    }
  ],
  Portuguese: [
    { 
      name: 'pt-BR-FranciscaNeural', 
      shortName: 'Francisca', 
      locale: 'pt-BR', 
      gender: 'Female',
      friendlyName: 'Francisca (Brazilian - Friendly)',
      personality: 'energetic',
      ageGroup: 'young-adult'
    }
  ],
  Russian: [
    { 
      name: 'ru-RU-SvetlanaNeural', 
      shortName: 'Svetlana', 
      locale: 'ru-RU', 
      gender: 'Female',
      friendlyName: 'Svetlana (Russian - Clear)',
      personality: 'calm',
      ageGroup: 'adult'
    }
  ],
  Korean: [
    { 
      name: 'ko-KR-SunHiNeural', 
      shortName: 'SunHi', 
      locale: 'ko-KR', 
      gender: 'Female',
      friendlyName: 'SunHi (Korean - Cheerful)',
      personality: 'energetic',
      ageGroup: 'young-adult'
    }
  ],
  Hindi: [
    { 
      name: 'hi-IN-SwaraNeural', 
      shortName: 'Swara', 
      locale: 'hi-IN', 
      gender: 'Female',
      friendlyName: 'Swara (Hindi - Warm)',
      personality: 'warm',
      ageGroup: 'young-adult'
    }
  ],
  Arabic: [
    { 
      name: 'ar-SA-ZariyahNeural', 
      shortName: 'Zariyah', 
      locale: 'ar-SA', 
      gender: 'Female',
      friendlyName: 'Zariyah (Arabic - Gentle)',
      personality: 'calm',
      ageGroup: 'adult'
    }
  ],
  Turkish: [
    { 
      name: 'tr-TR-EmelNeural', 
      shortName: 'Emel', 
      locale: 'tr-TR', 
      gender: 'Female',
      friendlyName: 'Emel (Turkish - Friendly)',
      personality: 'warm',
      ageGroup: 'young-adult'
    }
  ],
  Greek: [
    { 
      name: 'el-GR-AthinaNeural', 
      shortName: 'Athina', 
      locale: 'el-GR', 
      gender: 'Female',
      friendlyName: 'Athina (Greek - Clear)',
      personality: 'calm',
      ageGroup: 'adult'
    }
  ],
  Romanian: [
    { 
      name: 'ro-RO-AlinaNeural', 
      shortName: 'Alina', 
      locale: 'ro-RO', 
      gender: 'Female',
      friendlyName: 'Alina (Romanian - Warm)',
      personality: 'warm',
      ageGroup: 'young-adult'
    }
  ],
  // For Yoruba and Latin, fall back to English with appropriate accent
  Yoruba: [
    { 
      name: 'en-NG-EzinneNeural', 
      shortName: 'Ezinne', 
      locale: 'en-NG', 
      gender: 'Female',
      friendlyName: 'Ezinne (Nigerian English)',
      personality: 'warm',
      ageGroup: 'young-adult'
    }
  ],
  Latin: [
    { 
      name: 'en-GB-SoniaNeural', 
      shortName: 'Sonia', 
      locale: 'en-GB', 
      gender: 'Female',
      friendlyName: 'Sonia (British - For Latin)',
      personality: 'calm',
      ageGroup: 'adult'
    }
  ]
};

// Speech styles for different contexts
type SpeechStyle = 'cheerful' | 'friendly' | 'excited' | 'encouraging' | 'calm' | 'storytelling';

interface SpeakOptions {
  language: string;
  style?: SpeechStyle;
  voiceGender?: 'Male' | 'Female';
  speed?: number; // 0.5 to 2.0, default 1.0
  pitch?: number; // -50 to +50, default 0
  useKidVoice?: boolean;
}

// Add natural expression markers for different contexts
const addExpressionMarkers = (text: string, style: SpeechStyle): string => {
  switch (style) {
    case 'cheerful':
    case 'excited':
      // Add enthusiasm to questions and exclamations
      return text
        .replace(/\!/g, '! ')
        .replace(/\?/g, '? ')
        .replace(/\.\s+/g, '. ');
    
    case 'encouraging':
      // Add warmth with slight pauses for emphasis
      return text
        .replace(/great|excellent|wonderful|amazing|fantastic|brilliant|well done|good job/gi, 
          match => `${match}!`);
    
    case 'storytelling':
      // Add dramatic pauses
      return text.replace(/\.\s+/g, '... ');
    
    case 'calm':
    case 'friendly':
    default:
      return text;
  }
};

// Optimized speaking rate for learning contexts
const getOptimalRate = (text: string, baseRate: number = 1.0): number => {
  // Slower for longer texts, numbers, or complex content
  const wordCount = text.split(/\s+/).length;
  const hasNumbers = /\d/.test(text);
  const hasComplexTerms = /[a-z]{10,}/i.test(text);
  
  let rate = baseRate;
  
  if (wordCount > 50) rate -= 0.05;
  if (hasNumbers) rate -= 0.05;
  if (hasComplexTerms) rate -= 0.05;
  
  // Keep within valid range
  return Math.max(0.7, Math.min(1.3, rate));
};

// Cache for audio to avoid re-synthesizing
const audioCache = new Map<string, AudioBuffer>();

/**
 * Main speak function using Web Speech API with enhanced settings
 * This is the fallback that works everywhere
 */
export const speakWithEnhancedWebSpeech = async (
  text: string,
  options: SpeakOptions
): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      resolve(false);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Get voices
    const voices = window.speechSynthesis.getVoices();
    
    // Find the best voice for the language
    const voiceConfig = EDGE_VOICES[options.language];
    const preferredVoice = voiceConfig?.find(v => 
      options.useKidVoice ? v.ageGroup === 'child' : v.gender === (options.voiceGender || 'Female')
    ) || voiceConfig?.[0];

    // Find matching browser voice
    let selectedVoice: SpeechSynthesisVoice | null = null;
    if (preferredVoice) {
      // Try to find exact match
      selectedVoice = voices.find(v => 
        v.name.toLowerCase().includes(preferredVoice.shortName.toLowerCase()) ||
        v.name.includes(preferredVoice.name.split('-')[0])
      ) || null;
    }

    // Fallback to any voice for the locale
    if (!selectedVoice) {
      const locale = preferredVoice?.locale || 'en-GB';
      selectedVoice = voices.find(v => v.lang.startsWith(locale.split('-')[0])) || voices[0];
    }

    // Prepare text with expression markers
    const processedText = addExpressionMarkers(text, options.style || 'friendly');

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(processedText);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }

    // Set rate based on content
    const baseRate = options.speed || 0.95;
    utterance.rate = getOptimalRate(text, baseRate);
    
    // Pitch adjustment
    utterance.pitch = options.pitch !== undefined 
      ? 1 + (options.pitch / 100) 
      : 1.02; // Slightly higher for warmth
    
    utterance.volume = 1.0;

    utterance.onend = () => resolve(true);
    utterance.onerror = (event) => {
      if (event.error !== 'canceled') {
        console.error('Speech error:', event.error);
      }
      resolve(false);
    };

    // Speak!
    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Main function to speak text naturally for students
 */
export const speakForStudent = async (
  text: string,
  language: string = 'English',
  context: 'lesson' | 'quiz' | 'feedback' | 'celebration' | 'story' = 'lesson'
): Promise<boolean> => {
  // Determine style based on context
  const styleMap: Record<string, SpeechStyle> = {
    lesson: 'friendly',
    quiz: 'encouraging',
    feedback: 'cheerful',
    celebration: 'excited',
    story: 'storytelling'
  };

  const style = styleMap[context] || 'friendly';
  
  // For celebrations and positive feedback, be more energetic
  const speed = context === 'celebration' ? 1.05 : 0.95;

  return speakWithEnhancedWebSpeech(text, {
    language,
    style,
    speed,
    voiceGender: 'Female' // Default to female voice as more soothing for children
  });
};

/**
 * Speak with MiRa's personality (warm, encouraging, slightly playful)
 */
export const speakAsMiRa = async (
  text: string,
  language: string = 'English'
): Promise<boolean> => {
  // MiRa should sound warm, friendly, and encouraging
  return speakWithEnhancedWebSpeech(text, {
    language,
    style: 'cheerful',
    speed: 0.95,
    pitch: 5, // Slightly higher pitch for friendliness
    voiceGender: 'Female'
  });
};

/**
 * Read pronunciation slowly and clearly for language learning
 */
export const speakPronunciation = async (
  text: string,
  language: string
): Promise<boolean> => {
  return speakWithEnhancedWebSpeech(text, {
    language,
    style: 'calm',
    speed: 0.8, // Slower for pronunciation
    voiceGender: 'Female'
  });
};

/**
 * Celebrate with excitement!
 */
export const speakCelebration = async (
  text: string,
  language: string = 'English'
): Promise<boolean> => {
  return speakWithEnhancedWebSpeech(text, {
    language,
    style: 'excited',
    speed: 1.1,
    pitch: 10,
    voiceGender: 'Female'
  });
};

/**
 * Stop any ongoing speech
 */
export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Check if TTS is currently speaking
 */
export const isSpeaking = (): boolean => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
};

/**
 * Get available voices for a language
 */
export const getVoicesForLanguage = (language: string): EdgeVoice[] => {
  return EDGE_VOICES[language] || EDGE_VOICES['English'];
};

export default {
  speakForStudent,
  speakAsMiRa,
  speakPronunciation,
  speakCelebration,
  speakWithEnhancedWebSpeech,
  stopSpeaking,
  isSpeaking,
  getVoicesForLanguage
};
