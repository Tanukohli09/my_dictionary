import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TabName } from './BottomTabs';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout } from '../theme/breakpoints';

const items: { tab: TabName; icon: string; title: string; subtitle: string }[] = [
  { tab: 'Search', icon: '⌕', title: 'Search', subtitle: 'Find a word' },
  { tab: 'Dictionary', icon: '▥', title: 'Dictionary', subtitle: 'Saved words' },
  { tab: 'Review', icon: '♡', title: 'Review', subtitle: 'Practice quiz' },
  { tab: 'Profile', icon: '♙', title: 'Profile', subtitle: 'Progress' },
];

export function DesktopNavigation({ active, onChange }: { active: TabName; onChange: (tab: TabName) => void }) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <Text style={styles.logo}>My</Text>
        <Text style={styles.logoStrong}>Dictionary</Text>
        <Text style={styles.tagline}>Your words, your world.</Text>
      </View>
      <View style={styles.items}>
        {items.map((item) => {
          const selected = item.tab === active;
          return (
            <Pressable key={item.tab} accessibilityRole="button" onPress={() => onChange(item.tab)} style={[styles.item, selected && styles.selected]}>
              <Text style={styles.icon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, selected && styles.selectedText]}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: layout.desktopSidebarWidth,
    borderRightWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardLight,
    paddingHorizontal: 18,
    paddingVertical: 28,
  },
  brand: { marginBottom: 32 },
  logo: { fontFamily: typography.serif, color: colors.text, fontSize: 27, lineHeight: 30, fontWeight: '900' },
  logoStrong: { fontFamily: typography.serif, color: colors.text, fontSize: 27, lineHeight: 30, fontWeight: '900' },
  tagline: { color: colors.muted, fontSize: 12, marginTop: 8 },
  items: { gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12 },
  selected: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  icon: { width: 30, textAlign: 'center', color: colors.text, fontSize: 19, fontWeight: '900' },
  title: { color: colors.text, fontSize: 14, fontWeight: '800' },
  selectedText: { color: colors.greenDark },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 2 },
});
