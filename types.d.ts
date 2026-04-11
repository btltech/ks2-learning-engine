declare module '*.wav' {
  const src: string;
  export default src;
}

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, params: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export {};
