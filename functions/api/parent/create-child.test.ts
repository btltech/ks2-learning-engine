import { beforeEach, describe, expect, it, vi } from 'vitest';

const admin = vi.hoisted(() => ({
  commit: vi.fn(),
  getDocument: vi.fn(),
  getGoogleAccessToken: vi.fn(),
  runQuery: vi.fn(),
  verifyFirebaseIdToken: vi.fn(),
}));

vi.mock('../../../functions-shared/firebase-admin', () => ({
  commit: admin.commit,
  documentName: (_projectId: string, path: string) => `projects/test/databases/(default)/documents/${path}`,
  firestoreFields: (value: Record<string, unknown>) => value,
  firestoreValue: (value: unknown) => ({ value }),
  getCors: () => ({ allowed: true, headers: {} }),
  getDocument: admin.getDocument,
  getGoogleAccessToken: admin.getGoogleAccessToken,
  getProjectId: () => 'test-project',
  getServiceAccount: () => ({ client_email: 'service@example.com', private_key: 'key' }),
  hasRole: (profile: any, _caller: any, role: string) =>
    profile?.role === role || (Array.isArray(profile?.roles) && profile.roles.includes(role)),
  jsonResponse: (status: number, body: unknown, headers: Record<string, string>) =>
    new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } }),
  runQuery: admin.runQuery,
  verifyFirebaseIdToken: admin.verifyFirebaseIdToken,
}));

import { onRequestPost } from './create-child';

function request(body: unknown) {
  return {
    request: new Request('https://demiwuraks2.co.uk/api/parent/create-child', {
      method: 'POST',
      headers: { Origin: 'https://demiwuraks2.co.uk', Authorization: 'Bearer token' },
      body: JSON.stringify(body),
    }),
    env: {},
    params: {},
    waitUntil: () => {},
    passThroughOnException: () => {},
    next: async () => new Response(),
  };
}

async function pinHash(childId: string, pin: string) {
  const bytes = new TextEncoder().encode(`pin:${childId}:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

describe('parent create-child endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    admin.verifyFirebaseIdToken.mockResolvedValue({ uid: 'parent-1', claims: {} });
    admin.getGoogleAccessToken.mockResolvedValue('access-token');
    admin.getDocument.mockResolvedValue({ id: 'parent-1', role: 'parent', roles: ['parent'] });
    admin.runQuery.mockResolvedValue([]);
    admin.commit.mockResolvedValue({});
  });

  it('creates an atomic linked child profile without storing the plain PIN', async () => {
    const response = await onRequestPost(request({ name: 'Ada', age: 9, pin: '246810' }) as any);

    expect(response.status).toBe(201);
    const body = await response.json() as any;
    expect(body.child).toMatchObject({ name: 'Ada', age: 9 });
    expect(admin.commit).toHaveBeenCalledOnce();
    expect(JSON.stringify(admin.commit.mock.calls[0][2])).not.toContain('246810');
  });

  it('rejects an invalid PIN', async () => {
    const response = await onRequestPost(request({ name: 'Ada', age: 9, pin: '12ab' }) as any);

    expect(response.status).toBe(400);
    expect(admin.commit).not.toHaveBeenCalled();
  });

  it('rejects non-parent callers', async () => {
    admin.getDocument.mockResolvedValue({ id: 'student-1', role: 'student', roles: ['student'] });

    const response = await onRequestPost(request({ name: 'Ada', age: 9, pin: '246810' }) as any);

    expect(response.status).toBe(403);
  });

  it('does not create a duplicate child profile', async () => {
    admin.runQuery.mockResolvedValue([{ id: 'child-1', name: 'ada', age: 9 }]);

    const response = await onRequestPost(request({ name: 'Ada', age: 9, pin: '246810' }) as any);

    expect(response.status).toBe(409);
    expect(admin.commit).not.toHaveBeenCalled();
  });

  it('requires a different PIN for each child in a family', async () => {
    admin.runQuery.mockResolvedValue([{
      id: 'child-1',
      name: 'Grace',
      age: 10,
      childPinHash: await pinHash('child-1', '246810'),
    }]);

    const response = await onRequestPost(request({ name: 'Ada', age: 9, pin: '246810' }) as any);

    expect(response.status).toBe(409);
    expect(admin.commit).not.toHaveBeenCalled();
  });

  it('allows a verified admin to create a child when Firestore reads are quota-blocked', async () => {
    admin.verifyFirebaseIdToken.mockResolvedValue({ uid: 'admin-parent', claims: { admin: true } });
    admin.getDocument.mockRejectedValue(new Error('Quota exceeded.'));

    const response = await onRequestPost(request({ name: 'Grace', age: 10, pin: '135790' }) as any);

    expect(response.status).toBe(201);
    expect(admin.commit).toHaveBeenCalledOnce();
  });

  it('allows a verified parent claim to create a child when Firestore reads are quota-blocked', async () => {
    admin.verifyFirebaseIdToken.mockResolvedValue({ uid: 'verified-parent', claims: { parent: true } });
    admin.getDocument.mockRejectedValue(new Error('RESOURCE_EXHAUSTED: Quota exceeded.'));

    const response = await onRequestPost(request({ name: 'Ada', age: 9, pin: '246810' }) as any);

    expect(response.status).toBe(201);
    expect(admin.commit).toHaveBeenCalledOnce();
  });

  it('returns a clear temporary error when a non-admin is quota-blocked', async () => {
    admin.getDocument.mockRejectedValue(new Error('Quota exceeded.'));

    const response = await onRequestPost(request({ name: 'Grace', age: 10, pin: '135790' }) as any);

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: expect.stringContaining('daily quota') });
    expect(admin.commit).not.toHaveBeenCalled();
  });
});
