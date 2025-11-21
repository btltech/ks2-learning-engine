# Firebase Deployment Guide

## Prerequisites

✅ Firebase CLI installed: `firebase-tools@14.25.1`

## Step 1: Initialize Firebase (One-time setup)

### Option A: If you have an existing Firebase project
```bash
firebase login
firebase init firestore
```

### Option B: If you need to create a new Firebase project
1. Go to https://console.firebase.google.com
2. Click "Create Project"
3. Enter project name: `ks2-learning-engine`
4. Skip Google Analytics (or enable as desired)
5. Create the project
6. Note your **Project ID**

Then run:
```bash
firebase login
firebase init firestore --project YOUR_PROJECT_ID
```

## Step 2: Deploy Firestore Security Rules

### Deploy rules to your Firebase project
```bash
firebase deploy --only firestore:rules
```

### Expected Output
```
=== Deploying to 'your-project-id'...

i  deploying firestore
i  cloud firestore rules uploaded successfully

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project-id/overview
```

## Step 3: Verify Rules Deployed

1. Go to https://console.firebase.google.com
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Verify your rules are displayed (should match `firestore.rules` file)

## Troubleshooting

### "Error: Failed to authenticate, have you run firebase login?"
**Solution:** Run `firebase login` and follow the browser prompt to authorize

### "Error: Could not find project"
**Solution:** Create `.firebaserc` file:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

Then deploy:
```bash
firebase deploy --only firestore:rules
```

### "Error: permission-denied: Missing or insufficient permissions"
**Solution:** Go to Firebase Console → Project Settings → Service Accounts → Enable Admin SDK, then run `firebase login` again

## Alternative: Deploy via Firebase Console

If CLI deployment doesn't work:

1. Go to https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/rules
2. Click **Edit Rules** button
3. Copy content from `firestore.rules` file
4. Paste into the editor
5. Click **Publish**

## Local Testing (Before Production)

Test rules locally without deploying:
```bash
firebase emulators:start
```

This will:
- Start Firestore emulator
- Start Auth emulator
- Load your rules
- Show emulator UI at http://localhost:4000

Run tests:
```bash
npm test
```

## Next Steps

After deploying rules:

1. ✅ Rules are live and protecting your data
2. Update `firebaseAuthService.ts` with your Firebase config (if not already set)
3. Test multi-device synchronization
4. Monitor Firestore usage in Firebase Console
5. Set up Firestore backups (optional, in settings)

## Quick Reference

```bash
# Check current project
firebase use

# List all projects
firebase projects:list

# Switch project
firebase use my-project-id

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy

# View deployment logs
firebase deploy --debug
```

---

**For your KS2 Learning Engine project:**
Your rules file is ready at: `/firestore.rules`
