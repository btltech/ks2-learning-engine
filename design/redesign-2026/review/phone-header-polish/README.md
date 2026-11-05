# Public phone header and avatar polish

Branch `fix/phone-header-and-polish`, based on `origin/main` **3885b95b**, fetched after PR #21 merged on 5 November 2026. Review uses the existing synthetic harness and actual UI components at 390×900.

## Changes

- Landing and sign-in phones now show the owl logo and one labelled Menu button, with Sign in and Create a family account visible below. The disclosure exposes `aria-expanded`/`aria-controls`; hidden links leave the tab order and accessibility tree. Native Enter opens it, Tab reaches the links, and Escape closes it and returns focus to the button. Account navigation closes it; navigation changes reset it.
- Sign-in's existing desktop Login control and landing's desktop inline links are retained. Phone checks include standard, dark, calm, and combined high contrast/larger text/reduced movement. A small sign-in theme-token correction pairs the existing dark text colours with dark panel surfaces; the initial white-on-white finding is preserved in [sign-in-dark-before.json](sign-in-dark-before.json).
- Header account actions also update the visible form when `/login` is already mounted, including returning from the password-reset view to the same sign-in URL. Authentication calls and submission rules are unchanged.
- A presentation lookup translates the five known avatar achievement codes. `perfect_week` becomes “Earn a perfect week”; unknown codes and all other progress text retain the service's existing wording. The service still controls locks, progress and equipment. The Unicorn remains disabled in the capture and regression test.

## Phone screenshots

| View | Standard | Dark | Calm | High contrast + larger text |
| --- | --- | --- | --- | --- |
| Landing menu open | [Image](after-landing-standard-open-390.jpg) | [Image](after-landing-dark-open-390.jpg) | [Image](after-landing-calm-open-390.jpg) | [Image](after-landing-contrast-open-390.jpg) |
| Sign-in menu open | [Image](after-login-standard-open-390.jpg) | [Image](after-login-dark-open-390.jpg) | [Image](after-login-calm-open-390.jpg) | [Image](after-login-contrast-open-390.jpg) |

Collapsed headers: [landing](after-landing-closed-390.jpg), [sign-in](after-login-closed-390.jpg). Additional captures: [friendly locked avatar item](after-avatar-lock-390.jpg), [registration reached from header](after-registration-390.jpg).

The standard closed landing header measured 139px. Account actions remain visible with the menu open. At 320px and 390px, the document fits its viewport. At 768px and 1280px, the phone disclosure is hidden and the existing desktop navigation is shown.

## Live artwork diagnosis — 5 November 2026

**Seven of the eight configured artwork images fail.** The live gallery asset imports the same eight URLs from the deployed entry bundle; see [live-gallery-asset.json](live-gallery-asset.json). Plain image requests made from **https://demiwuraks2.co.uk/** reproduce seven failures with zero natural image width. No account was used; this is a live-origin image probe, not an authenticated gallery journey.

Independent GET requests confirm the seven failures return **HTTP 400**, content type **text/html**, with the message “Use thumbnail sizes listed on https://w.wiki/GHai”. Chrome reports `net::ERR_BLOCKED_BY_ORB` for those HTML responses requested as images. Wikimedia's [official thumbnail-size documentation](https://www.mediawiki.org/wiki/Common_thumbnail_sizes) explains that direct hotlinks must use its standard widths; the configured **220px/300px** widths are not among them.

| Artwork | Configured width | Result |
| --- | --- | --- |
| The Starry Night | 300px | HTTP 400 / HTML |
| Mona Lisa | 220px | HTTP 400 / HTML |
| Sunflowers | 220px | HTTP 400 / HTML |
| The Great Wave off Kanagawa | 300px | HTTP 400 / HTML |
| Water Lilies | 300px | HTTP 400 / HTML |
| Girl with a Pearl Earring | 220px | HTTP 400 / HTML |
| The Persistence of Memory | Original image | HTTP 200 / JPEG; 371×268 loaded |
| The Scream | 220px | HTTP 400 / HTML |

The live CSP already permits HTTPS images, and the probe produced no image CSP violation. The thumbnail failures are upstream URL-size rejections. [Sanitised browser/HTTP evidence](live-thumbnail-probe.json) includes the live policy and each URL/result; it excludes cookies, client addresses and raw diagnostic pages.

This PR leaves artwork URLs, CSP, Cloudflare and server settings unchanged, as a diagnosis-only check.

## Validation

Using Node **20.19.5**, matching CI:

- `npm run lint`: passed.
- `npm test -- --run`: **67 files / 320 tests passed**.
- `npm run build`: passed, including PWA generation.
- [Phone axe report](phone-audit.json): **10 states, zero reported violations**, including both menu states and all four display modes on each page. Theme checks use the existing display root classes in the harness. [Registration audit](registration-audit.json) also reports zero violations. Incomplete checks are preserved.
- [Native keyboard and responsive measurements](keyboard-and-widths.json): Enter/Tab/Escape sequence and 320/768/1280px layouts; the 390px state measurements are in the phone audit.

No merge or deployment was performed.
