import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function SearchBar(props: TextInputProps) {
  return <View style={styles.wrap}><Text style={styles.icon}>⌕</Text><TextInput {...props} placeholderTextColor={colors.muted} style={styles.input} returnKeyType="search" /></View>;
}
const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingHorizontal: spacing.md, minHeight: 38 },
  icon: { fontSize: 17, color: colors.text, marginRight: spacing.sm },
  input: { flex: 1, color: colors.text, fontFamily: typography.sans, fontSize: 12, paddingVertical: 0 },
});
