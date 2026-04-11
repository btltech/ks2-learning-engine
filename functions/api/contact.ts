// Cloudflare Pages Function - Contact form submission handler
// - Validates and saves contact submissions to Firestore via REST API
// - Sends admin notification email via Resend (https://resend.com)
//
// Required env vars (set in Cloudflare Pages → Settings → Environment Variables):
//   VITE_FIREBASE_API_KEY         - Firebase web API key (already set)
//   VITE_FIREBASE_PROJECT_ID      - Firebase project ID (already set)
//   RESEND_API_KEY                - Resend API key (get from resend.com)
//   CONTACT_EMAIL                 - Admin email to receive notifications (default: support@demiwuraks2.co.uk)

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<unknown>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
}) => Response | Promise<Response>;

interface Env {
  VITE_FIREBASE_API_KEY?: string;
  FIREBASE_API_KEY?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  FIREBASE_PROJECT_ID?: string;
  RESEND_API_KEY?: string;
  /** Admin email to receive contact notifications. Defaults to support@demiwuraks2.co.uk */
  CONTACT_EMAIL?: string;
  ALLOWED_ORIGINS?: string;
}

const CORS_METHODS = 'POST, OPTIONS';
const CORS_HEADERS = 'Content-Type';

function getCorsOrigin(request: Request, env: Env): string {
  const origin = request.headers.get('Origin') ?? '';
  const allowed = (env.ALLOWED_ORIGINS || 'https://demiwuraks2.co.uk,https://ks2-learning-engine.pages.dev')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  // Allow any *.pages.dev preview deployment as well
  if (allowed.includes(origin) || /^https:\/\/ks2-learning-engine-[^.]+\.pages\.dev$/.test(origin)) {
    return origin;
  }
  // Allow localhost for development
  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
    return origin;
  }
  return 'null';
}

function jsonResponse(status: number, body: unknown, corsOrigin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': CORS_METHODS,
      'Access-Control-Allow-Headers': CORS_HEADERS,
      'Vary': 'Origin',
    },
  });
}

/** Strip HTML special chars and zero-width chars to prevent injection */
function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width chars
    .replace(/[<>]/g, '')                   // strip HTML angle brackets
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // control chars
    .trim()
    .slice(0, maxLen);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Firestore REST ───────────────────────────────────────────────────────────

async function saveToFirestore(
  projectId: string,
  apiKey: string,
  data: {
    name: string;
    email: string;
    userType: string;
    subject: string;
    message: string;
    submittedAt: number;
    status: string;
  }
): Promise<void> {
  const url =
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}` +
    `/databases/(default)/documents/contactSubmissions?key=${encodeURIComponent(apiKey)}`;

  const body = {
    fields: {
      name:        { stringValue: data.name },
      email:       { stringValue: data.email },
      userType:    { stringValue: data.userType },
      subject:     { stringValue: data.subject },
      message:     { stringValue: data.message },
      submittedAt: { integerValue: String(data.submittedAt) },
      status:      { stringValue: data.status },
    },
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err: any = await resp.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Firestore write failed (${resp.status})`);
  }
}

// ─── Resend email ─────────────────────────────────────────────────────────────

