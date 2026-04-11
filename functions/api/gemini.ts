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
}

// Simple in-memory rate limiter (resets on cold start, but provides basic protection)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per window (per uid+ip)
const RATE_WINDOW = 60 * 1000; // 1 minute window

const ALLOWED_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
]);

const jwks = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
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

  // Rate limiting
  const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  const rateCheck = checkRateLimit(`${uid}:${clientIP}`);
  
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
    const body = await request.json();
    const { model, contents, generationConfig, safetySettings } = body as any;

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
    if (!Array.isArray(contents) || contents.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid contents' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const totalText = JSON.stringify(contents);
    if (totalText.length > 60_000) {
      return new Response(
        JSON.stringify({ error: 'Request too large' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Forward to Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${env.VITE_GEMINI_API_KEY}`;
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig,
        safetySettings,
      }),
    });

    const data = await geminiResponse.json();
    
    return new Response(JSON.stringify(data), {
      status: geminiResponse.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
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
