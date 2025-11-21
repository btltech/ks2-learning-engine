# Cloudflare Pages Deployment Guide

## 🚀 Quick Start

This application is configured for deployment to Cloudflare Pages with automatic deployments on every push to main.

## Prerequisites

1. **Cloudflare Account** - Sign up at https://dash.cloudflare.com
2. **Domain** - Already added to Cloudflare
3. **GitHub Repository** - Connected to Cloudflare
4. **API Tokens** - Created in Cloudflare dashboard

## Setup Steps

### Step 1: Get Cloudflare Credentials

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Create new token with these permissions:
   - **Account** → Cloudflare Pages → Edit
   - **Account** → Workers Scripts → Edit
   - **Zone** → Cache Purge → Purge
   - **Zone** → Zone → Read

3. Copy the token (you'll need it in Step 2)

4. Go to https://dash.cloudflare.com/profile/account-id
5. Copy your Account ID

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions → New repository secret
3. Add these secrets:

```
CLOUDFLARE_API_TOKEN = [token from Step 1]
CLOUDFLARE_ACCOUNT_ID = [account ID from Step 1]
VITE_FIREBASE_API_KEY = [your Firebase API key]
VITE_FIREBASE_AUTH_DOMAIN = [your Firebase auth domain]
VITE_FIREBASE_PROJECT_ID = [your Firebase project ID]
VITE_FIREBASE_STORAGE_BUCKET = [your Firebase storage bucket]
VITE_FIREBASE_MESSAGING_SENDER_ID = [your Firebase sender ID]
VITE_FIREBASE_APP_ID = [your Firebase app ID]
VITE_GEMINI_API_KEY = [your Gemini API key]
```

### Step 3: Connect Domain to Cloudflare Pages

1. Go to https://dash.cloudflare.com/
2. Select your zone (domain)
3. Go to Workers & Pages → Pages → Create application
4. Connect your GitHub repository
5. Select the branch to deploy (usually `main`)
6. Build settings:
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
7. Click Deploy!

### Step 4: Configure Domain

1. In Cloudflare dashboard, go to DNS records
2. Add a CNAME record:
   - **Name**: `ks2-learning` (or your subdomain)
   - **Target**: `[your-project].pages.dev`
   - **Proxy status**: Proxied (orange cloud)

## Deployment

### Automatic Deployment
- Every push to `main` branch automatically deploys to production
- Every pull request gets a preview deployment
- GitHub Actions workflow runs the build and deploys to Cloudflare

### Manual Deployment

To manually deploy:

```bash
# Install Wrangler CLI
npm install -g wrangler

# Authenticate
wrangler login

# Deploy
wrangler pages deploy dist/ --project-name=ks2-learning-engine
```

## Environment Variables

The following environment variables are required:

### Firebase Config
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

### AI Config
- `VITE_GEMINI_API_KEY` - Google Gemini API key

## Build Configuration

### Build Command
```bash
npm run build
```

This creates optimized production build in `dist/` directory

### Build Output
- Static HTML/CSS/JS files
- Optimized bundle with tree-shaking
- Source maps for debugging
- Zero-runtime dependencies

## Performance Optimization

Cloudflare Pages provides:
- ✅ Global CDN - Content served from edge servers worldwide
- ✅ HTTP/3 - Faster page loads
- ✅ Automatic HTTPS - Free SSL certificate
- ✅ Caching - Intelligent cache headers
- ✅ Analytics - Built-in performance monitoring

## Monitoring

### Cloudflare Analytics
- Go to Workers & Pages → Pages → Select your project
- View:
  - Deployments and rollback history
  - Request analytics
  - Performance metrics
  - Error logs

### GitHub Actions
- Go to GitHub repository → Actions
- Monitor deployment status
- View build logs
- See deployment history

## Troubleshooting

### Build Fails
1. Check GitHub Actions logs
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Check for TypeScript errors: `npm run build`

### Site Not Loading
1. Wait 5-10 minutes for DNS propagation
2. Check Cloudflare DNS records are correct
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check status on status.cloudflare.com

### Performance Issues
1. Check Cloudflare Analytics
2. View Request Performance in Cloudflare dashboard
3. Check Firebase API response times
4. Monitor Gemini API latency

### API Key Issues
1. Verify all secrets are added to GitHub
2. Check secrets are spelled correctly
3. Verify keys have correct permissions
4. Check keys aren't rate limited

## Rollback

### Automatic Rollback
1. Go to Cloudflare Pages project
2. View Deployments
3. Click the previous successful deployment
4. Click "Rollback to this Deployment"

### Manual Rollback
```bash
git revert [commit-hash]
git push origin main
# New deployment will use reverted code
```

## Custom Domain Setup

### Add Custom Domain
1. In Cloudflare Pages, go to Custom domains
2. Add your domain (e.g., ks2-learning.com)
3. Add CNAME record if not already present

### SSL Certificate
- Automatically provisioned by Cloudflare
- Valid for all subdomains
- Auto-renews before expiration

## API Rate Limits

### Firebase
- Standard plan allows ~1000 reads/writes per second
- Monitor usage in Firebase console

### Gemini API
- Free tier has rate limits
- Purchase quota if needed
- Monitor in Google Cloud Console

## Security

✅ **HTTPS Enforcement** - All traffic encrypted
✅ **DDoS Protection** - Cloudflare's distributed network
✅ **API Key Protection** - Stored in GitHub Secrets
✅ **Firestore Rules** - Database-level security
✅ **CORS** - Configured for specific origins
✅ **Content Security Policy** - Prevents XSS attacks

## Support

### Resources
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/cli-wrangler/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Firebase Docs](https://firebase.google.com/docs)

### Contact
- Cloudflare Support: https://support.cloudflare.com
- GitHub Support: https://support.github.com
- Firebase Support: https://firebase.google.com/support

## Next Steps

1. ✅ Create Cloudflare API token
2. ✅ Add GitHub secrets
3. ✅ Connect GitHub repository to Cloudflare Pages
4. ✅ Configure custom domain
5. ✅ Test deployment pipeline
6. ✅ Monitor first production deployment
7. ✅ Set up uptime monitoring
8. ✅ Configure analytics

---

**Domain**: Your custom domain configured in Cloudflare  
**Status**: Ready for automatic deployment  
**Last Updated**: November 21, 2025
