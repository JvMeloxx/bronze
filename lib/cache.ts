/**
 * SunSync Local Cache Utility
 * Provides localStorage caching with TTL (Time-To-Live) support
 */

const CACHE_PREFIX = 'sunsync_cache_';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

/**
 * Get cached data if it exists and hasn't expired
 * @param key Cache key
 * @returns Cached data or null if expired/not found
 */
export function getCache<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(CACHE_PREFIX + key);
        if (!stored) return null;

        const entry: CacheEntry<T> = JSON.parse(stored);
        const now = Date.now();

        // Check if cache has expired
        if (now - entry.timestamp > entry.ttl) {
            localStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }

        return entry.data;
    } catch (error) {
        console.warn('[Cache] Error reading cache:', error);
        return null;
    }
}

/**
 * Store data in cache with TTL
 * @param key Cache key
 * @param data Data to cache
 * @param ttlMs Time-To-Live in milliseconds (default: 5 minutes)
 */
export function setCache<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    if (typeof window === 'undefined') return;

    try {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl: ttlMs,
        };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
        console.warn('[Cache] Error writing cache:', error);
    }
}

/**
 * Remove a specific cache entry
 * @param key Cache key to remove
 */
export function removeCache(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CACHE_PREFIX + key);
}

/**
 * Clear all SunSync cache entries
 */
export function clearAllCache(): void {
    if (typeof window === 'undefined') return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_PREFIX)) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
}

// Cache keys constants
export const CACHE_KEYS = {
    SERVICOS: 'servicos',
    STUDIO_CONFIG: 'studio_config',
    CLIENTES: 'clientes',
} as const;

// Default TTL values
export const CACHE_TTL = {
    SHORT: 2 * 60 * 1000,      // 2 minutes
    MEDIUM: 5 * 60 * 1000,     // 5 minutes  
    LONG: 15 * 60 * 1000,      // 15 minutes
    VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const;
