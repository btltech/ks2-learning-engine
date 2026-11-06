# PR B — Clear Path teacher screens

Branch `redesign/12-teacher`, based on fetched main `5da9936d` (squash-merged PR #28). Reference: `boards/TeacherDashboard.dc.html`, `screens/TeacherDashboard.jpg` and the Clear Path foundations. The user's grown-up-screen instructions override the child-only Sunny Owl notes in the design README. PR C is not included.

## Scope and preserved behavior

- `TeacherHomeView.tsx`, `TeacherDashboard.tsx`, `EnhancedTeacherDashboard.tsx`: teacher-only presentation hooks, responsive cards, associated form labels, heading structure and keyboard access. The dashboard tabs support arrows/Home/End through their existing route action; learner cards support Enter/Space through their existing selection action. The enhanced dialog uses the existing modal focus hook, has a named keyboard-scrollable content region, and retains its close callback.
- `ClassroomMode.tsx`: only the teacher root receives Clear Path, and create-session controls gain associated labels and pressed-state presentation. The pupil root stays Sunny Owl. All three existing effects, their dependencies, session subscription/cleanup, timer, question resets, generation, start/next/end/join/answer handlers and service arguments are unchanged.
- `ClearPathTeacher.css`: self-hosted Lexend 600/700, existing Atkinson Hyperlegible, ink `#172033`, muted `#4A5568`, action `#1E55C8`, control borders `#7A8496`, card borders `#D5DAE5`, page `#F6F7FB`, 2px/24px cards, minimum 48px controls and immediate 4px focus rings. Existing dark, high-contrast and calm tokens, larger text, app Less movement and OS reduced motion are respected. Static SVG logo transforms remain intact. No decorative owls were added.
- `TeacherPresentation.test.tsx`, `TeacherClassroom.test.tsx`: existing data/actions, confirmation cancellation/payload, assignment publication, exports, keyboard semantics, realtime membership and completion, timer ticks and disabled teacher answers. The existing pupil classroom tests are unchanged and included in every repeated run.
- `scripts/review-teacher/`: isolated synthetic fixtures and reproducible capture, axe, keyboard, preferences, source comparison and repetition tools. Not an app entry point; fixture markers were checked absent from production JavaScript.

[Source comparison](source-preservation.json) verifies every existing effect/dependency, non-JSX handler/helper, click/change action, accessible label and test ID against main. `App.tsx` routes/role checks, services, Firebase, Cloudflare, secrets, `.env`, `users.json` and Gemini safeguards were not edited. The native learner-removal confirmation and its exact class/learner payload remain intact. No data feature, route, service call or product action was added. Nothing merged or deployed.

Classroom service events still control live membership, question changes and completion. Teacher timer expiry does not submit an answer or change the question. Pupil menu/join presentation matches baseline at all three widths and appearances; existing pupil submission tests also pass. [Pupil comparison](pupil-parity.json).

The enhanced dashboard remains an isolated legacy component; App does not mount it, and no route was added. Its local analytics/homework reads and export are preserved. These teacher views use existing HTML/CSS bars, not a chart-library component: each keeps its existing subject labels, numeric percentages, quiz counts or submitted/total text as a text alternative. No chart library, chart data or score calculation changed; red/green are not required to distinguish the figures.

## Checks

- Node 20.19.5: lint passed, zero warnings; **359 tests / 72 files passed**; production/PWA build passed. Existing browser-data freshness notices remain; no dependency updates were needed.
- Node 22.23.4 / Vitest 4.0.10: **40 consecutive fresh-process runs**, then a batch after a successful build with **three parallel workers × 40 runs each**. **160 runs / 1,920 test executions / zero failures**. Every new async/timer test was in every run. Subscription fixtures wait for the initial effect before emitting. [Run record](repeated-tests.txt), [per-run results](repeated-tests.json).
- **225 axe 4.14.0 samples, zero violations**: 19 core views/states × 390/768/1280px × standard/dark/high-contrast = 171; plus 54 interaction/preference samples. Empty/error, learner detail, assignments, reports, enhanced tabs and every classroom view are included. Core enabled targets are at least 48×48px; no page-level horizontal overflow. [Core raw axe](after-audits.json), [keyboard/preferences and additional axe](keyboard-preferences.json).
- Keyboard-only at all three widths: Tab to dashboard tabs, arrows/Home/End, Enter on learner cards, cancel native removal confirmation without a mutation, create class, publish assignment, forward/reverse enhanced-dialog focus trap, select a subject/topic, create/start/advance/finish a live classroom session. Teacher answer controls stay disabled; no submitAnswer call. Unit tests additionally cover Escape dismissal and the unchanged export actions.
- 48 preference/font/static-logo checks across all four surfaces and three widths: larger text, calm, UI Less movement and OS reduced motion; Lexend weights and Atkinson body verified. Focus rings are 4px immediately. No external requests from the isolated review browser.
- `git diff --check` passed. Screenshot fixture markers absent from built JavaScript. No real account or learner data was opened, printed, logged or captured.

### Incomplete axe checks

The only incomplete rule is `color-contrast`: **63 core samples and 24 interaction/preference samples**, all for glyph-only close/dismiss controls. These remain recorded as incomplete, not automated passes. The controls retain accessible names. Computed foreground/background checks at all three widths and appearances give at least 4.5:1, and representative controls/screens were visually checked. [18 glyph-contrast samples](glyph-contrast.json). This is DOM/browser, keyboard and visual verification, not a manual screen-reader session.

## Prototype gaps

- The board's per-pupil fractions/topic grid and “Secure / Practising / Not started” categories are not provided by the shared class API. Existing learner records and subject-mastery percentages remain; no topic states were inferred or invented.
- The board's “Most missed idea” and “Make a 5-minute starter” action have no corresponding feature here. Existing assignment and live-session setup remain.
- Per-pupil access-setting counts/editors are not available in the teacher data; that card was omitted.
- Homework `[N]` counters and sample deadlines were not copied. Existing assignment titles, due dates and submission statistics use their original data and calculations. Class codes already implemented by the app remain.
- The board's claim that nobody sees who got it wrong does not describe the existing classroom: names, scores and final correct-answer counts can appear. That assurance was not added, and leaderboard/settings behavior was not changed.
- No saved reports, new safeguarding role, audit-log promise or additional class-code system was introduced. Existing CSV/JSON/print exports remain. Analytics, curriculum and question-quality destinations keep their existing routes; their PR C redesign has not started.

## Retained screenshots

Exactly **12 after-only JPEGs, quality 70**, **1,023,603 bytes total**. Widths are 1280px or 390px; ten standard, one dark and one high-contrast. Synthetic names and deliberately non-working `DEMO-ONLY` / `DEMO00` codes only. No comparison viewer. Fixed dashboards use an extended capture height to show the complete scrollable content; accessibility and keyboard tests use a 900px-high viewport.

| Standard appearance — after | 1280px | 390px |
| --- | --- | --- |
| Teacher home | [Image](after-home-standard-1280.jpg) | [Image](after-home-standard-390.jpg) |
| Shared class dashboard | [Image](after-dashboard-standard-1280.jpg) | [Image](after-dashboard-standard-390.jpg) |
| Enhanced dashboard | [Image](after-enhanced-standard-1280.jpg) | [Image](after-enhanced-standard-390.jpg) |
| Live classroom waiting | [Image](after-classroom-waiting-standard-1280.jpg) | [Image](after-classroom-waiting-standard-390.jpg) |
| Live classroom active | [Image](after-classroom-active-standard-1280.jpg) | [Image](after-classroom-active-standard-390.jpg) |

| Shared class dashboard — after, 390px | Image |
| --- | --- |
| Dark | [Image](after-dashboard-dark-390.jpg) |
| High contrast | [Image](after-dashboard-contrast-390.jpg) |

The full before/after matrix is reproducible with `scripts/review-teacher`; all full-matrix output goes to temporary storage, never this folder. The repository keeps the 12 images and JSON/text evidence only.

## Reproduce

Use a fresh browser profile with the synthetic harness, never a real account. The review Vite loader re-exports one shared fixture module in place of context, workspace, analytics, homework, Gemini and realtime services; browser scripts block every non-loopback request. Baseline source is read using `git show 5da9936d:components/…`.

Run these servers in separate terminals (after 3013, before 3014):

```sh
node node_modules/vite/bin/vite.js --config scripts/review-teacher/vite.config.ts
REVIEW_BASELINE=1 node node_modules/vite/bin/vite.js --config scripts/review-teacher/vite.config.ts
```

Set `PLAYWRIGHT_MODULE` to a local Playwright `index.mjs`, `REVIEW_AXE` to axe-core's `axe.min.js`, and optionally `REVIEW_BROWSER` to a Chrome executable. These are temporary review tools, not application dependencies. All capture scripts default to `ks2-teacher-review` in the OS temporary directory; `REVIEW_OUT` can select another temporary location.

```sh
REVIEW_OUT=/tmp/ks2-teacher-review node scripts/review-teacher/capture.mjs before
REVIEW_OUT=/tmp/ks2-teacher-review node scripts/review-teacher/capture.mjs after
REVIEW_OUT=/tmp/ks2-teacher-review node scripts/review-teacher/exercise.mjs
REVIEW_OUT=/tmp/ks2-teacher-review node scripts/review-teacher/pupil-parity.mjs
REVIEW_OUT=/tmp/ks2-teacher-review node scripts/review-teacher/contrast.mjs
node scripts/review-teacher/verify-source.mjs
```

Optional `REVIEW_WIDTHS`, `REVIEW_THEMES`, `REVIEW_CASES` and `REVIEW_HEIGHT` restrict/extend temporary captures. `node scripts/review-teacher/capture.mjs after --retained` alone writes the approved 12 images to this folder. Do not commit regenerated full matrices. Repeated-test commands are in `repeated-tests.txt`.
