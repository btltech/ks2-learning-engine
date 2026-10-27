# Speech architecture and the Kokoro natural English voice

All read-aloud goes through `services/naturalTTS.ts`, in this order:

1. Reviewed Yorùbá recordings (`services/yorubaAudio.ts`) and pre-recorded encouragement clips (`services/encouragementAudio.ts`).
2. Pre-generated French/Spanish pronunciation audio (`services/languageAudio.ts`, below).
3. Kokoro on-device English voice, if the user opted in and it has loaded.
4. The browser's Web Speech API, which always works and is the final fallback.

No paid or cloud TTS provider is called from the app. The earlier Google Cloud TTS proxy, Edge/Piper/SpeechT5 experiments and `unifiedTTS` were removed because nothing used them.

## Kokoro natural English voice

Opt-in, on-device text-to-speech using [Kokoro-82M](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX) via `kokoro-js`.

- **Where it plugs in:** `services/naturalTTS.ts` (the path used by `useTTS` / `useTTSEnhanced`) tries `speakWithKokoro()` first and falls back to Web Speech.
- **Opt-in:** Accessibility settings -> Audio -> "Natural English Voice". The preference is stored in `localStorage` (`ks2.kokoroVoice.enabled`); the ~90MB model downloads only after opting in. Until it is ready, speech uses Web Speech, so nothing waits on the download.
- **English only:** `kokoro-js` phonemises English only. French/Spanish/etc. keep using Web Speech; Yorùbá keeps its reviewed audio pack.
- **Privacy/cost:** runs in a Web Worker on the device, no text leaves the browser, no per-request cost.
- **Voices:** `bf_emma` (lessons, celebration, pronunciation) and `bf_isabella` (MiRa). Change in `VOICES` in `services/kokoroTTS.ts`; keep `scripts/upload-kokoro-model-r2.mjs` and the allow-list in `functions/api/kokoro-model/[[path]].ts` in sync.
- **Runtime:** q8 quantised model on the WASM backend, single-threaded (the site is not cross-origin isolated). Slower devices may take a moment per sentence; sentence N+1 is generated while N plays.

## Deploying the model

The CSP only allows `'self'`, so the model is served from our own origin, not huggingface.co.

1. `node scripts/upload-kokoro-model-r2.mjs` downloads the model files and uploads them to `models/kokoro-82m-v1.0/` in the `APP_AUDIO` R2 bucket (needs `wrangler` login).
2. `functions/api/kokoro-model/[[path]].ts` serves them at `/api/kokoro-model/v1.0/...` (allow-listed files only).
3. Local dev has no Pages Functions: run `node scripts/upload-kokoro-model-r2.mjs --download-only`, serve that folder, and set `VITE_KOKORO_MODEL_BASE` to it (the folder must be exposed as `<base>/v1.0/...`).

Confirm the model licence before shipping (the ONNX repo metadata says Apache-2.0).

## Pre-generated French and Spanish audio

`kokoro-js` can't speak French/Spanish in the browser, so word and phrase pronunciation is generated offline with the Python Kokoro package and served as MP3s, like the Yorùbá pack.

What is covered: the vocabulary in `services/phoneticsService.ts` plus the options/answers of the French and Spanish question-bank topics (84 entries, 54 French and 30 Spanish). Sentences written by Gemini at runtime are not covered and still use browser speech.

```bash
node scripts/build-language-audio-manifest.mjs          # -> data/audio/language-audio-manifest.json (committed)
python3.12 -m venv .venv && . .venv/bin/activate         # kokoro 0.9.x needs Python 3.10-3.12
pip install -r scripts/requirements-language-audio.txt   # also needs espeak-ng and ffmpeg installed
python3 scripts/generate-language-audio.py               # -> audio/languages/kokoro-82m-v1.0/*.mp3 (gitignored)
# LISTEN to the files, ideally with a French / Spanish speaker. generation-report.json lists automatic flags.
node scripts/upload-language-audio-r2.mjs                # or: --approved-ids id1,id2,...
```

Voices: French `ff_siwis` (the only French voice), Spanish `ef_dora`; speed 0.9. To change a voice or the word list, edit `scripts/build-language-audio-manifest.mjs`; hashes change with the voice/text, so only changed entries are regenerated.

At runtime `naturalTTS.speakPronunciation()` asks `services/languageAudio.ts` for a recording (`/api/language-audio`, served from R2 by `functions/api/language-audio.ts`) and falls back to browser speech when there isn't one, e.g. before the audio is uploaded.

Review notes: some question-bank options are deliberate wrong answers (e.g. "Si" as a distractor for "sí"). They get recordings too; remove them from the manifest if you'd rather not have them spoken.
