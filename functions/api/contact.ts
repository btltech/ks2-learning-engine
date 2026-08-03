// Cloudflare Pages Function - contact form submission handler.
//
// Submissions are written with a server-side Firebase service account.  This
// deliberately avoids a public Firestore write rule, which would otherwise be
// an easy spam bypass for a form intended for families and schools.

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
  RESEND_API_KEY?: string;
  CONTACT_EMAIL?: string;
  ALLOWED_ORIGINS?: string;
  TURNSTILE_SECRET_KEY?: string;
  RATE_LIMIT_KV?: KVNamespace;
}

interface ContactData {
  name: string;
  email: string;
  userType: string;
  subject: string;
  message: string;
  submittedAt: number;
  status: string;
}

const CORS_METHODS = 'POST, OPTIONS';
const CORS_HEADERS = 'Content-Type';
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 1000;
const contactRateLimits = new Map<string, { count: number; resetTime: number }>();

function allowedOrigins(env: Env): string[] {
  return (env.ALLOWED_ORIGINS || 'https://demiwuraks2.co.uk,https://ks2-learning-engine.pages.dev')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getCorsOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin') ?? '';
  if (allowedOrigins(env).includes(origin)) return origin;
  if (/^https:\/\/ks2-learning-engine-[^.]+\.pages\.dev$/.test(origin)) return origin;
  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return origin;
  return null;
}

function corsHeaders(corsOrigin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': corsOrigin || 'null',
    'Access-Control-Allow-Methods': CORS_METHODS,
    'Access-Control-Allow-Headers': CORS_HEADERS,
    'Vary': 'Origin',
  };
}

function jsonResponse(status: number, body: unknown, corsOrigin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(corsOrigin) },
  });
}

function getClientIp(request: Request): string {
  const cfIp = request.headers.get('CF-Connecting-IP');
  if (cfIp?.trim()) return cfIp.trim();
  const forwarded = request.headers.get('X-Forwarded-For');
  if (forwarded?.trim()) return forwarded.split(',')[0].trim();
  return 'unknown';
}

async function checkRateLimit(env: Env, key: string): Promise<{ allowed: boolean; retryAfter: number }> {
  const now = Date.now();
  if (env.RATE_LIMIT_KV) {
    try {
      const stored = await env.RATE_LIMIT_KV.get(key, 'json') as { count: number; resetTime: number } | null;
      if (!stored || stored.resetTime <= now) {
        await env.RATE_LIMIT_KV.put(key, JSON.stringify({ count: 1, resetTime: now + RATE_WINDOW_MS }), { expirationTtl: 120 });
        return { allowed: true, retryAfter: 0 };
      }
      if (stored.count >= RATE_LIMIT) {
        return { allowed: false, retryAfter: Math.max(1, Math.ceil((stored.resetTime - now) / 1000)) };
      }
      await env.RATE_LIMIT_KV.put(key, JSON.stringify({ count: stored.count + 1, resetTime: stored.resetTime }), { expirationTtl: 120 });
      return { allowed: true, retryAfter: 0 };
    } catch {
      // Use the process-local limiter if a configured KV binding is temporarily unavailable.
    }
  }

  const stored = contactRateLimits.get(key);
  if (!stored || stored.resetTime <= now) {
    contactRateLimits.set(key, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }
  if (stored.count >= RATE_LIMIT) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((stored.resetTime - now) / 1000)) };
  }
  stored.count += 1;
  return { allowed: true, retryAfter: 0 };
}

function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLen);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getProjectId(env: Env): string | null {
  return env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || null;
}

function getServiceAccount(env: Env): { client_email: string; private_key: string } | null {
  const raw = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const encoded = env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  try {
    if (raw?.trim()) return JSON.parse(raw);
    if (encoded?.trim()) return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
  return null;
}

async function getGoogleAccessToken(serviceAccount: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const privateKey = await importPKCS8(serviceAccount.private_key, 'RS256');
  const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/cloud-platform' })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(serviceAccount.client_email)
    .setSubject(serviceAccount.client_email)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 5 * 60)
    .sign(privateKey);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
  });
  const data: any = await response.json().catch(() => ({}));
  if (!response.ok || typeof data?.access_token !== 'string') {
    throw new Error(data?.error_description || data?.error || 'Unable to authenticate contact storage');
  }
  return data.access_token;
}

