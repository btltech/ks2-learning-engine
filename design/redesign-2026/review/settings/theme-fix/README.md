# PR #20 — public theme review follow-up

Baseline: PR #20 commit `5e6c02f6868add232ac0bdabf638583d842ffdb7`. The fix stays on `redesign/9-settings`; nothing was merged or deployed.

## Changes

Only two production files changed:

- `components/sunny/displayPreferences.css`: replaces the broad sunny-class background match with an explicit list of actual panels and controls. Images, SVGs and scenery retain transparent backgrounds; SVG fills and original artwork are intact. Public landing tokens follow the chosen theme. Dark landing uses a navy sky gradient; calm uses a soft green sky. High contrast still uses black/white surfaces and hides scenery. The phone home greeting remains a themed card. The PE, PSHE, D&T and Religious Education Heroicons use the light theme foreground in dark/high-contrast modes.
- `components/AccessibilitySettings.tsx`: adds the requested note directly below Colours: “Dark and calm colours apply to the main learning screens.” Help, privacy and policy pages retain their existing presentation. No settings handlers, storage, routes, aria labels, audio or learning behaviour changed.

The hero text is `#F7FAFF`; its lowest contrast over the dark gradient is **11.88:1** against the lightest stop, `#1D3554` (other stops `#101827` and `#172B46`). This exceeds 4.5:1. Light fallback icons against `#1C283B` have 14.18:1 contrast. These values use sRGB relative luminance and `(Llighter + .05) / (Ldarker + .05)`.

## Review method

The **real public app** was built with placeholder values for all six `VITE_FIREBASE_*` settings, rather than using the real Firebase project. An unshipped review entry set only local display preferences before loading the real `index.tsx` and then used the normal `/` route. Public layout, landing, footer, settings dialog and providers were not mocked. The actual footer button was opened using keyboard navigation in every mode/width. The expected blocked request to the placeholder auth domain appeared in the local console; public pages rendered correctly. Service-worker registration was disabled only in the temporary review HTML to keep before/after bundles separate; production PWA code/config is unchanged.

Home, lesson and quiz used their actual components with synthetic Casey/content fixtures and mocked auth, question, class-read and performance-write boundaries. No cloud classroom or learner data was written. The before review used the frozen baseline stylesheet; after used the final stylesheet. Reduced motion was on for stable captures. Temporary entries, fixtures, configs and servers were removed after review.

**All five screens were inspected in dark, calm and high contrast at 1280px and 390px**, including the four fallback subject icons on both widths. Scenery, clouds, sparkles and the owl have no rectangular fills. Dark sky copy, example answers, MiRa explanation, buttons, home text, lesson text, quiz answers and the footer settings dialog are readable. No horizontal overflow was found in the 60-image matrix; each full-size capture is exactly twice its specified viewport width. The dialog remains scrollable, and focus is visible.

Images are original Chrome captures at 2x resolution. Settings uses a 900px-tall viewport capture of the actual footer dialog; other screens use full-page captures. The full-page phone learning captures paint fixed navigation/actions at the initial viewport fold, a browser capture artifact. All task downloads were moved into this folder; none remain in Downloads.

## Checks

- `npm run lint`: pass, zero warnings.
- `NODE_OPTIONS=--no-experimental-webstorage npm test -- --run`: pass, **65 files / 305 tests**. The flag is the local Node Web Storage workaround; CI uses Node 20.
- `npm run build`: pass with explicit placeholder `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`. No `.env`, Firebase, Cloudflare or safeguard file was edited.

## Before / after matrix

| Screen | Mode | 1280px | 390px |
| --- | --- | --- | --- |
| Landing | Dark | [Before](before-dark-landing-1280.png) · [After](after-dark-landing-1280.png) | [Before](before-dark-landing-390.png) · [After](after-dark-landing-390.png) |
| Landing | Calm | [Before](before-calm-landing-1280.png) · [After](after-calm-landing-1280.png) | [Before](before-calm-landing-390.png) · [After](after-calm-landing-390.png) |
| Landing | Contrast | [Before](before-contrast-landing-1280.png) · [After](after-contrast-landing-1280.png) | [Before](before-contrast-landing-390.png) · [After](after-contrast-landing-390.png) |
| Home | Dark | [Before](before-dark-home-1280.png) · [After](after-dark-home-1280.png) | [Before](before-dark-home-390.png) · [After](after-dark-home-390.png) |
| Home | Calm | [Before](before-calm-home-1280.png) · [After](after-calm-home-1280.png) | [Before](before-calm-home-390.png) · [After](after-calm-home-390.png) |
| Home | Contrast | [Before](before-contrast-home-1280.png) · [After](after-contrast-home-1280.png) | [Before](before-contrast-home-390.png) · [After](after-contrast-home-390.png) |
| Lesson | Dark | [Before](before-dark-lesson-1280.png) · [After](after-dark-lesson-1280.png) | [Before](before-dark-lesson-390.png) · [After](after-dark-lesson-390.png) |
| Lesson | Calm | [Before](before-calm-lesson-1280.png) · [After](after-calm-lesson-1280.png) | [Before](before-calm-lesson-390.png) · [After](after-calm-lesson-390.png) |
| Lesson | Contrast | [Before](before-contrast-lesson-1280.png) · [After](after-contrast-lesson-1280.png) | [Before](before-contrast-lesson-390.png) · [After](after-contrast-lesson-390.png) |
| Quiz | Dark | [Before](before-dark-quiz-1280.png) · [After](after-dark-quiz-1280.png) | [Before](before-dark-quiz-390.png) · [After](after-dark-quiz-390.png) |
| Quiz | Calm | [Before](before-calm-quiz-1280.png) · [After](after-calm-quiz-1280.png) | [Before](before-calm-quiz-390.png) · [After](after-calm-quiz-390.png) |
| Quiz | Contrast | [Before](before-contrast-quiz-1280.png) · [After](after-contrast-quiz-1280.png) | [Before](before-contrast-quiz-390.png) · [After](after-contrast-quiz-390.png) |
| Footer settings | Dark | [Before](before-dark-settings-1280.png) · [After](after-dark-settings-1280.png) | [Before](before-dark-settings-390.png) · [After](after-dark-settings-390.png) |
| Footer settings | Calm | [Before](before-calm-settings-1280.png) · [After](after-calm-settings-1280.png) | [Before](before-calm-settings-390.png) · [After](after-calm-settings-390.png) |
| Footer settings | Contrast | [Before](before-contrast-settings-1280.png) · [After](after-contrast-settings-1280.png) | [Before](before-contrast-settings-390.png) · [After](after-contrast-settings-390.png) |
