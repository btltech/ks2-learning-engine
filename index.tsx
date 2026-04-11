import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import './tailwind.css';
import App from './App';
import { UserProvider } from './context/UserContext';
import { UISettingsProvider } from './context/UISettingsContext';
import ErrorBoundary from './components/ErrorBoundary';
import { initSentry } from './services/sentryService';
import { versionService } from './services/versionService';

// Initialize Sentry error tracking
initSentry();

// Initialize version service for automatic cache management
versionService.initialize().catch(err => {
  console.error('[Version] Failed to initialize:', err);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// In dev, make sure any previously installed service workers from a production
// build are unregistered so they don't intercept Vite's dev assets.
if (import.meta.env.DEV && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
  if (typeof window !== 'undefined' && window.caches) {
    caches.keys().then(keys => keys.forEach(key => {
      // Clear any old precache caches for localhost to avoid stale routes
      caches.delete(key);
    }));
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <ErrorBoundary>
        <BrowserRouter>
          <UserProvider>
            <UISettingsProvider>
              <App />
            </UISettingsProvider>
          </UserProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);

// Error fallback component for Sentry
function ErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 to-purple-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h1>
        <p className="text-gray-600 mb-6">
          We've been notified and are working on a fix. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}
