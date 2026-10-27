// Sentry Error Tracking Configuration
// Captures privacy-minimised runtime errors when a production DSN is configured.

import * as Sentry from '@sentry/react';

// Only initialize in production
export const initSentry = () => {
  // Check for Sentry DSN in environment variables
  const dsn = (import.meta as any).env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.log('Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: (import.meta as any).env.MODE || 'development',
    
    // Only send errors in production
    enabled: (import.meta as any).env.PROD,
    sendDefaultPii: false,
    
    // Sample rate for performance monitoring (0 = disabled, 1 = 100%)
    tracesSampleRate: 0,
    
    // Filter out known non-critical errors
    beforeSend(event) {
      // Ignore network errors from offline users
      if (event.exception?.values?.[0]?.type === 'TypeError' &&
          event.exception?.values?.[0]?.value?.includes('Failed to fetch')) {
        return null;
      }
      
      // Ignore extension errors
      if (event.exception?.values?.[0]?.value?.includes('chrome-extension://')) {
        return null;
      }
      
      // Never attach an authenticated learner identifier, cookies, auth headers,
      // form bodies or session-replay material to an error report.
      delete event.user;
      if (event.request) {
        delete event.request.cookies;
        delete event.request.data;
        if (event.request.headers) {
          delete event.request.headers.Authorization;
          delete event.request.headers.authorization;
          delete event.request.headers.Cookie;
          delete event.request.headers.cookie;
        }
      }
      return event;
    },
  });
};

// Retain only a broad role tag; never send a learner or account identifier.
export const setSentryUser = (_userId: string | null, role?: string) => {
  Sentry.setUser(null);
  Sentry.setTag('user_role', role || 'signed_out');
};

// Capture custom errors
export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Capture custom messages
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  Sentry.captureMessage(message, level);
};

export default Sentry;
