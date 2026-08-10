# Yorùbá audio implementation plan

## Current baseline

- Content inventory: **733 unique entries** (376 source-audited queue entries plus
  the expanded reviewed lesson/question content). This exceeds the 450-entry
  Phase 1 target; it is still text-only until pronunciation review and audio
  generation are complete.
- The inventory is text-only for now; no Yoruba pack has been uploaded to R2.
- The local F5-TTS Yoruba checkpoint is now a research-only candidate. The
  25-file phrase test clipped or dropped clauses, so it is not approved for
  production audio. It is also licensed CC-BY-NC-4.0 and must be treated as
  non-commercial until licensing is confirmed.
- The review page is local-only. The current F5 samples include articulation
  tests for `Wúrà Ọlá` and `Yọ̀rùbá`; those variants are not automatically
  promoted to lesson content.

## Subject-matter map after the curriculum audit

The reviewed Yoruba lesson pack now defines **26 staged units** (the requested
25 areas plus a dedicated Places and directions unit). Every unit has a lesson,
vocabulary and at least four deterministic quiz questions, and is assigned to a
Year 3–6 progression:

| Topic | Current coverage | Decision |
|---|---|---|
| Greetings, introductions and politeness | Morning/afternoon/evening, thanks, please, sorry, excuse me, elder greetings and introductions | Covered; Batch 1 |
| Alphabet and pronunciation | Ẹ/Ọ/Ṣ, `gb`, tone levels and high/mid/low syllable practice | Covered; dedicated audio set |
| Numbers and age | 0–20, tens, 100, counting sentences and simple arithmetic | Covered; Batch 1 |
| Colours | Red, blue, green, black, white, yellow, purple, brown | Covered; Batch 1 |
| Family and people | Parents, siblings, grandparents, aunt/uncle/cousin and respectful people words | Covered; Batch 1 |
| Body and health | Head, eyes, ears, nose, mouth, hands, legs, hair and wellbeing | Covered; Batch 2 |
| Food and drink | Core foods, fruit, vegetables, preferences, ordering/eating/drinking phrases | Covered; Batch 2 |
| Animals and nature | Domestic/wild animals, birds, fish, insects, trees, rivers and mountains | Covered; Batch 2 |
| School and home | Classroom subjects/help, rooms, furniture, household objects and chores | Covered; Batch 2 |
| Clothing | Clothing, colours and wearing phrases | Covered; Batch 2 |
| Weather and seasons | Sunny, rainy, hot, cold, windy, clouds, harmattan and seasons | Covered; Batch 2 |
| Time and calendar | Today/tomorrow/yesterday, time, Monday–Sunday and January–December | Covered; Batch 3 |
| Transport, shopping and hobbies | Travel/road safety, market/money/prices and free-time activities | Covered; Batch 3 |
| Community and culture | Police, doctor, firefighter, hospital, library, post office, names, festivals, clothing, food, music, respect and proverbs | Covered; Batch 3 |
| Grammar | Pronouns, sentence order, verbs, questions, negatives, singular/plural quantity and adjectives | Covered; Year 6 |
| Reading, listening, speaking and writing | Passages, dialogues, stories, poems, songs, instructions, dictation, role-play, presentations, copying, sentence completion and paragraphs | Covered; Year 6 |

The inventory is now broad enough for the first curriculum release. It remains
an owner-review queue: some borrowed or regional terms (especially colours,
transport and family relationships) are intentionally flagged for native-speaker
correction before their audio is published.

For the learner-facing release, split the inventory into three bands:

- **Core KS2:** greetings, family, colours, numbers, food, school, home,
  weather, days and months.
- **Everyday extension:** markets, travel, directions, body/health, hobbies,
  animals and short conversations.
- **Reference/advanced:** university terms, specialist professions, formal
  institutions and long academic noun phrases. Keep these available for
  enrichment, but do not mix them into a beginner audio playlist.

## Phased implementation

### 1. Content and pronunciation audit

1. Review the 733 manifest rows by category, starting with lesson vocabulary,
   greetings, numbers, and question-bank options.
2. Keep the exact marked Yoruba text as the source of truth. Never flatten
   underdots, tone marks, or word boundaries to make a model happier.
3. Record corrections in a review file keyed by the stable entry id rather than
   editing generated audio by hand.
4. Split any new slash alternatives before synthesis; a slash is never spoken.

### 2. Baseline generation in safe batches

1. Generate a provider test batch locally in 25-entry increments, beginning
   with complete phrases rather than isolated words.
2. Use one approved reference voice and record the model, checkpoint, speed,
   inference steps, and reference hash in the report.
3. Treat this first release as a practice baseline: run automated duration,
   silence, clipping, Unicode and duplicate checks, then listen to a sample of
   each batch plus all flagged names, greetings, tone pairs and short words.
4. Keep the complete batch available while corrections are collected; do not
   block the whole pack on manually listening to every item.
5. Generate corrected rows again instead of overwriting the original silently.

### 3. Cache and publish only approved files

Use a versioned key that includes all pronunciation-affecting inputs:

```text
audio/yoruba/<provider>/<model-version>/<speed>/<text-and-settings-hash>.mp3
```

The app should check the R2 object first. A cache hit must never call a TTS
provider. A cache miss should be generated only by an authenticated backend
job, then written to R2 after validation.

### 4. Wire the app

1. Add a backend audio lookup endpoint that accepts an entry id or exact text,
   resolves the manifest object key, and returns a short-lived signed/public
   R2 URL.
2. Keep dynamic AI-question audio separate from the reusable lesson pack; cache
   it on first use with the same stable key.
3. Add a provider setting so F5, a future hosted model, or a human recording
   can be selected without changing lesson data.
4. Keep the existing Google TTS proxy as a fallback for languages that do not
   have a stored Yoruba recording. It must not be the primary Yoruba path.

### 5. Retune as models improve

When a new Yoruba model becomes available, run it against the same fixed
review set and compare it to the accepted baseline. Publish a new model-version
namespace only after review; keep the previous version available for rollback.

## Acceptance gate before production

- All tone-marked text passes Unicode/NFC and slash checks.
- Every published row has an audio object, duration, checksum, provider, model
  version, and review state.
- A native speaker approves greetings, names, tone minimal pairs, and all
  corrections marked by the audit.
- No CC-BY-NC model output is used in a commercial deployment without explicit
  licensing confirmation.
- R2 cache hits are verified in the live app without a provider request.
