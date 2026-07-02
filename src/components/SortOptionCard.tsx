import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function SortOptionCard({ title, subtitle, icon, selected, onPress }: { title: string; subtitle: string; icon: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={[styles.icon, title === 'Favourites' && styles.star]}>{icon}</Text>
      <View style={{ flex: 1 }}><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View>
      <Text style={styles.check}>{selected ? '✓' : ''}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 15, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.cardLight },
  icon: { width: 34, color: colors.text, fontWeight: '900', fontSize: 20, textAlign: 'center' },
  star: { color: colors.yellow },
  title: { color: colors.text, fontWeight: '900', fontSize: 15 },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 4 },
  check: { width: 18, color: colors.greenDark, fontSize: 20, fontWeight: '900' },
});
