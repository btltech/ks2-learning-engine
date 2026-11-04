# Quiz and results visual review

Base: latest main `093eb6fb5c9a3efb09fa07ef82efc376a933bb81` (PRs #11, #12 and
#14 merged). This branch is independent of the still-open lesson PR #13.

Native Chromium captures at CSS viewport widths 1280 and 390, device scale 2.
The viewport is 900px high; full-page captures include content below the fold.
Fixed navigation stays at its original viewport position in full-page images.

| State | Before 1280 | After 1280 | Before 390 | After 390 |
| --- | --- | --- | --- | --- |
| Question | [Before](before-question-1280.png) | [After](after-question-1280.png) | [Before](before-question-390.png) | [After](after-question-390.png) |
| Correct answer | [Original question flow](before-question-1280.png) | [Correct feedback](after-correct-1280.png) | [Original question flow](before-question-390.png) | [Correct feedback](after-correct-390.png) |
| Wrong answer | [Original result review](before-results-1280.png) | [Wrong feedback](after-wrong-1280.png) | [Original result review](before-results-390.png) | [Wrong feedback](after-wrong-390.png) |
| Results | [Before](before-results-1280.png) | [After](after-results-1280.png) | [Before](before-results-390.png) | [After](after-results-390.png) |

[Phone accessibility settings](accessibility-390.png) ·
[Matching, sorting and ordering](question-types-390.png)

## What was checked

A temporary local Vite review entry rendered the actual Header, QuizView and
FeedbackModal with a synthetic learner. The questions and explanations are the
reviewed Year 4 PSHE **Money choices** content. A review-only Vite loader supplied
that local data and a null user context; no real child account, Firestore writes,
Gemini call or chat submission was used. The standalone question-type review
uses simple synthetic fixtures with the actual components. Before captures use
the original main components. Review entry, baseline copies and temporary config
were removed before committing.

- Played a complete quiz with only Tab, Shift+Tab, Space and Enter: two answers
  right and one wrong; actual results were **2 out of 3**. Result actions remain
  keyboard reachable and the existing focus trap/Escape handler is retained.
- Inspected normal desktop and phone layouts, correct/wrong feedback, results,
  and the matching, sorting and ordering presentations on phones.
- Phone high contrast, larger text and Less movement enabled together. Browser
  measurements: inner width 390, document width 390, zero quiz buttons smaller
  than 48px in either dimension, zero running animations.
- Tests cover immediate advancement, real correct/wrong outcomes, submission
  exactly once, speed timeout, +30 seconds, timer off/on, creative-task score
  exclusion, actual points, result callbacks and Escape, suppression of automatic
  celebration for sound-off, Less movement and OS reduced motion, and cancelling
  a pending celebration when the result dialog closes.
- Existing scoring, adaptivity, question generation and timing/analytics handlers
  are unchanged. Battle and SATs implementations were not edited; no live
  multiplayer or timed SATs session was run in this synthetic local review.

## Differences from the prototype

- The existing quiz submits and advances immediately. There is no extra check /
  retry stage: the same action now reads **Check answer** (last question remains
  **Finish Quiz**), and its existing aria-label and callback are unchanged.
  Wura presents feedback for the last submitted answer alongside the next
  question; correct/wrong styling uses the existing scoring helper. Answers are
  never revealed before submission. Wrong feedback says **Worth another look**
  because the existing retry action is at the end of the quiz.
- The progress dots show completed/current/new questions, not an invented score.
  Existing speed-mode controls remain, and **No timer** reflects actual state.
- Results remain the existing focus-trapped, scrollable dialog. Its opening focus
  now lands on the score summary so a long review does not open at the bottom.
- Rewards remain the real **points earned**, shown with a star. No new stars
  conversion or reward system was invented. **Try Again** retries the existing
  quiz flow, and **New Topic** keeps the existing destination. There is no fake
  Home route, next-topic prediction or incorrect-only retry button.
- MiRa's result tip is static practice guidance; existing generated explanations
  and their Listen controls remain available. The confetti strip is static, so
  it needs no canvas animation. Automatic celebration audio respects sound and
  reduced-motion settings; manual explanation read-aloud stays available.
- Actual question wording/counts and all existing question types remain intact.
  Shapes supplement multiple-choice/true-false answer values. Matching and
  sorting feedback now has both an icon and a word on each checked item.

## Checks

- `npm run lint`: passed, zero warnings.
- `NODE_OPTIONS=--no-experimental-webstorage npm test -- --run`: 277 tests passed
  in 55 files. The flag avoids this host Node's incomplete experimental storage
  replacing the test storage mock during the pre-existing Kokoro tests.
- `npm run build`: passed. Existing browser-metadata age notices remain.

No merge or deployment was performed.
