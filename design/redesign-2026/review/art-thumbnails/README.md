# Artwork thumbnail repair

Branch `fix/art-thumbnails`, based on **bd3fc07f**, fetched after PR #22 merged. Checked on **5 November 2026**.

## URL change and regression coverage

All eight cards now request the **330px** standard width. The seven Commons detail images request **960px**; the existing low-resolution Dalí file requests **330px** for both uses instead of upscaling it. The underlying Wikimedia project, hash path and filename are preserved for every picture.

The regression test in [data/artResources.test.ts](../../../../data/artResources.test.ts) checks both configured image properties for all eight artworks: HTTPS, Wikimedia host, a sized-file path, an allowed standard width, and matching filenames/source files between card and detail URLs. Allowed widths come from [Wikimedia's current standard-size list](https://www.mediawiki.org/wiki/Common_thumbnail_sizes).

No CSP, Cloudflare, server setting, layout or artwork selection change is included. The source comment now points to the explicit rights report rather than describing all files as public-domain/educational-use images.

## Before and after screenshots

| Before — 390px | After — 390px |
| --- | --- |
| [Gallery screenshot](before-gallery-390.jpg) | [Gallery screenshot](after-gallery-390.jpg) |

[Restored gallery at 1280px](after-gallery-1280.jpg)

Screenshots use the actual ArtGalleryView with the existing synthetic learner harness. The eight real external image requests were allowed to finish, including off-screen lazy images, before full-page capture. The phone full-page captures paint fixed tabs at the initial viewport fold; this is a capture artifact. The desktop capture has no phone tab overlay. Full-page phone captures show all eight cards rather than only the first viewport.

## Live-origin verification

[Raw before/after image probe](live-origin-probe.json), run from **https://demiwuraks2.co.uk/** with plain Image requests and the live document's actual policy:

| Configured uses | Baseline | Candidate branch URLs |
| --- | ---: | ---: |
| Eight card thumbnails | **1/8 loaded** | **8/8 loaded**, each 330px wide |
| Eight detail images | Not replayed as a baseline | **8/8 loaded** (seven at 960px; Dalí at 330px) |

The live CSP remains unchanged and no image CSP violation was emitted. The probe tests the candidate URLs from the production origin; it does **not** deploy them or imply that the live application already uses this branch. [Local gallery measurements](gallery-after.json) separately confirm all eight rendered images load and fit the 390px viewport. The desktop gallery also fits 1280px.

## Rights report

[Per-picture licence and attribution table](../../../../docs/ARTWORK_LICENCES.md), with exact file-page and museum sources. **Seven files are marked public domain. The Persistence of Memory is non-free, not PD or CC.** Its existing low-resolution picture is retained as requested; a successful image request does not establish the site's reuse rights, and attribution alone does not grant permission.

## Checks

Using Node 20.19.5, matching CI:

- `npm run lint`: passed.
- `npm test -- --run`: **68 files / 328 tests passed**.
- `npm run build`: passed, including PWA generation.
- Focused artwork URL and gallery interaction checks: **10 tests passed**.
- Live-origin image probe: **all 16 configured card/detail uses loaded**, no image CSP violations.

No merge or deployment was performed.
