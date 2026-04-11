// Cloudflare Pages Function - Public runtime config (non-secret)
// Lets the frontend discover settings that may change in Cloudflare without a rebuild.

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<unknown>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
}) => Response | Promise<Response>;

interface Env {
  ALLOWED_ORIGINS?: string; // comma-separated
  TURNSTILE_SITE_KEY?: string; // preferred (runtime)
  VITE_TURNSTILE_SITE_KEY?: string; // fallback
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

  // Notes:
  // - Same-origin browser fetches may omit the Origin header (notably Safari in some cases).
  // - This endpoint returns non-secret config, so we prefer availability over strict CORS.
  const isAllowed =
    !origin
      ? true
      : (allowedOrigins.length > 0
          ? allowedOrigins.includes(origin)
          : Boolean(requestOrigin && origin === requestOrigin));

  return {
    allowed: isAllowed,
    headers: {
      'Access-Control-Allow-Origin': origin && isAllowed ? origin : '*',
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  };
}

function jsonResponse(status: number, body: unknown, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const cors = getCorsHeaders(request, env);
  if (!cors.allowed) {
    return jsonResponse(403, { error: 'Origin not allowed' }, cors.headers);
  }

  const turnstileSiteKey = (env.TURNSTILE_SITE_KEY || env.VITE_TURNSTILE_SITE_KEY || '').trim();
  return jsonResponse(200, { turnstileSiteKey }, cors.headers);
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const cors = getCorsHeaders(request, env);
  return new Response(null, { status: cors.allowed ? 204 : 403, headers: cors.headers });
};

