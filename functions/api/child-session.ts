// Cloudflare Pages Function - Child session bootstrap
// Allows a child to start with: parentCode + name + age (no email/password)
// - Validates parentCode against Firestore
// - Creates a child profile linked to the parent
// - Returns a Firebase custom token for signInWithCustomToken()

import { SignJWT, importPKCS8 } from 'jose';

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
  TURNSTILE_SECRET_KEY?: string;
  SECURITY_ALERT_WEBHOOK_URL?: string;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // per IP per minute
const RATE_WINDOW = 60 * 1000;

const SECURITY_LOCKS_COLLECTION = 'securityLocks';
const SECURITY_ALERTS_COLLECTION = 'securityAlerts';
const PARENT_CODES_COLLECTION = 'parentCodes';

const LOCK_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const IP_MAX_ATTEMPTS = 25; // per window
const IP_LOCK_MS = 15 * 60 * 1000; // 15 minutes
const CODE_MAX_ATTEMPTS = 10; // per window
const CODE_LOCK_MS = 30 * 60 * 1000; // 30 minutes

const LOCK_DOC_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (cleanup via TTL if enabled)

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

function getProjectId(env: Env): string | null {
  return env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || null;
}

function getClientIp(request: Request): string {
  const cfIp = request.headers.get('CF-Connecting-IP');
  if (cfIp && cfIp.trim()) return cfIp.trim();
  const forwarded = request.headers.get('X-Forwarded-For');
  if (forwarded && forwarded.trim()) return forwarded.split(',')[0].trim();
  return 'unknown';
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyTurnstile(params: {
  secretKey: string;
  token: string;
  ip: string;
}): Promise<{ success: boolean; errorCodes?: string[] }> {
  const form = new URLSearchParams();
  form.set('secret', params.secretKey);
  form.set('response', params.token);
  if (params.ip && params.ip !== 'unknown') form.set('remoteip', params.ip);

  const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  const data: any = await resp.json().catch(() => ({}));
  return {
    success: Boolean(data?.success),
    errorCodes: Array.isArray(data?.['error-codes']) ? data['error-codes'] : undefined,
  };
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

function parseFirestoreTimestamp(value: any): Date | null {
  const raw = value?.timestampValue;
  if (typeof raw !== 'string') return null;
  const parsed = new Date(raw);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function getLockDocId(prefix: string, keyHash: string): string {
  return `pc_${prefix}_${keyHash}`;
}

function computeLockUpdate(params: {
  now: Date;
  existing: { count: number; windowStart: Date | null; lockedUntil: Date | null };
  maxAttempts: number;
  windowMs: number;
  lockMs: number;
}): { next: { count: number; windowStart: Date; lockedUntil: Date | null; expiresAt: Date } ; triggeredLock: boolean } {
  const nowMs = params.now.getTime();
  const existingWindowStart = params.existing.windowStart?.getTime() ?? 0;
  const existingLockedUntilMs = params.existing.lockedUntil?.getTime() ?? 0;

  if (existingLockedUntilMs > nowMs) {
    return {
      next: {
        count: params.existing.count,
        windowStart: params.existing.windowStart || params.now,
        lockedUntil: params.existing.lockedUntil,
        expiresAt: new Date(nowMs + LOCK_DOC_TTL_MS),
      },
      triggeredLock: false,
    };
  }

  const shouldReset = !existingWindowStart || nowMs - existingWindowStart > params.windowMs;
  const windowStart = shouldReset ? params.now : (params.existing.windowStart || params.now);
  const count = (shouldReset ? 0 : params.existing.count) + 1;
  const triggeredLock = count >= params.maxAttempts;
  const lockedUntil = triggeredLock ? new Date(nowMs + params.lockMs) : null;

  return {
    next: {
      count,
      windowStart,
      lockedUntil,
      expiresAt: new Date(nowMs + LOCK_DOC_TTL_MS),
    },
    triggeredLock,
  };
}

async function maybeSendSecurityAlert(params: {
  env: Env;
  event: string;
  ipHash: string;
  codeHash: string;
  lockedUntil: Date;
  userAgent: string;
}): Promise<void> {
  if (!params.env.SECURITY_ALERT_WEBHOOK_URL) return;
  try {
    await fetch(params.env.SECURITY_ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: params.event,
        ipHash: params.ipHash,
        codeHash: params.codeHash,
        lockedUntil: params.lockedUntil.toISOString(),
        userAgent: params.userAgent,
        createdAt: new Date().toISOString(),
      }),
    });
  } catch {
    // non-fatal
  }
}

