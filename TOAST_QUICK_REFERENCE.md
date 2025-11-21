# Quick Reference: Using Toast Notifications

## Installation
✅ Already integrated in your app!

Toast system is wrapped in `App.tsx` via `<ToastProvider>`.

## Basic Usage

```tsx
import { useToast } from './components/Toast';

export function MyComponent() {
  const { showToast } = useToast();

  return (
    <button onClick={() => showToast('success', 'Great job!')}>
      Click Me
    </button>
  );
}
```

## Toast Types

### Success
```tsx
showToast('success', 'Quiz completed! 🎉');
showToast('success', 'Points earned: +50');
```

### Error
```tsx
showToast('error', 'Please select an answer');
showToast('error', 'Connection lost. Try again.');
```

### Info
```tsx
showToast('info', 'New topic unlocked!');
showToast('info', 'You earned a badge!');
```

### Warning
```tsx
showToast('warning', 'This will reset your progress');
showToast('warning', 'Connection unstable');
```

## Options

```tsx
// Auto-dismiss after 3 seconds (default)
showToast('success', 'Message');

// Custom duration (5 seconds)
showToast('success', 'Message', 5000);

// Long message (10 seconds)
showToast('info', 'This is a longer message', 10000);
```

## Common Examples

### Quiz Completion
```tsx
const handleQuizSubmit = (results: QuizResult[]) => {
  const score = calculateScore(results);
  if (score >= 80) {
    showToast('success', `Excellent! You scored ${score}%! 🌟`);
  } else if (score >= 60) {
    showToast('info', `Good try! You scored ${score}%. Keep practicing!`);
  } else {
    showToast('warning', `You scored ${score}%. Review and try again!`);
  }
};
```

### Badge Earning
```tsx
const handleBadgeEarned = (badgeName: string) => {
  showToast('success', `🏆 Badge Unlocked: ${badgeName}`);
};
```

### Error Handling
```tsx
const handleFetchError = () => {
  showToast('error', 'Failed to load. Check your connection and try again.');
};
```

### Progress Milestones
```tsx
if (totalPoints % 100 === 0) {
  showToast('success', `🎉 You've reached ${totalPoints} points!`);
}
```

## Styling Notes

- **Success:** Green background, green border
- **Error:** Red background, red border  
- **Info:** Blue background, blue border
- **Warning:** Yellow background, yellow border
- All toasts include smooth slide-up animation
- Auto-positioned in bottom-right corner
- Mobile-friendly responsive sizing

## No Additional Setup Needed!

The toast system is:
- ✅ Already wrapped in App.tsx
- ✅ Ready to use in any component
- ✅ No additional providers needed
- ✅ Zero configuration required

Just import and use `useToast()` hook anywhere!

---

## Styling the Enhanced UI

### Colors Used

**Buttons:**
- Primary (Green): `from-green-500 to-green-600`
- Secondary (Blue): `from-blue-500 to-blue-600`
- Danger (Red): `from-red-500 to-red-600`

**Shadows:**
- Light: `shadow-sm hover:shadow-md`
- Medium: `shadow-lg shadow-[color]-500/40`
- Heavy: `shadow-xl shadow-[color]-500/50`

**Borders:**
- Soft: `border border-[color]-200/50`
- Medium: `border-2 border-[color]-300`
- Bold: `border-2 border-[color]-600`

---

## Need Help?

All components use:
- ✅ Accessibility attributes (ARIA labels, roles)
- ✅ Keyboard navigation support
- ✅ Screen reader compatible
- ✅ Touch-friendly (min 44px targets)
