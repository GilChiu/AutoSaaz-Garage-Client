/**
 * Production-grade caching utility with TTL (Time To Live) support
 * 
 * Features:
 * - Dual-layer caching: Memory (fast) + localStorage (persistent)
 * - TTL-based expiration for fresh data
 * - Security: Sensitive data stored in memory only (cleared on logout)
 * - Automatic cleanup of expired entries
 * - Pattern-based cache invalidation
 * 
 * Industry Standards:
 * - Follows HTTP cache-control principles
 * - Memory-first strategy for performance
 * - localStorage fallback for persistence across sessions
 * - Secure handling of authentication data
 */

// Memory cache (fast, cleared on page reload)
const memoryCache = new Map();

// Default TTLs (in seconds) for different data types
const DEFAULT_TTLS = {
  dashboard: 120,        // 2 minutes - frequently changing stats
  bookings: 180,         // 3 minutes - order data
  appointments: 180,     // 3 minutes - appointment data
  inspections: 180,      // 3 minutes - inspection data
  disputes: 180,         // 3 minutes - dispute data
  support: 180,          // 3 minutes - support tickets
  profile: 300,          // 5 minutes - user profile data
  settings: 300,         // 5 minutes - settings data
  details: 600,          // 10 minutes - detail pages (less frequently changing)
  notifications: 60,     // 1 minute - notifications need to be fresh
  chats: 30,             // 30 seconds - chat messages need to be very fresh
};

// Data types that should ONLY be cached in memory (security)
const MEMORY_ONLY_PATTERNS = [
  'token',
  'password',
  'auth',
  'session',
  'credential',
];

/**
 * Check if data should only be stored in memory (not localStorage)
 * @param {string} key - Cache key
 * @returns {boolean}
 */
const isMemoryOnly = (key) => {
  return MEMORY_ONLY_PATTERNS.some(pattern => 
    key.toLowerCase().includes(pattern)
  );
};

/**
 * Get TTL for a specific endpoint
 * @param {string} endpoint - API endpoint
 * @returns {number} TTL in seconds
 */
const getTTL = (endpoint) => {
  if (endpoint.includes('dashboard')) return DEFAULT_TTLS.dashboard;
  if (endpoint.includes('booking')) return DEFAULT_TTLS.bookings;
  if (endpoint.includes('appointment')) return DEFAULT_TTLS.appointments;
  if (endpoint.includes('inspection')) return DEFAULT_TTLS.inspections;
  if (endpoint.includes('dispute')) return DEFAULT_TTLS.disputes;
  if (endpoint.includes('support')) return DEFAULT_TTLS.support;
  if (endpoint.includes('profile')) return DEFAULT_TTLS.profile;
  if (endpoint.includes('settings')) return DEFAULT_TTLS.settings;
  if (endpoint.includes('notification')) return DEFAULT_TTLS.notifications;
  if (endpoint.includes('chat') || endpoint.includes('message')) return DEFAULT_TTLS.chats;
  if (endpoint.includes('detail') || endpoint.includes('/:id')) return DEFAULT_TTLS.details;
  
  return DEFAULT_TTLS.bookings; // Default fallback
};

/**
 * Generate cache key from endpoint and params
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Request parameters
 * @returns {string} Cache key
 */
const generateKey = (endpoint, params = {}) => {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }
  
  // Sort params for consistent keys
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return `${endpoint}?${sortedParams}`;
};

/**
 * Get cached data
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Request parameters
 * @returns {any|null} Cached data or null if not found/expired
 */
