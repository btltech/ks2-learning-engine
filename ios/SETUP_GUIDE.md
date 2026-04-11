# iOS App Setup Guide

## 🎯 Complete Setup Instructions

This guide will help you create the Xcode project and configure everything needed to build the iOS app.

---

## Step 1: Create Xcode Project

### Option A: Using Xcode GUI (Recommended)

1. **Open Xcode**
2. **File → New → Project**
3. **Choose Template**: iOS → App
4. **Configure Project**:
   - Product Name: `KS2LearningEngine`
   - Team: Your Apple Developer Team
   - Organization Identifier: `com.yourcompany.ks2`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Storage: **None** (we'll use UserDefaults + Firebase)
   - Include Tests: ✅ Yes
5. **Save Location**: `ios/` folder in your project

### Option B: Using Command Line

```bash
cd ios
mkdir -p KS2LearningEngine.xcodeproj
# Then open Xcode and import existing files
```

---

## Step 2: Organize Project Files

### File Structure in Xcode

Create **Groups** (yellow folders) in Xcode:

```
KS2LearningEngine/
├── App/
│   ├── KS2LearningEngineApp.swift
│   └── ContentView.swift
├── Models/
│   ├── User.swift
│   ├── Quiz.swift
│   ├── AdaptiveLearning.swift
│   └── Recommendation.swift
├── Services/
│   ├── AuthenticationManager.swift
│   ├── AdaptiveLearningEngine.swift
│   ├── RecommendationsEngine.swift
│   ├── QuizManager.swift
│   ├── ProgressTracker.swift
│   └── UserPreferences.swift
├── Views/
│   ├── Auth/
│   │   └── LoginView.swift
│   ├── Student/
│   │   ├── HomeView.swift
│   │   ├── AdaptiveDashboardView.swift
│   │   └── ProfileView.swift
│   └── Teacher/
│       └── TeacherDashboardView.swift
├── Utils/
│   └── Extensions.swift
└── Resources/
    ├── Assets.xcassets
    ├── GoogleService-Info.plist
    └── Info.plist
```

**Drag and drop** all the `.swift` files you created into the appropriate groups.

---

## Step 3: Add Firebase SDK

### Using Swift Package Manager (Recommended)

1. **In Xcode**: File → Add Packages
2. **Enter URL**: `https://github.com/firebase/firebase-ios-sdk`
3. **Version**: Up to Next Major (10.0.0 or latest)
4. **Add Packages**:
   - ✅ FirebaseAuth
   - ✅ FirebaseFirestore
   - ✅ FirebaseAnalytics
5. **Add to Target**: KS2LearningEngine

### Verify Installation

Check `Package Dependencies` in Xcode project navigator shows Firebase packages.

---

## Step 4: Firebase Configuration

### 4.1: Download Config File

1. **Go to**: [Firebase Console](https://console.firebase.google.com)
2. **Select Project**: ks2-learning-engine
3. **Project Settings** → **General**
4. **Your Apps** → **iOS** → **Add App** (if not exists)
5. **Bundle ID**: `com.yourcompany.ks2.KS2LearningEngine`
6. **Download**: `GoogleService-Info.plist`

### 4.2: Add to Xcode

1. **Drag** `GoogleService-Info.plist` into Xcode
2. **Options**:
   - ✅ Copy items if needed
   - ✅ Create groups
   - ✅ Add to targets: KS2LearningEngine
3. **Verify**: File appears in Project Navigator

### 4.3: Configure Info.plist

Add these keys to `Info.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- App Name -->
    <key>CFBundleDisplayName</key>
    <string>KS2 Learning</string>
    
    <!-- Privacy Descriptions -->
    <key>NSCameraUsageDescription</key>
    <string>We need camera access for profile pictures</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>We need photo library access for profile pictures</string>
    
    <!-- Firebase URL Schemes -->
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>com.googleusercontent.apps.YOUR-CLIENT-ID</string>
            </array>
        </dict>
    </array>
    
    <!-- App Transport Security -->
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <false/>
    </dict>
</dict>
</plist>
```

**Note**: Replace `YOUR-CLIENT-ID` with value from `GoogleService-Info.plist`

---

## Step 5: Configure Build Settings

### 5.1: General Tab

- **Bundle Identifier**: `com.yourcompany.ks2.KS2LearningEngine`
- **Version**: `1.4.0`
- **Build**: `1`
- **Deployment Target**: iOS 16.0+
- **Supported Destinations**: iPhone, iPad
- **Supported Orientations**: Portrait, Landscape

### 5.2: Signing & Capabilities

1. **Automatically manage signing**: ✅ Enabled
2. **Team**: Select your Apple Developer team
3. **Add Capability**: Push Notifications (for future use)
4. **Add Capability**: Background Modes → Background fetch

### 5.3: Build Settings

- **Swift Language Version**: Swift 5
- **Optimization Level** (Debug): `-Onone`
- **Optimization Level** (Release): `-O`

---

## Step 6: Create App Icons

### Required Sizes

Create icons for all sizes in `Assets.xcassets/AppIcon`:

| Size | Device |
|------|--------|
| 20x20 @2x, @3x | iPhone Notification |
| 29x29 @2x, @3x | iPhone Settings |
| 40x40 @2x, @3x | iPhone Spotlight |
| 60x60 @2x, @3x | iPhone App |
| 1024x1024 | App Store |

### Quick Generation

Use online tools:
- [AppIcon.co](https://appicon.co)
- [MakeAppIcon](https://makeappicon.com)

Upload your logo and download all sizes.

---

## Step 7: Create Launch Screen

### Edit Launch Screen

1. Open `LaunchScreen.storyboard` (or create new one)
2. Add elements:
   - App logo (centered)
   - App name text
   - Background gradient (if needed)

### Alternative: SwiftUI Launch Screen

In `Info.plist`, add:

```xml
<key>UILaunchScreen</key>
<dict>
    <key>UIImageName</key>
    <string>LaunchIcon</string>
    <key>UIColorName</key>
    <string>LaunchBackground</string>
</dict>
```

---

## Step 8: Test Build

### 8.1: Select Scheme

- Target: **KS2LearningEngine**
- Device: iPhone 15 Pro (Simulator) or your physical device

### 8.2: Build

Press `Cmd+B` or Product → Build

**Expected**: Build succeeds with 0 errors

### 8.3: Common Build Errors

| Error | Solution |
|-------|----------|
| "Cannot find 'FirebaseApp'" | Re-add Firebase packages |
| "GoogleService-Info.plist not found" | Ensure file is in project |
| "No such module 'FirebaseAuth'" | Clean build folder (Cmd+Shift+K) |
| "SwiftUI import failed" | Check deployment target is iOS 16+ |

---

## Step 9: Run on Simulator

1. **Select Simulator**: iPhone 15 Pro
2. **Press**: `Cmd+R` or Product → Run
3. **Expected**:
   - App launches
   - Login screen appears with gradient
   - Can tap "Sign Up" / "Sign In" buttons

### Test Authentication

1. Tap "Sign Up"
2. Enter:
   - Name: Test Student
   - Email: test@student.com
   - Password: password123
   - Role: Student
3. Tap "Sign Up" button
4. Should navigate to Home screen

---

## Step 10: Run on Physical Device

### Prerequisites

- **Apple Developer Account** (paid)
- **iPhone** with iOS 16+
- **USB cable**

### Steps

1. **Connect iPhone** to Mac
2. **Trust Computer** on iPhone
3. **Select Device** in Xcode (top toolbar)
4. **Run** (Cmd+R)
5. **Trust Developer**: Settings → General → Device Management → Trust "YourTeam"
6. **Reopen App**

---

## Step 11: Enable Debugging

### Add Breakpoints

- Click line number gutter in Xcode to add breakpoint
- App will pause at that line when executed

### View Console

- `Cmd+Shift+Y` to show debug console
- See `print()` statements and errors

### LLDB Commands

In debug console:
```
po authManager.user  # Print user object
po currentSession    # Print current quiz session
```

---

## Step 12: Firebase Rules (Security)

Update Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Quizzes
    match /quizzes/{quizId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'teacher' || 
                     request.auth.token.role == 'admin';
    }
    
    // Quiz Results
    match /quiz_results/{resultId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Progress
    match /user_progress/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## Step 13: Next Steps

### Immediate Actions

- [ ] Test all authentication flows
- [ ] Create test quiz data in Firebase
- [ ] Test adaptive learning engine
- [ ] Verify recommendations work
- [ ] Check progress tracking

### Future Development

- [ ] Add quiz taking UI
- [ ] Build teacher dashboard
- [ ] Implement homework system
- [ ] Add multi-language support
- [ ] Create parent portal
- [ ] Add push notifications
- [ ] Implement offline mode

### App Store Preparation

- [ ] Create App Store listing
- [ ] Generate screenshots (all device sizes)
- [ ] Write app description
- [ ] Design promotional artwork
- [ ] Record preview video
- [ ] Set up TestFlight beta
- [ ] Submit for review

---

## 🆘 Troubleshooting

### Build Fails

```bash
# Clean build folder
Cmd+Shift+K

# Delete derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Reset package cache
File → Packages → Reset Package Caches
```

### Firebase Not Working

1. Check `GoogleService-Info.plist` is included
2. Verify `FirebaseApp.configure()` is called in `App.swift`
3. Check Firebase Console shows iOS app
4. Ensure bundle ID matches

### Simulator Issues

```bash
# Reset simulator
Device → Erase All Content and Settings

# Restart simulator
Device → Restart
```

---

## 📚 Resources

- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui/)
- [Firebase iOS Guide](https://firebase.google.com/docs/ios/setup)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Xcode Help](https://help.apple.com/xcode/)

---

## ✅ Setup Complete!

You should now have a fully functional iOS app that:

- ✅ Builds without errors
- ✅ Runs on simulator and device
- ✅ Connects to Firebase
- ✅ Authenticates users
- ✅ Shows home screen
- ✅ Displays AI recommendations

**Next**: Start building additional features and views!

---

Need help? Check the main project documentation or web version for reference.
