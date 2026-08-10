# Yoruba audio pipeline

The app's tone-marked Yoruba lesson content and Yoruba question-bank options are
combined into `data/audio/yoruba-audio-manifest.json`. The builder preserves NFC
Unicode, deduplicates exact text, and creates a stable cache identity from:

```text
model + language + playback speed + output format + exact text
```

The original app inventory contained 83 unique Yoruba phrases. After the
curriculum expansion and queue promotion, the manifest now has **733 unique
entries** (above the 450+ Phase 1 target) after slash-separated vocabulary
alternatives were split into separate entries. The Meta model is a speech
synthesizer, not a dictionary, so there is no vocabulary list to export from the
model itself.

The original review queue remains stored separately in
`data/audio/yoruba-expansion-review-queue.json`; its entries are marked
`pending-native-review` for audit, while the promoted production entries carry an
explicit owner-approval note and `pending-audio-review` status.

Slash-separated alternatives are not valid spoken text. The normalizer in
`scripts/normalize-yoruba-audio-text.mjs` splits them before synthesis, so the
voice never reads a slash.

To reproduce the queue from the downloaded COERLL textbook text:

```bash
pdftotext -enc UTF-8 /path/to/YorubaYeMi-textbook.pdf /tmp/YorubaYeMi-textbook.txt
python3 scripts/build-yoruba-expansion-review-queue.py /tmp/YorubaYeMi-textbook.txt
```

The importer corrects known legacy PDF glyph mappings and checks Unicode, but it
does not claim that OCR is a pronunciation review. A Yoruba speaker must approve
or correct each candidate before it enters the production manifest.

The queue currently contains a small number of explicitly flagged legacy-glyph
cases (for example borrowed terms containing `õ`). A few obvious spellings were
automatically normalised, but they remain pending review by design.

## Expanding the content safely

The manifest is intentionally richer than the minimum target. Each item should
still carry its tone-marked Yoruba, English meaning, category, source and review
state. Only approved items should move into a published audio batch;
AI-generated question phrases should remain on-demand and be cached after first
use.

The University of Texas COERLL Yorùbá Yé Mi materials are a suitable source for
that expansion because they provide structured beginner chapters, vocabulary, and
audio. Their spelling should be checked against a native speaker before import;
OCR from older PDFs must not be copied blindly.

## Local generation

The local generator is deliberately opt-in and never uploads files:

```bash
node scripts/build-yoruba-audio-manifest.mjs
node scripts/validate-yoruba-audio-manifest.mjs
python3 scripts/generate-yoruba-audio.py --dry-run --limit 20
python3 scripts/generate-yoruba-audio.py --limit 20
```

Phase 2 produced 20 local MP3 test files under `audio/yoruba/`. They are 16 kHz
mono MP3s and pass an `ffmpeg` decode check, but the owner listening review
rejected their Yoruba pronunciation. They are retained only as a failed test
reference, remain ignored by Git, and must not be uploaded to R2 or used in the
app. The decision is recorded in
`data/audio/yoruba-tts-quality-gate.json`.

The Meta generator now stops when that quality gate is rejected. The override
flag is available only for isolated research and must not be used for a
production batch:

```bash
python3 scripts/generate-yoruba-audio.py --limit 1 --override-rejected-quality
```

The local F5-TTS Yoruba checkpoint is retained for research comparison only.
The phrase test clipped or dropped clauses, so it is not approved for the
733-entry pack. Any generated files remain local and must not be cached in R2.
Use a provider that passes complete-phrase listening review before generating
small local batches and publishing them. See
`docs/YORUBA_AUDIO_IMPLEMENTATION_PLAN.md` for the staged rollout and retuning
process.

The generation command needs `transformers`, `torch`, `soundfile`, and `ffmpeg` in a local
virtual environment. It writes WAV files under
`audio/yoruba/facebook-mms-tts-yor/1.0/` temporarily, encodes 96 kbps MP3 files,
and writes a generation report. Review these files with a Yoruba speaker before
publishing them. A human recording can replace the same R2 object key when it is
better.

The model is `facebook/mms-tts-yor` and is licensed CC BY-NC 4.0. Confirm that
licence is suitable for the service's intended use before publishing generated
audio.

## R2 upload (after review)

R2 is not configured in this checkout yet. Once a bucket exists, add its real
name to `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "YORUBA_AUDIO"
bucket_name = "<actual-bucket-name>"
```

Then upload an approved file without putting credentials in source control:

```bash
wrangler r2 object put <actual-bucket-name>/audio/yoruba/facebook-mms-tts-yor/1.0/<hash>.mp3 \
  --file audio/yoruba/facebook-mms-tts-yor/1.0/<hash>.mp3
```

The application should look up this key first and only synthesize on a cache miss.
The key must include language, model, speed, format, and the exact text hash.
Question audio should be generated on demand; the reusable lesson pack is the
first batch to publish.
