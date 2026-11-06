# PR A — Clear Path parent screens

Based on fetched main `ff97190e`, branch `redesign/11-parent`. Reference: `boards/ParentDashboard.dc.html`, `screens/ParentDashboard.jpg` and `screens/Main.jpg`; the user's Clear Path instructions take precedence over the child-only Sunny Owl notes in the design README. Teacher and admin redesigns are not part of this PR.

## Presentation and scope

Parent surfaces use self-hosted `@fontsource/lexend` 600/700 headings and the existing Atkinson Hyperlegible body font; ink `#172033`, muted `#4A5568`, action `#1E55C8`, strong control borders `#7A8496`, card/divider borders `#D5DAE5`, page `#F6F7FB`, white cards with 2px borders and 24px corners, 48px minimum controls and 4px focus rings. Dark, calm and high-contrast appearances reuse the existing display tokens. No Google font requests or server/CSP changes. There are no decorative owls beyond the existing logo on its white header sticker.

Files changed:

- `ParentHomeView.tsx`, `ParentDashboard.tsx`, `ParentMonitoringDashboard.tsx`, `ParentActivityLog.tsx`, `StruggleAlert.tsx`: parent-only styling hooks, responsive grouping and semantic headings; existing copy, values and actions retained.
- `ClearPathParent.css`: scoped parent presentation, typography, responsive controls, display preferences and focus. It does not apply the parent theme to teacher/admin or child screens.
- `SubjectProgressCharts.tsx`, `CurriculumTracking.tsx`: the existing HTML/CSS charts and calculations remain; a table exposes the same subject values, and curriculum states have explicit symbols and words. Existing numeric labels remain text alternatives for the other progress bars.
- `ChildSelector.tsx`, `SignIn.css`, `AgeGroupedLeaderboard.tsx`, `ProgressNotifications.tsx`: heading semantics, pressed-state / dismiss naming and inherited parent styling. The child picker's original child-facing heading size stays intact outside a parent surface.
- `ParentPresentation.test.tsx`: keyboard access, original confirmation/cancellation, report arguments, legacy dialog behavior, chart/table values and the existing 300ms alert delay.
- `package.json` / `package-lock.json`: only the Lexend font dependency.
- `scripts/review-parent/`: isolated fixtures, before-source loader and reproducible screenshot/axe/keyboard tooling. These are not application entry points; synthetic fixture markers were checked absent from production JavaScript.

A source-AST comparison against fetched main confirmed the existing `handle*` / child-preview handlers and all authentication, report-generation and realtime calls are unchanged in the ten involved components. `App.tsx`, route/role gates, services, Firebase/Cloudflare configuration, secrets, `.env`, `users.json` and Gemini safeguards were not edited. Delete, unlink, regenerate, reset and other existing confirmation steps remain as implemented. This includes retaining the existing direct quick-reset actions rather than inventing new confirmation flows.

Accessibility presentation adds keyboard arrow/Home/End support to the existing parent tab actions, clear heading structure, a named scroll region for the table, and the existing modal-focus hook for StruggleAlert. Its accept/dismiss callbacks and 300ms delay are unchanged. No routes or new product actions were added. The legacy ParentDashboard and StruggleAlert components are not currently mounted by App routes; they were restyled and verified in isolation without making them new routes.

## Checks

- Node 20.19.5: lint passed with zero warnings; **351 tests in 70 files passed**; production/PWA build passed.
- Node 22.23.4: the two targeted parent files passed **40 consecutive runs**, plus **three parallel workers × 40 consecutive runs each**: **160 runs, 1,600 test executions, zero failures**. Every new async/timer test was included in every run. [Run record](repeated-tests.txt).
- Existing browser-data freshness notices appear in test/build tooling; no dependency upgrades beyond the requested font were made for those notices.
- **183 axe 4.14.0 samples, zero violations**: all main views and nested states at **390, 768 and 1280px**, in standard, dark and high contrast, plus calm/larger-text/Less movement combinations. No page-level horizontal overflow; enabled controls in the core matrix meet 48×48px. The subject table intentionally scrolls inside its labelled region at phone width.
- Keyboard-only checks at all three widths: reach tabs by Tab, operate them with arrows/Home/End, enter and cancel reset confirmation, trap and restore dialog focus, preserve the native delete confirmation, scroll the table with a keyboard, and operate/dismiss the alert. Synthetic cancellation checks confirmed no reset/delete service stub was called.
- Local font weights and body/heading families verified. App and OS reduced-motion checks passed at all three widths: no animations/transitions, static SVG logo transforms preserved, no external requests. [Preference results](preferences.json).
- `git diff --check` passed. No real accounts or learner records were opened, logged or captured. Nothing merged or deployed.

### Incomplete axe checks

The remaining incomplete rule is **`color-contrast`**, present in **88 samples**: glyph-only close controls and text overlapped/obscured by sticky headers, menus or modal layers. These are recorded rather than counted as automated passes. Text uses the supplied ink/muted/action tokens; active controls, dialogs/menus and representative standard/dark/high-contrast screenshots were also checked visually. The table's earlier ARIA review item was resolved by giving its named scroll container an explicit region role. This is browser/DOM, keyboard and visual verification, not a manual screen-reader session.

