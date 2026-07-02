import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

export function ScreenHeader({ title, left, right, onLeft, onRight, leftLabel, rightLabel }: { title: string; left?: string; right?: string; onLeft?: () => void; onRight?: () => void; leftLabel?: string; rightLabel?: string }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel={leftLabel} hitSlop={8} disabled={!onLeft} onPress={onLeft} style={[styles.icon, !!onLeft && styles.activeIcon]}><Text style={[styles.iconText, !onLeft && styles.disabledIcon]}>{left || '☰'}</Text></Pressable><Text style={styles.title}>{title}</Text><Pressable accessibilityRole="button" accessibilityLabel={rightLabel} hitSlop={8} disabled={!onRight} onPress={onRight} style={[styles.icon, !!onRight && styles.activeIcon]}><Text style={[styles.iconText, !onRight && styles.disabledIcon]}>{right || '♡'}</Text></Pressable></View>;
}
const createStyles = (colors: AppColors) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingTop: 4 },
  icon: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  activeIcon: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  iconText: { color: colors.text, fontSize: 18 },
  disabledIcon: { opacity: 0.45 },
  title: { fontFamily: typography.serif, color: colors.text, fontSize: 19, fontWeight: '700' },
});
