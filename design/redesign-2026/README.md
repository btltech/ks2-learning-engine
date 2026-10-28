# DemiWura redesign 2026: "Sunny Owl"

This folder is the design pack for the new child-facing look of DemiWura and the
owl logo. It is reference material only. Nothing in here is imported by the app.

The live design canvas (private to the owner) is
https://claude.ai/artifact/4XQgWBPgP9g7RktsuHh8mw. Everything needed to build it is
copied into this folder, so you do not need access to the canvas.

## What is in here

| Folder | What it holds |
|---|---|
| `screens/` | A screenshot of every redesigned screen. Desktop at 1280px wide, phone at 390px. `Quiz-correct.jpg` shows the quiz after a right answer. |
| `boards/` | The design source for each screen (`*.dc.html`). Plain HTML with inline styles and inline SVG. Open them in a text editor to copy exact colours, spacing and SVG. Ignore `<sc-for>`, `<sc-if>`, `{{ }}` and the `DCLogic` script: those are the design tool's templating, not code to ship. |
| `assets/logo-owl-wordmark.svg` | The logo: Wura the owl plus the DemiWura wordmark. The letters are outlines, so no font is needed. |
| `assets/owl/` | Wura the owl in six poses: wave, reading, hooray, sleepy, thinking, standing. |
| `assets/subjects/` | Illustrated subject icons (maths, english, science, languages, history, geography, art, music, computing) plus a treasure chest. |
| `assets/mira.svg` | MiRa, the AI helper's face. |
| `assets/icons/` | App icon (`app-icon-owl.svg`), PNGs at 16, 32, 48, 180, 192 and 512, and `favicon.ico`. |

## Names

- **Wura** is the owl mascot. "Wúrà" means gold in Yorùbá. Wura cheers, reads along and naps when offline. Wura never gives answers.
- **MiRa** stays the name of the AI helper that explains lessons. MiRa keeps its own round blue face (`assets/mira.svg`).

## Design tokens

### Colours

| Token | Hex | Use |
|---|---|---|
| `ink` | `#172033` | All text, all outlines, all hard shadows. |
| `muted` | `#4A5568` | Secondary text (7.5:1 on white). |
| `gold` | `#FFC93C` | Main buttons, stars, "you are here". Ink text on gold is about 10:1. |
| `gold-deep` | `#F2A91C` | Owl wings, decoration only. |
| `sky` | `#3D8BFF` | Maths, decoration. Never text. |
| `bubblegum` | `#FF6FB5` | Art, celebration, decoration. Never text. |
| `leaf` | `#2FC27A` | Science, "correct" (always with a tick and the word). |
| `grape` | `#8E6CFF` | English, music, decoration. Never text. |
| `orange` | `#FF9F1C` | Languages, "try again" (always with an arrow and words). |
| `coral` | `#FF5A4E` | Decoration only. |
| `action` | `#1E55C8` | Selected state, links, focus ring, "Sign in" button with white text (6.6:1). |
| `page` | `#FFF9EC` | Page background, with a dot pattern: `radial-gradient(#F3E3B8 2px, transparent 2px)` at `28px 28px`. |

Light tints for cards and panels, always with ink text:
sky `#DCEBFF`, grape `#ECE6FF`, leaf `#DDF6E8`, gold `#FFF1C7`, orange `#FFE9D2`, bubblegum `#FFE3F1`, teal `#D7F3EF`, coral `#FFE1DE`.

### Type

- Headings: **Fredoka** 700 (600 for smaller labels).
- Body: **Atkinson Hyperlegible** 400/700, 18px minimum, line height 1.6. Lesson text is 22 to 24px.
- Self-host both fonts (for example `@fontsource/fredoka` and `@fontsource/atkinson-hyperlegible`). Do not load them from Google at runtime. This keeps children's browsing private, works offline in the PWA and needs no CSP change.

### Shape

- Outline: `3px solid #172033` on cards, buttons, chips, inputs and tiles.
- Hard shadow: buttons `0 5px 0 #172033`, cards `0 6px 0 #172033`. On hover a button moves down 2px and the shadow shrinks to 3px. On press it moves down 5px with no shadow.
- Radius: buttons 18px, cards 28px, hero panels 32px, chips 999px.
- Buttons: minimum 48px tall (56px default, 64px for the main action), 3px ink outline.
- Small playful tilts (−2° to 2°) on stickers and feature cards only, never on text the child has to read in a lesson.

### Motion

- Owl blinks, stars twinkle, clouds float, letters bounce on hover of the logo.
- **All of it must stop** when the app's "Less movement" setting (`reducedAnimations` in `UISettingsContext`) is on, **and** when the OS asks for `prefers-reduced-motion: reduce`.
- No timers by default. Nothing flashes.

## Rules that must not be broken

1. Text is always ink (or white on `action` blue). Bright colours are fills, never text.
2. Right and wrong always show a word **and** an icon, never colour alone. Quiz answers have a shape as well as a value (triangle, circle, square, star).
3. Every tap target is at least 48 by 48px.
4. Focus is always visible: `outline: 4px solid #1E55C8; outline-offset: 3px`.
5. Wura always appears with words (a speech bubble or caption). Decorative owls have `aria-hidden="true"`.
6. Existing display settings keep working: larger text, high contrast, dark mode, calm tint, less movement, read aloud. In high contrast mode, drop the tints and dot pattern and fall back to the existing high contrast colours.
7. Grown-up screens (parent, teacher, admin, analytics, help and policy pages) keep their calmer style. They only get the new logo. On dark headers, the logo sits on a white rounded "sticker" (`background:#fff; border-radius:14px; padding:4px 10px`).

## Screen map

The file names on the right are the most likely places in this repo. Check before editing.

| Design (`screens/` and `boards/`) | Likely code |
|---|---|
| Landing | `components/LandingPage.tsx`, `components/PublicLayout.tsx`, `components/Footer.tsx` |
| SignIn (who is learning) | `components/LoginView.tsx`, `components/ChildSelector.tsx` |
| Home | `components/HomeView.tsx`, `components/GuidedHomeView.tsx`, `components/Header.tsx`, `components/DailyChallenge.tsx` |
| Subject (topic path) | `components/SubjectSelector.tsx`, `components/TopicSelector.tsx`, `components/LearningPaths.tsx` |
| Lesson | `components/LessonView.tsx` |
| Quiz, Quiz-correct | `components/QuizView.tsx` and the question type components |
| Results | the results part of `components/QuizView.tsx` (or its results component) |
| Languages | `components/LanguageSelector.tsx`, `components/PronunciationHelper.tsx` |
| YorubaLibrary | `components/YorubaAudioLibrary.tsx` |
| Progress | `views/ProgressView.tsx`, `components/ProgressView.tsx`, `components/StreakRewards.tsx` |
| Games | `components/MiniGames.tsx`, `components/GamesLockOverlay.tsx` |
| ArtStudio | `components/DrawingCanvas.tsx`, `components/DrawingLessonView.tsx`, `components/ArtGalleryView.tsx` |
| Avatar | `components/AvatarCustomization.tsx`, `components/AvatarDisplay.tsx` |
| Microlearning | `components/MicrolearningDashboard.tsx`, `components/MicrolearningCard.tsx` |
| LiveClassroom | `components/ClassroomMode.tsx` |
| Settings | `components/AccessibilitySettings.tsx`, `components/UIModeSelector.tsx` |
| Phone* | the same components at phone width (bottom tab bar, one column) |
| KidStyle | the style guide: the tokens above, drawn out |
