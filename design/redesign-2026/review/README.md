# Foundations visual review

Captured locally in Safari Responsive Design Mode on 27 October 2026. No production deployment was made.

## Header and browser tab icon

| View | Before | After |
|---|---|---|
| Public, 1280 | [Before](before-public-header-1280.png) | [After](after-public-header-1280.png) |
| Public, 390 | [Before](before-public-header-390.png) | [After](after-public-header-390.png) |
| Learner, 1280 | [Before](before-learner-header-1280.png) | [After](after-learner-header-1280.png) |
| Learner, 390 | [Before](before-learner-header-390.png) | [After](after-learner-header-390.png) |

The public-page baseline was built from main before implementation and preserved outside the repository. The learner comparison used an uncommitted, login-free fixture with the original/current Header components and a synthetic learner. The temporary fixture and original Header copy were removed before committing. No real account or child information is in the screenshots.

## Display preferences

| Preference | 1280 | 390 |
|---|---|---|
| Less movement | [Screenshot](after-1280-less-movement.png) | [Screenshot](after-390-less-movement.png) |
| High contrast | [Screenshot](after-1280-high-contrast.png) | [Screenshot](after-390-high-contrast.png) |
| Larger text | [Screenshot](after-1280-larger-text.png) | [Screenshot](after-390-larger-text.png) |

- Each preference was checked separately with the other two off.
- No horizontal document overflow in any captured state. Larger text wraps the learner header rather than shrinking its wordmark into an unreadable mark.
- The sample sparkle's computed animation changes from `sunny-twinkle` to `none` when Less movement is selected; the root `.reduce-motion` class is present.
- Fredoka and Atkinson Hyperlegible were loaded locally (`document.fonts.check` returned true for both). Single-line button heights were 48/56/64px; larger text can increase them.
- Raw measurements are in [measurements.json](measurements.json). Safari's toolbar was set to 1280×900 and 390×900; at its automatic 67% preview scale it reported `innerWidth` as 1279 and 389. This one-pixel rounding is retained in the evidence.
- Chrome automation was unavailable, so Safari was used for the browser checks. The OS reduced-motion branch is implemented in CSS; the visual interaction checks used the app's Less movement setting.

These images verify the foundations and branding. They are not implementations of the redesigned Home, lesson or quiz screens.
