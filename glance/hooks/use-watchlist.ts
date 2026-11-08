import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_WATCHLIST, MAX_WATCHLIST_SIZE } from '@/constants/hush';
import { getStoredWatchlist, setStoredWatchlist } from '@/lib/watchlist-storage';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      const stored = await getStoredWatchlist();
      if (mounted) {
        setWatchlist(stored);
      }
    };

    void hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const addHandle = useCallback((rawHandle: string) => {
    const handle = rawHandle.trim().replace(/^@/, '');

    if (!handle) {
      return;
    }

    setWatchlist((current) => {
      if (current.includes(handle) || current.length >= MAX_WATCHLIST_SIZE) {
        return current;
      }

      const next = [...current, handle];
      void setStoredWatchlist(next);
      return next;
    });
  }, []);

  const removeHandle = useCallback((handle: string) => {
    setWatchlist((current) => {
      const next = current.filter((item) => item !== handle);
      void setStoredWatchlist(next);
      return next.length > 0 ? next : DEFAULT_WATCHLIST;
    });
  }, []);

  const replaceWatchlist = useCallback((handles: string[]) => {
    void setStoredWatchlist(handles);
    setWatchlist(handles);
  }, []);

  const canAddMore = useMemo(() => watchlist.length < MAX_WATCHLIST_SIZE, [watchlist.length]);

  return {
    watchlist,
    canAddMore,
    addHandle,
    removeHandle,
    replaceWatchlist,
  };
}