const get = (endpoint, params = {}) => {
  const key = generateKey(endpoint, params);
  
  // Check memory cache first (fastest)
  if (memoryCache.has(key)) {
    const { data, expiresAt } = memoryCache.get(key);
    
    if (Date.now() < expiresAt) {
      console.log(`[Cache] Memory hit: ${key}`);
      return data;
    } else {
      // Expired - remove from memory
      memoryCache.delete(key);
      console.log(`[Cache] Memory expired: ${key}`);
    }
  }
  
  // Check localStorage (persistent, slower)
  if (!isMemoryOnly(key)) {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (cached) {
        const { data, expiresAt } = JSON.parse(cached);
        
        if (Date.now() < expiresAt) {
          // Restore to memory cache for faster subsequent access
          memoryCache.set(key, { data, expiresAt });
          console.log(`[Cache] localStorage hit: ${key}`);
          return data;
        } else {
          // Expired - remove from localStorage
          localStorage.removeItem(`cache_${key}`);
          console.log(`[Cache] localStorage expired: ${key}`);
        }
      }
    } catch (error) {
      console.warn(`[Cache] localStorage read error:`, error);
    }
  }
  
  console.log(`[Cache] Miss: ${key}`);
  return null;
};

/**
 * Set cached data
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Request parameters
 * @param {any} data - Data to cache
 * @param {number} customTTL - Optional custom TTL in seconds
 */
const set = (endpoint, params = {}, data, customTTL = null) => {
  const key = generateKey(endpoint, params);
  const ttl = customTTL || getTTL(endpoint);
  const expiresAt = Date.now() + (ttl * 1000);
  
  // Always cache in memory (fast access)
  memoryCache.set(key, { data, expiresAt });
  console.log(`[Cache] Memory set: ${key} TTL: ${ttl}s`);
  
  // Also cache in localStorage (persistent) unless sensitive
  if (!isMemoryOnly(key)) {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({ data, expiresAt }));
      console.log(`[Cache] localStorage set: ${key}`);
    } catch (error) {
      console.warn(`[Cache] localStorage write error:`, error);
      // localStorage might be full or disabled - continue with memory cache only
    }
  }
};

/**
 * Invalidate specific cache entry
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Request parameters
 */
const invalidate = (endpoint, params = {}) => {
  const key = generateKey(endpoint, params);
  
  memoryCache.delete(key);
  try {
    localStorage.removeItem(`cache_${key}`);
    console.log(`[Cache] Invalidated: ${key}`);
  } catch (error) {
    console.warn(`[Cache] Invalidation error:`, error);
  }
};

/**
 * Invalidate all cache entries matching a pattern
 * @param {string} pattern - Pattern to match (e.g., 'bookings', 'appointments')
 */
const invalidatePattern = (pattern) => {
  let count = 0;
  
  // Invalidate memory cache
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
      count++;
    }
  }
  
  // Invalidate localStorage
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_') && key.includes(pattern)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    count += keysToRemove.length;
  } catch (error) {
    console.warn(`[Cache] Pattern invalidation error:`, error);
  }
  
  console.log(`[Cache] Invalidated ${count} entries matching: ${pattern}`);
};

/**
 * Clear all cache (useful on logout)
 */
const clear = () => {
  memoryCache.clear();
  
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`[Cache] Cleared all cache (${keysToRemove.length} entries)`);
  } catch (error) {
    console.warn(`[Cache] Clear error:`, error);
  }
};

/**
 * Cleanup expired entries (run periodically)
 */
const cleanup = () => {
  let count = 0;
  const now = Date.now();
  
  // Cleanup memory cache
  for (const [key, { expiresAt }] of memoryCache.entries()) {
    if (now >= expiresAt) {
      memoryCache.delete(key);
      count++;
    }
  }
  
  // Cleanup localStorage
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        try {
          const { expiresAt } = JSON.parse(localStorage.getItem(key));
          if (now >= expiresAt) {
            keysToRemove.push(key);
          }
        } catch (e) {
          // Invalid cache entry - remove it
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    count += keysToRemove.length;
  } catch (error) {
    console.warn(`[Cache] Cleanup error:`, error);
  }
  
  if (count > 0) {
    console.log(`[Cache] Cleaned up ${count} expired entries`);
  }
};

// Run cleanup every 5 minutes
setInterval(cleanup, 5 * 60 * 1000);

// Export cache API
const cacheApi = {
  get,
  set,
  invalidate,
  invalidatePattern,
  clear,
  cleanup,
};

export default cacheApi;
