import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { MAX_WATCHLIST_SIZE } from '@/constants/hush';
import { ThemedText } from '@/components/themed-text';

type WatchlistBarProps = {
  handles: string[];
  canAddMore: boolean;
  onAddHandle: (value: string) => void;
  onRemoveHandle: (value: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
};

export function WatchlistBar({
  handles,
  canAddMore,
  onAddHandle,
  onRemoveHandle,
  onRefresh,
  refreshing,
}: WatchlistBarProps) {
  const [input, setInput] = useState('');

  const submit = () => {
    onAddHandle(input);
    setInput('');
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={submit}
          placeholder="Add @handle"
          placeholderTextColor="#777"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          editable={canAddMore}
        />
        <Pressable onPress={submit} disabled={!canAddMore || input.trim().length === 0} style={styles.addButton}>
          <ThemedText style={styles.buttonText}>Add</ThemedText>
        </Pressable>
        <Pressable onPress={onRefresh} disabled={refreshing} style={styles.refreshButton}>
          <ThemedText style={styles.buttonText}>{refreshing ? '...' : 'Refresh'}</ThemedText>
        </Pressable>
      </View>

      <View style={styles.chips}>
        {handles.map((handle) => (
          <Pressable key={handle} style={styles.chip} onPress={() => onRemoveHandle(handle)}>
            <ThemedText style={styles.chipText}>@{handle} ×</ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText style={styles.hint}>
        Watchlist up to {MAX_WATCHLIST_SIZE}. Tap a handle chip to remove.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    backgroundColor: '#0b0b0b',
  },
  addButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#1e1e1e',
  },
  refreshButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#2c2c2c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 18,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#2f2f2f',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    color: '#ddd',
    fontSize: 13,
    lineHeight: 16,
  },
  hint: {
    color: '#888',
    fontSize: 12,
    lineHeight: 15,
  },
});
