type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const feedCache = new Map<string, CacheEntry<unknown>>();

export function getCacheValue<T>(key: string): T | null {
  const entry = feedCache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    feedCache.delete(key);
    return null;
  }

  return entry.value as T;
}

export function setCacheValue<T>(key: string, value: T, ttlMs: number): void {
  feedCache.set(key, {
    expiresAt: Date.now() + ttlMs,
    value,
  });
}
