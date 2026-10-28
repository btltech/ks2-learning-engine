# Child header and home review

Branch `redesign/4-home`, based on main `965314889b9599b339d04209b30242c94fabc3c0`.
The landing/sign-in branches are not prerequisites.

## Browser evidence

The images are actual Chrome for Testing desktop-browser captures, not mockups.
Full-page captures use responsive viewports of **1280 × 900** and **390 × 900**
at DPR 2 (PNG widths 2560 and 780). Keyboard captures include the browser and
DevTools so the focused control is visible.

- `before-1280.png`, `before-390.png`: original components from the base commit.
- `after-1280.png`, `after-390.png`: standard-mode home and responsive header.
- `all-preferences-1280.png`, `all-preferences-390.png`: high contrast, larger
  text and Less movement together, using the real UISettingsProvider updates.
- `keyboard-1280.jpg`, `keyboard-390.jpg`: keyboard focus on the adventure action
  and phone navigation respectively.

Authenticated components were rendered in a temporary local Vite fixture using
synthetic learner Alex, two example quiz records, existing subject progress and
an empty mocked teacher workspace. It rendered the actual Header, HomeView,
GuidedHomeView, daily challenge, widgets and UISettingsProvider. The fixture was
removed before lint/tests/build and is not shipped. No live account, credentials
or real child's records were used. These checks do **not** claim a live sign-in
or real backend end-to-end test. The normal `npm run dev` app was also started and its public privacy page loaded.
Its existing local warning was `Sentry DSN not configured - error tracking disabled`.

## Checks and adaptations

- Guided mode keeps its three existing subjects and its game gate, badges,
  avatar and encouragement. Standard/advanced keep all **13** existing subjects.
  The nine illustrated subject assets are used where supplied; PE, PSHE, D&T
  and Religious Education retain their existing icons.
- Top order: greeting/adventure; subject picker; recent subjects and this week;
  daily challenge and points. Existing Learn/Play/Progress tabs follow this block.
  My Class, homework, join-class/live-class actions, review-due and Study actions
  stay under Learn; games, battle, art, rewards, avatar and achievements under
  Play; streak milestone, skills, next certificate, analytics, curriculum and
  Quick Stats under Progress. Original optional-feature gates remain in place.
- The app does not store unfinished lesson parts. Adventure/recent cards show
  actual quiz scores and completed-topic counts. Carry on/Continue use the
  existing subject-selection callback to open that subject's topic chooser.
  The week records quiz activity; points retain the existing currency name.
- Existing teacher/parent/admin header appearance and role gates are retained.
  Child utility actions remain in the avatar menu; badges, streak and points
  remain available there, with the points chip on desktop.
- Browser checks covered guided, standard and advanced modes, keyboard Tab/Enter,
  the actual legacy accessibility switches and the UISettingsProvider preference
  switches. At 390px: document/scroll width 390; no visible interactive target
  under 48px; no measured card/control overflow. High contrast + large text +
  Reduced Motion also fit at the legacy setting's larger 25.92px body text.
- Less movement: root `.reduce-motion`, **0 running animations**. DevTools OS
  emulation: `prefers-reduced-motion: reduce` matched, with the app switch off,
  **0 running animations**. Static SVG transforms remain intact.
- Keyboard limitation retained from main: the existing Learn/Play/Progress
  tablist makes only the active tab tabbable and has no arrow-key handler. The
  redesign does not change those handlers; new header links and home buttons
  were checked with Tab/Enter. This is not a full keyboard-accessibility audit.
- No runtime console errors were observed in the isolated home review. The
  existing accessibility dialog produces DevTools accessibility issue notices;
  its controls/authentication were not redesigned in this step.

Wording additions follow the design headings. The real app's greetings, class
messages, assignment actions, daily-challenge copy and existing aria labels are
retained. No example lesson-part progress, rewards or completed days are invented.
