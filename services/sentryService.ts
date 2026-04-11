// Sentry Error Tracking Configuration
// Captures runtime errors and sends them to Sentry dashboard

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
    
    // Sample rate for performance monitoring (0 = disabled, 1 = 100%)
    tracesSampleRate: 0.1, // Capture 10% of transactions for performance
    
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
      
      return event;
    },
    
    // Set user context when available
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Mask all text for privacy (good for educational apps)
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Capture 1% of all sessions for replay
    replaysSessionSampleRate: 0.01,
    // Capture 100% of sessions with errors
    replaysOnErrorSampleRate: 1.0,
  });
};

// Set user context for error tracking
export const setSentryUser = (userId: string | null, role?: string) => {
  if (userId) {
    Sentry.setUser({ 
      id: userId,
      role: role || 'unknown',
    });
  } else {
    Sentry.setUser(null);
  }
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
