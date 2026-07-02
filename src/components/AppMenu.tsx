import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TabName } from './BottomTabs';
import { ThemeToggle } from './ThemeToggle';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';

const items: { tab: TabName; icon: string; title: string; subtitle: string }[] = [
  { tab: 'Search', icon: '⌕', title: 'Search', subtitle: 'Find and save a new word' },
  { tab: 'Dictionary', icon: '▥', title: 'Dictionary', subtitle: 'Browse your saved words' },
  { tab: 'Review', icon: '♡', title: 'Review', subtitle: 'Practice with quick quizzes' },
  { tab: 'Profile', icon: '♙', title: 'Profile', subtitle: 'See progress and streaks' },
];

export function AppMenu({ visible, active, onClose, onNavigate }: { visible: boolean; active: TabName; onClose: () => void; onNavigate: (tab: TabName) => void }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <Pressable accessibilityLabel="Close navigation menu" onPress={onClose} style={StyleSheet.absoluteFill} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Navigate</Text>
          <Text onPress={onClose} style={styles.close}>×</Text>
        </View>
        {items.map((item) => {
          const selected = item.tab === active;
          return (
            <Pressable key={item.tab} accessibilityRole="button" onPress={() => onNavigate(item.tab)} style={[styles.item, selected && styles.selected]}>
              <Text style={styles.icon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.check}>{selected ? '✓' : '›'}</Text>
            </Pressable>
          );
        })}
        <View style={styles.toggleWrap}><ThemeToggle /></View>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 90, justifyContent: 'flex-end', backgroundColor: 'rgba(58, 32, 17, 0.10)' },
  sheet: { marginHorizontal: 18, marginBottom: 18, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.cardLight, padding: 14, shadowColor: colors.shadow, shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  title: { flex: 1, fontFamily: typography.serif, color: colors.text, fontSize: 21, fontWeight: '800' },
  close: { color: colors.text, fontSize: 25, lineHeight: 30, paddingHorizontal: 8 },
  item: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, paddingHorizontal: 12, marginTop: 6 },
  selected: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  icon: { width: 30, textAlign: 'center', color: colors.text, fontSize: 19, fontWeight: '900' },
  itemTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 2 },
  check: { color: colors.greenDark, fontSize: 20, fontWeight: '900' },
  toggleWrap: { marginTop: 10 },
});
