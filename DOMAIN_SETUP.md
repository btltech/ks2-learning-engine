# Linking demiwuraks2.co.uk to GitHub Pages

This guide will help you connect your custom domain hosted on Cloudflare to your KS2 Learning Engine GitHub Pages.

## **Step 1: Set Up GitHub Pages (Automated)**

Since you have a custom domain (not a subdomain of github.io), follow these steps:

### 1.1 Build the Project

```bash
npm run build
```

This creates a `dist/` folder with your built app.

### 1.2 Create GitHub Pages Deployment Workflow

We'll create an automated deployment that publishes to GitHub Pages whenever you push to main.

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v3

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: 'dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

### 1.3 Enable GitHub Pages in Repository Settings

1. Go to https://github.com/btltech/ks2-learning-engine/settings/pages
2. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - This enables automatic deployment

## **Step 2: Configure Your Custom Domain on GitHub**

### 2.1 Add Custom Domain to GitHub

1. Go to https://github.com/btltech/ks2-learning-engine/settings/pages
2. Under "Custom domain":
   - Enter: `demiwuraks2.co.uk`
   - Click "Save"

GitHub will create a `CNAME` file in your repository with this entry.

### 2.2 Commit the CNAME File

The CNAME file will be automatically created. Pull the changes:

```bash
git pull origin main
git push origin main
```

## **Step 3: Configure Cloudflare DNS**

This is the crucial part. You need to point your Cloudflare DNS to GitHub's servers.

### 3.1 Log in to Cloudflare

1. Go to https://dash.cloudflare.com
2. Select your domain: `demiwuraks2.co.uk`
3. Go to **DNS** tab

### 3.2 Remove Existing DNS Records (if any)

Delete any A records or CNAME records pointing to old hosts (except email-related records).

### 3.3 Add GitHub Pages DNS Records

You need to add GitHub's IP addresses. Add these **A records**:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**Steps:**
1. Click "Add record"
2. Type: **A**
3. Name: **@** (apex domain)
4. IPv4 address: `185.199.108.153`
5. TTL: Auto
6. Proxy status: **Proxied** (orange cloud)
7. Click Save

Repeat for the other 3 IP addresses.

### 3.4 Add CNAME Record (Optional but Recommended)

For the `www` subdomain:

1. Click "Add record"
2. Type: **CNAME**
3. Name: **www**
4. Target: `btltech.github.io`
5. TTL: Auto
6. Proxy status: **Proxied** (orange cloud)
7. Click Save

### 3.5 Verify DNS Records

Your DNS records should look like:

```
Type    Name        Content                 Proxy
A       @           185.199.108.153        Proxied
A       @           185.199.109.153        Proxied
A       @           185.199.110.153        Proxied
A       @           185.199.111.153        Proxied
CNAME   www         btltech.github.io      Proxied
```

## **Step 4: Wait for DNS Propagation**

DNS changes can take 15 minutes to 48 hours to propagate globally.

**Check status:**

```bash
# Check if DNS is pointing to GitHub
nslookup demiwuraks2.co.uk

# Should show the GitHub IP addresses:
# 185.199.108.153
# 185.199.109.153
# 185.199.110.153
# 185.199.111.153
```

Or use online tools:
- https://www.whatsmydns.net/
- https://dns.google/

## **Step 5: Enable HTTPS (Automatic)**

Once DNS is configured:

1. Go back to GitHub Pages settings
2. Check "Enforce HTTPS" ✓
3. Wait a few minutes for the SSL certificate to be issued

## **Step 6: Verify the Deployment**

Once everything is set up:

```bash
# Test the domain
curl -I https://demiwuraks2.co.uk

# Should respond with 200 OK and show GitHub Pages headers
```

Visit https://demiwuraks2.co.uk in your browser to verify!

## **Troubleshooting**

### Domain shows GitHub 404

- Wait longer for DNS propagation (up to 48 hours)
- Check Cloudflare DNS records are correct
- Verify CNAME file exists in your repository

### HTTPS certificate not issuing

- Ensure DNS is pointing to GitHub first
- Wait 15-30 minutes for certificate issuance
- Check GitHub Pages settings → no errors

### Domain redirects to github.io

- Check Cloudflare SSL/TLS is not interfering
- Set SSL/TLS mode to "Flexible" temporarily to test

### Check what GitHub sees

Visit: https://github.com/btltech/ks2-learning-engine/settings/pages

Should show:
```
✓ Your site is published at https://demiwuraks2.co.uk/
```

## **Automatic Deployments**

Now whenever you push to `main`:

1. GitHub Actions builds your app
2. Deploys to GitHub Pages
3. Your domain `demiwuraks2.co.uk` serves the latest version

**Example workflow:**

```bash
# Make changes to your code
git add .
git commit -m "feat: Add new feature"
git push origin main

# GitHub Actions automatically:
# 1. Runs tests (npm test)
# 2. Builds the app (npm run build)
# 3. Deploys to GitHub Pages
# 4. Available at demiwuraks2.co.uk within minutes
```

## **Environment Variables**

If you need API keys for Gemini or Firebase in production:

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add your secrets:
   - `VITE_GEMINI_API_KEY`
   - Firebase config (as JSON)
3. Update `.github/workflows/deploy.yml` to use them:

```yaml
- name: Build
  env:
    VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
  run: npm run build
```

## **Need Help?**

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Cloudflare DNS Guide](https://developers.cloudflare.com/dns/)
- [Custom Domain with GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

Once done, your KS2 Learning Engine will be live at **demiwuraks2.co.uk** 🚀
