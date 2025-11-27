// Optimized Web Speech API for natural-sounding TTS (completely free, no external APIs)
// Uses advanced voice selection and natural speech parameters

const languageToBCP47Full: Record<string, string> = {
  French: 'fr-FR',
  Spanish: 'es-ES',
  German: 'de-DE',
  Japanese: 'ja-JP',
  Mandarin: 'zh-CN',
  Romanian: 'ro-RO',
  Yoruba: 'yo-NG', // Nigerian Yoruba
  English: 'en-GB',
  // Additional languages with full BCP47 support:
  Italian: 'it-IT',
  Arabic: 'ar-SA',
  Portuguese: 'pt-BR',
  Russian: 'ru-RU',
  Korean: 'ko-KR',
  Hindi: 'hi-IN',
  Turkish: 'tr-TR',
  Greek: 'el-GR',
  Latin: 'la-VA', // Vatican Latin
};

// Enhanced language mapping with native voice preferences
const languageVoicePreferences: Record<string, {
  primary: string[];
  fallback: string[];
  pronunciationHints: Record<string, string>;
}> = {
  French: {
    primary: ['fr-FR', 'fr-CA', 'fr-BE'],
    fallback: ['fr-FR'],
    pronunciationHints: {
      'ç': 'ss',
      'œ': 'eu',
      'à': 'ah',
      'è': 'eh',
      'ù': 'oo',
      'â': 'ah',
      'ê': 'eh',
      'î': 'ee',
      'ô': 'oh',
      'û': 'oo'
    }
  },
  Spanish: {
    primary: ['es-ES', 'es-US', 'es-MX'],
    fallback: ['es-ES'],
    pronunciationHints: {
      'ñ': 'ny',
      'll': 'y',
      'rr': 'r (rolled)',
      'j': 'h',
      'z': 'th (in Spain)',
      'c': 'th (before i,e)',
      'g': 'h (before i,e)'
    }
  },
  German: {
    primary: ['de-DE', 'de-AT', 'de-CH'],
    fallback: ['de-DE'],
    pronunciationHints: {
      'ü': 'ue',
      'ö': 'oe',
      'ä': 'ae',
      'ß': 'ss',
      'ch': 'kh',
      'sch': 'sh',
      'w': 'v'
    }
  },
  Japanese: {
    primary: ['ja-JP'],
    fallback: ['ja-JP'],
    pronunciationHints: {
      'う': 'u',
      'え': 'e',
      'お': 'o',
      'か': 'ka',
      'き': 'ki',
      'く': 'ku',
      'け': 'ke',
      'こ': 'ko'
    }
  },
  Mandarin: {
    primary: ['zh-CN', 'zh-TW'],
    fallback: ['zh-CN'],
    pronunciationHints: {
      '你好': 'ni hao',
      '谢谢': 'xie xie',
      '对不起': 'dui bu qi',
      '请': 'qing'
    }
  },
  Romanian: {
    primary: ['ro-RO'],
    fallback: ['ro-RO'],
    pronunciationHints: {
      'ă': 'uh',
      'â': 'uh',
      'î': 'ee',
      'ș': 'sh',
      'ț': 'ts'
    }
  },
  // All languages now fully implemented with native voice support:
  Italian: {
    primary: ['it-IT', 'it-CH'],
    fallback: ['it-IT'],
    pronunciationHints: {
      'gli': 'lyee',
      'gn': 'ny',
      'sc': 'sh (before i,e)',
      'ch': 'k',
      'gh': 'g',
      'h': '(silent)'
    }
  },
  Arabic: {
    primary: ['ar-SA', 'ar-EG', 'ar-AE'],
    fallback: ['ar-SA'],
    pronunciationHints: {
      'ع': 'ayn',
      'ح': 'ha',
      'خ': 'kha',
      'غ': 'ghayn',
      'ق': 'qaf'
    }
  },
  Portuguese: {
    primary: ['pt-BR', 'pt-PT'],
    fallback: ['pt-BR'],
    pronunciationHints: {
      'ão': 'own',
      'lh': 'ly',
      'nh': 'ny',
      'ç': 's',
      'rr': 'kh (Portuguese)',
      's': 'sh (between vowels)'
    }
  },
  English: {
    primary: ['en-GB', 'en-US', 'en-AU'],
    fallback: ['en-GB'],
    pronunciationHints: {}
  },
  Yoruba: {
    primary: ['en-GB'], // Nigerian English voices preferred
    fallback: ['en-GB', 'en-US'],
    pronunciationHints: {
      'ẹ': 'eh',
      'ọ': 'oh',
      'ṣ': 'sh',
      'gb': 'g-b (explosive)',
      'kp': 'k-p (explosive)',
      'ẹ̀': 'eh (low tone)',
      'ẹ́': 'eh (high tone)',
      'ọ̀': 'oh (low tone)',
      'ọ́': 'oh (high tone)'
    }
  },
  Russian: {
    primary: ['ru-RU'],
    fallback: ['ru-RU'],
    pronunciationHints: {
      'ы': 'ui',
      'ъ': '(hard sign)',
      'ь': '(soft sign)',
      'щ': 'shch',
      'ж': 'zh',
      'ш': 'sh',
      'ч': 'ch',
      'ц': 'ts'
    }
  },
  Korean: {
    primary: ['ko-KR'],
    fallback: ['ko-KR'],
    pronunciationHints: {
      'ㅏ': 'ah',
      'ㅑ': 'yah',
      'ㅓ': 'uh',
      'ㅕ': 'yuh',
      'ㅗ': 'oh',
      'ㅛ': 'yoh',
      'ㅜ': 'oo',
      'ㅠ': 'yoo'
    }
  },
  Hindi: {
    primary: ['hi-IN'],
    fallback: ['hi-IN'],
    pronunciationHints: {
      'अ': 'uh',
      'आ': 'ah',
      'इ': 'ee',
      'ई': 'ee',
      'उ': 'oo',
      'ऊ': 'oo',
      'ए': 'ay',
      'ऐ': 'eye',
      'ओ': 'oh',
      'औ': 'ow'
    }
  },
  Turkish: {
    primary: ['tr-TR'],
    fallback: ['tr-TR'],
    pronunciationHints: {
      'ğ': '(soft g)',
      'ı': 'uh',
      'ş': 'sh',
      'ç': 'ch',
      'ö': 'ur',
      'ü': 'ue',
      'â': 'ah',
      'î': 'ee',
      'û': 'oo'
    }
  },
  Greek: {
    primary: ['el-GR'],
    fallback: ['el-GR'],
    pronunciationHints: {
      'α': 'ah',
      'β': 'v',
      'γ': 'gh',
      'δ': 'th',
      'ε': 'eh',
      'ζ': 'z',
      'η': 'ee',
      'θ': 'th',
      'ι': 'ee',
      'κ': 'k'
    }
  },
  Latin: {
    primary: ['la-VA'],
    fallback: ['en-GB'], // fallback to English for Latin
    pronunciationHints: {
      'ae': 'eye',
      'oe': 'oy',
      'ti': 'tee (before vowel)',
      'ph': 'f',
      'ch': 'k',
      'th': 't',
      'rh': 'r'
    }
  }
};

