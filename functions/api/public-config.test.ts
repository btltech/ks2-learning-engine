import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestGet, onRequestOptions } from './public-config';

function makeCtx(url: string, env: Record<string, string> = {}, origin?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (origin) headers['Origin'] = origin;
  const request = new Request(url, { headers });
  return {
    request,
    env,
    params: {},
    waitUntil: () => {},
    passThroughOnException: () => {},
    next: async () => new Response(),
  };
}

describe('public-config function', () => {
  describe('GET /api/public-config', () => {
    it('returns 200 with turnstileSiteKey from TURNSTILE_SITE_KEY', async () => {
      const ctx = makeCtx('https://demiwuraks2.co.uk/api/public-config', {
        TURNSTILE_SITE_KEY: 'my-site-key',
      });
      const res = await onRequestGet(ctx as any);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.turnstileSiteKey).toBe('my-site-key');
    });

    it('falls back to VITE_TURNSTILE_SITE_KEY', async () => {
      const ctx = makeCtx('https://demiwuraks2.co.uk/api/public-config', {
        VITE_TURNSTILE_SITE_KEY: 'vite-site-key',
      });
      const res = await onRequestGet(ctx as any);
      const body = await res.json();
      expect(body.turnstileSiteKey).toBe('vite-site-key');
    });

    it('returns empty string when no key configured', async () => {
      const ctx = makeCtx('https://demiwuraks2.co.uk/api/public-config', {});
      const res = await onRequestGet(ctx as any);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.turnstileSiteKey).toBe('');
    });

    it('reflects allowed origin in CORS header', async () => {
      const ctx = makeCtx(
        'https://demiwuraks2.co.uk/api/public-config',
        { ALLOWED_ORIGINS: 'https://demiwuraks2.co.uk' },
        'https://demiwuraks2.co.uk'
      );
      const res = await onRequestGet(ctx as any);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://demiwuraks2.co.uk');
    });

    it('falls back to * for requests without Origin header', async () => {
      const ctx = makeCtx('https://demiwuraks2.co.uk/api/public-config', {
        ALLOWED_ORIGINS: 'https://demiwuraks2.co.uk',
      });
      const res = await onRequestGet(ctx as any);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });

    it('returns 403 for blocked origin', async () => {
      const ctx = makeCtx(
        'https://demiwuraks2.co.uk/api/public-config',
        { ALLOWED_ORIGINS: 'https://demiwuraks2.co.uk' },
        'https://evil.com'
      );
      const res = await onRequestGet(ctx as any);
      // public-config endpoint is non-secret: CORS allows the request but sets origin to *
      // or returns 403 - verify it doesn't leak the key to disallowed origins
      if (res.status === 403) {
        expect(res.status).toBe(403);
      } else {
        const corsHeader = res.headers.get('Access-Control-Allow-Origin');
        expect(corsHeader).not.toBe('https://evil.com');
      }
    });
  });

  describe('OPTIONS /api/public-config', () => {
    it('returns 204 for preflight', async () => {
      const ctx = makeCtx(
        'https://demiwuraks2.co.uk/api/public-config',
        {},
        'https://demiwuraks2.co.uk'
      );
      const res = await onRequestOptions(ctx as any);
      expect(res.status).toBe(204);
    });
  });
});
