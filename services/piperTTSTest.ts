/**
 * Simple test utility to verify Piper TTS is working correctly
 * Run this in the browser console to test voice generation
 * 
 * Usage:
 * import { testPiperTTS } from './services/piperTTSTest';
 * 
 * // Test default English voice
 * testPiperTTS('Hello, this is a test of Piper TTS!');
 * 
 * // Test with language
 * testPiperTTS('Bonjour! Ceci est un test.', 'fr-FR');
 */

import { initPiperTTS, generatePiperAudio } from './piperTTS';

export const testPiperTTS = async (
  text: string,
  language: string = 'en-US'
): Promise<void> => {
  console.log(`\n🧪 Testing Piper TTS...`);
  console.log(`📝 Text: "${text}"`);
  console.log(`🌍 Language: ${language}`);

  try {
    console.log(`⏳ Initializing...`);
    const initialized = await initPiperTTS(language);
    if (!initialized) {
      console.error('❌ Failed to initialize Piper TTS');
      return;
    }

    console.log(`⏳ Generating audio...`);
    const audioUrl = await generatePiperAudio(text, language);
    
    if (!audioUrl) {
      console.error('❌ Failed to generate audio');
      return;
    }

    console.log(`✅ Audio generated successfully`);
    console.log(`📊 URL: ${audioUrl}`);

    // Play the audio
    const audio = new Audio(audioUrl);
    console.log(`🔊 Playing audio...`);
    await audio.play();

    audio.onended = () => {
      console.log(`✅ Test complete! Piper TTS is working correctly.`);
      console.log(`\n💡 Tip: Piper generates much more natural-sounding speech than Web Speech API!`);
    };

    audio.onerror = (e) => {
      console.error(`❌ Audio playback error:`, e);
    };
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Test multiple languages
export const testAllLanguages = async (): Promise<void> => {
  const tests = [
    { text: 'Hello, welcome to the learning app!', lang: 'en-US' },
    { text: 'Bonjour, bienvenue dans l\'application d\'apprentissage!', lang: 'fr-FR' },
    { text: '¡Hola, bienvenido a la aplicación de aprendizaje!', lang: 'es-ES' },
    { text: 'Hallo, willkommen in der Lern-App!', lang: 'de-DE' },
    { text: '你好，欢迎来到学习应用程序！', lang: 'zh-CN' },
  ];

  console.log('\n🧪 Testing all supported languages...\n');

  for (const test of tests) {
    await testPiperTTS(test.text, test.lang);
    // Wait 3 seconds between tests
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('\n✅ All language tests complete!');
};
