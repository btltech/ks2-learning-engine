import { db, doc, getDoc, setDoc } from './firebase';

const CACHE_COLLECTION = 'content_cache';
// Default version — callers should pass the model name so stale content is
// automatically invalidated whenever the AI model is upgraded.
const CACHE_VERSION = '1.0.0';

// TTL in milliseconds (e.g., 30 days for shared content)
const SHARED_TTL = 30 * 24 * 60 * 60 * 1000;

interface SharedCacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

/**
 * Retrieves data from the shared Firestore cache.
 * @param key - The unique cache key.
 * @param version - Cache version; pass the AI model name so a model upgrade busts stale content.
 * @returns The cached data or null if not found/expired/version mismatch.
 */
export const getFromSharedCache = async <T>(key: string, version = CACHE_VERSION): Promise<T | null> => {
  try {
    // Sanitize key for Firestore document ID (alphanumeric + hyphens only)
    const docId = key.replace(/[^a-zA-Z0-9-]/g, '_');
    const docRef = doc(db, CACHE_COLLECTION, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const entry = docSnap.data() as SharedCacheEntry<T>;
      
      // Check TTL
      if (Date.now() - entry.timestamp > SHARED_TTL) {
        return null;
      }

      // Check Version — if the model has changed, cached content is stale
      if (entry.version !== version) {
        return null;
      }

      console.log(`🔥 Shared cache HIT for: ${key}`);
      return entry.data;
    }
  } catch (error) {
    console.warn(`Error reading shared cache for ${key}:`, error);
  }
  
  return null;
};

/**
 * Saves data to the shared Firestore cache.
 * @param key - The unique cache key.
 * @param data - The data to cache.
 * @param version - Cache version; pass the AI model name to tie cache entries to a specific model.
 */
export const setInSharedCache = async <T>(key: string, data: T, version = CACHE_VERSION): Promise<void> => {
  try {
    const docId = key.replace(/[^a-zA-Z0-9-]/g, '_');
    const docRef = doc(db, CACHE_COLLECTION, docId);
    
    const entry: SharedCacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version,
    };

    await setDoc(docRef, entry);
    console.log(`💾 Saved to shared cache: ${key}`);
  } catch (error) {
    console.warn(`Error writing shared cache for ${key}:`, error);
  }
};
