import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function PrimaryButton({ title, onPress, variant = 'primary', disabled = false }: { title: string; onPress: () => void; variant?: 'primary' | 'ghost' | 'danger'; disabled?: boolean }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, styles[variant], disabled && styles.disabled, pressed && { transform: [{ scale: 0.98 }] }]}>
      <Text style={[styles.text, variant !== 'primary' && styles.altText]}>{title}</Text>
    </Pressable>
  );
}
const createStyles = (colors: AppColors) => StyleSheet.create({
  button: { borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  primary: { backgroundColor: colors.green, borderColor: colors.green },
  ghost: { backgroundColor: colors.cardLight },
  danger: { backgroundColor: colors.card, borderColor: colors.error },
  disabled: { opacity: 0.55 },
  text: { color: '#FFFDF5', fontFamily: typography.sans, fontWeight: '900', fontSize: 14 },
  altText: { color: colors.text },
});
