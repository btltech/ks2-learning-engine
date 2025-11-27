# How to Get Your Google Cloud Text-to-Speech API Key

## Step-by-Step Guide (5 Minutes)

### Step 1: Go to Google Cloud Console

Open this link in your browser:
👉 **[https://console.cloud.google.com](https://console.cloud.google.com)**

You'll see the Google Cloud Console dashboard.

---

### Step 2: Create or Select a Project

**If you don't have a project yet:**

1. At the top of the page, click the **Project dropdown** (shows "Select a project")
2. Click **New Project**
3. Enter a name like `ks2-learning-engine`
4. Click **Create**
5. Wait for it to be created (takes 1-2 minutes)

**If you already have a project:**

1. Click the project dropdown
2. Select your existing project

---

### Step 3: Enable the Text-to-Speech API

1. In the left sidebar, click **APIs & Services**
2. Click **Enabled APIs & services**
3. Click **+ Enable APIs and Services** (blue button at top)
4. Search for **"Text-to-Speech"**
5. Click on **"Cloud Text-to-Speech API"**
6. Click **Enable** (blue button)
7. Wait for it to enable (takes a few seconds)

---

### Step 4: Create an API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** (blue button at top)
3. Select **API Key**
4. A new API key will be created and shown in a popup
5. **Copy the API key** (it looks like: `AIzaSy...`)
6. **Save it somewhere safe** - you'll need this

---

### Step 5: Add to Your App

1. Open your `.env.local` file in VS Code
2. Find this line:
   ```
   VITE_GOOGLE_CLOUD_TTS_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual API key:
   ```
   VITE_GOOGLE_CLOUD_TTS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
4. Save the file (Cmd+S)
5. Restart your dev server:
   ```bash
   npm run dev
   ```

---

## ✅ How to Know It's Working

After restarting your dev server, you should see in the console:

```
✓ Google Cloud TTS initialized successfully
```

If you see this instead:
```
ℹ Google Cloud TTS API key not configured. Using Web Speech API as fallback.
```

That means the API key wasn't found. Check:
- ✓ The key is in `.env.local`
- ✓ You saved the file
- ✓ You restarted the dev server

---

## 🔍 Can't Find Your API Key?

If you already created a key but can't find it:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **APIs & Services** → **Credentials**
3. Look for a section called **"API keys"**
4. Find your key in the list
5. Click on it to view/copy it

---

## 🚨 Important Security Notes

⚠️ **DO NOT commit your API key to GitHub!**

The `.env.local` file should already be in your `.gitignore`, but verify:

1. Open `.gitignore` file
2. Make sure it contains: `.env.local`
3. If not there, add it

**Your key is now safe** - it won't be pushed to GitHub.

---

## 💰 Important: Set Up Budget Alerts!

To avoid unexpected charges:

1. Go to [Google Cloud Billing](https://console.cloud.google.com/billing)
2. Click **Budgets and alerts**
3. Click **Create Budget**
4. Set a monthly limit (e.g., $50)
5. Add email alerts at 50%, 90%, 100%

**Cost Estimate:**
- 500,000 characters/month = **FREE**
- Above that = $16 per million characters
- 1 hour of speech ≈ $0.24
- 100 hours/month ≈ $48-64

---

## 🎯 Quick Checklist

- [ ] Opened Google Cloud Console
- [ ] Created/selected a project
- [ ] Enabled Text-to-Speech API
- [ ] Created an API key
- [ ] Copied the API key
- [ ] Added to `.env.local`
- [ ] Restarted dev server
- [ ] See "✓ Google Cloud TTS initialized successfully"
- [ ] Set up budget alerts
- [ ] Added `.env.local` to `.gitignore` (already done)

---

## 📞 Troubleshooting

### Problem: "Can't find the Credentials page"

Solution:
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Make sure you're logged in to the correct Google account
3. Click the project dropdown and select your project
4. In the left sidebar, click **APIs & Services**
5. Click **Credentials**

### Problem: "Text-to-Speech API not showing up in search"

Solution:
1. Make sure you're in the right project
2. Click **+ Enable APIs and Services**
3. Search for exactly: **"Cloud Text-to-Speech"**
4. Click the first result
5. Click **Enable**

### Problem: "I created a key but it's not working"

Solution:
1. Check `.env.local` has the full key (starts with `AIzaSy`)
2. Restart dev server: `npm run dev`
3. Check browser console for the "✓ Google Cloud TTS initialized" message
4. Wait 10 seconds - API keys can take a moment to activate

### Problem: "API key shows as invalid"

Solution:
1. Make sure you copied the **full** key (it's very long)
2. Check there are no extra spaces before/after
3. Make sure you're using the right project
4. Try deleting and creating a new key

---

## 🔗 Quick Links

- 🎯 [Google Cloud Console](https://console.cloud.google.com)
- 🔐 [API Credentials](https://console.cloud.google.com/apis/credentials)
- 📊 [Text-to-Speech API Metrics](https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/metrics)
- 💰 [Billing Dashboard](https://console.cloud.google.com/billing)
- ⚠️ [Budget Alerts](https://console.cloud.google.com/billing/budgets)

---

## ✨ Next Steps After Setup

1. ✅ Add API key to `.env.local`
2. ⏭️ Restart dev server
3. ⏭️ Test Google Cloud TTS with the test component
4. ⏭️ Set up budget alerts
5. ⏭️ Monitor usage in the metrics dashboard

---

**Need more help?** Check:
- [GOOGLE_CLOUD_CONFIGURATION_GUIDE.md](./GOOGLE_CLOUD_CONFIGURATION_GUIDE.md)
- [GOOGLE_CLOUD_TTS_SETUP.md](./GOOGLE_CLOUD_TTS_SETUP.md)
- [Google Cloud Documentation](https://cloud.google.com/text-to-speech/docs)
