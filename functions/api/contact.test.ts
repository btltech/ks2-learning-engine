import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { onRequestPost, onRequestOptions } from './contact';

function makePostCtx(
  body: unknown,
  env: Record<string, string> = {},
  origin = 'https://demiwuraks2.co.uk'
) {
  const request = new Request('https://demiwuraks2.co.uk/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': origin,
    },
    body: JSON.stringify(body),
  });
  return {
    request,
    env,
    params: {},
    waitUntil: () => {},
    passThroughOnException: () => {},
    next: async () => new Response(),
  };
}

function makeOptionsCtx(origin = 'https://demiwuraks2.co.uk') {
  const request = new Request('https://demiwuraks2.co.uk/api/contact', {
    method: 'OPTIONS',
    headers: { Origin: origin },
  });
  return {
    request,
    env: {},
    params: {},
    waitUntil: () => {},
    passThroughOnException: () => {},
    next: async () => new Response(),
  };
}

const VALID_BODY = {
  name: 'Test User',
  email: 'test@example.com',
  subject: 'Hello',
  message: 'This is a test message',
  userType: 'parent',
};

describe('contact function', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('OPTIONS preflight', () => {
    it('returns 204', async () => {
      const res = await onRequestOptions(makeOptionsCtx() as any);
      expect(res.status).toBe(204);
    });

    it('sets CORS headers', async () => {
      const res = await onRequestOptions(makeOptionsCtx() as any);
      expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });
  });

  describe('POST validation', () => {
    it('returns 400 for invalid JSON', async () => {
      const request = new Request('https://demiwuraks2.co.uk/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'https://demiwuraks2.co.uk' },
        body: 'not-json',
      });
      const ctx = {
        request,
        env: {},
        params: {},
        waitUntil: () => {},
        passThroughOnException: () => {},
        next: async () => new Response(),
      };
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/invalid json/i);
    });

    it('returns 400 when name is missing', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, name: '' });
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
    });

    it('returns 400 when email is missing', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, email: '' });
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid email format', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, email: 'not-an-email' });
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/invalid email/i);
    });

    it('returns 400 when subject is missing', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, subject: '' });
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
    });

    it('returns 400 when message is missing', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, message: '' });
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
    });

    it('returns 400 for non-object JSON body', async () => {
      const request = new Request('https://demiwuraks2.co.uk/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'https://demiwuraks2.co.uk' },
        body: '"just a string"',
      });
      const ctx = { request, env: {}, params: {}, waitUntil: () => {}, passThroughOnException: () => {}, next: async () => new Response() };
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
    });
  });

  describe('POST success', () => {
    it('returns 200 for valid submission (no credentials configured)', async () => {
      const ctx = makePostCtx(VALID_BODY, {});
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it('calls Firestore REST API when credentials are configured', async () => {
      const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
      vi.stubGlobal('fetch', mockFetch);

      const ctx = makePostCtx(VALID_BODY, {
        FIREBASE_PROJECT_ID: 'my-project',
        FIREBASE_API_KEY: 'my-api-key',
      });
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(200);
      // Firestore REST URL should have been called
      const firestoreCall = mockFetch.mock.calls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('firestore.googleapis.com')
      );
      expect(firestoreCall).toBeDefined();
    });

    it('calls Resend when RESEND_API_KEY is configured', async () => {
      const mockFetch = vi.fn().mockResolvedValue(new Response('{"id":"email-id"}', { status: 200 }));
      vi.stubGlobal('fetch', mockFetch);

      const ctx = makePostCtx(VALID_BODY, {
        FIREBASE_PROJECT_ID: 'my-project',
        FIREBASE_API_KEY: 'my-api-key',
        RESEND_API_KEY: 'resend-key',
        CONTACT_EMAIL: 'admin@example.com',
      });
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(200);
      const resendCall = mockFetch.mock.calls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('resend.com')
      );
      expect(resendCall).toBeDefined();
    });

    it('normalises unknown userType to "other"', async () => {
      const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
      vi.stubGlobal('fetch', mockFetch);

      const ctx = makePostCtx(
        { ...VALID_BODY, userType: 'hacker' },
        { FIREBASE_PROJECT_ID: 'p', FIREBASE_API_KEY: 'k' }
      );
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(200);
      // The Firestore call body should contain userType: 'other'
      const firestoreCall = mockFetch.mock.calls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('firestore')
      );
      expect(firestoreCall).toBeDefined();
      const requestBody = JSON.parse(firestoreCall![1].body as string);
      expect(requestBody.fields.userType.stringValue).toBe('other');
    });

    it('still returns 200 if Firestore write fails (best-effort)', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Firestore down')));
      const ctx = makePostCtx(VALID_BODY, {
        FIREBASE_PROJECT_ID: 'my-project',
        FIREBASE_API_KEY: 'my-api-key',
      });
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(200);
    });

    it('still returns 200 if Resend fails (best-effort)', async () => {
      vi.stubGlobal('fetch', vi.fn()
        .mockResolvedValueOnce(new Response('{}', { status: 200 })) // Firestore ok
        .mockRejectedValueOnce(new Error('Resend down'))             // Resend fails
      );
      const ctx = makePostCtx(VALID_BODY, {
        FIREBASE_PROJECT_ID: 'my-project',
        FIREBASE_API_KEY: 'my-api-key',
        RESEND_API_KEY: 'resend-key',
      });
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(200);
    });
  });

  describe('XSS / injection sanitization', () => {
    it('strips HTML angle brackets from name', async () => {
      const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
      vi.stubGlobal('fetch', mockFetch);

      const ctx = makePostCtx(
        { ...VALID_BODY, name: '<script>alert(1)</script>' },
        { FIREBASE_PROJECT_ID: 'p', FIREBASE_API_KEY: 'k' }
      );
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(200);
      const firestoreCall = mockFetch.mock.calls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('firestore')
      );
      const body = JSON.parse(firestoreCall![1].body as string);
      expect(body.fields.name.stringValue).not.toContain('<');
      expect(body.fields.name.stringValue).not.toContain('>');
    });

    it('strips zero-width characters from message', async () => {
      const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
      vi.stubGlobal('fetch', mockFetch);

      const zwsp = '\u200B';
      const ctx = makePostCtx(
        { ...VALID_BODY, message: `Hello${zwsp}World` },
        { FIREBASE_PROJECT_ID: 'p', FIREBASE_API_KEY: 'k' }
      );
      await onRequestPost(ctx as any);
      const firestoreCall = mockFetch.mock.calls.find((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('firestore')
      );
      const body = JSON.parse(firestoreCall![1].body as string);
      expect(body.fields.message.stringValue).not.toContain(zwsp);
    });
  });

  describe('CORS', () => {
    it('reflects demiwuraks2.co.uk origin', async () => {
      const ctx = makePostCtx(VALID_BODY, {}, 'https://demiwuraks2.co.uk');
      const res = await onRequestPost(ctx as any);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://demiwuraks2.co.uk');
    });

    it('allows *.pages.dev preview deployments', async () => {
      const ctx = makePostCtx(VALID_BODY, {}, 'https://ks2-learning-engine-abc123.pages.dev');
      const res = await onRequestPost(ctx as any);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://ks2-learning-engine-abc123.pages.dev');
    });

    it('allows localhost for development', async () => {
      const ctx = makePostCtx(VALID_BODY, {}, 'http://localhost:3000');
      const res = await onRequestPost(ctx as any);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
    });

    it('returns null origin for blocked domains', async () => {
      const ctx = makePostCtx(VALID_BODY, {}, 'https://evil.com');
      const res = await onRequestPost(ctx as any);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('null');
    });
  });
});
