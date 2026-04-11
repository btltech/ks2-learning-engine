// Cloudflare Pages Function - Admin Role Management
// - Verifies caller Firebase ID token signature
// - Requires caller to have custom claim: { admin: true }
// - Sets target user's custom claims via Identity Platform Admin REST API
// - Syncs Firestore user profile role/roles via Firestore REST API

import { createRemoteJWKSet, jwtVerify, SignJWT, importPKCS8 } from 'jose';

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<unknown>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
}) => Response | Promise<Response>;

interface Env {
  VITE_FIREBASE_PROJECT_ID?: string;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  FIREBASE_SERVICE_ACCOUNT_BASE64?: string;
}

const allowedRoles = new Set(['student', 'parent', 'teacher', 'admin']);

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

function getProjectId(env: Env): string | null {
  return env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || null;
}

function getServiceAccount(env: Env): { client_email: string; private_key: string; project_id?: string } | null {
  const raw = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const b64 = env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (raw && raw.trim()) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  if (b64 && b64.trim()) {
    try {
      const decoded = atob(b64);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  return null;
}

async function verifyCallerIsAdmin(request: Request, projectId: string): Promise<{ uid: string; claims: any }> {
  const authHeader = request.headers.get('Authorization') || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new Error('Missing Authorization Bearer token');
  }

  const token = match[1];

  // Firebase ID tokens are signed by Google; verify via Secure Token JWKs
  const jwks = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  if (payload.admin !== true) {
    throw new Error('Caller is not an admin (missing admin custom claim)');
  }

  const uid = typeof payload.sub === 'string' ? payload.sub : '';
  if (!uid) {
    throw new Error('Invalid token: missing sub');
  }

  return { uid, claims: payload };
}

async function getGoogleAccessToken(serviceAccount: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const pk = await importPKCS8(serviceAccount.private_key, 'RS256');

  const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/cloud-platform' })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(serviceAccount.client_email)
    .setSubject(serviceAccount.client_email)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 5)
    .sign(pk);

  const form = new URLSearchParams();
  form.set('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
  form.set('assertion', assertion);

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  const data: any = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error_description || data?.error || 'Failed to obtain Google access token');
  }

  if (!data.access_token) {
    throw new Error('Token response missing access_token');
  }

  return data.access_token as string;
}

async function lookupUserByEmail(projectId: string, accessToken: string, email: string): Promise<{ localId: string } | null> {
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/accounts:lookup`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: [email] }),
  });

  const data: any = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || 'Failed to lookup user');
  }

  const users = Array.isArray(data?.users) ? data.users : [];
  if (users.length === 0) return null;

  const localId = users[0]?.localId;
  if (typeof localId !== 'string' || !localId) return null;

  return { localId };
}

async function setCustomClaims(projectId: string, accessToken: string, localId: string, claims: Record<string, any>): Promise<void> {
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/accounts:update`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      localId,
      customAttributes: JSON.stringify(claims),
    }),
  });

  const data: any = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || 'Failed to set custom claims');
  }
}

async function updateFirestoreUserRoles(projectId: string, accessToken: string, uid: string, role: string, roles: string[]): Promise<void> {
  const url = new URL(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/users/${encodeURIComponent(uid)}`);
  url.searchParams.set('updateMask.fieldPaths', 'role');
  url.searchParams.append('updateMask.fieldPaths', 'roles');
  url.searchParams.append('updateMask.fieldPaths', 'updatedAt');

  const body = {
    fields: {
      role: { stringValue: role },
      roles: {
        arrayValue: {
          values: roles.map((r) => ({ stringValue: r })),
        },
      },
      updatedAt: { timestampValue: new Date().toISOString() },
    },
  };

  const resp = await fetch(url.toString(), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  // Firestore returns 404 if profile doesn't exist; we treat it as non-fatal.
  if (resp.status === 404) return;

  const data: any = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || 'Failed to update Firestore user profile');
  }
}

function computePrimaryRole(roles: string[]): 'admin' | 'teacher' | 'parent' | 'student' {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('teacher')) return 'teacher';
  if (roles.includes('parent')) return 'parent';
  return 'student';
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  const projectId = getProjectId(env);
  if (!projectId) {
    return json(500, { error: 'FIREBASE_PROJECT_ID not configured in function environment' });
  }

  const serviceAccount = getServiceAccount(env);
  if (!serviceAccount?.client_email || !serviceAccount?.private_key) {
    return json(500, { error: 'Service account not configured (set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_BASE64)' });
  }

  try {
    await verifyCallerIsAdmin(request, projectId);

    const body = (await request.json()) as any;
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const rolesIn: unknown[] = Array.isArray(body?.roles) ? body.roles : [];
    const roles: string[] = rolesIn
      .map((r) => String(r).trim().toLowerCase())
      .filter(Boolean);

    if (!email) return json(400, { error: 'Missing email' });
    if (roles.length === 0) return json(400, { error: 'At least one role is required' });

    for (const r of roles) {
      if (!allowedRoles.has(r)) {
        return json(400, { error: `Invalid role: ${r}` });
      }
    }

    // Ensure unique roles
    const uniqueRoles: string[] = Array.from(new Set<string>(roles));

    // Custom claims used by security rules
    const claims = {
      admin: uniqueRoles.includes('admin') || undefined,
      teacher: uniqueRoles.includes('teacher') || undefined,
    };

    const accessToken = await getGoogleAccessToken(serviceAccount);
    const user = await lookupUserByEmail(projectId, accessToken, email);

    if (!user) {
      return json(404, { error: 'No auth user found for that email' });
    }

    await setCustomClaims(projectId, accessToken, user.localId, claims);

    const primaryRole = computePrimaryRole(uniqueRoles as string[]);
    await updateFirestoreUserRoles(projectId, accessToken, user.localId, primaryRole, uniqueRoles as string[]);

    return json(200, {
      ok: true,
      email,
      uid: user.localId,
      role: primaryRole,
      roles: uniqueRoles,
      claims,
      note: 'User must sign out/in to refresh token claims.',
    });
  } catch (err: any) {
    return json(403, { error: err?.message || 'Forbidden' });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders() });
};
