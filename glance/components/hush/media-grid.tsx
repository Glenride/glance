import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { FooterDisclaimer } from '@/components/hush/footer-disclaimer';
import type { MediaItem } from '@/types/feed';
import { ThemedText } from '@/components/themed-text';

type MediaGridProps = {
  items: MediaItem[];
  onPressItem: (item: MediaItem) => void;
};

export function MediaGrid({ items, onPressItem }: MediaGridProps) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.columns}
      contentContainerStyle={styles.content}
      ListFooterComponent={<FooterDisclaimer />}
      renderItem={({ item }) => (
        <Pressable style={[styles.tile, item.mediaType === 'photo' ? styles.tallTile : styles.shortTile]} onPress={() => onPressItem(item)}>
          {item.mediaType === 'photo' ? (
            <Image source={{ uri: item.thumbnailUrl ?? item.mediaUrl }} style={styles.image} contentFit="cover" />
          ) : (
            <Video
              source={{ uri: item.mediaUrl }}
              style={styles.image}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isMuted
              isLooping
            />
          )}
          <View style={styles.overlay}>
            <ThemedText style={styles.username}>@{item.sourceUsername}</ThemedText>
            {item.mediaType !== 'photo' ? <ThemedText style={styles.badge}>{item.mediaType}</ThemedText> : null}
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 80,
    gap: 10,
  },
  columns: {
    gap: 10,
  },
  tile: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tallTile: {
    height: 220,
  },
  shortTile: {
    height: 170,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#111',
  },
  overlay: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badge: {
    color: '#ddd',
    fontSize: 10,
    lineHeight: 12,
    textTransform: 'uppercase',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
