import { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { Lightbox } from '@/components/hush/lightbox';
import { MediaGrid } from '@/components/hush/media-grid';
import { WatchlistBar } from '@/components/hush/watchlist-bar';
import { ThemedText } from '@/components/themed-text';
import { useWatchlist } from '@/hooks/use-watchlist';
import { loadFeed } from '@/lib/feed';
import type { MediaItem } from '@/types/feed';

export default function HomeScreen() {
  const { watchlist, canAddMore, addHandle, removeHandle } = useWatchlist();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [loadTimeMs, setLoadTimeMs] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [cached, setCached] = useState(false);

  const refreshFeed = useCallback(
    async (forceRefresh = false) => {
      setRefreshing(true);
      setError(null);

      try {
        const result = await loadFeed(watchlist, forceRefresh);
        setItems(result.items);
        setLoadTimeMs(result.metrics.loadTimeMs);
        setSuccessRate(result.metrics.successRate);
        setCached(result.metrics.fromCache);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feed.');
      } finally {
        setRefreshing(false);
      }
    },
    [watchlist],
  );

  useEffect(() => {
    void refreshFeed();
  }, [refreshFeed]);

  const statusLine = useMemo(() => {
    const rate = `${Math.round(successRate * 100)}%`;
    const source = cached ? 'cache' : 'network';
    return `${items.length} items • ${loadTimeMs}ms • success ${rate} • ${source}`;
  }, [cached, items.length, loadTimeMs, successRate]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Hush
        </ThemedText>
        <ThemedText style={styles.subtitle}>A zen, media-first social viewer.</ThemedText>
      </View>

      <WatchlistBar
        handles={watchlist}
        canAddMore={canAddMore}
        onAddHandle={addHandle}
        onRemoveHandle={removeHandle}
        onRefresh={() => void refreshFeed(true)}
        refreshing={refreshing}
      />

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      <ThemedText style={styles.status}>{statusLine}</ThemedText>

      <MediaGrid
        items={items}
        onPressItem={(item) => {
          const index = items.findIndex((candidate) => candidate.id === item.id);
          setSelectedIndex(index);
          setLightboxVisible(true);
        }}
      />

      <Lightbox
        items={items}
        selectedIndex={selectedIndex}
        visible={lightboxVisible}
        onClose={() => setLightboxVisible(false)}
        onIndexChange={setSelectedIndex}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 12,
  },
  header: {
    gap: 4,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 38,
    lineHeight: 40,
  },
  subtitle: {
    color: '#9a9a9a',
  },
  error: {
    color: '#ff8e8e',
    fontSize: 13,
    lineHeight: 16,
    marginTop: 8,
  },
  status: {
    color: '#7d7d7d',
    fontSize: 12,
    lineHeight: 14,
    marginVertical: 10,
  },
});
