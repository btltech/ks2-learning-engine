import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('jose', () => ({
  importPKCS8: vi.fn(async () => 'private-key'),
  SignJWT: class {
    setProtectedHeader() { return this; }
    setIssuer() { return this; }
    setSubject() { return this; }
    setAudience() { return this; }
    setIssuedAt() { return this; }
    setExpirationTime() { return this; }
    sign() { return Promise.resolve('signed-assertion'); }
  },
}));

import { onRequestOptions, onRequestPost } from './contact';

let ipCounter = 1;
const VALID_BODY = {
  name: 'Test User',
  email: 'test@example.com',
  subject: 'Hello',
  message: 'This is a test message',
  userType: 'parent',
};
const SERVICE_ACCOUNT = JSON.stringify({ client_email: 'test@example.com', private_key: 'not-a-real-key' });

function configuredEnv(extra: Record<string, unknown> = {}) {
  return {
    FIREBASE_PROJECT_ID: 'test-project',
    FIREBASE_SERVICE_ACCOUNT_JSON: SERVICE_ACCOUNT,
    ...extra,
  };
}

function makePostCtx(
  body: unknown,
  env: Record<string, unknown> = {},
  origin = 'https://demiwuraks2.co.uk',
  ip = `203.0.113.${ipCounter++}`,
) {
  const request = new Request('https://demiwuraks2.co.uk/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin, 'CF-Connecting-IP': ip },
    body: JSON.stringify(body),
  });
  return { request, env, params: {}, waitUntil: () => {}, passThroughOnException: () => {}, next: async () => new Response() };
}

function makeOptionsCtx(origin = 'https://demiwuraks2.co.uk') {
  return {
    request: new Request('https://demiwuraks2.co.uk/api/contact', { method: 'OPTIONS', headers: { Origin: origin } }),
    env: {}, params: {}, waitUntil: () => {}, passThroughOnException: () => {}, next: async () => new Response(),
  };
}

function successfulFetch() {
  return vi.fn(async (url: string) => {
    if (url.includes('oauth2.googleapis.com')) return new Response(JSON.stringify({ access_token: 'access-token' }), { status: 200 });
    if (url.includes('firestore.googleapis.com')) return new Response('{}', { status: 200 });
    if (url.includes('resend.com')) return new Response(JSON.stringify({ id: 'email-id' }), { status: 200 });
    if (url.includes('turnstile')) return new Response(JSON.stringify({ success: true }), { status: 200 });
    return new Response('{}', { status: 404 });
  });
}

