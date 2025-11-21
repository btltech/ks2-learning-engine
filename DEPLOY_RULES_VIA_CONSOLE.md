# Deploy Firestore Security Rules via Firebase Console

Since the Firebase CLI requires interactive browser authentication, here's how to deploy your rules directly through the Firebase Console:

## Quick Deploy (2 minutes)

### Step 1: Open Firebase Console
Go to: https://console.firebase.google.com/project/ks2-learning-engine/firestore/rules

### Step 2: Replace the Rules
1. Click the **"Edit Rules"** button
2. Delete all existing content
3. Copy the entire content from `/firestore.rules` file in your project
4. Paste it into the editor

### Step 3: Publish
1. Click the **"Publish"** button
2. Wait for confirmation: "Rules published successfully"
3. Done! ✅

---

## What Rules Do

Your Firestore security rules enforce:

✅ **Parent-Child Data Isolation**
- Parents can only see/edit their own children
- Students can only edit their own profile
- No cross-family access possible

✅ **Role-Based Access Control**
- Different permissions for 'parent' vs 'student' roles
- Enforced at read/write time

✅ **Immutable Activity Logs**
- Activity history cannot be deleted once logged
- Prevents tampering with records

✅ **Public Leaderboards**
- Leaderboard is readable by all authenticated users
- Only backend can update rankings

---

## After Publishing

Your app will immediately have:
- ✅ Firestore security enabled
- ✅ Real-time listeners working with protected data
- ✅ Parent monitoring dashboard fully functional
- ✅ Activity logs and leaderboards protected

All your new components will work:
- ParentActivityLog (real-time sync)
- ProgressNotifications (live updates)
- AgeGroupedLeaderboard (competitive rankings)
- SubjectProgressCharts (visual progress)

---

## Verify Deployment

After publishing:
1. Go to Firestore Database → Rules tab
2. Should show your rules (no longer default "deny all")
3. Reload your app - everything should work!

---

## Need Help?

If you get errors:
- **"Permission denied"** → Rules are working (access denied as expected)
- **"Document not found"** → Data exists but isn't accessible (check role)
- **No errors** → Rules deployed successfully! 🎉
