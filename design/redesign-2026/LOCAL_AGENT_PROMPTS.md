# Prompts for the local agent: building the Sunny Owl redesign

Paste **one prompt at a time**, in order. Wait for the agent to open its pull request, look at its
screenshots, merge it, then paste the next one. Each prompt repeats the rules, so it works on its
own even if the agent has forgotten the earlier steps.

Deploying stays with you, using wrangler as usual, after you have merged the pull requests you are happy with.

---

## Prompt 1: design pack, logo, fonts and building blocks

```text
We are redesigning the KS2 app (ks2-learning-engine) in a new playful style called "Sunny Owl", with a new owl logo. This step lays the foundations only. Do not restyle whole screens yet.

Get the design pack:
  git fetch origin main claude/great-sagan-2nbg6v
  git checkout -b redesign/1-foundations origin/main
  git checkout origin/claude/great-sagan-2nbg6v -- design/redesign-2026
Read design/redesign-2026/README.md fully before you start. Look at screens/KidStyle.jpg and screens/Home.jpg.

Do this:
1. Fonts: self-host Fredoka (600, 700) and Atkinson Hyperlegible (400, 700, 400 italic), for example with @fontsource packages. Do not load fonts from Google at runtime.
2. Tokens: add the README's colours, tints, outline, hard shadows and radii to tailwind.config.js (for example colors.ink, colors.gold, colors.sky, tint.*, shadow-chunky, shadow-chunky-card, font-display = Fredoka, font-body = Atkinson Hyperlegible). Keep the existing tokens so nothing breaks.
3. Building blocks in components/sunny/ (one file each, typed, small):
   - KidButton (gold / white / tint / action-blue variants; sm 48px, md 56px, lg 64px; 3px ink outline; hard shadow; press effect; works as a link or a button)
   - KidCard, Chip, Meter (progress bar with an accessible label), SpeechBubble
   - OwlLogo (inline SVG from assets/logo-owl-wordmark.svg; prop for height; optional "sticker" white background for dark headers)
   - Owl (pose prop: wave, reading, hooray, sleepy, thinking, standing; SVGs from assets/owl/; decorative by default, aria-hidden)
   - SubjectIcon (name prop; SVGs from assets/subjects/), MiraFace (assets/mira.svg)
   - Sparkle and a reduced-motion-safe CSS file for blink, twinkle, float and bounce.
4. Motion: every animation in the new CSS must switch off when UISettingsContext.settings.reducedAnimations is true and when prefers-reduced-motion is reduce. Use one class on the root (for example .reduce-motion) so it is a single switch.
5. Logo everywhere: replace the old DemiWura logo (and any "DemiWura" text logo) in Header.tsx, PublicLayout.tsx, Footer.tsx and the parent, teacher, admin and analytics headers with OwlLogo. On dark headers use the white sticker version. Keep labels like "for families" or "for schools" as a small chip next to it, with dark text.
6. App icons: replace public/favicon.ico, public/apple-touch-icon.png (use assets/icons/owl-180.png), public/pwa-192x192.png and public/pwa-512x512.png with the owl icons. Update masked-icon.svg to a one-colour owl silhouette or remove it from the manifest if you cannot make a clean one. Set the PWA theme colour to #FFC93C and the background colour to #FFF9EC in vite.config.ts.
7. Add a short components/sunny/README.md showing how to use each building block.

Rules for this step:
- Looks only. Keep every feature, route, data call, test id, aria label and behaviour exactly as it is.
- Do not touch users.json, any .env file, secrets, Firebase or Cloudflare settings, or the Gemini safeguards (curriculum check, model allow-list, rate limits). Do not deploy, merge or force-push.
- Text is always ink #172033 (or white on #1E55C8). Bright colours are never text. Tap targets at least 48px. Focus ring 4px #1E55C8.
- Run npm run lint, npm test -- --run and npm run build. All must pass. Then run npm run dev and check the header and logo at 1280px and 390px wide, with "Less movement", high contrast and larger text each switched on.
- Open a pull request into main with before and after screenshots of the header and the browser tab icon. In your reply list: files changed, checks run with results, and anything you could not match.
```

---

## Prompt 2: landing page

