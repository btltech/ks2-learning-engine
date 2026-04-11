import React, { useEffect, useRef } from 'react';

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileWidgetProps {
  siteKey: string;
  onToken: (token: string) => void;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ siteKey, onToken, className, theme = 'light' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey) return;

    let cancelled = false;

    const loadScript = async () => {
      if (document.getElementById(TURNSTILE_SCRIPT_ID)) return;
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.id = TURNSTILE_SCRIPT_ID;
        script.src = TURNSTILE_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Turnstile script'));
        document.head.appendChild(script);
      });
    };

    const renderWidget = async () => {
      try {
        await loadScript();
        if (cancelled) return;
        if (!containerRef.current) return;
        const turnstile = (window as any).turnstile as { render?: Function; remove?: Function } | undefined;
        if (!turnstile?.render) return;

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token: string) => onToken(token),
          'expired-callback': () => onToken(''),
          'error-callback': () => onToken(''),
        });
      } catch (e) {
        console.warn('Turnstile failed to load:', e);
      }
    };

    void renderWidget();

    return () => {
      cancelled = true;
      const widgetId = widgetIdRef.current;
      widgetIdRef.current = null;
      const turnstile = (window as any).turnstile as { remove?: Function } | undefined;
      if (widgetId && turnstile?.remove) {
        try {
          turnstile.remove(widgetId);
        } catch {
          // ignore
        }
      }
    };
  }, [siteKey, theme, onToken]);

  return <div ref={containerRef} className={className} />;
};
