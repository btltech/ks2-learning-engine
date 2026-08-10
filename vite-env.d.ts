/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_PAID_CELEBRATION_TTS?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
