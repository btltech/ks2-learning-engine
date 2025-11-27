# Google Cloud TTS - Configuration & Cost Monitoring Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Get Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select your project
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **API Key**
5. Copy the API key

### Step 2: Add to Your Environment

Edit `.env.local`:
```env
VITE_GOOGLE_CLOUD_TTS_API_KEY=your_api_key_here
```

### Step 3: Restart Your App

The app will automatically initialize Google Cloud TTS on startup.

```bash
npm run dev
```

You should see in console:
```
✓ Google Cloud TTS initialized successfully
```

---

## 📊 Monitoring & Cost Management

### Dashboard Links

**Your Project Metrics:**
- 📈 [TTS API Metrics](https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/metrics?project=gen-lang-client-0266086415)
- 💰 [Billing Overview](https://console.cloud.google.com/billing)
- 📋 [API Quotas & Limits](https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/quotas)
- 🔐 [API Credentials](https://console.cloud.google.com/apis/credentials)

### Pricing

| Characters | Price |
|-----------|-------|
| 0 - 500,000/month | **FREE** |
| 500,001+ | $16.00 per 1M chars |

**Real-World Estimates:**
- 1 hour of speech ≈ 15,000 characters ≈ $0.24
- 100 hours/month ≈ $48-64
- 50 students × 2 hrs/day × 20 days ≈ $200-300/month

---

## 🛡️ Setting Up Budget Alerts

### 1. Enable Billing Alerts

Go to [Google Cloud Billing](https://console.cloud.google.com/billing):

1. Select your project
2. Click **Billing** in sidebar
3. Click **Budget and alerts**
4. Click **Create Budget**
5. Set **Budget Type**: Monthly
6. Set **Amount**: e.g., $50 or $100
7. Add email alerts at 50%, 90%, 100%

### 2. Set API Quotas

Go to [Quotas Page](https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/quotas):

1. Find **Characters** quota
2. Click to edit
3. Set limit to control monthly spend
4. Example: 
   - 50 students × 2 hours/day × 20 days × 15K chars/hour = 30M chars/month
   - Set quota to 30M characters

### 3. Enable API Restrictions

Go to [Credentials](https://console.cloud.google.com/apis/credentials):

1. Find your API Key
2. Click **Edit**
3. **API restrictions**: Select only "Text-to-Speech API"
4. **Application restrictions**: Restrict to your domain(s)
5. Save

---

## 📈 Monitoring Usage

### Real-Time Monitoring

Your app includes built-in cost tracking. Check the browser console:

```typescript
// You can add this to any component to check usage:
import { ttsConfigManager } from '@/services/ttsConfigManager';

const config = ttsConfigManager.getConfig();
console.log('TTS Usage:', {
  cacheSize: config.cacheSettings.maxCacheSize,
  cacheTTL: config.cacheSettings.cacheTTL,
  estimatedCost: '~$0.24 per 100M characters'
});
```

### Google Cloud Console

**Daily/Weekly View:**
1. Go to [TTS Metrics Dashboard](https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/metrics?project=gen-lang-client-0266086415)
2. Select **Text-to-Speech API**
3. View charts for:
   - Total requests
   - Error rates
   - Latency

**Export Usage Data:**
1. Go to [Billing → Reports](https://console.cloud.google.com/billing/reports)
2. Download CSV for analysis
3. Filter by "Speech-to-Text API"

---

## 💰 Cost Optimization Strategies

### 1. **Enable Caching** (Built-in - No Config Needed)
- App automatically caches audio for repeated phrases
- Default: 100MB cache, 24-hour TTL
- Estimated savings: **30-50%** for educational content

### 2. **Use Shorter Text**
- Break long lessons into shorter phrases
- Example: "Hello world" instead of full paragraphs
- Savings: **20-30%**

### 3. **Batch Similar Requests**
- The app already batches related phrases
- Pre-cache common phrases during app initialization
- Savings: **10-15%**

### 4. **Smart Provider Switching**
Edit `constants.ts` to prioritize providers:

```typescript
// In ttsConfigManager.ts - adjust provider priority
const DEFAULT_CONFIG = {
  provider: {
    activeProvider: 'web-speech', // Use free Web Speech API by default
    priority: [
      'web-speech',      // Free - always available
      'google-cloud',    // Premium - when available
      'piper'           // Offline option
    ]
  }
};
```

**Savings by switching to Web Speech:**
- Reduces cost to **~$0** (free)
- Trade-off: Lower voice quality, no fine-tuned regional accents
- Best for: Casual learning, testing, development

### 5. **Schedule Expensive Operations**
Cache audio during off-peak hours:

```typescript
// Add to your backend/service:
async function warmupCache() {
  const commonPhrases = [
    'Hello', 'Welcome', 'Great job!',
    'Try again', 'Correct!', 'Incorrect'
  ];
  
  for (const phrase of commonPhrases) {
    await synthesizeGoogleCloudTTS(phrase, 'English');
  }
}

// Call during app initialization or scheduled task
```

---

## 🚨 Cost Control Checklist

- [ ] API key restricted to Text-to-Speech API only
- [ ] API key restricted to your domain
- [ ] Budget alert set to $50/month
- [ ] API quota set (e.g., 30M characters/month)
- [ ] Billing contact email configured
- [ ] Caching enabled (default: enabled)
- [ ] Provider priority configured
- [ ] Monitor usage weekly
- [ ] Review billing reports monthly

---

## 🔐 Security Checklist

- [ ] API key stored in `.env.local` (never commit)
- [ ] `.env.local` added to `.gitignore`
- [ ] API key has API restrictions enabled
- [ ] API key has application restrictions enabled
- [ ] Only project owner has access to API keys
- [ ] Monthly billing review scheduled
- [ ] Cost alert email configured
- [ ] Team informed of cost structure

---

## 🧪 Testing Configuration

### Test Setup (Free During Development)

1. **Use Web Speech API** (default, free):
```typescript
// In TTSSettings.tsx, disable Google Cloud
ttsConfigManager.updateConfig({
  provider: {
    activeProvider: 'web-speech',
    priority: ['web-speech']
  }
});
```

2. **Small Quota** during testing:
```
Set API quota to 1M characters/month
Only costs: $16 if exceeded
```

3. **Monitor costs** during initial phase:
```
Week 1: Set quota to 5M (costs ~$80 if all used)
Week 2: Adjust based on actual usage
Week 3+: Set final production quota
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Problem**: "API key invalid"
- Solution: Verify key in `.env.local` and restart dev server

**Problem**: "Quota exceeded"
- Solution: Increase quota in [Quotas](https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/quotas) or reduce usage

**Problem**: "High billing"
- Solution:
  1. Check [Reports](https://console.cloud.google.com/billing/reports)
  2. Enable caching (it's already on)
  3. Consider switching to Web Speech API as primary
  4. Reduce usage during peak hours

**Problem**: "Slow TTS response"
- Solution:
  1. Check network (Google Cloud API latency ~500ms)
  2. Enable caching (reduces latency to ~50ms on cache hit)
  3. Pre-warm cache before heavy usage

### Getting Help

- [Google Cloud TTS Documentation](https://cloud.google.com/text-to-speech/docs)
- [Troubleshooting Guide](GOOGLE_CLOUD_TTS_INTEGRATION_GUIDE.md#troubleshooting)
- [Google Cloud Support](https://cloud.google.com/support)

---

## 📋 Production Deployment

### Environment Setup

For Vercel, Netlify, or other platforms:

1. **Add Environment Variable**:
   - Go to project settings
   - Add `VITE_GOOGLE_CLOUD_TTS_API_KEY`
   - Set to your production key

2. **Different Keys for Environments** (Recommended):
   - Development: Unlimited quota, personal testing
   - Staging: 5M char/month quota
   - Production: Full production quota with alerts

3. **Backend Proxy** (Optional, Enhanced Security):

```typescript
// Create backend endpoint: /api/tts
// Forward requests instead of exposing API key to client
// This prevents key leakage if frontend is compromised

app.post('/api/tts', async (req, res) => {
  const { text, language } = req.body;
  const response = await textToSpeech.synthesizeSpeech({
    input: { text },
    voice: { languageCode: language },
    audioConfig: { audioEncoding: 'MP3' }
  });
  res.send(response.audioContent);
});
```

---

## 📊 Usage Report Template

**Monthly Cost Analysis:**

| Date | Requests | Characters | Cost | Provider |
|------|----------|-----------|------|----------|
| Nov 1-7 | 1,250 | 18.7M | $0.30 | Google Cloud |
| Nov 8-14 | 1,180 | 17.6M | $0.28 | Google Cloud |
| Nov 15-21 | 1,420 | 21.2M | $0.34 | Google Cloud |
| Nov 22-28 | 890 | 13.3M | $0.21 | Google Cloud |
| **Nov Total** | **4,740** | **70.8M** | **$1.13** | - |

---

## 🎯 Next Steps

1. ✅ Add API key to `.env.local`
2. ✅ Restart dev server
3. ⏭️ Set up budget alert (5 minutes)
4. ⏭️ Configure API quotas (5 minutes)
5. ⏭️ Test with TTSSettings component
6. ⏭️ Monitor usage for 1 week
7. ⏭️ Deploy to production with proper setup

---

## 📚 Related Documentation

- [Setup Guide](./GOOGLE_CLOUD_TTS_SETUP.md)
- [Integration Guide](./GOOGLE_CLOUD_TTS_INTEGRATION_GUIDE.md)
- [Implementation Summary](./GOOGLE_CLOUD_TTS_IMPLEMENTATION_SUMMARY.md)

---

**Last Updated**: November 27, 2025  
**Google Cloud TTS API Version**: v1  
**Project ID**: gen-lang-client-0266086415