async function findParentByCode(projectId: string, accessToken: string, parentCode: string): Promise<{ uid: string } | null> {
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'users' }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: 'parentCode' },
                op: 'EQUAL',
                value: { stringValue: parentCode },
              },
            },
            {
              fieldFilter: {
                field: { fieldPath: 'role' },
                op: 'EQUAL',
                value: { stringValue: 'parent' },
              },
            },
          ],
        },
      },
      limit: 2,
    },
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data: any = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || 'Failed to query Firestore');
  }

  const matches = (Array.isArray(data) ? data : [])
    .map((row) => row?.document?.name)
    .filter((name) => typeof name === 'string' && name.includes('/documents/users/')) as string[];

  const uids = matches
    .map((docName) => docName.split('/documents/users/')[1])
    .filter((uid) => typeof uid === 'string' && uid.length > 0);

  if (uids.length === 0) return null;
  if (uids.length > 1) {
    // Parent code collision (should not happen after we enforce uniqueness going forward).
    throw new Error('Parent code is not unique. Please ask the parent to regenerate their code.');
  }

  return { uid: uids[0] };
}

async function findParentByCodeWithIndex(
  projectId: string,
  accessToken: string,
  parentCode: string
): Promise<{ uid: string } | null> {
  // Prefer the unique index document when available: parentCodes/{code} -> { parentUid }
  const codeDoc = await firestoreGetDocument(projectId, accessToken, `${PARENT_CODES_COLLECTION}/${parentCode}`);
  const indexedUid = parseFirestoreString(codeDoc?.fields?.parentUid);
  if (indexedUid) return { uid: indexedUid };

  // Fallback for legacy parents (no index doc yet).
  const parent = await findParentByCode(projectId, accessToken, parentCode);
  if (!parent) return null;

  // Best-effort backfill of the index doc (only if it doesn't exist).
  try {
    const now = new Date();
    const reserveDoc = `projects/${projectId}/databases/(default)/documents/${PARENT_CODES_COLLECTION}/${parentCode}`;
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:commit`;
    await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        writes: [
          {
            update: {
              name: reserveDoc,
              fields: {
                parentUid: firestoreString(parent.uid),
                createdAt: firestoreTimestamp(now),
                updatedAt: firestoreTimestamp(now),
              },
            },
            currentDocument: { exists: false },
          },
        ],
      }),
    });
  } catch {
    // ignore backfill failures
  }

  return parent;
}

function parseFirestoreString(value: any): string | null {
  return typeof value?.stringValue === 'string' ? value.stringValue : null;
}

function parseFirestoreInteger(value: any): number | null {
  const raw = value?.integerValue;
  if (typeof raw !== 'string') return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

async function findChildrenByNameAgeUnderParent(
  projectId: string,
  accessToken: string,
  parentUid: string,
  child: { name: string; age: number }
): Promise<Array<{ uid: string; loginKeyHash?: string }>> {
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'users' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'parentId' },
          op: 'EQUAL',
          value: { stringValue: parentUid },
        },
      },
      limit: 50,
    },
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data: any = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || 'Failed to query existing children');
  }

  const desiredName = child.name.trim().toLowerCase();
  const matches: Array<{ uid: string; loginKeyHash?: string }> = [];
  for (const row of Array.isArray(data) ? data : []) {
    const doc = row?.document;
    const docName = doc?.name;
    if (typeof docName !== 'string' || !docName.includes('/documents/users/')) continue;
    const uid = docName.split('/documents/users/')[1];
    if (!uid) continue;

    const fields = doc?.fields || {};
    const role = parseFirestoreString(fields.role);
    if (role && role !== 'student') continue;

    const name = parseFirestoreString(fields.name);
    const age = parseFirestoreInteger(fields.age);
    if (!name || age == null) continue;

    if (name.trim().toLowerCase() === desiredName && age === child.age) {
      matches.push({
        uid,
        loginKeyHash: parseFirestoreString(fields.childLoginKeyHash) || undefined,
      });
    }
  }

  return matches;
}

async function findChildByLoginKeyHash(
  projectId: string,
  accessToken: string,
  parentUid: string,
  loginKeyHash: string
): Promise<{ uid: string } | null> {
  // Query by the hash only (hash includes parentUid so it's unique per family).
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'users' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'childLoginKeyHash' },
          op: 'EQUAL',
          value: { stringValue: loginKeyHash },
        },
      },
      limit: 2,
    },
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data: any = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || 'Failed to query existing child by PIN');
  }

  for (const row of Array.isArray(data) ? data : []) {
    const doc = row?.document;
    const docName = doc?.name;
    if (typeof docName !== 'string' || !docName.includes('/documents/users/')) continue;
    const uid = docName.split('/documents/users/')[1];
    if (!uid) continue;

    const fields = doc?.fields || {};
    const role = parseFirestoreString(fields.role);
    if (role && role !== 'student') continue;

    const parentId = parseFirestoreString(fields.parentId);
    if (parentId !== parentUid) continue;

    return { uid };
  }

  return null;
}

function firestoreString(value: string) {
  return { stringValue: value };
}
function firestoreInteger(value: number) {
  return { integerValue: String(Math.trunc(value)) };
}
function firestoreTimestamp(value: Date) {
  return { timestampValue: value.toISOString() };
}
function firestoreArray(values: any[]) {
  return { arrayValue: { values } };
}
function firestoreMap(fields: Record<string, any>) {
  return { mapValue: { fields } };
}

async function findChildByPinHash(
  projectId: string,
  accessToken: string,
  parentUid: string,
  pin: string
): Promise<{ uid: string } | null> {
  // We don't query on pin hash directly because the hash includes childId.
  // Instead, fetch the parent's children and check for a matching hash.
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'users' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'parentId' },
          op: 'EQUAL',
          value: { stringValue: parentUid },
        },
      },
      limit: 100,
    },
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data: any = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || 'Failed to query children for PIN verification');
  }

  for (const row of Array.isArray(data) ? data : []) {
    const doc = row?.document;
    const docName = doc?.name;
    if (typeof docName !== 'string' || !docName.includes('/documents/users/')) continue;
    const uid = docName.split('/documents/users/')[1];
    if (!uid) continue;

    const fields = doc?.fields || {};
    const role = parseFirestoreString(fields.role);
    if (role && role !== 'student') continue;

    const stored = parseFirestoreString(fields.childPinHash);
    if (!stored) continue;

    const expected = await sha256Hex(`pin:${uid}:${pin}`);
    if (stored === expected) return { uid };
  }

  return null;
}

async function commitSetChildLoginKeyHash(
  projectId: string,
  accessToken: string,
  childUid: string,
  loginKeyHash: string
): Promise<void> {
  const now = new Date();
  const childDoc = `projects/${projectId}/databases/(default)/documents/users/${childUid}`;
  const body = {
    writes: [
      {
        update: {
          name: childDoc,
          fields: {
            childLoginKeyHash: firestoreString(loginKeyHash),
            updatedAt: firestoreTimestamp(now),
          },
        },
        updateMask: { fieldPaths: ['childLoginKeyHash', 'updatedAt'] },
      },
    ],
  };

  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:commit`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data: any = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || 'Failed to set child PIN');
  }
}

