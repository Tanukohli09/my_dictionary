import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export type TabName = 'Search' | 'Dictionary' | 'Review' | 'Profile';
const icons: Record<TabName, string> = { Search: '⌕', Dictionary: '▥', Review: '♡', Profile: '♙' };

export function BottomTabs({ active, onChange }: { active: TabName; onChange: (tab: TabName) => void }) {
  const tabs: TabName[] = ['Search', 'Dictionary', 'Review', 'Profile'];
  return <View style={styles.bar}>{tabs.map((tab) => <Pressable key={tab} onPress={() => onChange(tab)} style={styles.item}><View style={[styles.iconWrap, active === tab && styles.activeWrap]}><Text style={styles.icon}>{icons[tab]}</Text></View><Text style={[styles.label, active === tab && styles.activeText]}>{tab}</Text></Pressable>)}</View>;
}
const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.cardLight, borderTopWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 13 },
  item: { flex: 1, alignItems: 'center' },
  iconWrap: { width: 35, height: 31, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  activeWrap: { borderWidth: 1, borderColor: colors.border, backgroundColor: '#FFF0CF' },
  icon: { fontSize: 17, color: colors.text },
  label: { fontFamily: typography.sans, fontSize: 9, color: colors.text, marginTop: 2 },
  activeText: { fontWeight: '800' },
});