describe('contact function', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', successfulFetch());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('allows a trusted origin preflight and rejects an untrusted one', async () => {
    expect((await onRequestOptions(makeOptionsCtx() as any)).status).toBe(204);
    expect((await onRequestOptions(makeOptionsCtx('https://evil.example') as any)).status).toBe(403);
  });

  it('rejects a request from an untrusted origin before processing its payload', async () => {
    const res = await onRequestPost(makePostCtx(VALID_BODY, configuredEnv(), 'https://evil.example') as any);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'Origin not allowed' });
  });

  it('validates malformed and incomplete submissions', async () => {
    const invalidJsonRequest = new Request('https://demiwuraks2.co.uk/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://demiwuraks2.co.uk', 'CF-Connecting-IP': `203.0.113.${ipCounter++}` },
      body: 'not-json',
    });
    const invalidJson = await onRequestPost({ request: invalidJsonRequest, env: {}, params: {}, waitUntil: () => {}, passThroughOnException: () => {}, next: async () => new Response() } as any);
    expect(invalidJson.status).toBe(400);
    expect((await onRequestPost(makePostCtx({ ...VALID_BODY, email: 'invalid' }, configuredEnv()) as any)).status).toBe(400);
    expect((await onRequestPost(makePostCtx({ ...VALID_BODY, message: '' }, configuredEnv()) as any)).status).toBe(400);
  });

  it('does not pretend to accept a submission when trusted storage is unavailable', async () => {
    const res = await onRequestPost(makePostCtx(VALID_BODY) as any);
    expect(res.status).toBe(503);
  });

  it('stores a valid submission with a server bearer token', async () => {
    const mockFetch = successfulFetch();
    vi.stubGlobal('fetch', mockFetch);
    const res = await onRequestPost(makePostCtx(VALID_BODY, configuredEnv()) as any);
    expect(res.status).toBe(200);
    const firestoreCall = mockFetch.mock.calls.find(([url]: [string]) => url.includes('firestore.googleapis.com'));
    expect(firestoreCall).toBeDefined();
    expect(firestoreCall![1].headers.Authorization).toBe('Bearer access-token');
    expect(JSON.parse(firestoreCall![1].body).fields.userType.stringValue).toBe('parent');
  });

  it('returns 503 when Firestore rejects the saved submission', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('oauth2.googleapis.com')) return new Response(JSON.stringify({ access_token: 'access-token' }), { status: 200 });
      if (url.includes('firestore.googleapis.com')) return new Response(JSON.stringify({ error: { message: 'storage unavailable' } }), { status: 503 });
      return new Response('{}', { status: 200 });
    }));
    const res = await onRequestPost(makePostCtx(VALID_BODY, configuredEnv()) as any);
    expect(res.status).toBe(503);
  });

  it('keeps the submission when only the notification fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('oauth2.googleapis.com')) return new Response(JSON.stringify({ access_token: 'access-token' }), { status: 200 });
      if (url.includes('firestore.googleapis.com')) return new Response('{}', { status: 200 });
      if (url.includes('resend.com')) return new Response(JSON.stringify({ message: 'down' }), { status: 503 });
      return new Response('{}', { status: 200 });
    }));
    const res = await onRequestPost(makePostCtx(VALID_BODY, configuredEnv({ RESEND_API_KEY: 'key' })) as any);
    expect(res.status).toBe(200);
    expect((await res.json()).notificationSent).toBe(false);
  });

  it('requires a valid Turnstile token whenever Turnstile is configured', async () => {
    const missing = await onRequestPost(makePostCtx(VALID_BODY, configuredEnv({ TURNSTILE_SECRET_KEY: 'secret' })) as any);
    expect(missing.status).toBe(400);
    const verified = await onRequestPost(makePostCtx({ ...VALID_BODY, turnstileToken: 'token' }, configuredEnv({ TURNSTILE_SECRET_KEY: 'secret' })) as any);
    expect(verified.status).toBe(200);
  });

  it('rate limits repeated contact requests from one IP', async () => {
    const ip = `203.0.113.${ipCounter++}`;
    for (let index = 0; index < 5; index += 1) {
      expect((await onRequestPost(makePostCtx(VALID_BODY, configuredEnv(), 'https://demiwuraks2.co.uk', ip) as any)).status).toBe(200);
    }
    const limited = await onRequestPost(makePostCtx(VALID_BODY, configuredEnv(), 'https://demiwuraks2.co.uk', ip) as any);
    expect(limited.status).toBe(429);
  });

  it('sanitizes stored contact text and unknown user types', async () => {
    const mockFetch = successfulFetch();
    vi.stubGlobal('fetch', mockFetch);
    const res = await onRequestPost(makePostCtx({ ...VALID_BODY, name: '<script>Hello</script>', userType: 'unknown', message: 'One\u200B two' }, configuredEnv()) as any);
    expect(res.status).toBe(200);
    const firestoreCall = mockFetch.mock.calls.find(([url]: [string]) => url.includes('firestore.googleapis.com'));
    const fields = JSON.parse(firestoreCall![1].body).fields;
    expect(fields.name.stringValue).not.toContain('<');
    expect(fields.message.stringValue).not.toContain('\u200B');
    expect(fields.userType.stringValue).toBe('other');
  });
});
