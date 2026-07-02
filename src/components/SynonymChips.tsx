import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function SynonymChips({ words }: { words: string[] }) {
  if (!words.length) return <Text style={styles.empty}>No synonyms available.</Text>;
  return <View style={styles.wrap}>{words.slice(0, 5).map((word, i) => <Text key={word} style={styles.chip}>{word}{i < Math.min(words.length, 5) - 1 ? ' ·' : ''}</Text>)}</View>;
}
const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip: { color: colors.greenDark, fontWeight: '800', fontSize: 14 },
  empty: { color: colors.muted },
});
