import { DEFAULT_WATCHLIST, MAX_WATCHLIST_SIZE } from '@/constants/hush';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const WATCHLIST_KEY = 'hush.watchlist.v1';

function sanitizeHandles(handles: string[]): string[] {
  return Array.from(
    new Set(
      handles
        .map((handle) => handle.trim().replace(/^@/, ''))
        .filter(Boolean)
        .slice(0, MAX_WATCHLIST_SIZE),
    ),
  );
}

export async function getStoredWatchlist(): Promise<string[]> {
  if (Platform.OS === 'web' && globalThis.localStorage) {
    try {
      const raw = globalThis.localStorage.getItem(WATCHLIST_KEY);
      if (!raw) {
        return DEFAULT_WATCHLIST;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return DEFAULT_WATCHLIST;
      }

      const sanitized = sanitizeHandles(parsed);
      return sanitized.length > 0 ? sanitized : DEFAULT_WATCHLIST;
    } catch {
      return DEFAULT_WATCHLIST;
    }
  }

  try {
    const raw = await AsyncStorage.getItem(WATCHLIST_KEY);
    if (!raw) {
      return DEFAULT_WATCHLIST;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return DEFAULT_WATCHLIST;
    }

    const sanitized = sanitizeHandles(parsed);
    return sanitized.length > 0 ? sanitized : DEFAULT_WATCHLIST;
  } catch {
    return DEFAULT_WATCHLIST;
  }
}

export async function setStoredWatchlist(handles: string[]): Promise<string[]> {
  const sanitized = sanitizeHandles(handles);

  if (Platform.OS === 'web' && globalThis.localStorage) {
    globalThis.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(sanitized));
    return sanitized;
  }

  await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(sanitized));
  return sanitized;
}
