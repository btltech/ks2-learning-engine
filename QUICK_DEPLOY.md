# 🚀 Quick Deployment Guide - Auto Cache Clearing

## For Every Deployment:

### 1️⃣ Update Version Number
```typescript
// Edit: version.ts
export const APP_VERSION = '1.0.3'; // Change this number!
```

### 2️⃣ Build
```bash
npm run build
```

### 3️⃣ Deploy
```bash
wrangler pages deploy dist --project-name ks2-learning-engine
```

## ✨ What Happens Automatically:

- ✅ Children's iPads detect new version within 5 minutes
- ✅ Cache clears automatically (no manual action)
- ✅ App updates silently in background
- ✅ Shows brief "App updated! 🎉" notification
- ✅ User data (login, progress) preserved

## 📱 Testing:

1. Open app on iPad: `https://demiwuraks2.co.uk`
2. Wait 5 minutes OR hard refresh (Cmd+Shift+R)
3. You'll see "Updating..." then "App updated! 🎉"

## 🔢 Version Numbers:

- **Bug fix**: `1.0.2` → `1.0.3`
- **New feature**: `1.0.3` → `1.1.0`
- **Major change**: `1.1.0` → `2.0.0`

## 💡 Key Points:

- Kids **never** need to clear cache manually
- Works on **locked iPads** with parental controls
- **User data stays** - login and progress preserved
- Updates happen **automatically** - no app store
- **Silent updates** - minimal disruption to learning

## 🎯 Current Version: 1.0.2

---

**Remember**: Just change the version number in `version.ts` and deploy!
Everything else is automatic. 🎉