const getVoicesSafe = (): SpeechSynthesisVoice[] => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
};

// Cache for best voices to avoid re-scoring each time
const voiceCache = new Map<string, SpeechSynthesisVoice>();

export const pickVoice = (bcp47: string, languageLabel?: string): SpeechSynthesisVoice | null => {
  // Return cached voice if available
  const cacheKey = `${bcp47}-${languageLabel || 'default'}`;
  if (voiceCache.has(cacheKey)) {
    return voiceCache.get(cacheKey)!;
  }

  const voices = getVoicesSafe();
  if (!voices.length) return null;

  // Get language preferences for native voice selection
  const langPrefs = languageLabel ? languageVoicePreferences[languageLabel] : null;

  // Enhanced voice scoring with native speaker prioritization
  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    const name = (v.name || '').toLowerCase();
    let score = 0;

    // PRIORITY 1: Native speaker voices for the target language
    if (langPrefs) {
      // Exact match with preferred language codes
      for (const preferredLang of langPrefs.primary) {
        if (v.lang === preferredLang) {
          score += 100; // Massive boost for native speakers
          break;
        }
      }

      // Partial match with preferred language codes
      for (const preferredLang of langPrefs.primary) {
        if (v.lang.startsWith(preferredLang.split('-')[0])) {
          score += 80;
          break;
        }
      }
    }

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

  // Prefer exact language match first, then native speakers
  let candidates = voices.filter(v => v.lang === bcp47);
  if (!candidates.length) {
    // Then any voice that starts with the same language code (e.g. fr-*, es-*)
    const base = bcp47.split('-')[0];
    candidates = voices.filter(v => v.lang.startsWith(base));
  }

  if (candidates.length) {
    const sorted = candidates.sort((a, b) => scoreVoice(b) - scoreVoice(a));
    const bestVoice = sorted[0];
    voiceCache.set(cacheKey, bestVoice);
    return bestVoice;
  }  // Fallback to best available English voice
  const englishVoices = voices.filter(v => v.lang.startsWith('en-'));
  if (englishVoices.length) {
    const sorted = englishVoices.sort((a, b) => scoreVoice(b) - scoreVoice(a));
    voiceCache.set(cacheKey, sorted[0]);
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

  // Enhanced text processing for native pronunciation
  const processTextForSpeech = (input: string, lang: string): string => {
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

    // Apply language-specific pronunciation hints
    const langPrefs = languageVoicePreferences[lang];
    if (langPrefs) {
      // Replace special characters with pronunciation guides
      Object.entries(langPrefs.pronunciationHints).forEach(([char, hint]) => {
        // Only replace if the character appears as a standalone word or in specific contexts
        const regex = new RegExp(`\\b${char}\\b`, 'gi');
        processed = processed.replace(regex, `${char} (${hint})`);
      });
    }

    return processed;
  };

  const speak = () => {
    const processedText = processTextForSpeech(text, languageLabel);
    const utterance = new SpeechSynthesisUtterance(processedText);
    utterance.lang = browserLangCode;

    // ENHANCED SETTINGS FOR ULTRA-NATURAL SOUNDING SPEECH
    // Tuned for children's educational content and native pronunciation
    utterance.rate = 0.88;        // Slightly slower for clarity (0.88 sweet spot)
    utterance.pitch = 1.05;       // Slightly warmer, friendlier tone
    utterance.volume = 1.0;       // Full volume for clarity

    // Set voice BEFORE speaking (important for Safari)
    const voice = pickVoice(browserLangCode, languageLabel);
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

      // For native language voices, use slightly different settings
      if (languageLabel !== 'English' && voice.lang.startsWith(browserLangCode.split('-')[0])) {
        // Native speakers: slightly faster, more natural rhythm
        utterance.rate = 0.95;
        utterance.pitch = 1.02;
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
