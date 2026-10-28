# Sunny Owl foundations

Import each building block from its own file, for example:

```tsx
import { KidButton } from './sunny/KidButton';
import { KidCard } from './sunny/KidCard';
import { Chip } from './sunny/Chip';
import { Meter } from './sunny/Meter';
import { SpeechBubble } from './sunny/SpeechBubble';
import { OwlLogo } from './sunny/OwlLogo';
import { Owl } from './sunny/Owl';
import { SubjectIcon } from './sunny/SubjectIcon';
import { MiraFace } from './sunny/MiraFace';
import { Sparkle } from './sunny/Sparkle';

<KidButton onClick={onContinue} size="lg">Carry on</KidButton>
<KidButton href="/help" variant="white" size="sm">Help</KidButton>
<KidButton variant="tint" tint="leaf">Listen</KidButton>
<KidButton variant="action-blue" type="submit">Sign in</KidButton>
<KidCard tint="sky" hero><h2>Today's adventure</h2></KidCard>
<Chip tint="gold">New</Chip>
<Meter label="Lesson progress" value={2} max={5} />
<SpeechBubble>Ready for an adventure?</SpeechBubble>
<OwlLogo height={48} />
<OwlLogo height={36} sticker />
<Owl pose="reading" />
<SubjectIcon name="maths" />
<MiraFace label="MiRa, your learning helper" />
<Sparkle className="sunny-twinkle" />
```

- Buttons use native button/link semantics. Sizes `sm`/`md`/`lg` have minimum heights 48/56/64px; text can wrap and increase their height. `Chip` is a non-interactive label; use a button for an action.
- `KidCard` and `Chip` tints: white, sky, grape, leaf, gold, orange, bubblegum, teal, coral. `KidButton` supports the same coloured tints, with gold/white/tint/action-blue variants.
- `Meter` requires a spoken label and exposes a clamped 0–max value to assistive technology. It also displays a percentage in words.
- `SpeechBubble` supports left, bottom or no tail. It is ordinary text, never an unsolicited live announcement.
- Owl poses: wave, reading, hooray, sleepy, thinking, standing. Always pair Wura with words. Owl, subject icons, MiRa and sparkles are decorative by default; `label` gives an image a meaningful accessible name when needed. Use `decorative` on `OwlLogo` inside an already-labelled home button.
- Subject names: maths, english, science, languages, history, geography, art, music, computing, chest. Assets are copied from the supplied design pack; the wordmark is inline outlined SVG, not font-dependent text.
- Dark grown-up headers use `sticker`: white, 14px radius, 4px/10px padding. Keep any role label in an ink-text chip beside it. Existing page headings, routes, controls and layout remain intact.
- `index.tsx` loads local Fontsource files for Fredoka 600/700 and Atkinson Hyperlegible 400/700/400 italic. New components use these fonts; existing screens retain their typography. No Google font request is made.
- Tailwind adds `ink`, `muted`, `gold`, `gold-deep`, `sky`, `bubblegum`, `leaf`, `grape`, `orange`, `coral`, `action`, `page`, `tint.*`, `font-display`, `font-body`, `border-3`, `shadow-chunky`, `shadow-chunky-card` and `rounded-kid-*`. Existing sky/orange shades are retained. Use `bg-sunny-dots bg-sunny-grid` for the 28px dot pattern, or `.sunny-page` on a future child screen.
- CSS motion helpers are opt-in: `sunny-blink` for an SVG eye group, `sunny-twinkle` for decoration, `sunny-float` for an illustration, `sunny-bounce` for hover. Only outlined logo letters bounce automatically on hover. No JavaScript timers or flashing opacity effects are used.
- **One motion switch:** `UISettingsContext.settings.reducedAnimations` and the existing accessibility Reduced Motion control both set `.reduce-motion` on `<html>`. Every new animation and transition also stops for `prefers-reduced-motion: reduce`. Neither setting overrides the other.
- High contrast drops new tints, shadows and dots in favour of the existing contrast colours. Larger text grows the new controls naturally; the existing dyslexia font preference remains available. Bright colours are fills, with ink text (white only on action-blue); focus outlines are 4px action blue.

This step does not apply the redesigned Home, lesson, quiz or dashboard layouts.
