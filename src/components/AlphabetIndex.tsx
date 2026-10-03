import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { alphabet } from '../utils/groupWords';

export function AlphabetIndex({ available, onPress }: { available: string[]; onPress: (letter: string) => void }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return <View style={styles.index}>{alphabet.map((l) => <Pressable key={l} accessibilityRole="button" accessibilityLabel={`Jump to ${l}`} accessibilityState={{ disabled: !available.includes(l) }} onPress={() => onPress(l)} disabled={!available.includes(l)}><Text style={[styles.letter, available.includes(l) && styles.available]}>{l}</Text></Pressable>)}</View>;
}
const createStyles = (colors: AppColors) => StyleSheet.create({
  index: { position: 'absolute', right: 9, top: 136, bottom: 58, justifyContent: 'center', borderRadius: 12, paddingHorizontal: 2 },
  letter: { minWidth: 24, minHeight: 24, textAlign: 'center', textAlignVertical: 'center', fontSize: 10, color: colors.text, paddingVertical: 4, fontWeight: '700' },
  available: { color: colors.greenDark, fontWeight: '900' },
});
