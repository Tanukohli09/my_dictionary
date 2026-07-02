import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { alphabet } from '../utils/groupWords';

export function AlphabetIndex({ available, onPress }: { available: string[]; onPress: (letter: string) => void }) {
  return <View style={styles.index}>{alphabet.map((l) => <Pressable key={l} onPress={() => onPress(l)} disabled={!available.includes(l)}><Text style={[styles.letter, available.includes(l) && styles.available]}>{l}</Text></Pressable>)}</View>;
}
const styles = StyleSheet.create({
  index: { position: 'absolute', right: 9, top: 136, bottom: 58, justifyContent: 'center', borderRadius: 12, paddingHorizontal: 2 },
  letter: { fontSize: 10, color: colors.text, paddingVertical: 1.2, fontWeight: '700' },
  available: { color: colors.greenDark, fontWeight: '900' },
});