async function commitSetChildPinHash(
  projectId: string,
  accessToken: string,
  childUid: string,
  pinHash: string
): Promise<void> {
  const now = new Date();
  const childDoc = `projects/${projectId}/databases/(default)/documents/users/${childUid}`;
  const body = {
    writes: [
      {
        update: {
          name: childDoc,
          fields: {
            childPinHash: firestoreString(pinHash),
            updatedAt: firestoreTimestamp(now),
          },
        },
        updateMask: { fieldPaths: ['childPinHash', 'updatedAt'] },
      },
    ],
  };

  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:commit`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data: any = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || 'Failed to set child PIN hash');
  }
}

async function commitCreateChildAndLink(
  projectId: string,
  accessToken: string,
  parentUid: string,
  childUid: string,
  child: { name: string; age: number; loginKeyHash?: string }
): Promise<void> {
  const now = new Date();
  const childDoc = `projects/${projectId}/databases/(default)/documents/users/${childUid}`;
  const linkDoc = `projects/${projectId}/databases/(default)/documents/users/${parentUid}/children/${childUid}`;

  const body = {
    writes: [
      // Create child profile
      {
        update: {
          name: childDoc,
          fields: {
            id: firestoreString(childUid),
            name: firestoreString(child.name),
            role: firestoreString('student'),
            roles: firestoreArray([firestoreString('student')]),
            age: firestoreInteger(child.age),
            avatarConfig: firestoreMap({ color: firestoreString('#4F46E5') }),
            totalPoints: firestoreInteger(0),
            unlockedItems: firestoreArray([]),
            badges: firestoreArray([]),
            streak: firestoreInteger(0),
            lastLoginDate: firestoreString(now.toISOString()),
            mastery: firestoreMap({}),
            timeSpentLearning: firestoreMap({}),
            quizHistory: firestoreArray([]),
            preferredDifficulty: firestoreString('Medium'),
            parentId: firestoreString(parentUid),
            ...(child.loginKeyHash ? { childLoginKeyHash: firestoreString(child.loginKeyHash) } : {}),
            // Optional: keep a childCode for future linking/recovery flows
            childCode: firestoreString(Math.random().toString(36).substring(2, 8).toUpperCase()),
            createdAt: firestoreTimestamp(now),
            updatedAt: firestoreTimestamp(now),
          },
        },
        currentDocument: { exists: false },
      },
      {
        update: {
          name: linkDoc,
          fields: {
            childId: firestoreString(childUid),
            displayName: firestoreString(child.name),
            age: firestoreInteger(child.age),
            linkedAt: firestoreTimestamp(now),
            lastActiveAt: firestoreTimestamp(now),
            createdAt: firestoreTimestamp(now),
            updatedAt: firestoreTimestamp(now),
          },
        },
        currentDocument: { exists: false },
      },
    ],
  };

  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:commit`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data: any = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || 'Failed to write child profile');
  }
}

