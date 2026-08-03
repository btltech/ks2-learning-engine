import { SignJWT, createRemoteJWKSet, importPKCS8, jwtVerify } from 'jose';

export interface FirebaseFunctionEnv {
  FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  FIREBASE_SERVICE_ACCOUNT_BASE64?: string;
  ALLOWED_ORIGINS?: string;
}

export interface VerifiedCaller {
  uid: string;
  claims: Record<string, unknown>;
}

export function isQuotaError(error: unknown): boolean {
  return /quota|resource[_ -]?exhausted/i.test(error instanceof Error ? error.message : String(error));
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

const jwks = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export function getProjectId(env: FirebaseFunctionEnv): string | null {
  return env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || null;
}

export function getServiceAccount(env: FirebaseFunctionEnv): ServiceAccount | null {
  try {
    if (env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
      return JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON) as ServiceAccount;
    }
    if (env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim()) {
      return JSON.parse(atob(env.FIREBASE_SERVICE_ACCOUNT_BASE64)) as ServiceAccount;
    }
  } catch {
    return null;
  }
  return null;
}

export async function verifyFirebaseIdToken(
  projectId: string,
  authorizationHeader: string
): Promise<VerifiedCaller> {
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new Error('Missing Authorization Bearer token');

  const { payload } = await jwtVerify(match[1], jwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  const uid = typeof payload.sub === 'string' ? payload.sub : '';
  if (!uid) throw new Error('Invalid Firebase token');
  return { uid, claims: payload as Record<string, unknown> };
}

export async function getGoogleAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const privateKey = await importPKCS8(serviceAccount.private_key, 'RS256');
  const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/cloud-platform' })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(serviceAccount.client_email)
    .setSubject(serviceAccount.client_email)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 300)
    .sign(privateKey);

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = (await response.json()) as { access_token?: string; error?: string; error_description?: string };
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Unable to authenticate Firebase service account');
  }
  return data.access_token;
}

export function getCors(request: Request, env: FirebaseFunctionEnv) {
  const origin = request.headers.get('Origin');
  const requestOrigin = new URL(request.url).origin;
  const configured = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  // Same-origin GET requests commonly omit Origin; cross-origin browser calls include it.
  const allowed = !origin || origin === requestOrigin || configured.includes(origin);
  return {
    allowed,
    headers: {
      'Access-Control-Allow-Origin': origin && allowed ? origin : 'null',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Vary': 'Origin',
    },
  };
}

export function jsonResponse(status: number, body: unknown, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export function firestoreValue(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(firestoreValue) } };
  if (typeof value === 'object') return { mapValue: { fields: firestoreFields(value as Record<string, unknown>) } };
  return { stringValue: String(value) };
}

export function firestoreFields(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, field]) => field !== undefined)
      .map(([key, field]) => [key, firestoreValue(field)])
  );
}

export function parseFirestoreValue(value: any): any {
  if (!value || typeof value !== 'object') return null;
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue?.values || []).map(parseFirestoreValue);
  if ('mapValue' in value) return parseFirestoreFields(value.mapValue?.fields || {});
  return null;
}

export function parseFirestoreFields(fields: Record<string, unknown> = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, parseFirestoreValue(value)]));
}

export function parseFirestoreDocument(document: any): Record<string, any> | null {
  if (!document?.name || !document?.fields) return null;
  return {
    id: String(document.name).split('/').pop(),
    ...(typeof document.updateTime === 'string' ? { __updateTime: document.updateTime } : {}),
    ...parseFirestoreFields(document.fields),
  };
}

function documentUrl(projectId: string, path = '') {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents${path ? `/${path}` : ''}`;
}

export async function getDocument(projectId: string, accessToken: string, path: string) {
  const response = await fetch(documentUrl(projectId, path), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (response.status === 404) return null;
  const data = await response.json();
  if (!response.ok) throw new Error((data as any)?.error?.message || `Unable to read ${path}`);
  return parseFirestoreDocument(data);
}

export async function runQuery(
  projectId: string,
  accessToken: string,
  fromCollection: string,
  where?: Record<string, unknown>
) {
  const response = await fetch(`${documentUrl(projectId)}:runQuery`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: fromCollection }],
        ...(where ? { where } : {}),
        limit: 200,
      },
    }),
  });
  const data = (await response.json()) as any[];
  if (!response.ok) throw new Error((data as any)?.error?.message || `Unable to query ${fromCollection}`);
  return data.map((item) => parseFirestoreDocument(item.document)).filter(Boolean) as Record<string, any>[];
}

export async function commit(projectId: string, accessToken: string, writes: Record<string, unknown>[]) {
  const response = await fetch(`${documentUrl(projectId)}:commit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ writes }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as any)?.error?.message || 'Unable to save shared data');
  return data;
}

export function documentName(projectId: string, path: string) {
  return `projects/${projectId}/databases/(default)/documents/${path}`;
}

export function fieldFilter(fieldPath: string, op: string, value: unknown) {
  return { fieldFilter: { field: { fieldPath }, op, value: firestoreValue(value) } };
}

export function hasRole(profile: Record<string, any>, caller: VerifiedCaller, role: string) {
  const roles = Array.isArray(profile.roles) ? profile.roles : [profile.role];
  return roles.includes(role) || caller.claims[role] === true;
}
