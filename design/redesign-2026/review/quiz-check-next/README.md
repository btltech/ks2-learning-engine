# Quiz: Check answer, then Next

Based on `main` at `7f2386e0` (including the Sunny Owl redesign, artwork fix and classroom test fix), on `feature/quiz-check-then-next`.

Check uses the existing `buildQuizResults` scorer once for the current question, stores that result and answer time, locks the inputs, and focuses the current question's feedback. Next only advances; Finish sends the stored results through the existing `recordQuizAttempts` / `onSubmit` completion pipeline once. Wrong answers cannot be retried within the quiz. The results dialog and its Retry action are unchanged.

Matching and sorting expose optional deferred checking / answer-change callbacks so QuizView can own the same Check button for every type. Their standalone check/scoring paths remain unchanged. Drawing/creative tasks retain their existing unscored completion and local-only drawing sentinel; they are not described as a wrong knowledge answer.

Timeouts retain the existing blank-answer scoring rule, stop the timer, focus “Time’s up” feedback for that question, and wait for Next. Timer-off preference persists between questions, and standard mode never starts a timer. Answer time stops at Check/timeout rather than including time spent reading feedback.

## Validation

See the [ordering review follow-up](ordering-review.md) for the reproduced reset race, fix, Node 22 validation and extended stress runs. The results below record the initial PR validation at `93b05448`.

Using Node 20.19.5, matching CI:

- `npm run lint` — passed, zero warnings.
- `npm test -- --run` — 68 files, 341 tests passed.
- `npm run build` — passed, including PWA generation.
- `npm test -- --run components/QuizView.test.tsx components/MatchingQuestion.test.tsx` — 20 consecutive runs passed, 16 tests per run. See [run record](repeated-tests.txt).
- `git diff --check` — passed.

Regression coverage includes multiple choice (including indexed correct answers), true/false, accepted fill-in variants and Enter submission, matching, keyboard sorting, ordering, drawing/creative completion, resetting consecutive matching questions, locked wrong answers, same-render rapid clicks, double-clicks, repeated Enter/Space, voice submit repeats and late transcripts, timeout versus Check, timer controls, completion exactly once, and excluding feedback reading time from answer timing. The scorer is spied on to verify that Next/Finish never score again.

Browser checks used the real components and styles with synthetic, local review fixtures at 1280×1000 and 390×900. The opt-in fixture is `/scripts/review-phone/index.html?screen=quiz&flow=check-next` under the existing review Vite server. No real learner data or production writes are used.

Keyboard-only verification at both sizes: arrow keys select answers; Tab reaches Check; Enter checks; focus moves to the named `role="status"` feedback; the next Tab reaches Next; Enter advances and focuses the new question heading. The same pinned phone button changes labels and remains above the bottom navigation. Wrong feedback includes an arrow, words, explanation and correct answer; correct feedback includes a tick and words. Canvas pointer events, native form controls and late voice answers lock after Check.

Dark and calm appearances, plus high contrast / larger text / Less movement together, were checked at 390px. No horizontal overflow or enabled controls smaller than 48px were found in the sampled states. Reduced-motion transitions were `0s`. Axe 4.14.0 found zero violations in the desktop, phone and display-mode samples; [raw results](accessibility.json) retain incomplete contrast checks for gradient/obscured content and icon-only characters. Feedback contrast and visibility were also checked visually. This is browser/DOM accessibility verification, not a manual screen-reader session.

## Screenshots

Phone captures show the actual viewport after choosing or after feedback receives focus; the page scrolls to keep feedback above the pinned action bar. Desktop captures show the whole question.

| State | 1280px | 390px |
| --- | --- | --- |
| Choosing an answer | [Desktop](choosing-1280.jpg) | [Phone](choosing-390.jpg) |
| Correct feedback | [Desktop](correct-1280.jpg) | [Phone](correct-390.jpg) |
| Wrong feedback | [Desktop](wrong-1280.jpg) | [Phone](wrong-390.jpg) |
| Last question, checked, Finish Quiz | [Desktop](last-question-1280.jpg) | [Phone](last-question-390.jpg) |

Additional phone feedback captures: [dark](wrong-appearance-dark-390.jpg), [calm](wrong-appearance-calm-390.jpg), [high contrast + larger text + Less movement](wrong-high-contrast-390.jpg).

## Scope check

Battle (`QuizBattle` / `QuizBattleRealtime`) and SATs (`SATsPracticeMode`) use separate question, timing and submission implementations. They do not render QuizView and were not edited. The full suite passes.

`App.tsx`'s points, mastery, badges, streaks, adaptivity/session persistence and analytics event handlers, `FeedbackModal`, the scoring service, all other services, Firebase/Cloudflare configuration, secrets and Gemini safeguards are unchanged. Nothing was merged or deployed.
