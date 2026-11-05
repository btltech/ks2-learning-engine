# Prompt 9 — voice and display settings

Independent branch `redesign/9-settings`, based on main `15d1039ef84a8e6bd2c9b473277513cca53e14ae`. Does not depend on the bites/classroom PR #19.

## Files and behaviour

- `components/AccessibilitySettings.tsx`: Wura hero, Reading / Listening / Calm and focus cards, gold segmented choices with aria-pressed, named On/Off switches, labelled selects and speed slider, and a live display example. This is also the exact modal opened by the public footer. Its dialog name, Close settings label, focus trap, Escape/Done and reset confirmation remain. Existing voice enable/disable callbacks, download/loading/error descriptions, settings keys and full 0.5–2.0 speed range remain.
- `components/UIModeSelector.tsx`: minimum 48px targets, Sunny Owl body presentation and aria-pressed selection. All three existing mode presets, feature visibility and close behaviour remain.
- `components/SunnySettings.css`: responsive dialog and preview; compact phone header leaves the controls scrollable when large text is enabled.
- `context/UISettingsContext.tsx`: optional context hook lets the same dialog work from the public footer. The three existing visual preferences are mirrored when explicitly changed in the accessibility dialog, so disabling a preference also clears the equivalent UI preference. No learning-mode, feature, navigation or automatic-reading defaults are changed.
- `services/accessibilityService.ts`: adds only the presentation preference `appearance` (standard / calm / dark), defaulting old saved settings to standard. Existing storage key, save/apply/subscribe and other preferences remain. A root motion class also supports the footer without a UI provider.
- `components/sunny/displayPreferences.css`: common Sunny surfaces react to dark/calm/contrast settings; logo has a white sticker, high contrast removes UI tints/dots/shadows, root text scaling increases rem-based type and layout, and app/OS reduced motion disables CSS animations/transitions. Original artwork, SVG answer shapes, drawing pixels and paint swatch colours are preserved. Existing game confetti already honours the app root motion class and OS preference.
- `components/AccessibilitySettings.test.tsx`: persistence/reopening, public-footer fallback, conflicting visual preference sources, original audio controls and both Kokoro callbacks, full speed range, existing interaction preferences and cancelled/confirmed reset.

No routes, quiz/scoring logic, audio engines, network handlers, account data, Firebase/Cloudflare settings, secrets or Gemini safeguards changed.

## Validation and local review

- `npm run lint`: pass, zero warnings.
- `NODE_OPTIONS=--no-experimental-webstorage npm test -- --run`: pass, 65 files / 305 tests. This flag avoids the local Node Web Storage API issue; GitHub CI uses Node 20.
- `npm run build`: pass, including PWA generation.
- Local Vite/Chrome review at 1280px and 390px. Actual settings controls were switched on and off with keyboard input: text size, colour themes, dyslexia font, all colour-vision options, sound effects, Text-to-Speech, Natural English Voice, speed presets/slider, screen reader optimisation, reduced motion, keyboard navigation, focus highlight, click target sizes and extended time. Preferences survived navigation/reopening; the live example reflected changes. Temporary preferences were reset after review.
- Home (guided and standard), the actual lesson component and actual quiz component were reviewed with restored defaults, larger text, high contrast/reduced motion and dark colours. The standard home also has final dark and combined-accessibility desktop captures. The phone combined mode confirms unclipped content width, visible text/focus, monochrome UI surfaces and scrollable controls.
- Synthetic Casey / static fractional lesson and quiz fixtures replaced auth, cloud question generation, classroom reads and performance writes in the review harness only. No real learner, classroom or cloud records were written. A gold “Review voice and display” launch button in some page captures belongs only to this local harness and is outside the app's Sunny surface. The harness is not shipped.
- Natural voice was enabled into its existing download/loading flow and then disabled; a complete 90MB voice download or a full offline playback cycle was not required for this styling review. The original audio service is unchanged.

Images are 2x resolution. Settings captures show the viewport of the scrollable modal, including lower Listening / interaction / live-example views. Full-page phone captures of home/lesson/quiz paint fixed controls at the initial viewport fold; the apparent overlap in those tall images is the browser capture artifact, not a second bar. Generated captures were moved into this directory; none were left in Downloads.

| Settings | Before | After |
| --- | --- | --- |
| Desktop | [before](before-settings-1280.png) | [after](after-settings-1280.png) |
| Phone | [before](before-settings-390.png) | [after](after-settings-390.png) |

| Display review | Home | Lesson | Quiz |
| --- | --- | --- | --- |
| Defaults, desktop | [home](after-home-1280.png) | [lesson](after-lesson-1280.png) | [quiz](after-quiz-1280.png) |
| Large text, desktop | [home](after-large-home-1280.png) | [lesson](after-large-lesson-1280.png) | [quiz](after-large-quiz-1280.png) |
| Large text + contrast + reduced motion, phone | [home](after-accessible-home-390.png) | [lesson](after-accessible-lesson-390.png) | [quiz](after-accessible-quiz-390.png) |

Additional captures include default/dark/combined-accessibility standard home at 1280px, dark settings and quiz at 390px, combined-accessibility settings at 390px, lower settings cards at both widths and the phone live example.

## Prototype gaps

The original text setting is a boolean, so the segmented control has Standard and Large. There is no existing extra-large text, separate spacing or lesson-only focus-mode preference. Those would change behaviour beyond the looks-only scope and are not represented with inactive controls. The dyslexia-friendly font, existing keyboard/focus settings and target-size select remain available. Colours required for Prompt 9 are implemented as presentation-only saved appearance choices.

The prototype claims child-specific saving and automatic question reading; existing accessibility preferences are stored in this browser and Text-to-Speech is a separate setting from the existing guided-mode automatic-reading preference. The UI keeps the accurate existing wording and mode behaviour rather than making those promises. The live example demonstrates display changes and reports voice status/speed; it does not introduce fake quiz controls or a new playback path.

Nothing was merged or deployed.