async function sendAdminNotification(
  resendApiKey: string,
  adminEmail: string,
  sub: { name: string; email: string; userType: string; subject: string; message: string }
): Promise<void> {
  const safeName    = escapeHtml(sub.name);
  const safeEmail   = escapeHtml(sub.email);
  const safeType    = escapeHtml(sub.userType);
  const safeSubject = escapeHtml(sub.subject);
  const safeMessage = escapeHtml(sub.message).replace(/\n/g, '<br>');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f3f4f6;">
      <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:24px;">
          <h1 style="color:#fff;margin:0;font-size:20px;">📬 New Contact Form Submission</h1>
        </div>
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:10px 12px;font-weight:600;color:#374151;width:110px;background:#f9fafb;border-radius:4px;">Name</td>
                <td style="padding:10px 12px;color:#1f2937;">${safeName}</td></tr>
            <tr><td style="padding:10px 12px;font-weight:600;color:#374151;background:#f9fafb;border-radius:4px;">Email</td>
                <td style="padding:10px 12px;"><a href="mailto:${safeEmail}" style="color:#3b82f6;">${safeEmail}</a></td></tr>
            <tr><td style="padding:10px 12px;font-weight:600;color:#374151;background:#f9fafb;border-radius:4px;">User type</td>
                <td style="padding:10px 12px;color:#1f2937;text-transform:capitalize;">${safeType}</td></tr>
            <tr><td style="padding:10px 12px;font-weight:600;color:#374151;background:#f9fafb;border-radius:4px;">Subject</td>
                <td style="padding:10px 12px;color:#1f2937;">${safeSubject}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#eff6ff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;">
            <p style="font-weight:600;color:#1e40af;margin:0 0 8px;">Message</p>
            <p style="color:#1f2937;margin:0;line-height:1.6;">${safeMessage}</p>
          </div>
          <p style="margin-top:20px;font-size:13px;color:#6b7280;">
            Reply to this person: <a href="mailto:${safeEmail}" style="color:#3b82f6;">${safeEmail}</a>
          </p>
        </div>
      </div>
    </body>
    </html>`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'KS2 Learning Engine <noreply@demiwuraks2.co.uk>',
      to: [adminEmail],
      reply_to: sub.email,
      subject: `📬 Contact: ${sub.subject}`,
      html,
    }),
  });

  if (!resp.ok) {
    const err: any = await resp.json().catch(() => ({}));
    throw new Error(err?.message || `Resend error (${resp.status})`);
  }
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const corsOrigin = getCorsOrigin(context.request, context.env);
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': CORS_METHODS,
      'Access-Control-Allow-Headers': CORS_HEADERS,
      'Vary': 'Origin',
    },
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const corsOrigin = getCorsOrigin(request, env);

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' }, corsOrigin);
  }

  if (typeof body !== 'object' || body === null) {
    return jsonResponse(400, { error: 'Body must be a JSON object' }, corsOrigin);
  }

  const b = body as Record<string, unknown>;

  // Validate and sanitize
  const name    = sanitizeText(b.name,    100);
  const email   = sanitizeText(b.email,   200);
  const subject = sanitizeText(b.subject, 200);
  const message = sanitizeText(b.message, 5000);
  const rawType = sanitizeText(b.userType, 20);

  if (!name || !email || !subject || !message) {
    return jsonResponse(400, { error: 'name, email, subject and message are required' }, corsOrigin);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return jsonResponse(400, { error: 'Invalid email address' }, corsOrigin);
  }

  const VALID_TYPES = new Set(['parent', 'teacher', 'student', 'admin', 'other']);
  const userType = VALID_TYPES.has(rawType) ? rawType : 'other';

  const projectId = env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID;
  const apiKey    = env.FIREBASE_API_KEY    || env.VITE_FIREBASE_API_KEY;

  // 1. Save to Firestore (best-effort)
  if (projectId && apiKey) {
    try {
      await saveToFirestore(projectId, apiKey, {
        name, email, userType, subject, message,
        submittedAt: Date.now(),
        status: 'new',
      });
    } catch (err) {
      console.error('[contact] Firestore save failed:', err);
      // Continue — email notification is the critical path
    }
  } else {
    console.warn('[contact] Firebase credentials not configured — skipping Firestore write');
  }

  // 2. Email admin notification (best-effort)
  const resendApiKey = env.RESEND_API_KEY;
  const adminEmail   = env.CONTACT_EMAIL || 'support@demiwuraks2.co.uk';

  if (resendApiKey) {
    try {
      await sendAdminNotification(resendApiKey, adminEmail, { name, email, userType, subject, message });
    } catch (err) {
      console.error('[contact] Email notification failed:', err);
      // Don't fail the request just because email failed
    }
  } else {
    console.warn('[contact] RESEND_API_KEY not set — skipping admin notification email');
  }

  return jsonResponse(200, { success: true }, corsOrigin);
};
