// Cloudflare Pages Function - reviewed Yoruba audio delivery.
// The R2 bucket stays private; only known audio objects are served.

type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<unknown>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
}) => Response | Promise<Response>;

interface Env {
  YORUBA_AUDIO?: R2Bucket;
  ALLOWED_ORIGINS?: string;
}

const AUDIO_PREFIX = 'audio/yoruba/curated-450-v1';
const HASH_PATTERN = /^[a-f0-9]{32}$/i;

function corsHeaders(request: Request, env: Env): Headers {
  const origin = request.headers.get('Origin');
  const requestOrigin = new URL(request.url).origin;
  const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean);
  const allowed = !origin || (allowedOrigins.length > 0 ? allowedOrigins.includes(origin) : origin === requestOrigin);
  const headers = new Headers({ 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' });
  if (origin && allowed) headers.set('Access-Control-Allow-Origin', origin);
  return headers;
}

function jsonResponse(status: number, body: Record<string, unknown>, headers: Headers): Response {
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(body), { status, headers });
}

export const onRequestOptions: PagesFunction<Env> = async (context) => new Response(null, { status: 204, headers: corsHeaders(context.request, context.env) });

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const headers = corsHeaders(request, env);
  const origin = request.headers.get('Origin');
  const requestOrigin = new URL(request.url).origin;
  const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean);
  if (origin && (allowedOrigins.length > 0 ? !allowedOrigins.includes(origin) : origin !== requestOrigin)) {
    return jsonResponse(403, { error: 'Origin not allowed' }, headers);
  }
  if (!env.YORUBA_AUDIO) return jsonResponse(503, { error: 'Yoruba audio storage is not configured' }, headers);

  const url = new URL(request.url);
  const wantsManifest = url.searchParams.get('manifest') === '1';
  const hash = (url.searchParams.get('hash') || '').trim();
  if (!wantsManifest && !HASH_PATTERN.test(hash)) return jsonResponse(400, { error: 'Provide a valid audio hash' }, headers);

  const key = wantsManifest ? `${AUDIO_PREFIX}/manifest.json` : `${AUDIO_PREFIX}/${hash}.mp3`;
  const object = await env.YORUBA_AUDIO.get(key);
  if (!object) return jsonResponse(404, { error: 'Audio not found' }, headers);

  headers.set('Cache-Control', wantsManifest ? 'public, max-age=60, must-revalidate' : 'public, max-age=31536000, immutable');
  headers.set('Content-Type', object.httpMetadata?.contentType || (wantsManifest ? 'application/json' : 'audio/mpeg'));
  if (object.httpEtag) headers.set('ETag', object.httpEtag);
  if (object.size !== undefined) headers.set('Content-Length', String(object.size));
  return new Response(object.body, { status: 200, headers });
};
