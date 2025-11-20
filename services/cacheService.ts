// A simple service to interact with localStorage for caching API responses.

/**
 * Creates a consistent, lowercase, hyphen-separated key for caching.
 * @param parts - The parts of the key (e.g., 'lesson', 'Maths', 'Fractions').
 * @returns A formatted string key.
 */
export const createCacheKey = (...parts: string[]): string => {
  return parts.map(part => part.toLowerCase().replace(/[^a-z0-9]/g, '-')).join('-');
};

/**
 * Retrieves and parses a JSON item from localStorage.
 * @param key - The key to retrieve.
 * @returns The parsed data or null if not found or invalid.
 */
export const getFromCache = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from cache for key "${key}":`, error);
    return null;
  }
};

/**
 * Stringifies and sets an item in localStorage.
 * @param key - The key to set.
 * @param value - The value to store.
 */
export const setInCache = <T>(key: string, value: T): void => {
  try {
    const item = JSON.stringify(value);
    localStorage.setItem(key, item);
  } catch (error) {
    console.error(`Error writing to cache for key "${key}":`, error);
  }
};
