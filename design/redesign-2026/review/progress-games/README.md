# Prompt 8, part 1: progress and games

Base: fetched `origin/main` at `9afe74c1`, including merged PR #16. Branch: `redesign/8-progress-games-art-avatar`. Art studio and avatar are a separate PR from the same base so each review stands alone. No merge or deployment was run.

## What changed

- `views/ProgressView.tsx`: trophy hero with the current avatar and learner's existing points/streak, three-part subject milestone bars with a text legend/counts, My sticker book and Beat your own best. Existing tabs, deep links, certificates, skill-tree dialogs and historical chart remain. Friends still shows names/status; peer level/points are omitted to honour “never compare children”.
- `components/ProgressView.tsx`: legacy mastery widget styling and the same badge/personal-best presentation; its existing average-score calculation remains.
- `components/sunny/ProgressPresentation.tsx`: presentation of completed / attempted / unattempted skill nodes and already-awarded badges. Unlocked nodes with zero progress are not counted as learning. No achievement state is written here.
- `data/badges.ts` and `context/UserContext.tsx`: move the existing five badge definitions, unchanged, into shared metadata. Award conditions, timestamps, updates and authentication code are unchanged.
- `App.tsx`: pass the already-loaded user into the existing progress route; route and role guard unchanged.
- `components/MiniGames.tsx`: Game time hero, illustrated cards, factual feature chips, Play and How to play entrances to the existing introduction, and a link to the existing art route. Start remains the only action that spends a play. Existing five games, elapsed time, questions, server requests, credits, results and resume/abandon behavior remain.
- `components/GamesLockOverlay.tsx`, `components/StreakRewards.tsx`: readable Wura lock/reward presentation, selected tabs and 48px controls; existing thresholds, reward claims and modal hooks remain.
- `components/ProgressChart.tsx`: disable chart animation; data and calculations unchanged. Game confetti also honours the app's existing reduce-motion root switch.
- `components/SunnyProgressGames.css`: scoped responsive styles, ink text, focus rings, display-setting and reduced-motion overrides. Regression tests cover real milestone/award state and the new introduction entrance without spending a play.

## Validation

- `npm run lint`: passed, zero warnings.
- `NODE_OPTIONS=--no-experimental-webstorage npm test -- --run`: **60 files / 293 tests passed**. The environment flag is this host's Node compatibility workaround only.
- `npm run build`: passed, including PWA output.
- Native Chrome review in `npm run dev`: progress, game catalogue, lock widget and streaks at **1280 × 900** and **390 × 900**. Also inspected active games and large text/high contrast with reduced movement.
- Keyboard-only: subject selection opens the existing skill tree and Escape closes it; How to play opens the existing introduction; a locked learner's Start remains disabled with its unlock explanation; the Daily Rewards tab exposes the existing seven-day calendar.

The temporary review uses actual before/after components with synthetic learner/milestone/game/reward fixtures. Before copies come directly from the base commit. Local fixture services make no authenticated requests, consume no real plays and claim no real rewards. Fixtures and review entries are excluded from the PR and removed after the full Prompt 8 review. Screenshots are moved into this folder immediately, leaving no task captures in Downloads.

## Screenshots

Native captures at 2× device-pixel ratio. Progress/streaks are full-page images; their fixed tab bar can appear at the original viewport fold. Games uses the existing fixed, internally scrolling shell, so those captures show the viewport rather than all cards at once.

| Screen | Before 1280 | After 1280 | Before 390 | After 390 |
| --- | --- | --- | --- | --- |
| Progress | [Before](before-progress-1280.png) | [After](after-progress-1280.png) | [Before](before-progress-390.png) | [After](after-progress-390.png) |
| Games | [Before](before-games-1280.png) | [After](after-games-1280.png) | [Before](before-games-390.png) | [After](after-games-390.png) |
| Lock widget | [Before](before-lock-1280.png) | [After](after-lock-1280.png) | [Before](before-lock-390.png) | [After](after-lock-390.png) |
| Streak rewards | [Before](before-streak-1280.png) | [After](after-streak-1280.png) | [Before](before-streak-390.png) | [After](after-streak-390.png) |

Additional checks: [locked game introduction](after-games-locked-390.png), [active game desktop](after-games-session-1280.png), [active game phone](after-games-session-390.png), [accessible progress](after-progress-accessible-390.png), [accessible games](after-games-accessible-390.png).

## Differences from the sample boards

The app stores skill-tree completion, not the prototype's repeated-correct-on-different-days confidence model. The legend explicitly explains the existing milestone interpretation; no learning policy or completion threshold changes. The hero counts skill milestones and existing points/streaks, and the historical chart is retained. The example “best week” topic total is absent because that metric is not available here.

Game names/content, the earned-play rules and elapsed timers are preserved. Cards use accurate subject/question-count chips, not unsupported “No timer”, friend invitations or prototype-only games. Play and How to play both open the current introduction before Start. The art card links to `/art-studio`; the separate art/avatar PR is not required for that route to work.
