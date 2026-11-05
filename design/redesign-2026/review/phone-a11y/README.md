# Phone and accessibility review

Reviewed locally on **5 November 2026**, against `63288fdc`, using real UI components with synthetic learner/service fixtures. See [ACCESSIBILITY_AUDIT.md](../../../../ACCESSIBILITY_AUDIT.md) for the findings, validation and remaining manual checks, and the [reusable harness](../../../../scripts/review-phone/README.md) for reproduction.

[Phone overview](phone-overview.jpg)

## Standard matrix

Each composition passed axe at **390×900, 768×900 and 1280×900** (63 runs). Every measured document fits its viewport. The captures below are 390×900 viewport images at device scale 1. Fixed navigation is shown at the actual viewport edge.

| Composition | Phone capture |
| --- | --- |
| Landing, with storage notice | [Image](after-landing-390.jpg) |
| Sign-in, with public header/footer | [Image](after-login-390.jpg) |
| Embedded learner picker | [Image](after-children-390.jpg) |
| Standard home | [Image](after-home-390.jpg) |
| Guided home | [Image](after-guided-390.jpg) |
| Topic path | [Image](after-topics-390.jpg) |
| Lesson and pinned quiz action | [Image](after-lesson-390.jpg) |
| Quiz and pinned submission | [Image](after-quiz-390.jpg) |
| Results dialog | [Image](after-results-390.jpg) |
| Language passport | [Image](after-languages-390.jpg) |
| Pronunciation and pinned playback | [Image](after-pronounce-390.jpg) |
| Yorùbá library, sampled reviewed entries | [Image](after-library-390.jpg) |
| Progress | [Image](after-progress-390.jpg) |
| Games | [Image](after-games-390.jpg) |
| Art gallery | [Image](after-gallery-390.jpg) |
| Art lesson | [Image](after-artLesson-390.jpg) |
| Drawing canvas | [Image](after-canvas-390.jpg) |
| Avatar | [Image](after-avatar-390.jpg) |
| Five-minute bites | [Image](after-bites-390.jpg) |
| Pupil classroom menu | [Image](after-classroom-390.jpg) |
| Voice/display settings | [Image](after-settings-390.jpg) |

Additional captures: [pupil sign-in](after-sign-in-child-390.jpg), [active classroom](after-classroom-active-390.jpg), [matching](after-quiz-matching-390.jpg), [sorting](after-quiz-drag-and-drop-390.jpg), [ordering](after-quiz-ordering-390.jpg), [fill-in](after-quiz-fill-in-blank-390.jpg).

Combined larger text, high contrast and reduced movement: [home](after-accessible-home-390.jpg), [lesson](after-accessible-lesson-390.jpg), [quiz](after-accessible-quiz-390.jpg), [pronunciation](after-accessible-pronounce-390.jpg), [settings](after-accessible-settings-390.jpg), [languages](after-accessible-languages-390.jpg).

## Before and after

- [Before axe](axe-before.json): 21 baseline compositions; one critical and three serious findings, plus lower-severity findings. The missing-page-heading findings on standalone pronunciation/canvas/child-picker fragments reflect absent surrounding page context in that initial harness. The final harness supplies that context.
- [Before public-layout target measurements](axe-before-public-layout.json): the shared footer and storage notice had small controls, although axe reported no violation for those targets under the selected rules.
- [After axe](axe-after.json): all three standard widths, additional question types, combined preferences and active classroom. Zero reported violations in these recorded states. Incomplete checks are retained for manual review.
- [Final pinned-action recheck](final-fixed-actions.json): the preserved harness renders lesson, pronunciation and quiz without reported axe violations after the final layout changes.
- [Keyboard and layout evidence](keyboard-and-layout.json): native Tab samples on every composition, menu Escape/focus restoration and simulated safe-area padding. A BODY entry on a short fragment records traversal past its last control into browser/page chrome.
- [Production build comparison](build-sizes.json): HTML-referenced JS/CSS grows by 578 gzip bytes (0.11%); font files are identical.

Baseline phone images: [lesson](before-lesson-390.jpg), [quiz](before-quiz-390.jpg), [results](before-results-390.jpg), [pronunciation](before-pronounce-390.jpg), [languages](before-languages-390.jpg).

## Design and verification limits

The layouts were compared with PhoneHome, PhoneLesson, PhoneQuiz and PhonePronounce and the existing desktop designs. Existing lesson/quiz actions and navigation remain the app’s real flows. Pronunciation pins the available Hear it/speed controls; the prototype’s recording and next-word deck are not existing app features. The learner bottom tabs remain visible as required by this pass.

The review uses synthetic data and isolated services, including a 12-entry sample of the public reviewed Yorùbá manifest. It does not establish authenticated end-to-end behaviour or real audio delivery. Native keyboard checks are representative, not exhaustive for every conditional state. Axe’s incomplete gradient/emoji contrast checks, VoiceOver/NVDA listening, physical iPhone/WebKit behaviour and cold-load timing remain manual follow-ups. No deployment or merge was made.