```text
Next step of the Sunny Owl redesign. Start from the latest main (which now has design/redesign-2026 and components/sunny/). Branch: redesign/2-landing.

Read design/redesign-2026/README.md again. Match design/redesign-2026/screens/Landing.jpg, using boards/Landing.dc.html for exact colours, spacing and SVG (ignore the design tool's sc-for, sc-if and {{ }} templating).

Restyle the public landing page (components/LandingPage.tsx and the public header/footer in components/PublicLayout.tsx and components/Footer.tsx; check which files actually render "/" for signed-out visitors):
- Header: owl logo, links (How it works, Subjects, Accessibility, Grown-ups), "Sign in" (white) and "Create a family account" (gold).
- Hero: sky gradient with clouds, sparkles and green hills; headline "Learning every child can read, hear and enjoy" with read, hear and enjoy on tilted coloured stickers; Start learning (gold) and See how it works (white); Wura waving on top of the sample maths question card with shaped answers and MiRa's reply.
- "Made for every way of learning" four tilted cards; "Every Key Stage 2 subject" banner with the 9 subject icons; "How a session works" three numbered owl circles on a dotted path; parent and teacher cards; gold footer with the logo and policy links.
- Keep the skip link, every existing link target and any sign-up or Turnstile behaviour. Use the existing wording where the app has its own; only change text where the design's wording is clearly better and tell me which.

Rules for this step:
- Looks only. Keep every feature, route, data call, test id, aria label and behaviour exactly as it is.
- Do not touch users.json, any .env file, secrets, Firebase or Cloudflare settings, or the Gemini safeguards. Do not deploy, merge or force-push.
- Text is always ink #172033 (or white on #1E55C8). Bright colours are never text. Tap targets at least 48px. Focus ring visible. All animation stops with "Less movement" or prefers-reduced-motion.
- Run npm run lint, npm test -- --run and npm run build. All must pass. Check in the browser at 1280px and 390px wide, keyboard-only, and with high contrast and larger text on.
- Open a pull request into main with before and after screenshots at both widths. Report files changed, checks run, and anything you could not match.
```

---

## Prompt 3: who is learning today (child sign-in)

```text
Next step of the Sunny Owl redesign. Branch from the latest main: redesign/3-sign-in.

Match design/redesign-2026/screens/SignIn.jpg (source: boards/SignIn.dc.html). Read design/redesign-2026/README.md for the rules.

Restyle the child picker and picture-code sign-in (components/LoginView.tsx, components/ChildSelector.tsx; check what actually renders): owl waving with the bubble "Tap your picture, then pick your secret code!", big round child picture buttons, an "Add a child" dashed card, three code slots, six colourful picture buttons with their names, "Start again". The grown-ups sign-in panel stays calm and white, with chunky fields and buttons.

Do not change how sign-in, PINs, picture codes, Turnstile, email verification or Google sign-in work. Keep every error message and aria-live announcement. If the app's flow differs from the design (for example numbers instead of pictures), keep the app's flow and style it to match.

Rules for this step:
- Looks only. Keep every feature, route, data call, test id, aria label and behaviour exactly as it is.
- Do not touch users.json, any .env file, secrets, Firebase or Cloudflare settings, or the Gemini safeguards. Do not deploy, merge or force-push.
- Text is always ink #172033 (or white on #1E55C8). Tap targets at least 48px. Focus ring visible. Animation stops with "Less movement" or prefers-reduced-motion.
- Run npm run lint, npm test -- --run and npm run build. All must pass. Test sign-in end to end in npm run dev with a test child account (never print or commit credentials).
- Open a pull request with before and after screenshots at 1280px and 390px. Report files changed, checks run, and anything you could not match.
```

---

## Prompt 4: child header and home

