# 🚀 Cloudflare Pages Deployment Checklist

## Quick Setup (5-10 minutes)

### Step 1: Cloudflare API Token (2 min)
- [ ] Go to: https://dash.cloudflare.com/profile/api-tokens
- [ ] Click "Create Token"
- [ ] Choose "Edit Cloudflare Workers" template (or custom)
- [ ] Permissions needed:
  - [ ] Account > Cloudflare Pages > Edit
  - [ ] Zone > Cache Purge > Purge
  - [ ] Zone > Zone > Read
- [ ] Copy the token
- [ ] Test token works (optional)

### Step 2: Cloudflare Account ID (1 min)
- [ ] Go to: https://dash.cloudflare.com/profile/account-id
- [ ] Copy your Account ID
- [ ] Save for next step

### Step 3: Add GitHub Secrets (2 min)
- [ ] Go to: https://github.com/btltech/ks2-learning-engine/settings/secrets/actions
- [ ] Click "New repository secret"
- [ ] Add `CLOUDFLARE_API_TOKEN`:
  - [ ] Name: `CLOUDFLARE_API_TOKEN`
  - [ ] Value: [paste token from Step 1]
  - [ ] Click "Add secret"
- [ ] Add `CLOUDFLARE_ACCOUNT_ID`:
  - [ ] Name: `CLOUDFLARE_ACCOUNT_ID`
  - [ ] Value: [paste ID from Step 2]
  - [ ] Click "Add secret"

### Step 4: Firebase Secrets (2 min)
Add these from your `.env.local` file:
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`

### Step 5: Gemini API Secret (1 min)
- [ ] `VITE_GEMINI_API_KEY`

### Step 6: Connect to Cloudflare (2 min)
- [ ] Go to: https://dash.cloudflare.com
- [ ] Select your zone (domain)
- [ ] Go to "Workers & Pages" → "Pages"
- [ ] Click "Create application" → "Connect to Git"
- [ ] Select repository: `btltech/ks2-learning-engine`
- [ ] Select branch: `main`
- [ ] Build settings:
  - [ ] Build command: `npm run build`
  - [ ] Build output directory: `dist`
- [ ] Click "Save and Deploy"

### Step 7: Configure Custom Domain (1 min)
- [ ] In Cloudflare Pages project, click "Custom domains"
- [ ] Add your domain (e.g., `ks2-learning.com`)
- [ ] Verify DNS records are correct
- [ ] Wait for SSL certificate (usually <5 min)

### Step 8: Test Deployment (2 min)
- [ ] Make a small change to a file
- [ ] Push to GitHub: `git push origin main`
- [ ] Go to GitHub → Actions
- [ ] Watch deployment workflow run
- [ ] Check Cloudflare dashboard for successful deployment
- [ ] Visit your domain to verify live site

---

## ✅ Deployment Complete!

Once all steps are done:
- ✅ **Automatic Deployments** - Every push to main deploys automatically
- ✅ **Preview Deployments** - Every PR gets a preview URL
- ✅ **Global CDN** - Content served from edge servers worldwide
- ✅ **HTTPS** - Free SSL certificate for your domain
- ✅ **Analytics** - Built-in performance monitoring

---

## 🔧 After Deployment

### Monitor Deployments
1. Go to: https://dash.cloudflare.com/
2. Select your zone
3. Go to "Workers & Pages" → "Pages" → "ks2-learning-engine"
4. View:
   - Deployment history
   - Build logs
   - Traffic analytics
   - Performance metrics

### Set Up Analytics
- [ ] Enable Cloudflare Analytics
- [ ] Enable Google Analytics (optional)
- [ ] Set up error tracking
- [ ] Configure uptime monitoring

### Performance Optimization
- [ ] Enable Brotli compression
- [ ] Enable Auto Minify (CSS/JS/HTML)
- [ ] Configure caching rules
- [ ] Enable HTTP/3 (QUIC)

---

## 🆘 Troubleshooting

### Deployment Failed?
1. Check GitHub Actions logs:
   - Go to: https://github.com/btltech/ks2-learning-engine/actions
   - Click the failed workflow
   - Expand "Deploy to Cloudflare Pages" step
   - Check error message

2. Common issues:
   - ❌ "API token invalid" → Verify token in GitHub Secrets
   - ❌ "Account ID missing" → Add CLOUDFLARE_ACCOUNT_ID secret
   - ❌ "Build failed" → Check `npm run build` works locally
   - ❌ "Environment variables missing" → Add all VITE_* secrets

### Site Not Loading?
1. Check domain configuration:
   - [ ] DNS records point to Cloudflare
   - [ ] CNAME record exists for subdomain
   - [ ] Wait 5-10 min for DNS propagation

2. Check Cloudflare:
   - [ ] Custom domain is active
   - [ ] SSL certificate is provisioned (green checkmark)
   - [ ] Page rules allow the route

### Build Fails Locally?
```bash
# Clear cache
rm -rf node_modules dist

# Reinstall
npm install

# Build again
npm run build
```

---

## 📚 Useful Links

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler Docs](https://developers.cloudflare.com/workers/cli-wrangler/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Cloudflare Support](https://support.cloudflare.com)

---

## 📊 After Going Live

### First Week
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Test all features work
- [ ] Verify API connections

### Weekly
- [ ] Review analytics
- [ ] Monitor uptime
- [ ] Check build times
- [ ] Update documentation

### Monthly
- [ ] Review performance trends
- [ ] Optimize slow endpoints
- [ ] Update dependencies
- [ ] Plan improvements

---

**Status**: Ready for deployment  
**Last Updated**: November 21, 2025  
**Domain**: [Your custom domain]
