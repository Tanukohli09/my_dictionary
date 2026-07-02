import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { OwlMascot } from './OwlMascot';
import { PrimaryButton } from './PrimaryButton';

export function EmptyState({ title, subtitle, button, onPress }: { title: string; subtitle: string; button?: string; onPress?: () => void }) {
  return <View style={styles.wrap}><OwlMascot /><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text>{button && onPress && <PrimaryButton title={button} onPress={onPress} />}</View>;
}
const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: 26, gap: 12 },
  title: { fontFamily: typography.serif, fontSize: 24, color: colors.text, textAlign: 'center', fontWeight: '800' },
  subtitle: { fontFamily: typography.sans, fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 21 },
});
