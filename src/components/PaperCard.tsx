import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/spacing';

export function PaperCard({ style, ...props }: ViewProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return <View {...props} style={[styles.card, style]} />;
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.cardLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
});
