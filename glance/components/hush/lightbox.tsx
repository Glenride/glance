import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useEffect, useMemo, useRef } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import type { MediaItem } from '@/types/feed';
import { ThemedText } from '@/components/themed-text';

type LightboxProps = {
  items: MediaItem[];
  selectedIndex: number;
  visible: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export function Lightbox({ items, selectedIndex, visible, onClose, onIndexChange }: LightboxProps) {
  const scrollRef = useRef<ScrollView>(null);
  const width = Dimensions.get('window').width;

  const safeIndex = useMemo(() => {
    if (selectedIndex < 0) {
      return 0;
    }

    if (selectedIndex >= items.length) {
      return Math.max(items.length - 1, 0);
    }

    return selectedIndex;
  }, [items.length, selectedIndex]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    scrollRef.current?.scrollTo({ x: safeIndex * width, animated: false });
  }, [safeIndex, visible, width]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'web') {
      return;
    }

    const listener = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        onIndexChange(Math.max(0, safeIndex - 1));
      }

      if (event.key === 'ArrowRight') {
        onIndexChange(Math.min(items.length - 1, safeIndex + 1));
      }

      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [items.length, onClose, onIndexChange, safeIndex, visible]);

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} transparent>
      <View style={styles.root}>
        <Pressable style={styles.closeHit} onPress={onClose} />
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const next = Math.round(event.nativeEvent.contentOffset.x / width);
            onIndexChange(next);
          }}>
          {items.map((item) => (
            <View key={item.id} style={[styles.slide, { width }]}> 
              <Image source={{ uri: item.mediaUrl }} style={styles.image} contentFit="contain" />
            </View>
          ))}
        </ScrollView>

        <View style={styles.meta}>
          <ThemedText style={styles.metaText}>@{items[safeIndex]?.sourceUsername}</ThemedText>
          <Pressable onPress={() => Linking.openURL(items[safeIndex]?.originalPostUrl ?? '')}>
            <ThemedText style={styles.link}>View on X</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    justifyContent: 'center',
  },
  closeHit: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  image: {
    width: '100%',
    height: '75%',
  },
  meta: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 34,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    color: '#fff',
    fontSize: 14,
  },
  link: {
    color: '#8ab4ff',
    fontSize: 14,
    lineHeight: 18,
  },
});
