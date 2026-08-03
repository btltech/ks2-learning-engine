// Cloudflare Pages Function - Gemini AI Proxy
// Keeps API key server-side, never exposed to browser

import { createRemoteJWKSet, jwtVerify } from 'jose';

// Type definition for Cloudflare Pages Functions
type PagesFunction<E = unknown> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
  waitUntil: (promise: Promise<unknown>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
}) => Response | Promise<Response>;

interface Env {
  VITE_GEMINI_API_KEY: string;
  FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  ALLOWED_ORIGINS?: string; // comma-separated
  /** Optional Cloudflare KV namespace binding for persistent rate limiting.
   *  When bound, rate limit state survives cold starts. Falls back to in-memory. */
  RATE_LIMIT_KV?: KVNamespace;
}

// In-memory fallback (resets on cold start — used when KV is not bound)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUEST_BYTES = 70_000;
const MAX_PROMPT_CHARS = 30_000;
const MAX_SCHEMA_CHARS = 20_000;
const MAX_RESPONSE_BYTES = 2_000_000;

const ALLOWED_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
]);

const jwks = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export function buildProviderPayload(prompt: string, clientConfig: Record<string, unknown> = {}) {
  const responseMimeType = clientConfig.responseMimeType === 'application/json' ? 'application/json' : undefined;
  const responseSchema = responseMimeType && clientConfig.responseSchema && typeof clientConfig.responseSchema === 'object'
    && JSON.stringify(clientConfig.responseSchema).length <= MAX_SCHEMA_CHARS
    ? clientConfig.responseSchema
    : undefined;

  return {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 8192,
      ...(responseMimeType ? { responseMimeType } : {}),
      ...(responseSchema ? { responseSchema } : {}),
    },
    // Server-owned safety policy: callers cannot weaken or replace this list.
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };
}

/** Rate-limit key via KV (persistent across cold starts). */
async function checkRateLimitKV(kv: KVNamespace, key: string): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const stored = await kv.get(key, 'json') as { count: number; resetTime: number } | null;
  if (!stored || now > stored.resetTime) {
    await kv.put(key, JSON.stringify({ count: 1, resetTime: now + RATE_WINDOW }), { expirationTtl: 120 });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  if (stored.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  const updated = { count: stored.count + 1, resetTime: stored.resetTime };
  await kv.put(key, JSON.stringify(updated), { expirationTtl: 120 });
  return { allowed: true, remaining: RATE_LIMIT - updated.count };
}

/** Rate-limit key via in-memory Map (resets on cold start). */
function checkRateLimitMemory(key: string): { allowed: boolean; remaining: number } {
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

async function checkRateLimit(env: Env, key: string): Promise<{ allowed: boolean; remaining: number }> {
  if (env.RATE_LIMIT_KV) {
    try {
      return await checkRateLimitKV(env.RATE_LIMIT_KV, key);
    } catch {
      // KV error — fall through to in-memory
    }
  }
  return checkRateLimitMemory(key);
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const requestId = crypto.randomUUID();
  
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

  const isOriginAllowed =
    // If explicitly configured, only allow those origins
    (allowedOrigins.length > 0 ? Boolean(origin && allowedOrigins.includes(origin)) : Boolean(origin && requestOrigin && origin === requestOrigin));

  // CORS headers (for browser requests). We require an allowed Origin for POST/OPTIONS.
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin && isOriginAllowed ? origin : 'null',
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    if (!isOriginAllowed) {
      return new Response(null, { status: 403, headers: corsHeaders });
    }
    return new Response(null, { headers: corsHeaders });
  }

  if (!isOriginAllowed) {
    return new Response(
      JSON.stringify({ error: 'Origin not allowed' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const projectId = env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId) {
    return new Response(
      JSON.stringify({ error: 'Firebase project ID not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Require Firebase ID token (prevents anonymous quota abuse and lets us rate limit by uid).
  const authHeader = request.headers.get('Authorization') || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return new Response(
      JSON.stringify({ error: 'Missing Authorization Bearer token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let uid = 'unknown';
  try {
    const { payload } = await jwtVerify(match[1], jwks, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    uid = typeof payload.sub === 'string' && payload.sub ? payload.sub : 'unknown';
    const provider = (payload as any)?.firebase?.sign_in_provider;
    if (provider === 'anonymous') {
      return new Response(
        JSON.stringify({ error: 'Anonymous auth not allowed' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || 'Invalid token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Rate limiting (KV-backed when bound, in-memory fallback)
  const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  const rateCheck = await checkRateLimit(env, `${uid}:${clientIP}`);
  
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0'
        } 
      }
    );
  }

  try {
    const declaredLength = Number(request.headers.get('Content-Length') || '0');
    if (declaredLength > MAX_REQUEST_BYTES) {
      return new Response(JSON.stringify({ error: 'Request too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_REQUEST_BYTES) {
      return new Response(JSON.stringify({ error: 'Request too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { model, contents, generationConfig } = body;

    if (!env.VITE_GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const selectedModel = typeof model === 'string' && model.trim() ? model.trim() : 'gemini-2.5-flash';
    if (!ALLOWED_MODELS.has(selectedModel)) {
      return new Response(
        JSON.stringify({ error: `Model not allowed: ${selectedModel}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic payload validation/limits
    if (!Array.isArray(contents) || contents.length !== 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid contents' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const content = contents[0] as { parts?: unknown } | null;
    const parts = content && Array.isArray(content.parts) ? content.parts : [];
    const prompt = parts.length === 1 && typeof (parts[0] as { text?: unknown })?.text === 'string'
      ? (parts[0] as { text: string }).text
      : '';
    if (!prompt || prompt.length > MAX_PROMPT_CHARS) {
      return new Response(
        JSON.stringify({ error: 'Contents must contain one bounded text prompt' }),
        { status: prompt ? 413 : 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientConfig = generationConfig && typeof generationConfig === 'object'
      ? generationConfig as Record<string, unknown>
      : {};

    // Forward to Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${env.VITE_GEMINI_API_KEY}`;
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildProviderPayload(prompt, clientConfig)),
    });

    const responseText = await geminiResponse.text();
    if (responseText.length > MAX_RESPONSE_BYTES) {
      console.error(JSON.stringify({ event: 'gemini_response_too_large', requestId, uid, status: geminiResponse.status }));
      return new Response(JSON.stringify({ error: 'AI response exceeded the safe size limit' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let data: unknown;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: 'AI provider returned an invalid response' };
    }
    console.log(JSON.stringify({ event: 'gemini_request_complete', requestId, uid, model: selectedModel, status: geminiResponse.status }));
    
    return new Response(JSON.stringify(data), {
      status: geminiResponse.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error(JSON.stringify({ event: 'gemini_request_failed', requestId, message: error instanceof Error ? error.message : 'Unknown error' }));
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Request failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

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

  const isOriginAllowed =
    (allowedOrigins.length > 0 ? Boolean(origin && allowedOrigins.includes(origin)) : Boolean(origin && requestOrigin && origin === requestOrigin));

  const corsHeaders = {
    'Access-Control-Allow-Origin': origin && isOriginAllowed ? origin : 'null',
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  return new Response(null, { status: isOriginAllowed ? 204 : 403, headers: corsHeaders });
};
