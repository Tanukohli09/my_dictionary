import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WordEntry } from '../models/WordEntry';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { WordCard } from './WordCard';

export function DictionarySection({ letter, words, onWordPress }: { letter: string; words: WordEntry[]; onWordPress: (w: WordEntry) => void }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return <View><Text style={styles.letter}>{letter}</Text><View style={styles.group}>{words.map((w) => <WordCard key={w.id} word={w} onPress={() => onWordPress(w)} />)}</View></View>;
}
const createStyles = (colors: AppColors) => StyleSheet.create({
  letter: { fontFamily: typography.serif, color: colors.text, fontSize: 25, fontWeight: '900', marginTop: 16, marginBottom: 7 },
  group: { borderWidth: 1, borderColor: colors.border, borderRadius: 9, overflow: 'hidden', backgroundColor: colors.cardLight },
});
