import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OwlMascot } from '../components/OwlMascot';
import { ResponsivePage } from '../components/ResponsivePage';
import { SortOptionCard } from '../components/SortOptionCard';
import { SortMode } from '../models/WordEntry';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const opts: { mode: SortMode; title: string; subtitle: string; icon: string }[] = [
  { mode: 'alphabetical', title: 'Alphabetical', subtitle: 'A to Z', icon: 'A↙Z' },
  { mode: 'newest', title: 'Newest', subtitle: 'Recently added words', icon: '◷' },
  { mode: 'most_searched', title: 'Most Searched', subtitle: 'Frequently searched words', icon: '↗' },
  { mode: 'favourites', title: 'Favourites', subtitle: 'Your bookmarked words', icon: '★' },
];

export function SortScreen({ selected, onSelect, onBack }: { selected: SortMode; onSelect: (m: SortMode) => void; onBack: () => void }) {
  const { isTabletUp } = useResponsiveLayout();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={[styles.screen, isTabletUp && styles.screenWide]}>
      <ResponsivePage>
        <View style={styles.header}><Text onPress={onBack} style={styles.back}>‹</Text></View>
        <View style={[styles.layout, isTabletUp && styles.layoutWide]}>
          <View style={styles.optionsColumn}>
            <Text style={[styles.title, isTabletUp && styles.titleWide]}>Sort by</Text>
            <View style={[styles.box, isTabletUp && styles.boxWide]}>
              {opts.map((o) => <SortOptionCard key={o.mode} icon={o.icon} title={o.title} subtitle={o.subtitle} selected={selected === o.mode} onPress={() => { onSelect(o.mode); onBack(); }} />)}
            </View>
          </View>
          <View style={[styles.owl, isTabletUp && styles.owlWide]}><OwlMascot size={isTabletUp ? 220 : 154} variant="sort" /></View>
        </View>
      </ResponsivePage>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page, paddingHorizontal: 24, paddingTop: 8 },
  screenWide: { paddingHorizontal: 40, paddingTop: 28 },
  header: { minHeight: 22 },
  back: { color: colors.text, fontSize: 34, lineHeight: 34 },
  layout: {},
  layoutWide: { flexDirection: 'row', alignItems: 'center', gap: 48, minHeight: 520 },
  optionsColumn: { flex: 1, minWidth: 0 },
  title: { fontFamily: typography.serif, color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 6, marginBottom: 20 },
  titleWide: { fontSize: 38 },
  box: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.cardLight },
  boxWide: { maxWidth: 620, borderRadius: 16 },
  owl: { alignItems: 'center', marginTop: 188 },
  owlWide: { flex: 1, marginTop: 0 },
});
