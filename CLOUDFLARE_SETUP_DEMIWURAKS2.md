# Cloudflare Pages Deployment Setup for demiwuraks2.co.uk

## Your Account Information
- **Domain**: demiwuraks2.co.uk
- **Account ID**: 24b639e6bb10b1ed00866ff2b98c40da
- **Cloudflare Dashboard**: https://dash.cloudflare.com/24b639e6bb10b1ed00866ff2b98c40da/demiwuraks2.co.uk

## Quick Setup Guide

### Step 1: Create Cloudflare API Token ⏱️ (2 min)

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"** button
3. Select template: **"Edit Cloudflare Workers"** or create custom
4. Required permissions:
   - ✅ Account > Cloudflare Pages > Edit
   - ✅ Zone > Cache Purge > Purge
   - ✅ Zone > Zone > Read
5. Click **"Continue to summary"**
6. Click **"Create Token"**
7. **Copy the token** (you won't see it again!)

### Step 2: Add Secrets to GitHub 🔐 (3 min)

1. Go to: https://github.com/btltech/ks2-learning-engine/settings/secrets/actions
2. Click **"New repository secret"**

#### Add Cloudflare Credentials:
```
Name: CLOUDFLARE_API_TOKEN
Value: [PASTE TOKEN FROM STEP 1]
```
Click **"Add secret"**

```
Name: CLOUDFLARE_ACCOUNT_ID
Value: 24b639e6bb10b1ed00866ff2b98c40da
```
Click **"Add secret"**

#### Add Firebase Secrets:
Get these from your `.env.local` file:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

#### Add Gemini API:
```
VITE_GEMINI_API_KEY
```

### Step 3: Connect GitHub to Cloudflare Pages 🔗 (2 min)

1. Go to your Cloudflare dashboard: https://dash.cloudflare.com/24b639e6bb10b1ed00866ff2b98c40da/demiwuraks2.co.uk
2. Go to **"Workers & Pages"** in the left sidebar
3. Click **"Pages"** tab
4. Click **"Create application"**
5. Click **"Connect to Git"**
6. Authorize GitHub if prompted
7. Select repository: **btltech/ks2-learning-engine**
8. Select branch: **main**
9. Build settings:
   - Framework: **None**
   - Build command: **npm run build**
   - Build output directory: **dist**
10. Click **"Save and Deploy"**

### Step 4: Configure Your Domain 🌐 (2 min)

After deployment:

1. In your Cloudflare Pages project, click **"Custom domains"**
2. Add your domain:
   ```
   Option 1: www.demiwuraks2.co.uk
   Option 2: ks2-learning.demiwuraks2.co.uk
   Option 3: app.demiwuraks2.co.uk
   ```
3. If DNS records need updating, Cloudflare will show instructions
4. Wait for SSL certificate (usually <5 min)

### Step 5: Test the Deployment 🧪 (1 min)

1. Make a small test change to the code:
   ```bash
   echo "// test" >> App.tsx
   git add App.tsx
   git commit -m "test: trigger deployment"
   git push origin main
   ```

2. Go to: https://github.com/btltech/ks2-learning-engine/actions
3. Watch the "Deploy to Cloudflare Pages" workflow run
4. Once complete, visit your domain to see the live site!

---

## 📊 After Successful Deployment

### Monitor Your Site
- **Dashboard**: https://dash.cloudflare.com/24b639e6bb10b1ed00866ff2b98c40da/demiwuraks2.co.uk
- **Pages Project**: Workers & Pages → Pages → ks2-learning-engine
- **View Analytics**: See traffic, performance, and errors

### What's Included
✅ **Automatic HTTPS** - Free SSL certificate  
✅ **Global CDN** - Content from edge servers worldwide  
✅ **DDoS Protection** - Built-in security  
✅ **HTTP/3 Support** - Faster connections  
✅ **Auto-Minification** - Optimized assets  
✅ **Automatic Deployments** - Every git push deploys  

### Domain Options

You can deploy to any of these:

1. **Root Domain**
   - URL: demiwuraks2.co.uk
   - DNS: Add CNAME `demiwuraks2.co.uk` → `ks2-learning-engine.pages.dev`

2. **Subdomain (Recommended for App)**
   - URL: app.demiwuraks2.co.uk
   - DNS: Add CNAME `app` → `ks2-learning-engine.pages.dev`

3. **WWW Subdomain**
   - URL: www.demiwuraks2.co.uk
   - DNS: Add CNAME `www` → `ks2-learning-engine.pages.dev`

---

## 🔧 DNS Setup (If Needed)

If Cloudflare asks for DNS changes:

1. Go to: https://dash.cloudflare.com/24b639e6bb10b1ed00866ff2b98c40da/demiwuraks2.co.uk
2. Click **"DNS"** in left sidebar
3. Click **"Add record"**
4. Select: **CNAME**
5. Name: `app` (or your chosen subdomain)
6. Target: `ks2-learning-engine.pages.dev`
7. Proxy status: **Proxied** (orange cloud)
8. Click **"Save"**

---

## ✅ Quick Checklist

- [ ] Created Cloudflare API Token
- [ ] Added CLOUDFLARE_API_TOKEN to GitHub Secrets
- [ ] Added CLOUDFLARE_ACCOUNT_ID to GitHub Secrets (24b639e6bb10b1ed00866ff2b98c40da)
- [ ] Added all VITE_* environment variables to GitHub Secrets
- [ ] Connected GitHub repository to Cloudflare Pages
- [ ] Configured custom domain in Cloudflare Pages
- [ ] Tested deployment with git push
- [ ] Verified site is live at demiwuraks2.co.uk (or your chosen subdomain)

---

## 🆘 Troubleshooting

### "Deployment failed" in GitHub Actions
1. Check GitHub Actions logs: https://github.com/btltech/ks2-learning-engine/actions
2. Look for "Deploy to Cloudflare Pages" step
3. Common issues:
   - Missing `CLOUDFLARE_API_TOKEN` → Add to GitHub Secrets
   - Missing `CLOUDFLARE_ACCOUNT_ID` → Add 24b639e6bb10b1ed00866ff2b98c40da
   - `npm run build` fails → Test locally with `npm run build`

### "Site not loading" 
1. Wait 5-10 minutes for DNS propagation
2. Check Cloudflare dashboard for deployment status
3. Verify SSL certificate is provisioned (green checkmark)
4. Clear browser cache (Ctrl+Shift+Delete)

### "Wrong content showing"
1. Hard refresh page (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
2. Check Cloudflare cache: go to Caching → Purge Cache
3. Visit: https://dash.cloudflare.com/24b639e6bb10b1ed00866ff2b98c40da/demiwuraks2.co.uk/caching/cache-purge

### Build fails locally
```bash
# Clean and reinstall
rm -rf node_modules dist
npm install
npm run build
```

---

## 📝 Environment Variables Needed

Add these to GitHub Secrets:

```
✅ CLOUDFLARE_API_TOKEN = [your API token]
✅ CLOUDFLARE_ACCOUNT_ID = 24b639e6bb10b1ed00866ff2b98c40da

✅ VITE_FIREBASE_API_KEY = [from .env.local]
✅ VITE_FIREBASE_AUTH_DOMAIN = [from .env.local]
✅ VITE_FIREBASE_PROJECT_ID = [from .env.local]
✅ VITE_FIREBASE_STORAGE_BUCKET = [from .env.local]
✅ VITE_FIREBASE_MESSAGING_SENDER_ID = [from .env.local]
✅ VITE_FIREBASE_APP_ID = [from .env.local]

✅ VITE_GEMINI_API_KEY = [from .env.local]
```

---

## 🎯 Next Steps After Going Live

1. **Monitor Performance**
   - Check Cloudflare Analytics
   - Monitor error rates
   - Review API response times

2. **Test Features**
   - Login as student
   - Login as parent
   - Take a quiz
   - Check parent dashboard
   - Test all AI features

3. **Optimize**
   - Enable caching rules
   - Set cache TTL
   - Optimize images
   - Monitor bundle size

4. **Security**
   - Review Firestore security rules
   - Test API rate limiting
   - Monitor for suspicious activity

---

## 📞 Support Resources

- **Cloudflare Docs**: https://developers.cloudflare.com/pages/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/cli-wrangler/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Firebase**: https://firebase.google.com/docs

---

**Setup Date**: November 21, 2025  
**Domain**: demiwuraks2.co.uk  
**Account ID**: 24b639e6bb10b1ed00866ff2b98c40da  
**Status**: Ready for Cloudflare Pages deployment
