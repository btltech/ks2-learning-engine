// API Proxy Service
// Routes API calls through Cloudflare Pages Functions when USE_API_PROXY is enabled
// This keeps API keys server-side and never exposes them to the browser

import { getAuth } from 'firebase/auth';

const USE_API_PROXY = import.meta.env.PROD; // Use proxy in production, direct in dev

// Get the base URL for the API proxy
const getProxyBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
};

interface GeminiRequest {
  model?: string;
  contents: string;
  config?: {
    responseMimeType?: string;
    responseSchema?: any;
  };
}

interface GeminiResponse {
  text: string;
  candidates?: any[];
}

interface TTSRequest {
  input: { text?: string; ssml?: string };
  voice: {
    languageCode: string;
    name?: string;
    ssmlGender?: string;
  };
  audioConfig: {
    audioEncoding: string;
    speakingRate?: number;
    pitch?: number;
    effectsProfileId?: string[];
  };
}

interface TTSResponse {
  audioContent: string;
}

const getFirebaseIdToken = async (): Promise<string> => {
  const user = getAuth().currentUser;
  if (!user) {
    throw new Error('Please sign in to use AI features.');
  }
  return user.getIdToken();
};

/**
 * Call Gemini AI through the proxy
 */
export const callGeminiProxy = async (request: GeminiRequest): Promise<GeminiResponse> => {
  if (!USE_API_PROXY) {
    throw new Error('Proxy not enabled - use direct SDK call');
  }

  const token = await getFirebaseIdToken();
  const response = await fetch(`${getProxyBaseUrl()}/api/gemini`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: request.model || 'gemini-2.5-flash',
      contents: [{ parts: [{ text: request.contents }] }],
      generationConfig: request.config ? {
        responseMimeType: request.config.responseMimeType,
        responseSchema: request.config.responseSchema,
      } : undefined,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Gemini API call failed';
    try {
      const error = await response.json();
      errorMessage = error?.error || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Extract text from Gemini response format
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return { text, candidates: data.candidates };
};

/**
 * Call Google Cloud TTS through the proxy
 */
export const callTTSProxy = async (request: TTSRequest): Promise<TTSResponse> => {
  if (!USE_API_PROXY) {
    throw new Error('Proxy not enabled - use direct API call');
  }

  const token = await getFirebaseIdToken();
  const response = await fetch(`${getProxyBaseUrl()}/api/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorMessage = 'TTS API call failed';
    try {
      const error = await response.json();
      errorMessage = error?.error || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * Check if proxy should be used
 */
export const shouldUseProxy = (): boolean => {
  return USE_API_PROXY;
};

export { USE_API_PROXY };