[Core raw axe results](after-audits.json) · [Nested states and keyboard results](after-interaction-audits.json) · [Summary](verification-summary.json)

## Prototype gaps

- The prototype's `[N]` weekly learning-time, finished-topic and first-time-right counters are not copied into the UI. Existing learning-time, quiz, points, streak, badge and mastery figures retain their actual scope and calculations.
- The subject table uses the existing mastery percentage, mastered count and total topic count. The prototype's separate “Confident / Learning / Last practised” topic columns are not invented from other data.
- The prototype's “Questions asked to MiRa” conversation feed, “nothing needed your attention” statement and automatic safeguarding-email promise are not exposed by these parent screens. No conversation/safeguarding data access or assurances were added.
- Per-child reading/listening controls, editable family time/game/class-only rules and a weekly-summary-email settings panel are not present in these parent surfaces. Their prototype cards/buttons were omitted.
- The board's “Switch to child” navigation does not replace the app's existing read-only child preview or change authentication roles. Existing home, monitoring tabs, report generation, account/child controls, help route and logout behavior remain.
- Generated reports keep the existing on-demand flow and disclosure. No saved-report feature or new logging claim was added.

## Retained screenshots

The repository keeps only these **12 after screenshots**, saved as JPEG at **quality 70**, at **1280px or 390px wide**. The full before/after set is reproducible with the scripts in `scripts/review-parent`; it is not committed. All images use synthetic data, including the deliberately non-working `DEMO-ONLY` parent code. Monitoring overview includes the Activity Timeline.

| Standard appearance — after | 1280px | 390px |
| --- | --- | --- |
| Parent home | [Screenshot](after-home-standard-1280.jpg) | [Screenshot](after-home-standard-390.jpg) |
| Monitoring overview | [Screenshot](after-monitoring-standard-1280.jpg) | [Screenshot](after-monitoring-standard-390.jpg) |
| Reports | [Screenshot](after-reports-standard-1280.jpg) | [Screenshot](after-reports-standard-390.jpg) |
| Settings & Actions | [Screenshot](after-settings-standard-1280.jpg) | [Screenshot](after-settings-standard-390.jpg) |
| Reset confirmation | [Screenshot](after-reset-confirm-standard-1280.jpg) | [Screenshot](after-reset-confirm-standard-390.jpg) |

| Monitoring overview — after, 390px | Image |
| --- | --- |
| Dark | [Screenshot](after-monitoring-dark-390.jpg) |
| High contrast | [Screenshot](after-monitoring-contrast-390.jpg) |

Reset-confirmation images capture the viewport so the active dialog is clear. The other retained images show the full page. JSON/text accessibility, keyboard, preference and repeated-test evidence is retained unchanged.

PR B (teacher) and PR C (admin) each have the same budget from the start: **at most 12 JPEGs, quality 70, no wider than 1280px**. Keep their full matrices outside git.

## Reproduce locally

Use a fresh browser profile and the synthetic harness, not a real account. The review Vite config replaces context, auth, Gemini and realtime imports with local fixtures. The browser scripts block every non-local request. The baseline config reads only the fetched-main source snapshot using `git show ff97190e:…`.

```sh
node node_modules/vite/bin/vite.js --config scripts/review-parent/vite.config.ts
REVIEW_BASELINE=1 node node_modules/vite/bin/vite.js --config scripts/review-parent/vite.config.ts
```

Run the servers in separate terminals. After starts on port 3011, baseline on 3012. Open `/scripts/review-parent/index.html?screen=monitoring` for the synthetic harness.

The full-matrix scripts default to `ks2-parent-review` inside the system temporary directory; set `REVIEW_OUT` to choose another untracked location. They no longer write the full matrix into the repository by default.

The capture scripts use temporary Playwright and axe-core tooling, not new application dependencies. Set `PLAYWRIGHT_MODULE` to its local `index.mjs`, `REVIEW_AXE` to `axe.min.js`, and optionally `REVIEW_BROWSER` to a Chrome executable. Run `capture.mjs` and `exercise.mjs` with `before` / `after`; use `REVIEW_URL=http://127.0.0.1:3012` for baseline. `preferences.mjs` checks both motion settings and fonts; `viewports.mjs` produces compact PR comparisons. All scripts are in `scripts/review-parent/`.

To reproduce the complete before/after matrix in an explicit temporary directory (with the tooling environment variables above already set):

```sh
REVIEW_OUT=/tmp/ks2-parent-review node scripts/review-parent/capture.mjs after
REVIEW_OUT=/tmp/ks2-parent-review REVIEW_URL=http://127.0.0.1:3012 node scripts/review-parent/capture.mjs before
REVIEW_OUT=/tmp/ks2-parent-review node scripts/review-parent/exercise.mjs after
REVIEW_OUT=/tmp/ks2-parent-review REVIEW_URL=http://127.0.0.1:3012 node scripts/review-parent/exercise.mjs before
REVIEW_OUT=/tmp/ks2-parent-review node scripts/review-parent/viewports.mjs
```

`node scripts/review-parent/retained.mjs` recaptures only the twelve approved images in this folder at JPEG quality 70. Do not commit the regenerated full matrix.