```text
Next step of the Sunny Owl redesign. Branch from the latest main: redesign/4-home.

Match design/redesign-2026/screens/Home.jpg and screens/PhoneHome.jpg (sources: boards/Home.dc.html, boards/PhoneHome.dc.html). Read design/redesign-2026/README.md for the rules.

1. Child header (components/Header.tsx or the child layout): owl logo, pill navigation (Home, Learn, My progress, Games) with the current page in gold and aria-current="page", a stars chip, settings button, avatar. On phones use the bottom tab bar from PhoneHome.jpg instead of the top links.
2. Child home (components/HomeView.tsx and components/GuidedHomeView.tsx; check which one each UI mode uses): sky hero with hills where Wura greets the child by name plus a Listen button; "Today's adventure" card with the subject icon, progress bar and Carry on / Choose something else; "Where shall we explore?" subject tiles with the illustrated icons; "Pick up where you left off" cards; "This week" stars with today circled; Daily challenge chest; stars card.
3. Keep every widget the home screen shows today (missions, streaks, pets, certificates and so on). Restyle them with KidCard so they fit, rather than removing them. If there is far more than the design shows, keep the design's order at the top and put the rest below. Tell me what you placed where.
4. Guided, standard and advanced modes must all still work.

Rules for this step:
- Looks only. Keep every feature, route, data call, test id, aria label and behaviour exactly as it is.
- Do not touch users.json, any .env file, secrets, Firebase or Cloudflare settings, or the Gemini safeguards. Do not deploy, merge or force-push.
- Text is always ink #172033 (or white on #1E55C8). Tap targets at least 48px. Focus ring visible. Animation stops with "Less movement" or prefers-reduced-motion.
- Run npm run lint, npm test -- --run and npm run build. All must pass. Check at 1280px and 390px, keyboard-only, and with high contrast, larger text and less movement on.
- Open a pull request with before and after screenshots. Report files changed, checks run, and anything you could not match.
```

---

## Prompt 5: topic path and lesson

```text
Next step of the Sunny Owl redesign. Branch from the latest main: redesign/5-topics-lesson.

Match design/redesign-2026/screens/Subject.jpg, screens/Lesson.jpg and screens/PhoneLesson.jpg (sources in boards/). Read design/redesign-2026/README.md for the rules.

1. Subject topics (components/SubjectSelector.tsx, components/TopicSelector.tsx, and LearningPaths if used): "Maths Island" style banner with the subject icon, year group chips, topic search and progress; topics as a winding path of round stepping stones (done = gold with a tick and the word "Done", current = blue with Wura beside it and "You are here", new = white with a number), each with a label card and its buttons. The path must be an ordered list so screen readers read it in order. Use real topic data from the app, not the example names.
2. Lesson (components/LessonView.tsx): reading-aloud bar with a small reading owl, sound bars, Slower / Normal / Stop; storybook page card; the sentence being read is highlighted in gold with "(reading now)" for screen readers; "Word to know" sticker; example panel; Remember tip; Part back / Next: try one; "Stuck? Ask MiRa" side panel with MiRa's face. Keep the existing read-aloud and Kokoro voice code exactly as it is; only restyle its controls.
3. Lesson text stays 22px or more and is never tilted.

Rules for this step:
- Looks only. Keep every feature, route, data call, test id, aria label and behaviour exactly as it is.
- Do not touch users.json, any .env file, secrets, Firebase or Cloudflare settings, or the Gemini safeguards. Do not deploy, merge or force-push.
- Text is always ink #172033 (or white on #1E55C8). Tap targets at least 48px. Focus ring visible. Animation stops with "Less movement" or prefers-reduced-motion.
- Run npm run lint, npm test -- --run and npm run build. All must pass. In npm run dev, open a real lesson, press read aloud and check the highlight follows the voice.
- Open a pull request with before and after screenshots at 1280px and 390px. Report files changed, checks run, and anything you could not match.
```

---

## Prompt 6: quiz and results

```text
Next step of the Sunny Owl redesign. Branch from the latest main: redesign/6-quiz-results.

Match design/redesign-2026/screens/Quiz.jpg, screens/Quiz-correct.jpg, screens/PhoneQuiz.jpg and screens/Results.jpg (sources in boards/). Read design/redesign-2026/README.md for the rules.

1. Quiz (components/QuizView.tsx and every question type component it uses, such as DragDropQuestion, MatchingQuestion, OrderingQuestion): progress dots in the header (done ticks, current dashed ring), "No timer" label, purple question panel with Wura thinking; after a right answer Wura cheers, after a wrong one Wura waves "Have another go". Multiple-choice answers are big chunky buttons, each with a shape (triangle blue, circle pink, square green, star gold) as well as its value. Selected = action-blue border and "Your answer"; correct = leaf tint, tick and "Correct"; wrong = dashed orange border, arrow and "Try again". Hint and "Check answer" as in the design; Check answer is grey and disabled until an answer is chosen.
2. Results: confetti strip, Wura cheering, round gold "8 out of 10" badge (use real scores), stars earned, "What went well", "Worth another look" with Practise these two, MiRa's tip bubble, Home and Next topic buttons. canvas-confetti and sounds must respect "Less movement" and the sound effects setting.
3. Keep scoring, adaptivity, timers (only when the child turned one on), battles and SATs modes working. Restyle the other question types with the same building blocks, even though they are not in the design.

Rules for this step:
- Looks only. Keep every feature, route, data call, test id, aria label and behaviour exactly as it is.
- Do not touch users.json, any .env file, secrets, Firebase or Cloudflare settings, or the Gemini safeguards. Do not deploy, merge or force-push.
- Right and wrong always show a word and an icon, never colour alone. Text is always ink. Tap targets at least 48px. Focus ring visible.
- Run npm run lint, npm test -- --run and npm run build. All must pass. Play a full quiz in npm run dev, getting some answers right and some wrong, using only the keyboard.
- Open a pull request with before and after screenshots of the question, a correct answer, a wrong answer and results, at 1280px and 390px. Report files changed, checks run, and anything you could not match.
```

