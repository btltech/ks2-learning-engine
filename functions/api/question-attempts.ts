import { SignJWT, createRemoteJWKSet, importPKCS8, jwtVerify } from 'jose';

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<unknown>) => void;
}) => Response | Promise<Response>;

interface Env {
  FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  FIREBASE_SERVICE_ACCOUNT_BASE64?: string;
  ALLOWED_ORIGINS?: string;
}

interface QuestionAttempt {
  questionId: string;
  question: string;
  isCorrect: boolean;
  timeToAnswer: number | null;
  subject: string;
  topic: string;
  difficulty: string;
}

const jwks = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
const MAX_ATTEMPTS_PER_REQUEST = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_BATCHES = 12;
const MAX_BODY_BYTES = 30_000;
const rateLimits = new Map<string, { count: number; resetAt: number }>();

export const allowAttemptBatch = (uid: string, now = Date.now()): boolean => {
  const current = rateLimits.get(uid);
  if (!current || current.resetAt <= now) {
    rateLimits.set(uid, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_LIMIT_BATCHES) return false;
  current.count += 1;
  return true;
};

const boundedString = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export const sanitizeAttempts = (value: unknown): QuestionAttempt[] | null => {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_ATTEMPTS_PER_REQUEST) return null;
  const attempts: QuestionAttempt[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') return null;
    const item = raw as Record<string, unknown>;
    const questionId = boundedString(item.questionId, 180);
    const question = boundedString(item.question, 500);
    const subject = boundedString(item.subject, 80);
    const topic = boundedString(item.topic, 240);
    const difficulty = boundedString(item.difficulty, 20);
    const rawTime = item.timeToAnswer;
    const timeToAnswer = rawTime == null ? null : Number(rawTime);
    if (
      !questionId || questionId.includes('/') || !question || typeof item.isCorrect !== 'boolean'
      || !subject || !topic || !difficulty
      || (timeToAnswer !== null && (!Number.isFinite(timeToAnswer) || timeToAnswer < 0 || timeToAnswer > 3600))
    ) return null;
    attempts.push({ questionId, question, isCorrect: item.isCorrect, timeToAnswer, subject, topic, difficulty });
  }
  return attempts;
};

function cors(request: Request, env: Env): { allowed: boolean; headers: Record<string, string> } {
  const origin = request.headers.get('Origin');
  const configured = (env.ALLOWED_ORIGINS || '').split(',').map((entry) => entry.trim()).filter(Boolean);
  let sameOrigin = '';
  try { sameOrigin = new URL(request.url).origin; } catch { /* invalid request URL */ }
  const allowed = configured.length > 0 ? Boolean(origin && configured.includes(origin)) : origin === sameOrigin;
  return {
    allowed,
    headers: {
      'Access-Control-Allow-Origin': origin && allowed ? origin : 'null',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin',
    },
  };
}

function serviceAccount(env: Env): { client_email: string; private_key: string } | null {
  try {
    const raw = env.FIREBASE_SERVICE_ACCOUNT_JSON
      || (env.FIREBASE_SERVICE_ACCOUNT_BASE64 ? atob(env.FIREBASE_SERVICE_ACCOUNT_BASE64) : '');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function accessToken(account: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const key = await importPKCS8(account.private_key, 'RS256');
  const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/cloud-platform' })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(account.client_email)
    .setSubject(account.client_email)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 300)
    .sign(key);
  const form = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form,
  });
  const data = await response.json() as { access_token?: string; error_description?: string };
  if (!response.ok || !data.access_token) throw new Error(data.error_description || 'Unable to authorize performance write');
  return data.access_token;
}

const stringValue = (value: string) => ({ stringValue: value });
const timestampValue = (value: Date) => ({ timestampValue: value.toISOString() });
const increment = (value: number) => ({ doubleValue: value });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const requestCors = cors(request, env);
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), {
    status, headers: { ...requestCors.headers, 'Content-Type': 'application/json' },
  });
  if (!requestCors.allowed) return json(403, { error: 'Origin not allowed' });

  const projectId = env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID;
  const account = serviceAccount(env);
  if (!projectId || !account?.client_email || !account.private_key) return json(500, { error: 'Server is not configured' });

  const authMatch = (request.headers.get('Authorization') || '').match(/^Bearer\s+(.+)$/i);
  if (!authMatch) return json(401, { error: 'Missing Authorization token' });
  let uid = '';
  try {
    const { payload } = await jwtVerify(authMatch[1], jwks, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    uid = typeof payload.sub === 'string' ? payload.sub : '';
    if (!uid) throw new Error('Token missing user');
  } catch {
    return json(401, { error: 'Invalid Authorization token' });
  }
  if (!allowAttemptBatch(uid)) return json(429, { error: 'Too many analytics updates' });

  const declaredLength = Number(request.headers.get('Content-Length') || '0');
  if (declaredLength > MAX_BODY_BYTES) return json(413, { error: 'Request too large' });
  let body: { attempts?: unknown };
  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_BYTES) return json(413, { error: 'Request too large' });
    body = JSON.parse(rawBody) as { attempts?: unknown };
  }
  catch { return json(400, { error: 'Invalid JSON body' }); }
  const attempts = sanitizeAttempts(body.attempts);
  if (!attempts) return json(400, { error: 'Invalid question attempts' });

  try {
    const token = await accessToken(account);
    const now = new Date();
    const writes = attempts.map((attempt) => ({
      update: {
        name: `projects/${projectId}/databases/(default)/documents/questionPerformance/${attempt.questionId}`,
        fields: {
          questionId: stringValue(attempt.questionId),
          question: stringValue(attempt.question),
          subject: stringValue(attempt.subject),
          topic: stringValue(attempt.topic),
          difficulty: stringValue(attempt.difficulty),
          lastAttemptAt: timestampValue(now),
        },
      },
      updateMask: { fieldPaths: ['questionId', 'question', 'subject', 'topic', 'difficulty', 'lastAttemptAt'] },
      updateTransforms: [
        { fieldPath: 'timesShown', increment: increment(1) },
        { fieldPath: 'timesCorrect', increment: increment(attempt.isCorrect ? 1 : 0) },
        ...(attempt.timeToAnswer === null ? [] : [{ fieldPath: 'totalTimeSpent', increment: increment(attempt.timeToAnswer) }]),
      ],
    }));
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:commit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes }),
    });
    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } };
      throw new Error(error.error?.message || 'Firestore rejected the performance update');
    }
    return json(200, { recorded: attempts.length });
  } catch (error) {
    console.error('Question performance write failed', error);
    return json(500, { error: 'Unable to record question attempts' });
  }
};

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) => {
  const requestCors = cors(request, env);
  return new Response(null, { status: requestCors.allowed ? 204 : 403, headers: requestCors.headers });
};