async function commitEnsureParentLink(
  projectId: string,
  accessToken: string,
  parentUid: string,
  childUid: string,
  child: { name: string; age: number }
): Promise<void> {
  const now = new Date();
  const linkDoc = `projects/${projectId}/databases/(default)/documents/users/${parentUid}/children/${childUid}`;
  const body = {
    writes: [
      {
        update: {
          name: linkDoc,
          fields: {
            childId: firestoreString(childUid),
            displayName: firestoreString(child.name),
            age: firestoreInteger(child.age),
            linkedAt: firestoreTimestamp(now),
            lastActiveAt: firestoreTimestamp(now),
            updatedAt: firestoreTimestamp(now),
          },
        },
        updateMask: { fieldPaths: ['childId', 'displayName', 'age', 'linkedAt', 'lastActiveAt', 'updatedAt'] },
      },
    ],
  };

  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:commit`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data: any = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || 'Failed to link existing child');
  }
}

async function createFirebaseCustomToken(
  serviceAccount: { client_email: string; private_key: string },
  uid: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const pk = await importPKCS8(serviceAccount.private_key, 'RS256');

  // Firebase Custom Token
  // https://firebase.google.com/docs/auth/admin/create-custom-tokens
  return new SignJWT({ uid })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(serviceAccount.client_email)
    .setSubject(serviceAccount.client_email)
    .setAudience('https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit')
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 10) // short-lived; exchanged immediately for an ID token
    .sign(pk);
}

function jsonResponse(status: number, body: unknown, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

function getCorsHeaders(request: Request, env: Env): { headers: Record<string, string>; allowed: boolean } {
  const origin = request.headers.get('Origin');
  const hasOrigin = Boolean(origin && origin.trim());
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

  // Native apps and non-browser clients typically do not send an Origin header.
  // Only enforce the origin allowlist for browser requests (where Origin is present).
  const isAllowed = !hasOrigin
    ? true
    : (allowedOrigins.length > 0
      ? Boolean(origin && allowedOrigins.includes(origin))
      : Boolean(origin && requestOrigin && origin === requestOrigin));

  return {
    allowed: isAllowed,
    headers: {
      'Access-Control-Allow-Origin': hasOrigin ? (origin && isAllowed ? origin : 'null') : '*',
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const cors = getCorsHeaders(request, env);

  if (!cors.allowed) {
    return jsonResponse(403, { error: 'Origin not allowed' }, cors.headers);
  }

  const clientIP = getClientIp(request);
  const rate = checkRateLimit(clientIP);
  if (!rate.allowed) {
    return jsonResponse(429, { error: 'Rate limit exceeded. Please try again later.' }, {
      ...cors.headers,
      'Retry-After': '60',
      'X-RateLimit-Remaining': '0',
    });
  }

  const projectId = getProjectId(env);
  if (!projectId) {
    return jsonResponse(500, { error: 'FIREBASE_PROJECT_ID not configured in function environment' }, cors.headers);
  }

  const serviceAccount = getServiceAccount(env);
  if (!serviceAccount?.client_email || !serviceAccount?.private_key) {
    return jsonResponse(500, { error: 'Service account not configured (set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_BASE64)' }, cors.headers);
  }

  try {
    const body = (await request.json()) as any;
    const parentCode = typeof body?.parentCode === 'string' ? body.parentCode.trim().toUpperCase() : '';
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const ageRaw = body?.age;
    const age = typeof ageRaw === 'number' ? ageRaw : Number(ageRaw);
    const pin = typeof body?.pin === 'string' ? body.pin.trim() : '';
    const turnstileToken = typeof body?.turnstileToken === 'string' ? body.turnstileToken.trim() : '';

    if (!parentCode || parentCode.length !== 6 || !/^[A-Z0-9]{6}$/.test(parentCode)) {
      return jsonResponse(400, { error: 'Invalid parent code' }, cors.headers);
    }
    if (!name || name.length < 1 || name.length > 40) {
      return jsonResponse(400, { error: 'Invalid name' }, cors.headers);
    }
    if (!Number.isFinite(age) || age < 5 || age > 18) {
      return jsonResponse(400, { error: 'Invalid age' }, cors.headers);
    }

    // Enforce Turnstile when configured
    if (env.TURNSTILE_SECRET_KEY && env.TURNSTILE_SECRET_KEY.trim()) {
      if (!turnstileToken) {
        return jsonResponse(400, { error: 'Please complete the CAPTCHA.' }, cors.headers);
      }

      const verification = await verifyTurnstile({
        secretKey: env.TURNSTILE_SECRET_KEY.trim(),
        token: turnstileToken,
        ip: clientIP,
      });

      if (!verification.success) {
        return jsonResponse(400, { error: 'CAPTCHA verification failed. Please try again.' }, cors.headers);
      }
    }

    const accessToken = await getGoogleAccessToken(serviceAccount);

    const ipHash = await sha256Hex(`ip:${clientIP}`);
    const codeHash = await sha256Hex(`code:${parentCode}`);

    // Firestore-backed lockouts (survive cold starts)
    const ipLockId = getLockDocId('ip', ipHash);
    const codeLockId = getLockDocId('code', codeHash);
    const [ipLockDoc, codeLockDoc] = await Promise.all([
      firestoreGetDocument(projectId, accessToken, `${SECURITY_LOCKS_COLLECTION}/${ipLockId}`),
      firestoreGetDocument(projectId, accessToken, `${SECURITY_LOCKS_COLLECTION}/${codeLockId}`),
    ]);

    const now = new Date();
    const ipLockedUntil = parseFirestoreTimestamp(ipLockDoc?.fields?.lockedUntil);
    if (ipLockedUntil && ipLockedUntil.getTime() > now.getTime()) {
      return jsonResponse(429, { error: 'Too many attempts. Please try again later.' }, {
        ...cors.headers,
        'Retry-After': String(Math.ceil((ipLockedUntil.getTime() - now.getTime()) / 1000)),
      });
    }
    const codeLockedUntil = parseFirestoreTimestamp(codeLockDoc?.fields?.lockedUntil);
    if (codeLockedUntil && codeLockedUntil.getTime() > now.getTime()) {
      return jsonResponse(429, { error: 'Too many attempts. Please try again later.' }, {
        ...cors.headers,
        'Retry-After': String(Math.ceil((codeLockedUntil.getTime() - now.getTime()) / 1000)),
      });
    }

    let parent: { uid: string } | null = null;
    try {
      parent = await findParentByCodeWithIndex(projectId, accessToken, parentCode);
    } catch (e: any) {
      const message = typeof e?.message === 'string' ? e.message : '';
      if (message.includes('not unique')) {
        return jsonResponse(409, { error: message }, cors.headers);
      }
      throw e;
    }
    if (!parent) {
      // Record failed attempt (per-IP + per-code)
      const userAgent = request.headers.get('User-Agent') || '';
      const ipExisting = {
        count: parseFirestoreInteger(ipLockDoc?.fields?.count) ?? 0,
        windowStart: parseFirestoreTimestamp(ipLockDoc?.fields?.windowStart),
        lockedUntil: parseFirestoreTimestamp(ipLockDoc?.fields?.lockedUntil),
      };
      const codeExisting = {
        count: parseFirestoreInteger(codeLockDoc?.fields?.count) ?? 0,
        windowStart: parseFirestoreTimestamp(codeLockDoc?.fields?.windowStart),
        lockedUntil: parseFirestoreTimestamp(codeLockDoc?.fields?.lockedUntil),
      };

      const ipUpdate = computeLockUpdate({
        now,
        existing: ipExisting,
        maxAttempts: IP_MAX_ATTEMPTS,
        windowMs: LOCK_WINDOW_MS,
        lockMs: IP_LOCK_MS,
      });
      const codeUpdate = computeLockUpdate({
        now,
        existing: codeExisting,
        maxAttempts: CODE_MAX_ATTEMPTS,
        windowMs: LOCK_WINDOW_MS,
        lockMs: CODE_LOCK_MS,
      });

      const ipDoc = `projects/${projectId}/databases/(default)/documents/${SECURITY_LOCKS_COLLECTION}/${ipLockId}`;
      const codeDoc = `projects/${projectId}/databases/(default)/documents/${SECURITY_LOCKS_COLLECTION}/${codeLockId}`;

      const writes: any[] = [
        {
          update: {
            name: ipDoc,
            fields: {
              kind: firestoreString('parentCodeLock'),
              scope: firestoreString('ip'),
              keyHash: firestoreString(ipHash),
              count: firestoreInteger(ipUpdate.next.count),
              windowStart: firestoreTimestamp(ipUpdate.next.windowStart),
              ...(ipUpdate.next.lockedUntil ? { lockedUntil: firestoreTimestamp(ipUpdate.next.lockedUntil) } : {}),
              expiresAt: firestoreTimestamp(ipUpdate.next.expiresAt),
              updatedAt: firestoreTimestamp(now),
            },
          },
        },
        {
          update: {
            name: codeDoc,
            fields: {
              kind: firestoreString('parentCodeLock'),
              scope: firestoreString('code'),
              keyHash: firestoreString(codeHash),
              count: firestoreInteger(codeUpdate.next.count),
              windowStart: firestoreTimestamp(codeUpdate.next.windowStart),
              ...(codeUpdate.next.lockedUntil ? { lockedUntil: firestoreTimestamp(codeUpdate.next.lockedUntil) } : {}),
              expiresAt: firestoreTimestamp(codeUpdate.next.expiresAt),
              updatedAt: firestoreTimestamp(now),
            },
          },
        },
      ];

      // Write a security alert doc when we newly trigger a lockout.
      const alerts: any[] = [];
      if (ipUpdate.triggeredLock && ipUpdate.next.lockedUntil) {
        const alertDoc = `projects/${projectId}/databases/(default)/documents/${SECURITY_ALERTS_COLLECTION}/alert_${crypto.randomUUID()}`;
        alerts.push({
          update: {
            name: alertDoc,
            fields: {
              event: firestoreString('parentCode_ip_lockout'),
              ipHash: firestoreString(ipHash),
              codeHash: firestoreString(codeHash),
              lockedUntil: firestoreTimestamp(ipUpdate.next.lockedUntil),
              userAgent: firestoreString(userAgent.slice(0, 200)),
              createdAt: firestoreTimestamp(now),
            },
          },
        });
        context.waitUntil(
          maybeSendSecurityAlert({
            env,
            event: 'parentCode_ip_lockout',
            ipHash,
            codeHash,
            lockedUntil: ipUpdate.next.lockedUntil,
            userAgent,
          })
        );
      }
      if (codeUpdate.triggeredLock && codeUpdate.next.lockedUntil) {
        const alertDoc = `projects/${projectId}/databases/(default)/documents/${SECURITY_ALERTS_COLLECTION}/alert_${crypto.randomUUID()}`;
        alerts.push({
          update: {
            name: alertDoc,
            fields: {
              event: firestoreString('parentCode_code_lockout'),
              ipHash: firestoreString(ipHash),
              codeHash: firestoreString(codeHash),
              lockedUntil: firestoreTimestamp(codeUpdate.next.lockedUntil),
              userAgent: firestoreString(userAgent.slice(0, 200)),
              createdAt: firestoreTimestamp(now),
            },
          },
        });
        context.waitUntil(
          maybeSendSecurityAlert({
            env,
            event: 'parentCode_code_lockout',
            ipHash,
            codeHash,
            lockedUntil: codeUpdate.next.lockedUntil,
            userAgent,
          })
        );
      }

      if (alerts.length > 0) writes.push(...alerts);

      const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:commit`;
      await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ writes }),
      }).catch(() => {
        // non-fatal
      });

      return jsonResponse(400, { error: 'Invalid parent code' }, cors.headers);
    }

    // PIN is optional for now; validate if provided.
    if (pin && !/^[0-9]{4,6}$/.test(pin)) {
      return jsonResponse(400, { error: 'PIN must be 4 to 6 digits.' }, cors.headers);
    }

    const normalizedName = name.trim().toLowerCase();
    let loginKeyHash: string | undefined;
    let existingChildUid: string | null = null;

    if (pin) {
      // Preferred: parent-set PIN stored as childPinHash = sha256("pin:{childId}:{pin}")
      const byPinHash = await findChildByPinHash(projectId, accessToken, parent.uid, pin);
      if (byPinHash?.uid) {
        existingChildUid = byPinHash.uid;
      }

      // Legacy: older deployments stored childLoginKeyHash based on name/age/pin.
      // Only attempt legacy migration if we haven't already found the child via the new PIN hash.
      if (!existingChildUid) {
        loginKeyHash = await sha256Hex(`child:${parent.uid}:${normalizedName}:${age}:${pin}`);
        const byKey = await findChildByLoginKeyHash(projectId, accessToken, parent.uid, loginKeyHash);
        if (byKey?.uid) {
          existingChildUid = byKey.uid;
        } else {
          // Migration path: if there's exactly one matching child by name+age, allow setting the PIN hash now.
          const matches = await findChildrenByNameAgeUnderParent(projectId, accessToken, parent.uid, { name, age });

          if (matches.length === 1) {
            const match = matches[0];
            if (match.loginKeyHash && match.loginKeyHash !== loginKeyHash) {
              return jsonResponse(400, { error: 'Incorrect PIN for this child.' }, cors.headers);
            }
            if (!match.loginKeyHash) {
              await commitSetChildLoginKeyHash(projectId, accessToken, match.uid, loginKeyHash);
            }
            // Also set the new, stable PIN hash (tied to childId) so renames/age edits don't break logins.
            const pinHash = await sha256Hex(`pin:${match.uid}:${pin}`);
            await commitSetChildPinHash(projectId, accessToken, match.uid, pinHash);
            existingChildUid = match.uid;
          } else if (matches.length > 1) {
            return jsonResponse(409, { error: 'Multiple children found with the same name and age. Ask the parent to rename one of them.' }, cors.headers);
          }
        }
      }
    }

    // Legacy fallback when PIN is not provided (keeps older clients working).
    if (!existingChildUid && !pin) {
      const matches = await findChildrenByNameAgeUnderParent(projectId, accessToken, parent.uid, { name, age });
      existingChildUid = matches[0]?.uid || null;
    }

    const childUid = existingChildUid || `child_${crypto.randomUUID()}`;
    if (existingChildUid) {
      await commitEnsureParentLink(projectId, accessToken, parent.uid, childUid, { name, age });
    } else {
      const pinHash = pin ? await sha256Hex(`pin:${childUid}:${pin}`) : undefined;
      await commitCreateChildAndLink(projectId, accessToken, parent.uid, childUid, { name, age, loginKeyHash });
      if (pinHash) {
        await commitSetChildPinHash(projectId, accessToken, childUid, pinHash);
      }
    }

    const customToken = await createFirebaseCustomToken(serviceAccount, childUid);
    return jsonResponse(200, { customToken }, cors.headers);
  } catch (err: any) {
    return jsonResponse(500, { error: err?.message || 'Failed to create child session' }, cors.headers);
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const cors = getCorsHeaders(request, env);
  return new Response(null, { status: cors.allowed ? 204 : 403, headers: cors.headers });
};
