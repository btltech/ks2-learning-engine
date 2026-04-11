# Phase 2 Features - Quick Reference

## 🎯 For Users

### How to Access New Features

**Progress Dashboard:**
- Navigate to: "Progress" tab on Home screen
- Or direct URL: `/progress`

**Friends & Social:**
- Go to Progress → Friends tab
- Add friends, send challenges
- View friend leaderboard

**Skill Trees:**
- Progress tab → Click any subject card
- Interactive node exploration
- Complete quizzes to unlock nodes

**Certificates:**
- Progress tab → Certificates tab
- Print or share achievements
- Earn by scoring high on quizzes

**Quick Learning:**
- Navigate to `/microlearning`
- 5-minute focused sessions

---

## 🎮 How to Use

### Earning Certificates
1. Complete any quiz
2. Score 85%+ for Silver 🥈
3. Score 95%+ for Gold 🥇
4. Score 100% for Platinum 💎
5. View in Progress → Certificates tab

### Adding Friends
1. Progress → Friends tab
2. Click "Add Friend"
3. Search by name or code
4. Send request

### Challenging Friends
1. Friends tab → Find friend
2. Click "⚔️ Challenge"
3. Choose subject/topic/difficulty
4. Complete quiz
5. Winner gets bonus points

### Exploring Skill Trees
1. Progress tab
2. Click Maths/English/Science card
3. Tap nodes to see requirements
4. Complete quizzes to unlock
5. Earn rewards for completion

---

## 💻 For Developers

### New Components

```typescript
// Widgets (Home View)
<FriendsOnlineWidget />        // Shows top 5 friends
<SkillProgressWidget />         // Subject progress bars
<NextCertificateWidget />       // Next achievement goal

// Views
<ProgressView />                // Main dashboard (3 tabs)
<SkillTreeView subject={name} /> // Interactive tree
<ProgressChart days={30} />     // Chart with insights
<CertificateGallery />          // Certificate grid
<FriendsPanel />                // Social features
```

### New Services

```typescript
// Social Features
import { socialLearningService } from './services/socialLearningService';

socialLearningService.sendFriendRequest(userId, message)
socialLearningService.createChallenge(friendId, subject, topic, difficulty, count)
socialLearningService.completeChallenge(id, isInitiator, score)

// Progress Visualization
import { progressVisualizationService } from './services/progressVisualizationService';

progressVisualizationService.recordProgress(subject, score, timeSpent)
progressVisualizationService.awardCertificate(name, subject, achievement, badgeLevel)
progressVisualizationService.getSkillTree(subject)
progressVisualizationService.getWeeklySummary()
```

### Integration Points

**Quiz Completion:**
```typescript
// In handleQuizSubmit()
import('./services/progressVisualizationService').then(({ progressVisualizationService }) => {
  progressVisualizationService.recordProgress(subject, score, time);
  if (score >= 85) {
    progressVisualizationService.awardCertificate(name, subject, achievement, 'silver');
  }
});
```

**Home View:**
```typescript
// Import widgets
import FriendsOnlineWidget from './components/FriendsOnlineWidget';
import SkillProgressWidget from './components/SkillProgressWidget';
import NextCertificateWidget from './components/NextCertificateWidget';

// Add to Progress tab
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <FriendsOnlineWidget />
  <SkillProgressWidget />
  <NextCertificateWidget />
</div>
```

### Routes

```typescript
// App.tsx
<Route path="/progress" element={<ProgressView />} />
<Route path="/microlearning" element={<MicrolearningDashboard />} />
```

### Data Storage

**localStorage Keys:**
```typescript
// Social Learning
'ks2_friends'           // Friend list
'ks2_friend_requests'   // Pending requests
'ks2_challenges'        // Challenge history

// Progress Visualization
'ks2_skill_trees'       // Tree state per subject
'ks2_progress_data'     // 30-day rolling data
'ks2_certificates'      // Awarded certificates
```

---

## 📊 API Reference

### Social Learning Service

```typescript
interface Friend {
  userId: string;
  displayName: string;
  level: number;
  points: number;
  status: 'online' | 'offline' | 'in-quiz';
  lastActive: string;
}

// Get friends list
getFriends(): Friend[]

// Send friend request
sendFriendRequest(userId: string, message?: string): void

// Accept friend request
acceptFriendRequest(requestId: string): void

// Create challenge
createChallenge(
  friendId: string,
  subject: string,
  topic: string,
  difficulty: string,
  questionCount: number
): FriendChallenge

// Complete challenge
completeChallenge(
  challengeId: string,
  isInitiator: boolean,
  score: number
): void

// Get leaderboard
getFriendsLeaderboard(): Friend[]
```