---

## Prompt 7: languages, pronunciation and Yorùbá library

```text
Next step of the Sunny Owl redesign. Branch from the latest main: redesign/7-languages.

Match design/redesign-2026/screens/Languages.jpg, screens/PhonePronounce.jpg and screens/YorubaLibrary.jpg (sources in boards/). Read design/redesign-2026/README.md for the rules.

1. Languages (components/LanguageSelector.tsx, components/PronunciationHelper.tsx and the language topic pages): "My language passport" hero with Wura; round passport stamps for each language showing a greeting and the language name (the chosen one has a thick ring and aria-pressed); "Say it" card with the big word, "means ..." sticker, stressed syllable highlighted, Hear it / Hear it slowly / Record myself, tap-each-part syllable buttons, previous and next word; topic list; Yorùbá tone helper (high, middle, low with arrows).
2. Yorùbá sound library (components/YorubaAudioLibrary.tsx): green and gold hero with tone chips, group chips, search, word tiles with a coloured top strip, play and "Slowly" buttons, and "Playing now" with sound bars on the tile that is playing; "Say them with me" banner.
3. Keep the pre-generated French and Spanish audio, the Yorùbá recordings, the Kokoro voice and recording features exactly as they are. Mark words with the right lang attribute (fr, es, yo) so screen readers pronounce them.

Rules for this step:
- Looks only. Keep every feature, route, data call, test id, aria label and behaviour exactly as it is.
- Do not touch users.json, any .env file, secrets, Firebase or Cloudflare settings, or the Gemini safeguards. Do not deploy, merge or force-push.
- Text is always ink #172033 (or white on #1E55C8). Tap targets at least 48px. Focus ring visible. Animation stops with "Less movement" or prefers-reduced-motion.
- Run npm run lint, npm test -- --run and npm run build. All must pass. In npm run dev, play a French word, a Spanish word and a Yorùbá word to check audio still plays.
- Open a pull request with before and after screenshots at 1280px and 390px. Report files changed, checks run, and anything you could not match.
```

---

## Prompt 8: progress, games, art studio and avatar

```text
Next step of the Sunny Owl redesign. Branch from the latest main: redesign/8-progress-games-art-avatar.

Match design/redesign-2026/screens/Progress.jpg, screens/Games.jpg, screens/ArtStudio.jpg and screens/Avatar.jpg (sources in boards/). Read design/redesign-2026/README.md for the rules.

1. Progress (views/ProgressView.tsx, components/ProgressView.tsx, StreakRewards and related widgets): "My trophy room" hero with the avatar and tilted stat stickers; subject bars with three parts (confident = leaf, learning = gold with stripes, not started = white) plus a legend and the numbers in words; "My sticker book" badges (earned = round colourful stickers with "Earned", locked = dashed with a lock and what to do); "Beat your own best" banner. Never compare children with each other on this screen.
2. Games (components/MiniGames.tsx, components/GamesLockOverlay.tsx): "Game time!" banner with the unlock message; game cards with a coloured picture panel, feature chips (No timer, Keyboard friendly ...), Play and How to play; art studio card. The games lock must still work; restyle the lock screen with the sleepy or thinking owl and a clear message.
3. Art studio (components/DrawingCanvas.tsx, DrawingLessonView, ArtGalleryView): owl bubble with today's idea, chunky tool buttons with aria-pressed, paint-blob colours with names, line size slider, the "Describe your drawing in words" box, Save and Show a grown-up.
4. Avatar (components/AvatarCustomization.tsx, AvatarDisplay): owl bubble "Looking great!", big round picture with an ink outline, chunky option buttons with gold for the selected one, and the live text description of the picture. Keep all existing avatar options and how they are saved.

Rules for this step:
- Looks only. Keep every feature, route, data call, test id, aria label and behaviour exactly as it is.
- Do not touch users.json, any .env file, secrets, Firebase or Cloudflare settings, or the Gemini safeguards. Do not deploy, merge or force-push.
- Text is always ink #172033 (or white on #1E55C8). Tap targets at least 48px. Focus ring visible. Animation stops with "Less movement" or prefers-reduced-motion.
- Run npm run lint, npm test -- --run and npm run build. All must pass. Check each screen in npm run dev at 1280px and 390px and keyboard-only.
- Open a pull request with before and after screenshots. Report files changed, checks run, and anything you could not match.
```

