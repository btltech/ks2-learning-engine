# Automatic Cache Clearing for Children's Devices

## 🎯 Problem Solved

Children using iPads and tablets with parental controls can't manually clear cache. This system **automatically** clears cache and updates the app when you deploy new versions.

## 🚀 How It Works

### 1. **Version-Based Cache Busting**
- Every deployment includes a version number
- When a child's device detects a new version, it:
  - Clears all caches automatically
  - Downloads fresh files
  - Shows a brief "App updated! 🎉" message
  - Reloads with new version

### 2. **Automatic Update Detection**
- Checks for updates every 5 minutes
- No manual action needed from children
- Works even on locked-down school iPads

### 3. **Service Worker Management**
- Uses `skipWaiting: true` for immediate updates
- Old service workers are replaced instantly
- No need to close/reopen app

## 📝 Deployment Process

### When You Deploy Changes:

1. **Update Version Number** (IMPORTANT!)
   ```typescript
   // Edit: src/version.ts
   export const APP_VERSION = '1.0.3'; // Increment this!
   ```

2. **Build**
   ```bash
   npm run build
   ```
   This automatically:
   - Builds the app
   - Generates `dist/version.json`
   - Packages everything

3. **Deploy to Cloudflare**
   ```bash
   wrangler pages deploy dist --project-name ks2-learning-engine
   ```

4. **That's It!**
   - Children's devices will auto-update within 5 minutes
   - No manual cache clearing needed
   - Updates happen silently in background

## 🔄 What Happens on Child's Device

```
1. App checks for updates (every 5 minutes)
   ↓
2. Detects new version number
   ↓
3. Shows "Updating..." notification
   ↓
4. Clears all caches automatically
   ↓
5. Downloads new version
   ↓
6. Reloads page automatically
   ↓
7. Shows "App updated! 🎉" briefly
```

## 📋 Quick Reference

### Version Number Convention
- **Major changes**: `1.0.0` → `2.0.0`
- **New features**: `1.0.0` → `1.1.0`
- **Bug fixes**: `1.0.0` → `1.0.1`

### Files Modified
- `src/version.ts` - Version number (UPDATE THIS!)
- `src/services/versionService.ts` - Auto-update logic
- `dist/version.json` - Auto-generated on build

### What Gets Cleared Automatically
✅ Service Worker caches  
✅ Browser caches (images, CSS, JS)  
✅ localStorage (except user data)  
✅ sessionStorage  
✅ Old service workers  

### What's Preserved
✅ User login data (`ks2_user`)  
✅ Settings (`ks2_settings`)  
✅ Quiz progress (in Firestore)  

## 🧪 Testing

### Test Auto-Update Locally:
1. Build and deploy version `1.0.2`
2. Open app on device
3. Update version to `1.0.3` in `src/version.ts`
4. Build and deploy again
5. Wait 5 minutes (or hard refresh)
6. Device will show "Updating..." then "App updated! 🎉"

### Force Immediate Update (Debug):
```javascript
// In browser console:
await versionService.forceUpdate();
```

## 🔧 Troubleshooting

### "Updates not appearing?"
1. Check version number was incremented
2. Verify `dist/version.json` was generated
3. Ensure new version was deployed
4. Wait 5 minutes for auto-check
5. Try hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

### "Still seeing old version?"
- Browser may have cached old service worker
- Solution: Close all tabs, wait 30 seconds, reopen
- Or use incognito/private mode to test

### "Version number not updating?"
- Make sure you edited `src/version.ts`
- Run `npm run build` (not just `vite build`)
- Check that `scripts/generate-version.mjs` ran

## 🎓 For Developers

### Architecture
```
src/version.ts (source of truth)
    ↓
build process
    ↓
dist/version.json (deployed file)
    ↓
versionService.ts (checks & updates)
    ↓
User's device (auto-clears cache)
```

### Key Features
- **No user action required** - Perfect for children
- **Preserves user data** - Login stays intact
- **Silent updates** - Minimal disruption
- **Works on restricted devices** - No manual cache clearing
- **Periodic checks** - Catches updates within minutes

## 📱 Device Compatibility

✅ iOS Safari (iPads, iPhones)  
✅ Chrome on Android tablets  
✅ Desktop browsers (Chrome, Firefox, Safari, Edge)  
✅ PWA (installed as app)  
✅ Devices with parental controls/MDM  

## 🎉 Benefits

1. **Zero friction** - Kids don't see update process
2. **Always current** - No stale versions in schools
3. **Bug fixes deploy instantly** - Critical fixes reach users fast
4. **Works on locked devices** - No admin access needed
5. **Preserves progress** - User data intact across updates

## 📊 Monitoring

Check browser console for version logs:
```
[Version] New version detected: 1.0.2 → 1.0.3
[Version] Deleting cache: workbox-precache-v2
[Version] All caches cleared successfully
[Version] Server update detected: 1.0.2 → 1.0.3
```

---

**Remember**: Just update `src/version.ts` and deploy. Everything else is automatic! 🚀
