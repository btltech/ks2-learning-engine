# Sunny Owl synthetic review harness

Run from the repository root with the project dependencies installed:

```sh
node node_modules/vite/bin/vite.js --config scripts/review-phone/vite.config.ts
```

Open `http://127.0.0.1:3010/scripts/review-phone/index.html?screen=home`.
Use Chrome device emulation at 390×900, 768×900 and 1280×900. This alternate entry is development-only and is not imported by the production entry.

`screen` accepts `landing`, `login`, `children`, `home`, `guided`, `topics`, `lesson`, `quiz`, `results`, `languages`, `pronounce`, `library`, `progress`, `games`, `gallery`, `artLesson`, `canvas`, `avatar`, `bites`, `classroom` or `settings`.

- Add `accessible=1` for combined larger text, high contrast and reduced animations.
- On quiz, add `kind=matching`, `kind=drag-and-drop`, `kind=ordering` or `kind=fill-in-blank`.
- On classroom, add `state=active`, choose Join Session, enter `ABC123`, and Join. The in-memory subscription starts a question. Without this parameter it remains waiting.
- On login, select Child to inspect the pupil form. Do not enter real credentials or submit authentication forms.

The real UI components, fonts, base page styles and display provider are used. Service modules listed in `vite.config.ts` are substituted only by this configuration. The learner is synthetic. Quiz-attempt writes and classroom/game operations use fixtures; read-aloud hooks are silent. This harness does not verify authentication, real audio, remote progress writes or full production routing.

`yoruba-sample.json` contains 12 entries sampled from the locally preserved public reviewed manifest. It exercises the real library UI without depending on the API. Standalone pronunciation/canvas fragments receive a hidden page heading; the embedded child-picker receives parent-page heading context. The public landing/sign-in include the real PublicLayout, footer and storage notice.

For axe, the review used a locally available `axe-core@4.14.0` installation without modifying the project manifests. To install that optional tool locally:

```sh
npm install --no-save --package-lock=false axe-core@4.14.0
```

Use `audit.js` as an async function in DevTools or a browser evaluation tool. It loads axe from the local development server and returns the findings plus overflow/target measurements. Keep synthetic review data separate from real learner sessions. The initial evidence used temporary root-level entries; the preserved entry above was smoke-tested after relocation.
