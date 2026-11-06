# PR C — Clear Path admin and analytics screens

Branch `redesign/13-admin`, based on fetched main `3144ae86` (squash-merged PR #29). References: `boards/AdminConsole.dc.html`, `boards/Analytics.dc.html`, their screen JPGs and the Clear Path foundations. The user's grown-up instructions override the child-only Sunny Owl typography in the design README.

## Scope

- `AdminConsole.tsx`: scoped presentation, responsive navigation/cards, labels for the existing directory and role controls, and named On/Off settings toggles with a symbol and words. All original role-update validation, authenticated request, metrics/claims reads, directory search, feedback resolution and local settings callbacks remain exact.
- `AnalyticsDashboard.tsx`: Clear Path header/cards/tabs, accessible close naming, semantic headings and existing topic/trend words with symbols. The existing daily heatmap keeps its data and intensity calculation; each day now displays its quiz count and has a date/count accessible name. A disclosure exposes all displayed daily values in a labelled, keyboard-scrollable table. Weekly active days have ticks/dashes and Active/No quizzes text.
- `QuestionQualityDashboard.tsx`: scoped modal presentation, subject naming, a named scroll region, keyboard-operable existing question disclosure and expanded states. Existing modal focus/close behavior, refresh, subject filter, minimum five attempts and local fallback remain.
- `CurriculumCoverageDashboard.tsx`: scoped presentation, labelled subject/year selectors and strand expanded states. Its existing mock progress generator, filters, calculations, status icons and words remain unchanged.
- `CloudBankMonitor.tsx`: scoped loading/error/content styling, responsive rows and bars. Existing refresh call, errors, values, dates and percentages remain unchanged.
- `ClearPathAdmin.css`: self-hosted Lexend 600/700, existing Atkinson Hyperlegible; ink `#172033`, muted `#4A5568`, action `#1E55C8`, controls `#7A8496`, card borders `#D5DAE5`, page `#F6F7FB`, white 2px/24px cards, 48px targets and immediate 4px focus. Checkbox labels provide the full 48px click area around native checkboxes. Dark, calm, high contrast, larger text, UI Less movement and OS reduced motion remain supported. Static SVG logo transforms remain. App header, curriculum overlay close and notifications receive scoped styling without changing their source or callbacks. Tab/toast fades are disabled here so their text stays readable immediately.
- `AdminPresentation.test.tsx`: ten tests cover the original validation/gates, exact role request, directory search/filter/errors, feedback id/callback, settings values and 2500ms message, question filters/fallback/modal close, cloud values/errors, chart/table equivalence and curriculum disclosure.
- `scripts/review-admin/`: synthetic-only review tools and fixtures, not app entry points. Baseline/after Vite servers use separate caches in temporary storage. No review dependency was added to the app.

[Source preservation](source-preservation.json) compares every existing effect/memo dependency, non-JSX helper/handler, click/change action, fetch/logging/confirmation call, accessible label and test ID with fetched main. `App.tsx`, the shared modal shell and Toast source are byte-identical. No services, Firebase, Cloudflare, server settings, secrets, `.env`, `users.json` or Gemini safeguards changed. Existing authorization, confirmation and audit/logging behavior is retained; no new promise or logging was added. No real account, learner or safeguarding data was opened, printed, logged or captured. Nothing merged or deployed.

## Checks

- Node 20.19.5: lint passed with zero warnings; **369 tests / 73 files passed**; production/PWA build passed. Existing browser-data freshness notices remain; dependencies are unchanged.
- Node 22.23.4 / Vitest 4.0.10: **40 consecutive fresh-process runs**, plus after a successful build **three parallel workers × 40 consecutive runs each**. **160 runs / 1,600 test executions / zero failures**, including every new async/timer test. [Record](repeated-tests.txt), [per-run details](repeated-tests.json).
- Axe 4.14.0: **312 samples, zero violations** at **390, 768 and 1280px**. Core: 27 views/states × three widths × standard/dark/high-contrast = 243. Additional keyboard/interaction/preference samples = 69. No page-level horizontal overflow; core enabled click targets meet 48px (native checkbox measured through its clickable label). [Core axe](after-audits.json), [additional axe/keyboard/preferences](keyboard-preferences.json).
- Keyboard-only at all three widths: existing navigation, directory controls, exact normalized role-update request, Enter search, role filtering, feedback resolution, Space on settings switches, saving, analytics tabs/table scrolling, question filter/disclosure and forward/reverse dialog trap/Escape, curriculum selectors/strands and cloud refresh. Unit tests additionally cover signed-out and server-rejected role updates; no new confirmation was inserted into the original direct-update flow.
- 60 font/preference/static-logo checks across all five surfaces and three widths: larger text, calm, app Less movement and OS reduced motion. Both local Lexend weights and Atkinson body verified; 4px focus rings. No external review-browser requests.
- `git diff --check` passed. Review markers absent from built JavaScript. Full matrices remain temporary. [Verification summary](verification-summary.json).

### Incomplete axe checks

The only incomplete rule is `color-contrast`, present in 117 core and 29 additional samples. Its items include glyph-only close buttons/status symbols, zero/short table text, table cells clipped inside the horizontal scroller, and text partially covered by sticky headers/menus/toasts. These remain recorded as incomplete, not automated passes. The daily table is keyboard-scrollable; symbols have accompanying words or accessible names. Representative screens were checked visually, with 108 separate computed-color samples for close controls, settings switches and daily table cells, all at least 4.5:1. See [contrast review](contrast-review.json) and the raw axe files for targets and reasons. This is browser/DOM, keyboard and visual verification, not a manual screen-reader session.

## Prototype gaps

- The board's separate safeguarding queue, designated-lead workflow and safeguarding-only detail gate are not implemented in these components. The board's sensitive sample rows, “every view is logged” and “only the safeguarding role” claims were **not added**. Existing content-feedback resolution remains exactly as implemented; it was not relabelled as a safeguarding workflow. No safeguarding records or conversations were accessed.
- Recording playback/Approve/Reject, question editing/taking offline, schools/classes management and an audit-log browser are not implemented here. Their board buttons/routes, sample records and placeholder counts were omitted. Existing question-quality drill-down and “Mark Resolved” remain.
- Existing User Management updates selected roles by email; it has no delete/unlink/reset/approve/reject workflow and no confirmation dialog on that action. Its signed-in check, validation, authenticated endpoint request, server-error handling and App admin role gate are unchanged. No confirmation step or audit event was removed or invented.
- Admin Platform Analytics explicitly has no connected platform-wide dataset. It retains that wording; the board's school-wide weekly learner totals, date-range/year controls, retry percentages, access-setting counts and export report action were not invented.
- `AnalyticsDashboard` is currently the student's local learning-analytics route in App. It keeps its route/gate, local data, labels and calculations despite using the requested calmer style; it was not relabelled “School analytics”.
- Curriculum Coverage already generates random demonstration progress with `generateMockProgress`; this existing behavior is unchanged. A seeded RNG is used only in the synthetic screenshot harness for reproducibility. No real learner mastery is implied by the review fixtures.
- Existing System Overview event placeholders, local-only settings wording and disabled Add User After Signup control remain. No claim that all views/actions are logged, that settings are saved to a server, or that new management features are available was added.

## Retained screenshots

Exactly **12 after-only JPEGs, quality 70**, **1280px or 390px wide**, **1,445,930 bytes total**: ten standard, one dark and one high contrast. Synthetic names and `example.invalid` addresses only. No comparison viewer. The full before/after matrix is reproducible with `scripts/review-admin`; its output goes to temporary storage, never this folder. Quality and curriculum use extended capture heights to include scrollable content; accessibility and keyboard checks use 900px-high viewports.

| Standard appearance — after | 1280px | 390px |
| --- | --- | --- |
| Admin console | [Image](after-admin-standard-1280.jpg) | [Image](after-admin-standard-390.jpg) |
| Analytics activity | [Image](after-activity-standard-1280.jpg) | [Image](after-activity-standard-390.jpg) |
| Question quality detail | [Image](after-quality-detail-standard-1280.jpg) | [Image](after-quality-detail-standard-390.jpg) |
| Curriculum strand detail | [Image](after-curriculum-expanded-standard-1280.jpg) | [Image](after-curriculum-expanded-standard-390.jpg) |
| Cloud Bank Monitor | [Image](after-cloud-standard-1280.jpg) | [Image](after-cloud-standard-390.jpg) |

| Admin console — after, 390px | Image |
| --- | --- |
| Dark | [Image](after-admin-dark-390.jpg) |
| High contrast | [Image](after-admin-contrast-390.jpg) |

## Reproduce

Use fresh browser storage and the synthetic harness, not a real account. The Vite loader replaces user/auth, question performance, content feedback, settings, cloud and analytics imports with one shared fixture module. The role-update endpoint is intercepted by the harness with a synthetic response. Browser scripts block every non-loopback request. The baseline loader reads `git show 3144ae86:components/…`. The app header and curriculum overlay composition are included without mounting real App services.

Run in separate terminals (after 3015, before 3016):

```sh
node node_modules/vite/bin/vite.js --config scripts/review-admin/vite.config.ts
REVIEW_BASELINE=1 node node_modules/vite/bin/vite.js --config scripts/review-admin/vite.config.ts
```

Set `PLAYWRIGHT_MODULE` to a local Playwright `index.mjs`, `REVIEW_AXE` to axe-core's `axe.min.js`, and optionally `REVIEW_BROWSER` to Chrome. These are temporary review tools, not app dependencies. Capture output defaults to `ks2-admin-review` in the OS temporary directory; set `REVIEW_OUT` to another temporary location if wanted.

```sh
REVIEW_OUT=/tmp/ks2-admin-review node scripts/review-admin/capture.mjs before
REVIEW_OUT=/tmp/ks2-admin-review node scripts/review-admin/capture.mjs after
REVIEW_OUT=/tmp/ks2-admin-review node scripts/review-admin/exercise.mjs
REVIEW_OUT=/tmp/ks2-admin-review node scripts/review-admin/contrast.mjs
node scripts/review-admin/verify-source.mjs
```

`REVIEW_WIDTHS`, `REVIEW_THEMES` and `REVIEW_CASES` can restrict temporary captures. Only `node scripts/review-admin/capture.mjs after --retained` writes the approved 12 images to this folder. Do not commit full matrices. Repeated-test commands are recorded in `repeated-tests.txt`.
