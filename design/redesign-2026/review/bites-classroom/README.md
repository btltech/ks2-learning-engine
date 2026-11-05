# Prompt 9 — bites and pupil classroom

Based on main `15d1039ef84a8e6bd2c9b473277513cca53e14ae` after PRs #17 and #18. Settings is a separate independent PR.

## Changes and preserved behaviour

- MicrolearningDashboard and MicrolearningCard: Wura hero, subject strips, time chips, progress panel and compact More bites column. All five sessions, daily/recommended picks, points, timed quizzes and Start callbacks remain.
- ClassroomMode: pupil-only join, waiting, question and results presentation; labelled class code, thinking Wura and shaped answers. Teacher controls remain in their original presentation. The existing join, subscription, timer, answer payload and single-answer lock are unchanged.
- Delivery feedback follows the existing submission promise: Sending, Answer sent, or failure. A rejected write never claims success. Tests cover normalisation, pending/success/failure, invalid codes and teacher controls.
- SunnyBitesClassroom.css: scoped responsive layouts, 48px controls, visible focus, larger text, high contrast and reduced movement.

## Review and validation

`npm run lint`, `NODE_OPTIONS=--no-experimental-webstorage npm test -- --run` (65 files / 304 tests), and `npm run build` pass. The NODE_OPTIONS flag works around the local Node Web Storage API; CI uses Node 20.

The local Vite review rendered the actual components with synthetic Casey / ABC123 fixtures. No real classroom was created, no Firebase connection was made and no learner record was changed. Service contracts were verified with mocks, not a live multi-user backend. The preview alone fixed the random afternoon recommendation so before/after capture was stable; production recommendation logic is unchanged.

Chrome review covered 1280px and 390px widths, join and answered states, waiting, failed submission, combined larger text / high contrast / reduced motion, keyboard join and answer, and the actual Start callback (`quick_maths`, five questions). Screenshots are at 2x resolution. Full-page mobile captures paint the fixed tab bar at the initial viewport fold; this is a capture artifact, not a second bar. Captures were moved into this directory immediately; none remain in Downloads.

| Screen | Before desktop | After desktop | Before phone | After phone |
| --- | --- | --- | --- | --- |
| Bites | [before](before-bites-1280.png) | [after](after-bites-1280.png) | [before](before-bites-390.png) | [after](after-bites-390.png) |
| Join | [before](before-classroom-join-1280.png) | [after](after-classroom-join-1280.png) | [before](before-classroom-join-390.png) | [after](after-classroom-join-390.png) |
| Question / submitted | [before](before-classroom-active-1280.png) | [after](after-classroom-active-1280.png) | [before](before-classroom-active-390.png) | [after](after-classroom-active-390.png) |

Additional captures: waiting and delivery failure at 1280px; accessible bites, join and question at 390px.

## Prototype gaps

The existing MicroSession model contains timed quiz sessions, not Idea / Example / Question pages, Say it, Listen, saved bites or a save store. Adding those would change features and behaviour beyond this looks-only prompt, so there are no inert controls or invented saved content.

The classroom uses a timer and one answer per question. Prototype promises about waiting for everybody or changing answers would be inaccurate and are omitted. The privacy note truthfully says the teacher can see submitted results and names/scores can appear on the class leaderboard. Submission success is only shown after the existing promise resolves.

Nothing was merged or deployed.
