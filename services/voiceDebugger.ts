/**
 * Voice Selection Debugger for Cross-Browser TTS Testing
 * Use this in the browser console to debug voice selection in different browsers
 * 
 * Usage:
 * import { debugVoiceSelection, listAllVoices, testVoiceQuality } from './services/voiceDebugger';
 * 
 * debugVoiceSelection('en-GB');  // See which voice is selected
 * listAllVoices();                // See all available voices
 * testVoiceQuality();             // Test voice with sample text
 */

import { pickVoice } from './ttsService';

const languageToBCP47Full: Record<string, string> = {
  'English': 'en-GB',
  'French': 'fr-FR',
  'Spanish': 'es-ES',
  'German': 'de-DE',
  'Japanese': 'ja-JP',
  'Mandarin': 'zh-CN',
  'Romanian': 'ro-RO',
};

const getVoicesSafe = (): SpeechSynthesisVoice[] => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
};

export const debugVoiceSelection = (language: string = 'en-GB') => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎤 VOICE SELECTION DEBUG - ${language}`);
  console.log(`${'='.repeat(60)}\n`);

  const voices = getVoicesSafe();
  console.log(`Total voices available: ${voices.length}`);

  if (!voices.length) {
    console.log('⚠️  No voices loaded yet. Wait a moment and try again.');
    return;
  }

  // Get language-specific candidates
  let candidates = voices.filter(v => v.lang === language);
  if (!candidates.length) {
    const base = language.split('-')[0];
    candidates = voices.filter(v => v.lang.startsWith(base));
  }

  console.log(`\nCandidates for ${language}:`);
  candidates.forEach((voice, idx) => {
    console.log(`  ${idx + 1}. ${voice.name}`);
    console.log(`     Lang: ${voice.lang} | Remote: ${!voice.localService} | Default: ${voice.default}`);
  });

  const selected = pickVoice(language);
  console.log(`\n✅ SELECTED VOICE: ${selected?.name}`);
  if (selected) {
    console.log(`   Lang: ${selected.lang}`);
    console.log(`   Remote: ${!selected.localService}`);
    console.log(`   Default: ${selected.default}`);
  }

  console.log(`\n${'='.repeat(60)}\n`);
};

export const listAllVoices = () => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📋 ALL AVAILABLE VOICES (${getVoicesSafe().length} total)`);
  console.log(`${'='.repeat(70)}\n`);

  const voices = getVoicesSafe();
  if (!voices.length) {
    console.log('⚠️  No voices loaded yet.');
    return;
  }

  // Group by language
  const byLanguage: Record<string, SpeechSynthesisVoice[]> = {};
  voices.forEach(v => {
    if (!byLanguage[v.lang]) byLanguage[v.lang] = [];
    byLanguage[v.lang].push(v);
  });

  Object.keys(byLanguage).sort().forEach(lang => {
    console.log(`\n🌍 ${lang}:`);
    byLanguage[lang].forEach((voice, idx) => {
      const remote = voice.localService === false ? '☁️ ' : '💾';
      const def = voice.default ? '[DEFAULT]' : '';
      console.log(`  ${remote} ${idx + 1}. ${voice.name} ${def}`);
    });
  });

  console.log(`\n${'='.repeat(70)}\n`);
};

export const testVoiceQuality = (text?: string) => {
  const testText = text || 'The quick brown fox jumps over the lazy dog. This is a test of voice quality.';
  
  console.log(`\n🎤 Testing voice with text: "${testText}"\n`);

  const utterance = new SpeechSynthesisUtterance(testText);
  utterance.lang = 'en-GB';
  utterance.rate = 0.85;
  utterance.pitch = 1.08;
  utterance.volume = 1.0;

  const voice = pickVoice('en-GB');
  if (voice) {
    utterance.voice = voice;
    console.log(`Using voice: ${voice.name}`);
  }

  utterance.onstart = () => console.log('▶️  Speech started...');
  utterance.onend = () => console.log('✓ Speech ended');
  utterance.onerror = (e) => console.error('❌ Error:', e.error);

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
};

export const testAllLanguages = async () => {
  const languages = [
    { lang: 'en-GB', text: 'Hello, this is English.' },
    { lang: 'fr-FR', text: 'Bonjour, ceci est français.' },
    { lang: 'es-ES', text: 'Hola, esto es español.' },
    { lang: 'de-DE', text: 'Hallo, das ist Deutsch.' },
  ];

  console.log(`\n🌍 Testing all languages...\n`);

  for (const { lang, text } of languages) {
    console.log(`Testing ${lang}...`);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1.08;

    const voice = pickVoice(lang);
    if (voice) {
      utterance.voice = voice;
      console.log(`  Voice: ${voice.name}\n`);
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }

    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('✓ All tests complete');
};

export const compareBrowserVoices = () => {
  const userAgent = navigator.userAgent;
  const browserName = (() => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Brave')) return 'Brave';
    if (userAgent.includes('Firefox')) return 'Firefox';
    return 'Unknown';
  })();

  console.log(`\n📱 Browser: ${browserName}`);
  console.log(`User Agent: ${userAgent}\n`);
  
  debugVoiceSelection('en-GB');
};
