/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the self-hosted Kokoro model files (default /api/kokoro-model). */
  readonly VITE_KOKORO_MODEL_BASE?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
