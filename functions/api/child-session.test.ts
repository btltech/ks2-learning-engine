import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { onRequestPost } from './child-session';

// child-session.ts has module-level rate limit state.
// Use distinct IPs per test group to avoid cross-test contamination.
let ipCounter = 1;
function nextIp() {
  return `10.0.0.${ipCounter++}`;
}

function makePostCtx(
  body: unknown,
  env: Record<string, string> = {},
  origin = 'https://demiwuraks2.co.uk',
  ip?: string
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Origin: origin,
    'CF-Connecting-IP': ip || nextIp(),
  };
  const request = new Request('https://demiwuraks2.co.uk/api/child-session', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return {
    request,
    env,
    params: {},
    waitUntil: (_p: Promise<unknown>) => {},
    passThroughOnException: () => {},
    next: async () => new Response(),
  };
}

const VALID_BODY = {
  parentCode: 'ABC123',
  name: 'Alice',
  age: 9,
  pin: '1234',
  turnstileToken: '',
};

// A minimal fake service account (enough to get past env checks, fails on JWT signing)
const FAKE_SERVICE_ACCOUNT = JSON.stringify({
  client_email: 'test@test.iam.gserviceaccount.com',
  private_key: 'not-a-real-key',
});

describe('child-session function', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('CORS', () => {
    it('rejects disallowed origins with 403', async () => {
      const ctx = makePostCtx(VALID_BODY, {}, 'https://evil.com');
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toMatch(/origin not allowed/i);
    });

    it('allows requests from demiwuraks2.co.uk', async () => {
      const ctx = makePostCtx(VALID_BODY, {
        ALLOWED_ORIGINS: 'https://demiwuraks2.co.uk',
        // Missing project id so it will 500 — but it passes CORS check
      }, 'https://demiwuraks2.co.uk');
      const res = await onRequestPost(ctx as any);
      // Should not be 403
      expect(res.status).not.toBe(403);
    });
  });

  describe('input validation', () => {
    // Must include project ID + service account or the function 500s before reaching validation
    const env = {
      ALLOWED_ORIGINS: 'https://demiwuraks2.co.uk',
      FIREBASE_PROJECT_ID: 'my-project',
      FIREBASE_SERVICE_ACCOUNT_JSON: FAKE_SERVICE_ACCOUNT,
    };

    it('returns 400 for missing parentCode', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, parentCode: '' }, env);
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/invalid parent code/i);
    });

    it('returns 400 for parentCode shorter than 6 chars', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, parentCode: 'AB1' }, env);
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
    });

    it('returns 400 for parentCode longer than 6 chars', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, parentCode: 'TOOLONG' }, env);
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
    });

    it('returns 400 for parentCode with special chars', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, parentCode: 'AB!@#$' }, env);
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
    });

    it('returns 400 for missing name', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, name: '' }, env);
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/invalid name/i);
    });

    it('returns 400 for name longer than 40 chars', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, name: 'A'.repeat(41) }, env);
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
    });

    it('returns 400 for age below 5', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, age: 4 }, env);
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/invalid age/i);
    });

    it('returns 400 for age above 18', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, age: 19 }, env);
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
    });

    it('returns 400 for non-numeric age', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, age: 'nine' }, env);
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
    });

    it('accepts edge-case valid age 5', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, age: 5 }, {
        ...env,
        FIREBASE_PROJECT_ID: 'p',
        FIREBASE_SERVICE_ACCOUNT_JSON: FAKE_SERVICE_ACCOUNT,
      });
      const res = await onRequestPost(ctx as any);
      // Will fail later (bad service account key) but must not be a 400 validation error
      expect(res.status).not.toBe(400);
    });

    it('accepts edge-case valid age 18', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, age: 18 }, {
        ...env,
        FIREBASE_PROJECT_ID: 'p',
        FIREBASE_SERVICE_ACCOUNT_JSON: FAKE_SERVICE_ACCOUNT,
      });
      const res = await onRequestPost(ctx as any);
      expect(res.status).not.toBe(400);
    });
  });

  describe('environment configuration checks', () => {
    const env = { ALLOWED_ORIGINS: 'https://demiwuraks2.co.uk' };

    it('returns 500 when FIREBASE_PROJECT_ID is missing', async () => {
      const ctx = makePostCtx(VALID_BODY, env);
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toMatch(/FIREBASE_PROJECT_ID/i);
    });

    it('returns 500 when service account is missing', async () => {
      const ctx = makePostCtx(VALID_BODY, { ...env, FIREBASE_PROJECT_ID: 'my-project' });
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toMatch(/service account/i);
    });

    it('accepts service account from FIREBASE_SERVICE_ACCOUNT_BASE64', async () => {
      const b64 = btoa(FAKE_SERVICE_ACCOUNT);
      const ctx = makePostCtx(VALID_BODY, {
        ...env,
        FIREBASE_PROJECT_ID: 'p',
        FIREBASE_SERVICE_ACCOUNT_BASE64: b64,
      });
      const res = await onRequestPost(ctx as any);
      // Will fail at JWT sign step (invalid key) and return 500, but with a DIFFERENT message
      // than the "service account not configured" 500. This proves BASE64 decoding worked.
      const body = await res.json();
      expect(body.error).not.toMatch(/service account not configured/i);
    });
  });

  describe('Turnstile enforcement', () => {
    const baseEnv = {
      ALLOWED_ORIGINS: 'https://demiwuraks2.co.uk',
      FIREBASE_PROJECT_ID: 'p',
      FIREBASE_SERVICE_ACCOUNT_JSON: FAKE_SERVICE_ACCOUNT,
      TURNSTILE_SECRET_KEY: 'secret',
    };

    it('returns 400 when Turnstile is configured but token is empty', async () => {
      const ctx = makePostCtx({ ...VALID_BODY, turnstileToken: '' }, baseEnv);
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/captcha/i);
    });

    it('returns 400 when Turnstile verification fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] }), { status: 200 })
      ));
      const ctx = makePostCtx({ ...VALID_BODY, turnstileToken: 'bad-token' }, baseEnv);
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/captcha/i);
    });
  });

  describe('rate limiting', () => {
    it('blocks after 20 requests from the same IP', async () => {
      const ip = nextIp();
      const env = {
        ALLOWED_ORIGINS: 'https://demiwuraks2.co.uk',
        FIREBASE_PROJECT_ID: 'p',
        FIREBASE_SERVICE_ACCOUNT_JSON: FAKE_SERVICE_ACCOUNT,
      };

      // Send 20 allowed requests (will fail at JWT step but that's fine)
      for (let i = 0; i < 20; i++) {
        const ctx = makePostCtx(VALID_BODY, env, 'https://demiwuraks2.co.uk', ip);
        await onRequestPost(ctx as any);
      }

      // 21st should be rate-limited
      const ctx = makePostCtx(VALID_BODY, env, 'https://demiwuraks2.co.uk', ip);
      const res = await onRequestPost(ctx as any);
      expect(res.status).toBe(429);
      const body = await res.json();
      expect(body.error).toMatch(/rate limit/i);
    });

    it('does not rate-limit different IPs independently', async () => {
      const env = {
        ALLOWED_ORIGINS: 'https://demiwuraks2.co.uk',
        FIREBASE_PROJECT_ID: 'p',
        FIREBASE_SERVICE_ACCOUNT_JSON: FAKE_SERVICE_ACCOUNT,
      };
      const ip1 = nextIp();
      const ip2 = nextIp();

      // Fill up ip1's bucket
      for (let i = 0; i < 20; i++) {
        const ctx = makePostCtx(VALID_BODY, env, 'https://demiwuraks2.co.uk', ip1);
        await onRequestPost(ctx as any);
      }

      // ip2 should not be blocked
      const ctx = makePostCtx(VALID_BODY, env, 'https://demiwuraks2.co.uk', ip2);
      const res = await onRequestPost(ctx as any);
      expect(res.status).not.toBe(429);
    });
  });
});
