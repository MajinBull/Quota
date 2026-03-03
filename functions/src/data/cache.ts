import { loadAllData } from './dataLoader';
import type { AssetData } from '@quota/shared/types';

/**
 * Global cache for historical data
 * Persists between Cloud Function invocations in the same container (warm start)
 */
let globalCache: Map<string, AssetData> | null = null;
let cacheLoadTime: number = 0;

// Cache TTL: 1 hour (data doesn't change frequently)
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Get historical data from cache or load if not available
 * Uses global variable to persist data between function invocations
 */
export function getHistoricalData(): Map<string, AssetData> {
  const now = Date.now();

  // Check if cache exists and is still valid
  if (globalCache && (now - cacheLoadTime) < CACHE_TTL) {
    console.log('Using cached historical data');
    return globalCache;
  }

  // Cache miss or expired - load fresh data
  console.log('Loading fresh historical data (cold start or cache expired)...');
  const startTime = Date.now();

  globalCache = loadAllData();
  cacheLoadTime = now;

  const loadTime = Date.now() - startTime;
  console.log(`Historical data loaded in ${loadTime}ms`);

  return globalCache;
}

/**
 * Force cache refresh (useful for testing or manual updates)
 */
export function refreshCache(): Map<string, AssetData> {
  console.log('Force refreshing cache...');
  globalCache = null;
  return getHistoricalData();
}
