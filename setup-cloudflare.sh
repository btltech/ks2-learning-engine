#!/bin/bash

# Quick Setup Script for Cloudflare Pages Deployment
# This script helps you set up automatic deployments to Cloudflare Pages

echo "🚀 Cloudflare Pages Deployment Setup"
echo "===================================="
echo ""

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI..."
    npm install -g wrangler
fi

echo ""
echo "📋 Setup Instructions:"
echo "====================="
echo ""
echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
echo "   → Create API Token"
echo "   → Copy the token"
echo ""
echo "2. Go to: https://github.com/btltech/ks2-learning-engine/settings/secrets/actions"
echo "   → Add these secrets:"
echo ""
echo "   CLOUDFLARE_API_TOKEN = [paste token from step 1]"
echo ""
echo "   CLOUDFLARE_ACCOUNT_ID = [from https://dash.cloudflare.com/profile/account-id]"
echo ""
echo "3. Firebase Secrets:"
echo "   VITE_FIREBASE_API_KEY"
echo "   VITE_FIREBASE_AUTH_DOMAIN"
echo "   VITE_FIREBASE_PROJECT_ID"
echo "   VITE_FIREBASE_STORAGE_BUCKET"
echo "   VITE_FIREBASE_MESSAGING_SENDER_ID"
echo "   VITE_FIREBASE_APP_ID"
echo ""
echo "4. AI Secrets:"
echo "   VITE_GEMINI_API_KEY"
echo ""
echo "5. In Cloudflare Dashboard:"
echo "   → Go to Workers & Pages → Pages"
echo "   → Click 'Create application' → 'Connect to Git'"
echo "   → Select: btltech/ks2-learning-engine"
echo "   → Build settings:"
echo "      • Build command: npm run build"
echo "      • Build output directory: dist"
echo "   → Deploy!"
echo ""
echo "✅ After setup, every push to main will auto-deploy!"
echo ""
