# Sunny Owl accessibility review

**Reviewed:** 5 November 2026 · **Baseline:** `63288fdc` · **Branch:** `redesign/10-phone-and-a11y`

Automated and representative keyboard checks pass for the reviewed states. VoiceOver/NVDA listening and physical iPhone checks remain open; this is a scoped review, not a certification of every application state.

## Coverage and evidence

The [review pack](design/redesign-2026/review/phone-a11y/README.md) contains phone screenshots, raw axe findings before and after, keyboard measurements, safe-area simulation and build sizes. The [synthetic harness](scripts/review-phone/README.md) renders the actual components with a local learner and service fixtures.

- 21 screen compositions checked at **390 × 900**, **768 × 900** and **1280 × 900**: landing, sign-in, learner picker, standard/guided home, topics, lesson, quiz/results, language passport/pronunciation/library, progress, games, art gallery/lesson/canvas, avatar, bites, pupil classroom and settings.
- **63 standard axe runs**, using axe-core **4.14.0**, WCAG 2 A/AA, WCAG 2.1 AA and best-practice tags: **zero reported violations after fixes**. Every document fits its tested viewport width.
- Additional phone checks cover matching, sorting, ordering and fill-in answers; an active pupil classroom; and combined larger text, high contrast and reduced movement on home, lesson, quiz, pronunciation, settings and languages. These recorded states also have zero axe violations.
- Native Tab traversal sampled controls on every screen composition. Home, guided home, topics, lesson, quiz and languages have four recorded stops; other compositions have three-key traversal checks. These are representative checks, not exhaustive traversal of every conditional control. Results/settings focus stays within the modal during these checks.
- Enabled controls measured at least **48 × 48 CSS pixels** in the final standard matrix. The unfocused, visually hidden skip link is excluded from that measurement; it expands when focused.

## Fixed issues

| Finding | Change |
| --- | --- |
| Critical: language list contained buttons without list items | Use a labelled group and retain native button semantics. |
| Serious: quiz and results progress meters had no name | Add “Quiz progress” and “Quiz score” accessible names. |
| Serious: Games stars labelled a generic div | Expose the decorative star group as one named image. |
| Subject buttons overridden with `role="listitem"` | Keep native buttons inside a labelled group. |
| Missing/skipped headings; nested Games main landmarks | Add page/question headings, fix section levels, retain the application’s single main landmark. |
| Keyboard radio selection and question changes | Arrow/Home/End keys select and focus answers; Tab uses one radio stop; advancing focuses the next question heading. Existing scoring/submission is retained. |
| User menu Escape handling | Escape closes the menu and restores the avatar button’s focus. |
| Fixed tabs could cover a focused Games control | Give phone controls scroll margins based on the actual tab height. Native Tab now leaves that control 24px above the tabs. |
| Fixed actions assumed a constant navigation height | Measure the tabs’ border box, including padding, with ResizeObserver. Lesson, quiz and expanded pronunciation controls follow that height. |
| Small shared footer/storage-notice controls | Increase targets to 48px and strengthen focus indicators. |

Pronunciation’s DOM order now matches its visual order. Expanded word practice pins the existing Hear it/speed controls; the lesson quiz action returns to document flow while a word is open. The viewport enables safe-area coverage, with inset-aware phone content, navigation and action padding.

## Contrast, pictures and movement

Axe reported no colour-contrast violations in the recorded final states. It also returned **incomplete** checks for gradients, emoji and some layered backgrounds; these are retained in the JSON rather than counted as passes. Calculated design-token samples are ink/white **16.27:1**, ink/gold **10.59:1**, muted/white **7.53:1**, and white/action blue **6.59:1**. These samples exceed 4.5:1; they do not establish the contrast of every possible runtime text/background combination.

The shared Owl defaults to an empty alternative and `aria-hidden`; meaningful Owl images accept a label. Sparkles and the home scenery/cloud container are hidden from assistive technology. Existing meaningful artwork has text alternatives. Native keyboard samples show the 4px action-blue focus outline. Combined preference captures confirm readable high-contrast surfaces and larger text; the existing app and OS reduced-motion rules remain in place.

With large text enabled, the tabs measured **147.92px**. Simulating a 34px bottom inset instead of 14px padding increased them to **167.92px**; the quiz bar moved upward by the same **20px**, ending exactly at the top of the tabs. Document width remained 390px. This checks the layout response, not an actual iPhone/WebKit safe area.

## Validation and load size

Using **Node 20.19.5**, matching CI’s Node 20 configuration:

- `npm run lint`: passed.
- `npm test -- --run`: **66 files, 310 tests passed**, including radio keyboard selection, focus after advancing and meter names.
- `npm run build`: passed; PWA generation completed.

The host’s default Node 25 initially failed 17 existing Kokoro tests because its experimental `localStorage` interacts with global mock restoration. Node 20 passes; Node 25 also passes with `NODE_OPTIONS=--no-experimental-webstorage`. Voice implementation and test setup were left intact.

| Production assets | Before | After |
| --- | ---: | ---: |
| All JavaScript, raw | 6,089,410 B | 6,092,397 B |
| CSS, raw | 286,246 B | 288,946 B |
| WOFF2 fonts, raw | 124,144 B | 124,144 B |
| HTML-referenced JS/CSS, gzip | 514,447 B | 515,025 B |

HTML-referenced assets include the entry and module preloads, not every runtime request. Their gzip increase is **578 B (0.11%)**. Font files are identical; this pass adds no SVG/image assets to the application. First-load latency, cold network performance and real-device rendering were not benchmarked. See [build-sizes.json](design/redesign-2026/review/phone-a11y/build-sizes.json) for the measurement method.

## Remaining review

- Listen with VoiceOver or NVDA on home, a lesson and a quiz, including feedback and question transitions.
- Check a physical iPhone/WebKit with home indicator, rotation, display zoom and the software keyboard.
- Review axe’s incomplete contrast checks across remaining dynamic content, and extend keyboard traversal to conditional/expanded controls and complete authenticated journeys.
- Measure cold first-load performance on a representative device/network if a timing comparison is required.

The previous April checklist covered additional grown-up/help/policy pages. Those pages are outside this learner redesign review. No deployment or merge was performed.
