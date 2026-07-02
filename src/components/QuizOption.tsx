import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

export function QuizOption({ label, state, onPress }: { label: string; state?: 'correct' | 'wrong'; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.option, state === 'correct' && styles.correct, state === 'wrong' && styles.wrong]}><Text style={styles.text}>{label}</Text><Text>{state === 'correct' ? '✓' : state === 'wrong' ? '×' : ''}</Text></Pressable>;
}
const styles = StyleSheet.create({ option: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.input, padding: 14, marginBottom: 10 }, text: { flex: 1, color: colors.text, lineHeight: 21 }, correct: { backgroundColor: colors.greenLight, borderColor: colors.success }, wrong: { backgroundColor: '#FFF1ED', borderColor: colors.error } });
