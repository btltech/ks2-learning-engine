import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        strictPort: false,
      },
      build: {
        // Code splitting configuration for better performance
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Core React libraries
              if (id.includes('node_modules/react') || 
                  id.includes('node_modules/react-dom') || 
                  id.includes('node_modules/react-router')) {
                return 'react-vendor';
              }
              // Firebase - split into auth and firestore for smaller initial load
              if (id.includes('node_modules/firebase')) {
                if (id.includes('/auth')) return 'firebase-auth';
                if (id.includes('/firestore')) return 'firebase-firestore';
                return 'firebase-core';
              }
              // Sentry - only loaded if configured
              if (id.includes('node_modules/@sentry')) {
                return 'sentry';
              }
              // AI/ML libraries - only needed for lessons
              if (id.includes('node_modules/@google/genai')) {
                return 'ai-vendor';
              }
              // UI libraries
              if (id.includes('node_modules/@heroicons') || 
                  id.includes('node_modules/lucide-react') ||
                  id.includes('node_modules/canvas-confetti')) {
                return 'ui-vendor';
              }
              // Large data files
              if (id.includes('/data/nationalCurriculum') ||
                  id.includes('/data/questionBank')) {
                return 'curriculum-data';
              }
              // Subject-specific content chunks
              if (id.includes('/data/') && id.includes('Topics')) {
                const match = id.match(/\/data\/(\w+)Topics/);
                if (match) return match[1].toLowerCase();
              }
            },
          },
        },
        // Increase chunk size warning limit since we have large data files
        chunkSizeWarningLimit: 600,
      },
      plugins: [
        react(),
        // Only register the PWA plugin in production builds. During development
        // the service worker would intercept Vite dev client requests and cause
        // precache/no-route issues for dev-only assets (/@vite/client etc). By
        // adding PWA plugin only for production we avoid those errors while
        // keeping PWA for actual builds.
        ...(mode === 'production' ? [VitePWA({
          registerType: 'autoUpdate',
          workbox: {
            skipWaiting: true,
            clientsClaim: true,
            // IMPORTANT: do not precache version.json. The VersionService relies on fetching the
            // latest version from the network to detect updates and clear caches.
            // If version.json is precached, iOS/PWA clients can get stuck on stale bundles.
            globIgnores: ['version.json', '**/version.json'],
            maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // 30 MB
            // Runtime caching for safe resources only
            // NOTE: Google AI and TTS APIs are NOT cached because they contain API keys in URLs
            runtimeCaching: [
              {
                // Always check the network for the latest version.
                urlPattern: ({ url }) => url.pathname === '/version.json',
                handler: 'NetworkOnly',
              },
              {
                // Cache Firebase Firestore data (uses auth tokens, not URL keys)
                urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'firestore-cache',
                  expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 60 * 60 * 24, // 1 day
                  },
                  networkTimeoutSeconds: 10,
                },
              },
              {
                // Cache static assets from CDNs
                urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 20,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                  },
                },
              },
            ],
          },
          manifest: {
            name: 'KS2 Learning Engine',
            short_name: 'KS2 Learn',
            description: 'AI-powered learning companion for KS2 students',
            theme_color: '#3b82f6',
            background_color: '#ffffff',
            display: 'standalone',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        })] : []),
      ],
      define: {},
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '/@modules/onnxruntime-web': path.resolve(__dirname, 'node_modules/onnxruntime-web'),
        }
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './test/setup.ts',
      }
    };
});
