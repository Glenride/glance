import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export function FooterDisclaimer() {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.text}>
        Hush is a viewer for public social media content. All rights belong to the original creators.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  text: {
    color: '#666',
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
});
