# Google Cloud TTS Integration Guide

This guide explains how to set up and use Google Cloud Text-to-Speech in the KS2 Learning Engine.

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [API Key Management](#api-key-management)
3. [Usage Examples](#usage-examples)
4. [Supported Languages](#supported-languages)
5. [Voice Options](#voice-options)
6. [Performance & Caching](#performance--caching)
7. [Error Handling](#error-handling)
8. [Troubleshooting](#troubleshooting)

## Setup & Configuration

### Prerequisites

- Google Cloud Account
- Google Cloud project with Text-to-Speech API enabled
- API key with TTS permissions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a Project" → "New Project"
3. Enter project name and create

### Step 2: Enable Text-to-Speech API

1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Text-to-Speech API"
3. Click on the result and select "Enable"

### Step 3: Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key

### Step 4: Configure in Your App

#### Option A: Environment Variable

Create `.env.local`:

```env
VITE_GOOGLE_CLOUD_TTS_API_KEY=your_api_key_here
VITE_GOOGLE_CLOUD_PROJECT_ID=your_project_id
```

#### Option B: Runtime Configuration

```typescript
import { initializeGoogleCloudTTS } from '@/services/googleCloudTTS';
import { ttsConfigManager } from '@/services/ttsConfigManager';

// Initialize on app load
const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_TTS_API_KEY;
if (apiKey) {
  initializeGoogleCloudTTS(apiKey);
  ttsConfigManager.setGoogleCloudApiKey(apiKey);
}
```

## API Key Management

### Secure Storage

**Never commit API keys to version control!**

1. Use environment variables (`.env.local`)
2. Use `.gitignore` to exclude `.env.local`
3. For deployment, use platform secrets (Vercel, Netlify, etc.)

### Rotating Keys

1. Generate new key in Google Cloud Console
2. Update environment variable
3. Delete old key after testing

### Usage Monitoring

Monitor API usage in Google Cloud Console:
- Go to "APIs & Services" → "Quotas"
- Set daily quotas if needed
- Monitor billing to avoid unexpected charges

## Usage Examples

### Basic Usage

```typescript
import { speakWithGoogleCloud } from '@/services/googleCloudTTS';

// Simple text-to-speech
await speakWithGoogleCloud('Hello, world!', 'English');
```

### Advanced Usage with Options

```typescript
import { synthesizeGoogleCloudTTS, playGoogleCloudAudio } from '@/services/googleCloudTTS';

// Synthesize with custom settings
const audioBase64 = await synthesizeGoogleCloudTTS(
  'Bonjour le monde',
  'French',
  {
    gender: 'FEMALE',
    speakingRate: 0.9,
    pitch: 2
  }
);

// Play the audio
if (audioBase64) {
  playGoogleCloudAudio(audioBase64);
}
```

### Using the Enhanced Hook

```typescript
import { useTTSEnhanced } from '@/hooks/useTTSEnhanced';

function MyComponent() {
  const { speak, isSpeaking, switchProvider, activeProvider, googleCloudAvailable } = useTTSEnhanced(
    'English',
    {
      googleCloudApiKey: import.meta.env.VITE_GOOGLE_CLOUD_TTS_API_KEY,
      preferGoogleCloud: true
    }
  );

  return (
    <div>
      <button onClick={() => speak('Hello!')}>
        Speak (Provider: {activeProvider})
      </button>
      
      {googleCloudAvailable && (
        <button onClick={() => switchProvider('google-cloud')}>
          Switch to Google Cloud
        </button>
      )}
      
      {isSpeaking && <p>Speaking...</p>}
    </div>
  );
}
```

### Configuration Manager

```typescript
import { ttsConfigManager } from '@/services/ttsConfigManager';

// Set API key
ttsConfigManager.setGoogleCloudApiKey('your_api_key', 'your_project_id');

// Enable Google Cloud as primary provider
ttsConfigManager.updateProvider('googleCloud', {
  enabled: true,
  priority: 1 // Higher priority = used first
});

// Update audio settings
ttsConfigManager.updateAudioSettings({
  speakingRate: 1.0,
  pitch: 2,
  volumeGain: 5
});

// Subscribe to changes
const unsubscribe = ttsConfigManager.subscribe(config => {
  console.log('TTS config changed:', config);
});
```

## Supported Languages

Google Cloud TTS supports all 17 languages in the KS2 Learning Engine:

| Language | Voice Count | Quality |
|----------|-------------|---------|
| English | 3 | Neural (High) |
| French | 2 | Neural (High) |
| Spanish | 2 | Neural (High) |
| German | 2 | Neural (High) |
| Japanese | 2 | Neural (High) |
| Mandarin | 2 | Neural (High) |
| Romanian | 1 | Neural (High) |
| Yoruba | 1 | Neural (High) |
| Italian | 2 | Neural (High) |
| Arabic | 2 | Neural (High) |
| Portuguese | 2 | Neural (High) |
| Russian | 2 | Neural (High) |
| Korean | 2 | Neural (High) |
| Hindi | 2 | Neural (High) |
| Turkish | 1 | Neural (High) |
| Greek | 1 | Neural (High) |
| Latin | 1 | Neural (High) |

## Voice Options

### Available Genders

- **FEMALE**: Natural female voice
- **MALE**: Natural male voice
- **NEUTRAL**: Gender-neutral voice (if available)

### Voice Selection

```typescript
import { getAvailableVoices } from '@/services/googleCloudTTS';

// Get voices for a language
const voices = getAvailableVoices('English');
// Returns: [
//   { name: 'en-US-Neural2-C', gender: 'FEMALE', naturalness: 'high' },
//   { name: 'en-US-Neural2-A', gender: 'MALE', naturalness: 'high' },
//   { name: 'en-US-Neural2-E', gender: 'FEMALE', naturalness: 'high' }
// ]
```

## Performance & Caching

### Audio Caching

Google Cloud TTS automatically caches synthesized audio to improve performance:

```typescript
import { clearGoogleCloudCache } from '@/services/googleCloudTTS';

// Cache is automatically stored in memory
// Clear cache manually if needed
clearGoogleCloudCache();
```

### Cache Configuration

```typescript
import { ttsConfigManager } from '@/services/ttsConfigManager';

// Enable/disable caching
ttsConfigManager.updateConfig({
  caching: {
    enabled: true,
    maxSize: 100, // MB
    ttl: 86400000 // 24 hours
  }
});
```

### Billing Optimization

- **Cached requests**: No additional cost
- **New requests**: $16 per 1M characters (as of 2024)
- **Estimate**: 100 hours of audio ≈ 3-4M characters

### Performance Tips

1. **Enable caching** for common phrases
2. **Use shorter texts** for immediate feedback
3. **Batch requests** during off-peak hours
4. **Monitor API usage** in Google Cloud Console

## Error Handling

### Common Errors

```typescript
import { speakWithGoogleCloud } from '@/services/googleCloudTTS';

try {
  const success = await speakWithGoogleCloud('Text', 'Language');
  
  if (!success) {
    console.error('Speech synthesis failed');
    // Fallback to Web Speech API automatically
  }
} catch (error) {
  if (error.message.includes('API key')) {
    console.error('Invalid or missing API key');
  } else if (error.message.includes('401')) {
    console.error('Unauthorized - check API key permissions');
  } else if (error.message.includes('403')) {
    console.error('Forbidden - API not enabled for this project');
  } else if (error.message.includes('429')) {
    console.error('Rate limited - too many requests');
  }
}
```

### Automatic Fallback

If Google Cloud TTS fails, the app automatically falls back to Web Speech API:

```typescript
import { useTTSEnhanced } from '@/hooks/useTTSEnhanced';

// Automatically tries Google Cloud first, falls back to Web Speech
const { speak } = useTTSEnhanced('English', {
  googleCloudApiKey: apiKey,
  preferGoogleCloud: true
});

// Will succeed even if Google Cloud is unavailable
await speak('Hello');
```

## Troubleshooting

### "API key not initialized"

**Solution**: Ensure API key is set before using Google Cloud TTS

```typescript
import { initializeGoogleCloudTTS } from '@/services/googleCloudTTS';

initializeGoogleCloudTTS('your_api_key');
```

### "No voices found for language"

**Solution**: Ensure the language name matches exactly

```typescript
// Correct
await speakWithGoogleCloud('Hello', 'English');

// Incorrect
await speakWithGoogleCloud('Hello', 'english');
```

### "Unauthorized (401)" or "Forbidden (403)"

**Solution**: Check API credentials

1. Verify API key is correct
2. Ensure Text-to-Speech API is enabled
3. Check that API key has TTS permissions

### "Rate limited (429)"

**Solution**: Implement request throttling

```typescript
import { useTTSEnhanced } from '@/hooks/useTTSEnhanced';

const { speak } = useTTSEnhanced('English', {
  googleCloudApiKey: apiKey
});

// Throttle requests
let lastSpeakTime = 0;
const throttledSpeak = async (text: string) => {
  const now = Date.now();
  if (now - lastSpeakTime < 1000) {
    await new Promise(r => setTimeout(r, 1000 - (now - lastSpeakTime)));
  }
  lastSpeakTime = Date.now();
  return speak(text);
};
```

### Audio doesn't play

**Solution**: Check audio playback

```typescript
// Ensure audio element can play
const audio = new Audio('blob:...');
audio.volume = 1;
await audio.play().catch(err => {
  console.error('Playback failed:', err);
  // May require user gesture (click, tap)
});
```

### High latency

**Solution**: Monitor and optimize

1. Enable caching for repeated phrases
2. Use smaller text chunks
3. Check network connection
4. Consider region in Google Cloud API

## Integration Checklist

- [ ] Google Cloud project created
- [ ] Text-to-Speech API enabled
- [ ] API key generated
- [ ] `.env.local` configured with API key
- [ ] `useTTSEnhanced` hook integrated
- [ ] TTSSettings component added to app
- [ ] Error handling implemented
- [ ] Testing completed with all 17 languages
- [ ] Billing alerts set up
- [ ] Documentation updated

## Support

For issues or questions:

1. Check [Google Cloud TTS Documentation](https://cloud.google.com/text-to-speech/docs)
2. Review error messages and troubleshooting section
3. Check API quotas and usage in Google Cloud Console
4. Verify network connectivity

## License

Google Cloud TTS is provided by Google Cloud. Check [pricing and usage policies](https://cloud.google.com/text-to-speech/pricing).
