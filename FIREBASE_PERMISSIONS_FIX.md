# Firebase Permissions Fix - Leaderboard Write Error

## Problem
The app is getting this error:
```
FirebaseError: Missing or insufficient permissions.
```

This happens when trying to submit scores to the leaderboard in Firestore.

## Root Cause
Your Firestore security rules don't allow the app to write to the `leaderboard` collection. The current rules are likely too restrictive.

## Solution: Update Firestore Security Rules

### Step 1: Go to Firebase Console
1. Visit https://console.firebase.google.com
2. Select your project: **ks2-learning-engine**
3. Go to **Firestore Database** → **Rules** tab

### Step 2: Replace Your Rules

Replace your entire rules with this configuration:

```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow anyone to read leaderboard
    match /leaderboard/{document=**} {
      allow read: if true;
      allow write: if true;  // Allow score submissions from app
    }

    // Allow authenticated users to read/write their own data
    match /users/{uid} {
      allow read: if true;
      allow write: if request.auth.uid == uid;
    }

    // Allow authenticated users to read/write their own progress
    match /progress/{uid}/{document=**} {
      allow read: if request.auth.uid == uid;
      allow write: if request.auth.uid == uid;
    }

    // Deny everything else
    match /{document=**} {
      allow read: if false;
      allow write: if false;
    }
  }
}
```

### Step 3: Publish the Rules
1. Click **Publish** button
2. Confirm the update

### Step 4: Test
- Go back to your app
- Hard refresh (Cmd+Shift+R)
- Complete a quiz and submit your score
- Check if the error disappears

## Security Notes

### For Production (Recommended)
If you want better security, use this stricter version that allows authenticated users to write their scores:

```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Public leaderboard - anyone can read, authenticated users can write
    match /leaderboard/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;  // User can only write their own score
    }

    // User data - only they can access
    match /users/{uid} {
      allow read: if request.auth.uid == uid || true;  // Can be public or private
      allow write: if request.auth.uid == uid;
    }

    // Progress data - only the user can access
    match /progress/{uid}/{document=**} {
      allow read: if request.auth.uid == uid;
      allow write: if request.auth.uid == uid;
    }

    // Deny everything else by default
    match /{document=**} {
      allow read: if false;
      allow write: if false;
    }
  }
}
```

## Troubleshooting

**If scores still don't submit:**
1. Check browser console for errors
2. Verify your Firebase API Key is correct in `.env.local`
3. Ensure the `leaderboard` collection exists (create it manually if needed)

**If you see "net::ERR_BLOCKED_BY_CLIENT":**
- This usually means an ad blocker or privacy extension is blocking Firebase
- Ask users to add an exception for your domain

## Testing the Leaderboard

After fixing permissions:
1. Complete a quiz
2. Submit your score
3. Check the browser console - should see no errors
4. Go to Firebase Console → Firestore → leaderboard collection
5. You should see your new score entry

## Related Files
- Firebase config: `/services/firebase.ts`
- Leaderboard service: `/services/leaderboardService.ts`
- User context: `/context/UserContext.tsx` (calls submitScore)

