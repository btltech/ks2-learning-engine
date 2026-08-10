// Cloudflare Pages Function - reusable encouragement audio delivery.
// The R2 bucket stays private and only versioned, hashed objects are exposed.

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
}) => Response | Promise<Response>;

interface Env {
  APP_AUDIO?: R2Bucket;
  ALLOWED_ORIGINS?: string;
}

const AUDIO_PREFIX = 'audio/encouragement/gemini-v1';
const HASH_PATTERN = /^[a-f0-9]{32}$/i;

function corsHeaders(request: Request, env: Env): Headers {
  const origin = request.headers.get('Origin');
  const requestOrigin = new URL(request.url).origin;
  const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean);
  const allowed = !origin || (allowedOrigins.length > 0 ? allowedOrigins.includes(origin) : origin === requestOrigin);
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  });
  if (origin && allowed) headers.set('Access-Control-Allow-Origin', origin);
  return headers;
}

function jsonResponse(status: number, body: Record<string, unknown>, headers: Headers): Response {
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(body), { status, headers });
}

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) =>
  new Response(null, { status: 204, headers: corsHeaders(request, env) });

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const headers = corsHeaders(request, env);
  const origin = request.headers.get('Origin');
  const requestOrigin = new URL(request.url).origin;
  const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean);
  if (origin && (allowedOrigins.length > 0 ? !allowedOrigins.includes(origin) : origin !== requestOrigin)) {
    return jsonResponse(403, { error: 'Origin not allowed' }, headers);
  }
  if (!env.APP_AUDIO) return jsonResponse(503, { error: 'App audio storage is not configured' }, headers);

  const url = new URL(request.url);
  const wantsManifest = url.searchParams.get('manifest') === '1';
  const hash = (url.searchParams.get('hash') || '').trim();
  if (!wantsManifest && !HASH_PATTERN.test(hash)) {
    return jsonResponse(400, { error: 'Provide a valid audio hash' }, headers);
  }

  const key = wantsManifest ? `${AUDIO_PREFIX}/manifest.json` : `${AUDIO_PREFIX}/${hash}.mp3`;
  const object = await env.APP_AUDIO.get(key);
  if (!object) return jsonResponse(404, { error: 'Audio not found' }, headers);

  headers.set('Cache-Control', wantsManifest ? 'public, max-age=300, must-revalidate' : 'public, max-age=31536000, immutable');
  headers.set('Content-Type', object.httpMetadata?.contentType || (wantsManifest ? 'application/json' : 'audio/mpeg'));
  if (object.httpEtag) headers.set('ETag', object.httpEtag);
  if (object.size !== undefined) headers.set('Content-Length', String(object.size));
  return new Response(object.body, { status: 200, headers });
};
