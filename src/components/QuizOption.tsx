import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

export function QuizOption({ label, state, onPress }: { label: string; state?: 'correct' | 'wrong'; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return <Pressable onPress={onPress} style={[styles.option, state === 'correct' && styles.correct, state === 'wrong' && styles.wrong]}><Text style={styles.text}>{label}</Text><Text>{state === 'correct' ? '✓' : state === 'wrong' ? '×' : ''}</Text></Pressable>;
}
const createStyles = (colors: AppColors) => StyleSheet.create({ option: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.input, padding: 14, marginBottom: 10 }, text: { flex: 1, color: colors.text, lineHeight: 21 }, correct: { backgroundColor: colors.greenLight, borderColor: colors.success }, wrong: { backgroundColor: colors.card, borderColor: colors.error } });