async function saveToFirestore(projectId: string, accessToken: string, data: ContactData): Promise<void> {
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/contactSubmissions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        name: { stringValue: data.name },
        email: { stringValue: data.email },
        userType: { stringValue: data.userType },
        subject: { stringValue: data.subject },
        message: { stringValue: data.message },
        submittedAt: { integerValue: String(data.submittedAt) },
        status: { stringValue: data.status },
      },
    }),
  });
  const body: any = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message || `Contact storage failed (${response.status})`);
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  const form = new URLSearchParams({ secret, response: token });
  if (ip !== 'unknown') form.set('remoteip', ip);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  const body: any = await response.json().catch(() => ({}));
  return response.ok && body?.success === true;
}

async function sendAdminNotification(
  resendApiKey: string,
  adminEmail: string,
  submission: Pick<ContactData, 'name' | 'email' | 'userType' | 'subject' | 'message'>,
): Promise<void> {
  const safeName = escapeHtml(submission.name);
  const safeEmail = escapeHtml(submission.email);
  const safeType = escapeHtml(submission.userType);
  const safeSubject = escapeHtml(submission.subject);
  const safeMessage = escapeHtml(submission.message).replace(/\n/g, '<br>');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'DemiWura <onboarding@resend.dev>',
      to: [adminEmail],
      reply_to: submission.email,
      subject: `Contact: ${submission.subject}`,
      html: `<h1>New contact submission</h1><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p><p><strong>User type:</strong> ${safeType}</p><p><strong>Subject:</strong> ${safeSubject}</p><p>${safeMessage}</p>`,
    }),
  });
  const body: any = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.message || `Email notification failed (${response.status})`);
}

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const origin = getCorsOrigin(context.request, context.env);
  return new Response(null, { status: origin ? 204 : 403, headers: corsHeaders(origin) });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const origin = getCorsOrigin(request, env);
  if (!origin) return jsonResponse(403, { error: 'Origin not allowed' }, null);

  const clientIp = getClientIp(request);
  const rate = await checkRateLimit(env, `contact:${clientIp}`);
  if (!rate.allowed) {
    return new Response(JSON.stringify({ error: 'Too many contact requests. Please try again later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin), 'Retry-After': String(rate.retryAfter) },
    });
  }

  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return jsonResponse(400, { error: 'Body must be a JSON object' }, origin);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' }, origin);
  }

  const name = sanitizeText(body.name, 100);
  const email = sanitizeText(body.email, 200);
  const subject = sanitizeText(body.subject, 200);
  const message = sanitizeText(body.message, 5000);
  const rawType = sanitizeText(body.userType, 20);
  const turnstileToken = sanitizeText(body.turnstileToken, 4096);
  if (!name || !email || !subject || !message) {
    return jsonResponse(400, { error: 'name, email, subject and message are required' }, origin);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return jsonResponse(400, { error: 'Invalid email address' }, origin);
  }
  const userType = new Set(['parent', 'teacher', 'student', 'admin', 'other']).has(rawType) ? rawType : 'other';

  if (env.TURNSTILE_SECRET_KEY?.trim()) {
    if (!turnstileToken || !(await verifyTurnstile(env.TURNSTILE_SECRET_KEY.trim(), turnstileToken, clientIp))) {
      return jsonResponse(400, { error: 'Please complete the CAPTCHA and try again.' }, origin);
    }
  }

  const projectId = getProjectId(env);
  const serviceAccount = getServiceAccount(env);
  if (!projectId || !serviceAccount?.client_email || !serviceAccount.private_key) {
    return jsonResponse(503, { error: 'Contact service is temporarily unavailable. Please email support@demiwuraks2.co.uk.' }, origin);
  }

  const submission: ContactData = { name, email, userType, subject, message, submittedAt: Date.now(), status: 'new' };
  try {
    const accessToken = await getGoogleAccessToken(serviceAccount);
    await saveToFirestore(projectId, accessToken, submission);
  } catch (error: any) {
    return jsonResponse(503, { error: error?.message || 'Unable to save your message. Please try again shortly.' }, origin);
  }

  let notificationSent = false;
  if (env.RESEND_API_KEY?.trim()) {
    try {
      await sendAdminNotification(env.RESEND_API_KEY, env.CONTACT_EMAIL || 'support@demiwuraks2.co.uk', submission);
      notificationSent = true;
    } catch (error) {
      console.error('[contact] Notification failed after successful storage', error);
    }
  }
  return jsonResponse(200, { success: true, notificationSent }, origin);
};
