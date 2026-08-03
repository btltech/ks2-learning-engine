import { describe, expect, it } from 'vitest';
import { onRequestGet, onRequestOptions } from './games';

const env = {
  FIREBASE_PROJECT_ID: 'test-project',
  FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify({ client_email: 'test@example.com', private_key: 'test-key' }),
};

function context(method = 'GET', origin = 'https://demiwuraks2.co.uk') {
  return {
    request: new Request('https://demiwuraks2.co.uk/api/games', { method, headers: { Origin: origin } }),
    env,
    params: {},
  } as any;
}

describe('games API boundary', () => {
  it('rejects foreign origins before authentication', async () => {
    const response = await onRequestGet(context('GET', 'https://evil.example'));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'Origin not allowed' });
  });

  it('requires a Firebase bearer token', async () => {
    const response = await onRequestGet(context());
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Missing Authorization Bearer token' });
  });

  it('allows same-origin preflight and blocks foreign preflight', async () => {
    expect((await onRequestOptions(context('OPTIONS'))).status).toBe(204);
    expect((await onRequestOptions(context('OPTIONS', 'https://evil.example'))).status).toBe(403);
  });
});