### Progress Visualization Service

```typescript
interface SkillTree {
  subject: string;
  nodes: SkillNode[];
  totalNodes: number;
  completedNodes: number;
}

// Get skill tree
getSkillTree(subject: string): SkillTree

// Update node progress
updateNodeProgress(nodeId: string, score: number): void

// Record progress
recordProgress(
  subject: string,
  score: number,
  timeSpent: number
): void

// Get progress data
getProgressData(subject?: string, days?: number): ProgressDataPoint[]

// Award certificate
awardCertificate(
  recipientName: string,
  subject: string,
  achievement: string,
  badgeLevel: 'bronze' | 'silver' | 'gold' | 'platinum'
): Certificate

// Get certificates
getCertificates(): Certificate[]

// Get weekly summary
getWeeklySummary(): {
  totalQuizzes: number;
  averageScore: number;
  totalTime: number;
  topSubject: string;
  improvement: number;
}
```

---

## 🎨 Styling Guide

### Color Scheme

**Subjects:**
- Maths: Blue (#3B82F6)
- English: Green (#22C55E)
- Science: Orange (#F97316)

**Social:**
- Friends: Purple (#A855F7)
- Challenges: Orange (#F97316)

**Certificates:**
- Bronze: `from-orange-300 to-orange-600`
- Silver: `from-gray-300 to-gray-500`
- Gold: `from-yellow-300 to-yellow-600`
- Platinum: `from-purple-300 to-purple-600`

**Widgets:**
- Background: `bg-white`
- Shadow: `shadow-md`
- Rounded: `rounded-xl`
- Padding: `p-4`

### Component Patterns

**Widget Layout:**
```tsx
<div className="bg-white rounded-xl shadow-md p-4">
  <h3 className="font-bold text-gray-900 mb-3">Title</h3>
  {/* Content */}
  <button className="w-full py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg">
    CTA Button
  </button>
</div>
```

**Progress Bar:**
```tsx
<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
  <div 
    className="h-full bg-blue-500 transition-all duration-500"
    style={{ width: `${progress}%` }}
  />
</div>
```

---

## 🚀 Deployment

**Current Version:** 1.2.0  
**Live URL:** https://68f2601d.ks2-learning-engine.pages.dev

**To Deploy Updates:**
```bash
# 1. Update version
# Edit version.ts: APP_VERSION = '1.2.1'

# 2. Build
npm run build

# 3. Deploy
npx wrangler pages deploy dist
```

---

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers
- ✅ Tablet browsers

**Features:**
- LocalStorage (all browsers)
- Web Share API (modern browsers, fallback provided)
- Chart.js (all browsers)
- CSS Grid (all modern browsers)

---

## 🔗 Quick Links

**Documentation:**
- Full details: [PHASE_2_COMPLETE.md](PHASE_2_COMPLETE.md)
- Integration guide: [PHASE_2_INTEGRATION_COMPLETE.md](PHASE_2_INTEGRATION_COMPLETE.md)
- Original implementation: [PHASE_1_2_IMPLEMENTATION.md](PHASE_1_2_IMPLEMENTATION.md)

**Live App:**
- Production: https://68f2601d.ks2-learning-engine.pages.dev
- Progress Dashboard: `/progress`
- Microlearning: `/microlearning`

---

## ❓ Common Issues

**Q: Friends not showing online?**
A: Status updates every 30s. Wait for refresh or reload page.

**Q: Certificate not awarded?**
A: Check score threshold (85%+ required). View certificates in gallery.

**Q: Skill tree not updating?**
A: Complete quizzes in corresponding topics. Score 70%+ to progress.

**Q: Widget not loading?**
A: Check browser console for errors. Clear cache if needed.

---

## 🎯 Next Features (Phase 3)

Coming Soon:
- Multi-language support
- Teacher analytics dashboard
- Homework assignment system
- Advanced reporting
- School integration

---

**Last Updated:** January 11, 2026  
**Version:** 1.2.0  
**Status:** Production Ready ✅
