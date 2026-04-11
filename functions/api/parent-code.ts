// Cloudflare Pages Function - Parent code management (regenerate unique code)
// - Requires Firebase ID token (parent must be signed in)
// - Reserves codes in Firestore `parentCodes/{code}` to guarantee uniqueness

import { SignJWT, createRemoteJWKSet, jwtVerify, importPKCS8 } from 'jose';

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<unknown>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
}) => Response | Promise<Response>;

interface Env {
  FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  FIREBASE_SERVICE_ACCOUNT_BASE64?: string;
  ALLOWED_ORIGINS?: string; // comma-separated
}

const jwks = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

const PARENT_CODES_COLLECTION = 'parentCodes';

function getProjectId(env: Env): string | null {
  return env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || null;
}

function getServiceAccount(env: Env): { client_email: string; private_key: string } | null {
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

async function firestoreGetDocument(projectId: string, accessToken: string, docPath: string): Promise<any | null> {
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${docPath}`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (resp.status === 404) return null;

  const data: any = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || `Failed to read Firestore document: ${docPath}`);
  }
  return data;
}

function firestoreString(value: string) {
  return { stringValue: value };
}
function firestoreTimestamp(value: Date) {
  return { timestampValue: value.toISOString() };
}

function getCorsHeaders(request: Request, env: Env): { headers: Record<string, string>; allowed: boolean } {
  const origin = request.headers.get('Origin');
  const allowedOrigins = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const requestOrigin = (() => {
    try {
      return new URL(request.url).origin;
    } catch {
      return null;
    }
  })();

  const isAllowed =
    (allowedOrigins.length > 0
      ? Boolean(origin && allowedOrigins.includes(origin))
      : Boolean(origin && requestOrigin && origin === requestOrigin));

  return {
    allowed: isAllowed,
    headers: {
      'Access-Control-Allow-Origin': origin && isAllowed ? origin : 'null',
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  };
}

function jsonResponse(status: number, body: unknown, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

function generateParentCode(): string {
  // Avoid ambiguous chars (0/O, 1/I) for kids/parents.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function parseFirestoreString(value: any): string | null {
  return typeof value?.stringValue === 'string' ? value.stringValue : null;
}

async function verifyFirebaseIdToken(projectId: string, authorizationHeader: string): Promise<{ uid: string }> {
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new Error('Missing Authorization Bearer token');
  }
  const { payload } = await jwtVerify(match[1], jwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  const uid = typeof payload.sub === 'string' && payload.sub ? payload.sub : '';
  if (!uid) throw new Error('Invalid token');
  return { uid };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const cors = getCorsHeaders(request, env);

  if (!cors.allowed) {
    return jsonResponse(403, { error: 'Origin not allowed' }, cors.headers);
  }

  const projectId = getProjectId(env);
  if (!projectId) {
    return jsonResponse(500, { error: 'Firebase project ID not configured' }, cors.headers);
  }

  const serviceAccount = getServiceAccount(env);
  if (!serviceAccount?.client_email || !serviceAccount?.private_key) {
    return jsonResponse(
      500,
      { error: 'Service account not configured (set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_BASE64)' },
      cors.headers
    );
  }

  let uid = '';
  try {
    const authHeader = request.headers.get('Authorization') || '';
    ({ uid } = await verifyFirebaseIdToken(projectId, authHeader));
  } catch (e: any) {
    return jsonResponse(401, { error: e?.message || 'Unauthorized' }, cors.headers);
  }

  try {
    const accessToken = await getGoogleAccessToken(serviceAccount);
    const userDoc = await firestoreGetDocument(projectId, accessToken, `users/${uid}`);
    if (!userDoc?.fields) {
      return jsonResponse(404, { error: 'User profile not found' }, cors.headers);
    }

    const role = parseFirestoreString(userDoc.fields.role);
    if (role !== 'parent') {
      return jsonResponse(403, { error: 'Only parent accounts can regenerate parent codes' }, cors.headers);
    }

    const oldCode = parseFirestoreString(userDoc.fields.parentCode) || '';
    const now = new Date();

    // Generate + reserve a unique code in `parentCodes/{code}`.
    for (let attempt = 0; attempt < 25; attempt++) {
      const candidate = generateParentCode();

      const reserveDoc = `projects/${projectId}/databases/(default)/documents/${PARENT_CODES_COLLECTION}/${candidate}`;
      const parentDoc = `projects/${projectId}/databases/(default)/documents/users/${uid}`;

      const writes: any[] = [
        {
          update: {
            name: reserveDoc,
            fields: {
              parentUid: firestoreString(uid),
              createdAt: firestoreTimestamp(now),
              updatedAt: firestoreTimestamp(now),
            },
          },
          currentDocument: { exists: false },
        },
        {
          update: {
            name: parentDoc,
            fields: {
              parentCode: firestoreString(candidate),
              updatedAt: firestoreTimestamp(now),
            },
          },
          updateMask: { fieldPaths: ['parentCode', 'updatedAt'] },
        },
      ];

      if (oldCode && oldCode !== candidate) {
        const oldDoc = `projects/${projectId}/databases/(default)/documents/${PARENT_CODES_COLLECTION}/${oldCode}`;
        writes.push({ delete: oldDoc });
      }

      const commitUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:commit`;
      const resp = await fetch(commitUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ writes }),
      });

      const data: any = await resp.json().catch(() => ({}));
      if (resp.ok) {
        return jsonResponse(200, { parentCode: candidate }, cors.headers);
      }

      const message = data?.error?.message || 'Failed to commit code update';
      // Collision: try again.
      if (message.includes('ALREADY_EXISTS') || message.includes('Precondition') || message.includes('FAILED_PRECONDITION')) {
        continue;
      }

      throw new Error(message);
    }

    return jsonResponse(500, { error: 'Unable to generate a unique parent code. Please try again.' }, cors.headers);
  } catch (e: any) {
    return jsonResponse(500, { error: e?.message || 'Failed to regenerate parent code' }, cors.headers);
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const cors = getCorsHeaders(request, env);
  return new Response(null, { status: cors.allowed ? 204 : 403, headers: cors.headers });
};
