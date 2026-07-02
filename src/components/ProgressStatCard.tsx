import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export function ProgressStatCard({ label, value }: { label: string; value: string | number }) {
  return <View style={styles.card}><Text style={styles.value}>{value}</Text><Text style={styles.label}>{label}</Text></View>;
}
const styles = StyleSheet.create({
  card: { flex: 1, minWidth: '45%', backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 14, alignItems: 'center' },
  value: { fontFamily: typography.serif, color: colors.text, fontSize: 25, fontWeight: '900' }, label: { color: colors.muted, fontSize: 12, fontWeight: '800', marginTop: 4 },
});
