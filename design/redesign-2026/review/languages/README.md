# Prompt 7 review: languages, pronunciation and Yorùbá library

Branch: `redesign/7-languages`, created from fetched `origin/main` at `aeff6b8a` (includes merged PRs #13 and #15). No merge or deployment was run.

## Changes

- `LanguageSelector`: Wura's passport hero and round greeting stamps, selected ring and `aria-pressed`. All nine choices and the immediate selection/back callbacks remain.
- `PronunciationHelper`: Say it card, optional existing English meaning, emphasis from the existing phonetic stress guide, chunky playback/speed/syllable controls and shared tone guidance. Playback handlers and service arguments are unchanged.
- `TopicSelector`: passport greeting banner on language subjects and the Yorùbá tone panel. The existing ordered curriculum path, search, progress and routes remain.
- `YorubaAudioLibrary`: green/gold hero, tone chips, shortcuts to the existing topic filter, search, striped recording tiles, active-only Playing now bars and a Say them with me banner. The complete topic select, search normalization, pagination, whole-tile Play action, playback gate, loading/error states and cleanup remain.
- `LessonView`: language tags on vocabulary/phrases, and existing reviewed English vocabulary passed to the meaning sticker. No read-aloud or Stop logic changed.
- Presentation helpers: `SunnyLanguages.css`, `sunny/YorubaToneGuide.tsx`, `sunny/languagePresentation.ts`. Scoped styles include 48px minimum targets, visible focus and reduced-motion/high-contrast/large-text treatment.

No audio service, curriculum, authentication, Firebase, Cloudflare, Gemini safeguard or environment configuration changed.

## Screenshots

Native Chrome responsive review at **1280px** and **390px**, captured at 2× device-pixel ratio. These are full-page PNGs: the existing fixed tab bar is painted at the initial viewport fold, so it can appear partway down a long image. The library comparison uses the same “good morning” search on both versions.

| Screen | Before 1280 | After 1280 | Before 390 | After 390 |
| --- | --- | --- | --- | --- |
| Passport | [Before](before-passport-1280.png) | [After](after-passport-1280.png) | [Before](before-passport-390.png) | [After](after-passport-390.png) |
| Pronunciation | [Before](before-pronunciation-1280.png) | [After](after-pronunciation-1280.png) | [Before](before-pronunciation-390.png) | [After](after-pronunciation-390.png) |
| Yorùbá library | [Before](before-library-1280.png) | [After](after-library-1280.png) | [Before](before-library-390.png) | [After](after-library-390.png) |

[High-contrast pronunciation at 390px](after-pronunciation-accessible-390.png). Passport selection and audio were also exercised by keyboard. The visual pass prompted follow-up CSS fixes for the hero owl's flex sizing, narrow Japanese/Korean greetings and the phone filter chips.

The temporary local review entry rendered the actual components with a synthetic learner and the real shared header. Before components came directly from the base commit. No account, learner record or authenticated API was used. The pronunciation fixture supplied the existing reviewed “Hello” translation to demonstrate the optional sticker; production only shows it where the caller already has reviewed English vocabulary. The temporary entry, baseline copies and development proxy config were removed before commit.

## Validation

- `npm run lint` — passed, zero warnings.
- `NODE_OPTIONS=--no-experimental-webstorage npm test -- --run` — **59 files, 290 tests passed**. This host's Node web-storage compatibility switch affects only the test invocation.
- `npm run build` — passed, including PWA generation.
- Added regression coverage for all language choices/back/selected state, foreign-language tags, French/Spanish playback and syllables, Yorùbá playback rates/cleanup, optional meanings, library search/topic/back, active recording status and error cleanup.
- In `npm run dev`, real native HTML audio reached `ended` for:
  - French `bonjour`: `language-audio?hash=dd1a7f834554ecae1fa3886beca62eb0`, rate `0.9`.
  - Spanish `hola`: `language-audio?hash=50fc56d2881ee62c02fdedf9be1c4872`, rate `0.9`.
  - Yorùbá `Ẹ káàárọ̀. Báwo ni?`: `yoruba-audio?hash=4320173a8f027df2055118b9ec017540`, rate `1`.

For this local-only check, a removed dev proxy forwarded public recording GETs to the existing deployed endpoints. A removed review-only Audio wrapper observed native events; it did not mock or replace playback. No audio files were generated or uploaded.

## Prototype differences retained to honour “looks only”

- The current pronunciation component has no Record myself or previous/next-word workflow. This PR preserves its word picker, Hear action, Slow/Normal toggle, syllable buttons and All action. It does not add recording behavior or alter Kokoro.
- The current library has normal Play only. No new Slowly or play-all action is added; Say them with me is a visual practice banner.
- Meaning stickers use reviewed translations already supplied by the caller. No invented translations or new data calls are added.
- Topic pages retain the real ordered curriculum and all nine supported languages rather than replacing them with the prototype's example content.

These omitted controls require a separate functional change rather than presentation-only placeholders.
