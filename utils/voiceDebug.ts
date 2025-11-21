/**
 * Voice Debugging Utility
 * Use this to find and test the best-sounding voices available on your system
 */

export const listAllVoices = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.log('Speech Synthesis not available');
    return [];
  }

  const voices = window.speechSynthesis.getVoices();
  
  console.log(`\n📢 Available Voices (${voices.length} total):`);
  console.log('=====================================');
  
  voices.forEach((voice, idx) => {
    console.log(`
#${idx}. ${voice.name}
   Language: ${voice.lang}
   Local: ${voice.localService}
   Default: ${voice.default}
`);
  });
  
  return voices;
};

export const testVoice = (voiceIndex: number, testText: string = "Hello! This is a test of voice quality.") => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.log('Speech Synthesis not available');
    return;
  }

  const voices = window.speechSynthesis.getVoices();
  if (voiceIndex >= voices.length) {
    console.log(`Voice index ${voiceIndex} not found`);
    return;
  }

  const voice = voices[voiceIndex];
  const utterance = new SpeechSynthesisUtterance(testText);
  utterance.voice = voice;
  utterance.rate = 0.9;
  utterance.pitch = 1.05;
  utterance.volume = 1.0;

  console.log(`Testing voice #${voiceIndex}: ${voice.name}`);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

export const testVoiceByName = (voiceName: string, testText: string = "Hello! This is a test of voice quality.") => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.log('Speech Synthesis not available');
    return;
  }

  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.name.toLowerCase().includes(voiceName.toLowerCase()));
  
  if (!voice) {
    console.log(`Voice containing "${voiceName}" not found`);
    console.log(`Available voices: ${voices.map(v => v.name).join(', ')}`);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(testText);
  utterance.voice = voice;
  utterance.rate = 0.9;
  utterance.pitch = 1.05;
  utterance.volume = 1.0;

  console.log(`Testing voice: ${voice.name}`);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

export const findBestVoice = (language: string = 'en-US') => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.log('Speech Synthesis not available');
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  const baseLanguage = language.split('-')[0];
  
  // Filter by language
  const candidates = voices.filter(v => 
    v.lang.startsWith(language) || v.lang.startsWith(baseLanguage)
  );

  if (!candidates.length) {
    console.log(`No voices found for ${language}`);
    return null;
  }

  // Score voices
  const scored = candidates.map(voice => {
    const name = voice.name.toLowerCase();
    let score = 0;

    if (voice.localService === false) score += 15;
    if (name.includes('neural') || name.includes('natural')) score += 12;
    if (name.includes('victoria') || name.includes('samantha') || name.includes('karen')) score += 10;
    if (name.includes('google')) score += 11;
    if (!voice.default) score += 3;

    return { voice, score };
  });

  const best = scored.sort((a, b) => b.score - a.score)[0];
  console.log(`\n🏆 Best voice for ${language}:`);
  console.log(`   Name: ${best.voice.name}`);
  console.log(`   Score: ${best.score}`);
  console.log(`   Remote: ${!best.voice.localService}`);
  
  return best.voice;
};

// Usage in browser console:
// voiceDebug.listAllVoices()        - See all available voices
// voiceDebug.testVoice(0)            - Test voice at index 0
// voiceDebug.testVoiceByName('Victoria') - Test voice by name
// voiceDebug.findBestVoice('en-US') - Find best voice for language