---

## Prompt 9: five-minute bites, live classroom and settings

```text
Next step of the Sunny Owl redesign. Branch from the latest main: redesign/9-bites-classroom-settings.

Match design/redesign-2026/screens/Microlearning.jpg, screens/LiveClassroom.jpg and screens/Settings.jpg (sources in boards/). Read design/redesign-2026/README.md for the rules.

1. Five-minute bites (components/MicrolearningDashboard.tsx, components/MicrolearningCard.tsx): header with Wura; bite card with a subject-coloured top bar, the 1-2-3 steps (Idea, Example, Question), the "Say it" helper, Listen / Save for later / Next; "More bites" list with time chips and "Saved for later".
2. Live classroom (pupil side of components/ClassroomMode.tsx): Step 1 join card with a big class code field; Step 2 question with the thinking owl, shaped answer buttons, "Answer sent!" status and the privacy note. Do not change how joining, answering or the realtime connection work.
3. Voice and display settings (components/AccessibilitySettings.tsx and anything it opens, including the footer's settings dialog): hero with Wura "Make DemiWura just right for you!"; Reading, Listening, and Calm and focus cards; segmented choices with the selected one gold and aria-pressed; chunky switches with On/Off text; the live Example preview that changes as settings change. Every existing setting must still save and apply.
4. Make sure the new Sunny Owl look responds to these settings across the app: larger text scales everything, high contrast removes tints, dots and shadows in favour of the existing high contrast colours, dark mode uses dark surfaces with light text (logo on its white sticker), and less movement stops all animation.

Rules for this step:
- Looks only. Keep every feature, route, data call, test id, aria label and behaviour exactly as it is.
- Do not touch users.json, any .env file, secrets, Firebase or Cloudflare settings, or the Gemini safeguards. Do not deploy, merge or force-push.
- Text is always ink #172033 (or white on #1E55C8). Tap targets at least 48px. Focus ring visible.
- Run npm run lint, npm test -- --run and npm run build. All must pass. In npm run dev, switch each setting on and off and check home, a lesson and a quiz respond.
- Open a pull request with before and after screenshots. Report files changed, checks run, and anything you could not match.
```

---

## Prompt 10: phone pass and final accessibility check

```text
Last step of the Sunny Owl redesign. Branch from the latest main: redesign/10-phone-and-a11y.

Compare every child screen against design/redesign-2026/screens/Phone*.jpg and the desktop screenshots, at 390px, 768px and 1280px wide.

1. Phone layout: bottom tab bar on child screens, one column, main action pinned at the bottom on lesson, quiz and say-it screens (as in PhoneLesson.jpg, PhoneQuiz.jpg, PhonePronounce.jpg), no sideways scrolling anywhere, safe-area padding on iPhone.
2. Accessibility audit of every redesigned screen: run axe (for example @axe-core/playwright or the browser extension) and fix every serious or critical issue; check colour contrast of all text (4.5:1 minimum, 3:1 for large text and outlines); tab through each screen with the keyboard; test with VoiceOver or NVDA on home, a lesson and a quiz; confirm every decorative owl, sparkle and cloud is hidden from screen readers and every meaningful picture has a text alternative.
3. Performance: make sure the new SVGs and fonts do not slow first load noticeably. Report the build size before and after.
4. Update ACCESSIBILITY_AUDIT.md with what you checked and the results.

Rules for this step:
- Looks and accessibility fixes only. Keep every feature, route, data call, test id and behaviour.
- Do not touch users.json, any .env file, secrets, Firebase or Cloudflare settings, or the Gemini safeguards. Do not deploy, merge or force-push.
- Run npm run lint, npm test -- --run and npm run build. All must pass.
- Open a pull request with phone screenshots of every child screen and the axe results before and after. Report anything still failing and why.
```
