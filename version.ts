/**
 * App Version Management
 * Update this version number whenever you deploy changes.
 * This will trigger automatic cache clearing on user devices.
 */

export const APP_VERSION = '1.4.2'; // Increment this on each deployment
export const BUILD_DATE = new Date().toISOString();

// Version check interval (check every 5 minutes)
export const VERSION_CHECK_INTERVAL = 5 * 60 * 1000;

// Cache version key for localStorage
export const CACHE_VERSION_KEY = 'ks2_app_version';
