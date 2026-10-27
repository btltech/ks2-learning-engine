# Kokoro natural English voice

Opt-in, on-device text-to-speech using [Kokoro-82M](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX) via `kokoro-js`.

- **Where it plugs in:** `services/naturalTTS.ts` (the path used by `useTTS` / `useTTSEnhanced`) tries `speakWithKokoro()` first and falls back to Web Speech. `services/unifiedTTS.ts` is not used by the app.
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
