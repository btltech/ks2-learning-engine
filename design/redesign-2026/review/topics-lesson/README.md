# Topic path and lesson visual review

Base: `f1564808617086e2411b42918d0ad98f15d96ad4` (main, including PRs 7–9).

Screenshots are unedited Chrome captures at CSS viewport widths 1280 and 390,
900px high, device scale factor 2. Full-page captures include content below the
fold. `before-*` renders the original components from main; `after-*` renders
this branch. The four original components are identical between 96531488 and
f156480. The existing child header and phone navigation appear in both sets.

| Screen | Before | After |
| --- | --- | --- |
| Topic path, 1280px | [Before](before-topics-1280.png) | [After](after-topics-1280.png) |
| Topic path, 390px | [Before](before-topics-390.png) | [After](after-topics-390.png) |
| Lesson, 1280px | [Before](before-lesson-1280.png) | [After](after-lesson-1280.png) |
| Lesson, 390px | [Before](before-lesson-390.png) | [After](after-lesson-390.png) |

A temporary local Vite review entry rendered the actual components, Header,
UISettingsProvider and MiRa using a synthetic learner. Topics are the real
published Year 4 Maths units (two marked completed for comparison). The lesson
is the real reviewed Year 4 PSHE unit **Money choices**, returned by the existing
lesson service. Guided practice uses the reviewed local question bank in the
review entry; no Gemini request, real child account or chat submission was used.
The entry and its temporary aliases were removed before committing.

## Browser checks

- Desktop and phone: real topic order, done/current/new labels, search, back and
  topic callbacks, full lesson, fixed phone controls above existing bottom tabs.
- Keyboard: search for Fractions, Tab to the result, visible blue focus ring,
  Enter invokes the existing topic selection. See `keyboard-search-390.jpg` and
  `keyboard-high-contrast-390.jpg`.
- Larger text, high contrast and Less movement enabled together at both widths.
  Lesson paragraphs measured 26.4px (normal: 22px); phone document width stayed
  390px; zero visible checked controls below 48px; zero running scoped CSS
  animations. See `accessibility-*` captures.
- Topic path is an ordered list with all seven real Year 4 Maths units.
- MiRa opens and closes at phone width; quick help, privacy wording and input
  remain present. No message was sent.
- Existing Learning Paths dialog checked at phone width, including list, detail,
  current step and locked steps. Headers and badge labels wrap.
- Device read-aloud was exercised on the reviewed lesson. The presentation keeps
  its existing callbacks and payload. Speech cancellation/Pause/Resume changes
  belong exclusively to PR #12; they are absent from this branch.

## Differences from the prototype

- The original speech API has no sentence-position events or per-lesson speed
  controls. Sentence-following gold highlights, `(reading now)` announcements and
  Slower/Normal controls are not implemented here. There is no simulated progress
  or pretend speed selector. An explicit Stop button is supplied by PR #12.
- The existing lesson is one complete document, not paginated parts. Back to
  Topics, both quiz actions and their guided-practice gates remain intact.
- The year chips show the learner's age-derived year; they do not change the year
  or bypass the published curriculum. Topic search filters locally.
- MiRa keeps its existing collapsed/open flow rather than opening automatically.
  All actual reviewed lesson headings and words are retained; existing vocabulary,
  example and tip/check sections receive the prototype's coloured panels.
- The quiz action's visible copy changes from "Ready for a Quiz?" to "Next: try
  one". Its aria-label, handler and availability are unchanged.
- The existing subject picker is unchanged; the subject/topic route actually
  renders TopicSelector. All existing subjects remain available, with their
  existing icon as fallback where the design pack has no illustration.

## Automated checks

- `npm run lint`: passed (zero warnings).
- `npm test -- --run`: 249 tests passed in 51 files.
- `npm run build`: passed; `precache 135 entries (3942.29 KiB)`.
- Existing Browserslist/Baseline browser-metadata age notices remain; no dependency
  changes were made for this visual step.
