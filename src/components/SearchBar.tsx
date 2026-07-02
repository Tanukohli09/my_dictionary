import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function SearchBar(props: TextInputProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return <View style={styles.wrap}><Text style={styles.icon}>⌕</Text><TextInput {...props} placeholderTextColor={colors.muted} style={styles.input} returnKeyType="search" /></View>;
}
const createStyles = (colors: AppColors) => StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingHorizontal: spacing.md, minHeight: 38 },
  icon: { fontSize: 17, color: colors.text, marginRight: spacing.sm },
  input: { flex: 1, color: colors.text, fontFamily: typography.sans, fontSize: 12, paddingVertical: 0 },
});
