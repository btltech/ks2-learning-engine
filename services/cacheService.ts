// A service for caching API responses with TTL support and storage optimization.

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  version?: string;
}

// Cache version for invalidating old caches on app updates
const CACHE_VERSION = '1.0.0';

// Default TTL values
const TTL = {
  QUIZ: 7 * 24 * 60 * 60 * 1000, // 7 days for quiz questions
  LESSON: 14 * 24 * 60 * 60 * 1000, // 14 days for lessons
  TOPICS: 30 * 24 * 60 * 60 * 1000, // 30 days for topic lists
  EXPLANATION: 7 * 24 * 60 * 60 * 1000, // 7 days for explanations
  SHORT: 60 * 60 * 1000, // 1 hour for temporary data
};

/**
 * Creates a consistent, lowercase, hyphen-separated key for caching.
 * @param parts - The parts of the key (e.g., 'lesson', 'Maths', 'Fractions').
 * @returns A formatted string key.
 */
export const createCacheKey = (...parts: string[]): string => {
  return parts.map(part => part.toLowerCase().replace(/[^a-z0-9]/g, '-')).join('-');
};

/**
 * Retrieves and parses a JSON item from localStorage with TTL check.
 * @param key - The key to retrieve.
 * @returns The parsed data or null if not found, expired, or invalid.
 */
export const getFromCache = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const entry = JSON.parse(item) as CacheEntry<T>;
    
    // Check if entry has the new format with TTL
    if (entry.timestamp && entry.ttl) {
      const isExpired = Date.now() - entry.timestamp > entry.ttl;
      const isOldVersion = entry.version && entry.version !== CACHE_VERSION;
      
      if (isExpired || isOldVersion) {
        localStorage.removeItem(key);
        return null;
      }
      
      return entry.data;
    }
    
    // Legacy format - return as is
    return entry as unknown as T;
  } catch (error) {
    console.error(`Error reading from cache for key "${key}":`, error);
    return null;
  }
};

/**
 * Stringifies and sets an item in localStorage with TTL.
 * @param key - The key to set.
 * @param value - The value to store.
 * @param ttl - Time to live in milliseconds (defaults to 7 days).
 */
export const setInCache = <T>(key: string, value: T, ttl: number = TTL.QUIZ): void => {
  try {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
      version: CACHE_VERSION,
    };
    const item = JSON.stringify(entry);
    localStorage.setItem(key, item);
  } catch (error) {
    // Handle quota exceeded errors
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('Cache storage full, clearing old entries...');
      clearOldCacheEntries();
      // Retry once
      try {
        const entry: CacheEntry<T> = {
          data: value,
          timestamp: Date.now(),
          ttl,
          version: CACHE_VERSION,
        };
        localStorage.setItem(key, JSON.stringify(entry));
      } catch {
        console.error('Cache write failed after cleanup');
      }
    } else {
      console.error(`Error writing to cache for key "${key}":`, error);
    }
  }
};

/**
 * Clear expired and old cache entries to free up space
 */
export const clearOldCacheEntries = (): void => {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    // Only process cache keys (not user settings etc.)
    if (!key.startsWith('ks2_') && !key.includes('-quiz-') && !key.includes('-lesson-') && !key.includes('-topics-')) {
      continue;
    }
    
    try {
      const item = localStorage.getItem(key);
      if (!item) continue;
      
      const entry = JSON.parse(item);
      
      // Check if expired
      if (entry.timestamp && entry.ttl) {
        const isExpired = Date.now() - entry.timestamp > entry.ttl;
        if (isExpired) {
          keysToRemove.push(key);
        }
      }
    } catch {
      // Invalid JSON, mark for removal
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`Cleared ${keysToRemove.length} old cache entries`);
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): { totalEntries: number; totalSize: number; oldestEntry: number } => {
  let totalEntries = 0;
  let totalSize = 0;
  let oldestEntry = Date.now();
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    const item = localStorage.getItem(key);
    if (!item) continue;
    
    totalSize += item.length * 2; // Approximate bytes (UTF-16)
    totalEntries++;
    
    try {
      const entry = JSON.parse(item);
      if (entry.timestamp && entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
    } catch {
      // Ignore
    }
  }
  
  return { totalEntries, totalSize, oldestEntry };
};

// Export TTL constants for use in other services
export { TTL };
