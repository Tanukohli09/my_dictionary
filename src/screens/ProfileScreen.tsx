import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { OwlMascot } from '../components/OwlMascot';
import { ResponsivePage } from '../components/ResponsivePage';
import { ThemeToggle } from '../components/ThemeToggle';
import { WordEntry } from '../models/WordEntry';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { groupAlphabetically } from '../utils/groupWords';

type ProfileScreenProps = {
  words: WordEntry[];
  onBack?: () => void;
  onDictionary?: () => void;
  onReview?: () => void;
};

type StatAction = 'dictionary' | 'review';

type StatCard = {
  label: string;
  value: number | string;
  color?: string;
  hint: string;
  action: StatAction;
  accessibilityLabel: string;
};

export function ProfileScreen({ words, onBack, onDictionary, onReview }: ProfileScreenProps) {
  const { isTabletUp } = useResponsiveLayout();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const demoMode = words.length <= 10 && words.some((word) => word.source === 'demo');
  const reviewed = words.reduce((n, w) => n + w.reviewed_count, 0);
  const favourites = words.filter((w) => w.is_favorite).length;
  const xp = words.length * 10 + reviewed * 5;
  const level = Math.max(1, Math.floor(xp / 150) + 1);
  const next = level * 150;
  const display = demoMode
    ? { total: 48, reviewed: 23, favourites: 12, level: 3, xp: 350, next: 500 }
    : { total: words.length, reviewed, favourites, level, xp, next };
  const groups = groupAlphabetically(words);
  const rows = demoMode
    ? [['A', 12, 62], ['B', 5, 32], ['C', 9, 50], ['D', 2, 18]] as const
    : Object.keys(groups).sort().slice(0, 8).map((letter) => [letter, groups[letter].length, Math.max(8, (groups[letter].length / Math.max(1, words.length)) * 100)] as const);

  const mainStats: StatCard[] = [
    { label: 'Total Words', value: display.total, color: colors.greenDark, hint: 'Browse dictionary', action: 'dictionary', accessibilityLabel: 'Open dictionary from total words' },
    { label: 'Reviewed', value: display.reviewed, color: colors.greenDark, hint: 'Practice again', action: 'review', accessibilityLabel: 'Open review from reviewed words' },
    { label: 'Favourites', value: display.favourites, color: colors.bookmark, hint: 'See saved words', action: 'dictionary', accessibilityLabel: 'Open dictionary from favourites' },
  ];

  const smallStats: StatCard[] = [
    { label: 'Favourite Ratio', value: `${Math.round((display.favourites / Math.max(1, display.total)) * 100)}%`, hint: `${display.favourites} saved favourites`, action: 'dictionary', accessibilityLabel: 'Open dictionary from favourite ratio' },
    { label: 'Review Attempts', value: display.reviewed, hint: 'Start a quiz', action: 'review', accessibilityLabel: 'Open review from attempts' },
    { label: 'Current Streak', value: '7 days', hint: 'Keep growing', action: 'review', accessibilityLabel: 'Open review from streak' },
  ];

  function runAction(action: StatAction) {
    if (action === 'review') onReview?.();
    else onDictionary?.();
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, isTabletUp && styles.contentWide]} showsVerticalScrollIndicator={false}>
      <ResponsivePage>
        <View style={[styles.header, isTabletUp && styles.headerWide]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to search" disabled={!onBack} onPress={onBack} style={styles.backButton}>
            <Text style={styles.back}>‹</Text>
          </Pressable>
          <Text accessibilityRole="header" style={[styles.headerTitle, isTabletUp && styles.headerTitleWide]}>My Progress</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Open review practice" onPress={onReview} style={[styles.leafButton, isTabletUp && styles.leafButtonWide]}>
            <Text style={styles.leaf}>♧</Text>
          </Pressable>
        </View>

        <View style={[styles.profileRow, isTabletUp && styles.profileRowWide]}>
          <View style={styles.owlWrap}><OwlMascot size={isTabletUp ? 120 : 78} variant="search" /></View>
          <View style={styles.progressColumn}>
            <Text style={styles.collector}>Word Collector</Text>
            <Text style={[styles.level, isTabletUp && styles.levelWide]}>Level {display.level}</Text>
            <View style={styles.progressLine}>
              <View style={styles.progress}><View style={[styles.progressFill, { width: `${Math.min(100, (display.xp / display.next) * 100)}%` }]} /></View>
              {isTabletUp && <Text style={styles.xpInline}>{display.xp} / {display.next} XP</Text>}
            </View>
          </View>
          {!isTabletUp && <Text style={styles.xp}>{display.xp} / {display.next} XP</Text>}
        </View>

        <View style={[styles.themeRow, isTabletUp && styles.themeRowWide]}><ThemeToggle /></View>

        <View style={[styles.stats, isTabletUp && styles.statsWide]}>
          {mainStats.map((stat) => <ProfileStatCard key={stat.label} stat={stat} isWide={isTabletUp} onPress={() => runAction(stat.action)} styles={styles} colors={colors} />)}
        </View>

        <View style={[styles.smallStats, isTabletUp && styles.smallStatsWide]}>
          {smallStats.map((stat) => <ProfileMiniCard key={stat.label} stat={stat} isWide={isTabletUp} onPress={() => runAction(stat.action)} styles={styles} />)}
        </View>

        <Text style={[styles.section, isTabletUp && styles.sectionWide]}>Words by alphabet</Text>
        <View style={[styles.alphaBox, isTabletUp && styles.alphaBoxWide]}>
          {rows.length ? rows.map(([letter, count, width]) => <View key={letter} style={[styles.alphaRow, isTabletUp && styles.alphaRowWide]}><Text style={styles.alphaLetter}>{letter}</Text><View style={styles.bar}><View style={[styles.barFill, { width: `${width}%` }]} /></View><Text style={styles.alphaCount}>{count}</Text></View>) : <Text style={styles.emptyText}>Save words to see your alphabet spread.</Text>}
        </View>
      </ResponsivePage>
    </ScrollView>
  );
}

function ProfileStatCard({ stat, isWide, onPress, styles, colors }: { stat: StatCard; isWide: boolean; onPress: () => void; styles: ProfileStyles; colors: AppColors }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={stat.accessibilityLabel} onPress={onPress} style={({ pressed }) => [styles.stat, isWide && styles.statWide, pressed && styles.pressed]}>
      <Text style={[styles.statLabel, isWide && styles.statLabelWide]}>{stat.label}</Text>
      <Text style={[styles.statNum, isWide && styles.statNumWide, { color: stat.color || colors.greenDark }]}>{stat.value}</Text>
      <Text style={[styles.statHint, isWide && styles.statHintWide]}>{stat.hint}</Text>
    </Pressable>
  );
}

function ProfileMiniCard({ stat, isWide, onPress, styles }: { stat: StatCard; isWide: boolean; onPress: () => void; styles: ProfileStyles }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={stat.accessibilityLabel} onPress={onPress} style={({ pressed }) => [styles.smallStat, isWide && styles.smallStatWide, pressed && styles.pressed]}>
      <Text style={[styles.smallStatLabel, isWide && styles.smallStatLabelWide]}>{stat.label}</Text>
      <Text style={[styles.smallStatValue, isWide && styles.smallStatValueWide]}>{stat.value}</Text>
      {isWide && <Text style={styles.smallStatHint}>{stat.hint}</Text>}
    </Pressable>
  );
}

type ProfileStyles = ReturnType<typeof createStyles>;

const createStyles = (colors: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 38 },
  contentWide: { paddingHorizontal: 40, paddingTop: 10, paddingBottom: 52 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  headerWide: { marginBottom: 24 },
  backButton: { width: 42, height: 42, alignItems: 'flex-start', justifyContent: 'center' },
  back: { color: colors.text, fontSize: 31, lineHeight: 36 },
  headerTitle: { color: colors.text, fontSize: 12, flex: 1, textAlign: 'center' },
  headerTitleWide: { fontFamily: typography.serif, fontSize: 34, lineHeight: 40, fontWeight: '900' },
  leafButton: { width: 42, height: 42, alignItems: 'flex-end', justifyContent: 'center' },
  leafButtonWide: { alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 999, backgroundColor: colors.cardLight },
  leaf: { color: colors.text, fontSize: 17, lineHeight: 22, fontWeight: '900' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  profileRowWide: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.cardLight, paddingHorizontal: 30, paddingVertical: 28, gap: 26, marginBottom: 24 },
  owlWrap: { alignItems: 'center', justifyContent: 'center' },
  progressColumn: { flex: 1, minWidth: 0 },
  collector: { color: colors.text, fontSize: 12, fontWeight: '900', marginBottom: 7 },
  level: { fontFamily: typography.sans, color: colors.text, fontSize: 20, fontWeight: '800' },
  levelWide: { fontFamily: typography.serif, fontSize: 42, lineHeight: 50, fontWeight: '900' },
  progressLine: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 10 },
  progress: { flex: 1, maxWidth: 820, height: 8, backgroundColor: colors.input, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.green, borderRadius: 999 },
  xp: { color: colors.muted, fontSize: 9, alignSelf: 'center' },
  xpInline: { color: colors.muted, fontSize: 11, fontWeight: '700', minWidth: 94, textAlign: 'right' },
  themeRow: { marginBottom: 16 },
  themeRowWide: { maxWidth: 480 },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statsWide: { gap: 20, marginBottom: 18 },
  stat: { flex: 1, minHeight: 76, borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.cardLight, alignItems: 'center', justifyContent: 'center', padding: 10 },
  statWide: { minHeight: 136, borderRadius: 16, paddingVertical: 22 },
  statLabel: { color: colors.muted, fontSize: 10, marginBottom: 6, textAlign: 'center' },
  statLabelWide: { fontSize: 13, marginBottom: 10 },
  statNum: { fontSize: 25, fontWeight: '900' },
  statNumWide: { fontSize: 38, lineHeight: 44 },
  statHint: { color: colors.muted, fontSize: 9, marginTop: 5, textAlign: 'center' },
  statHintWide: { fontSize: 11, marginTop: 8 },
  pressed: { opacity: 0.72 },
  smallStats: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  smallStatsWide: { gap: 14, marginBottom: 24 },
  smallStat: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 8, minHeight: 45, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cardLight, paddingHorizontal: 8 },
  smallStatWide: { minHeight: 72, borderRadius: 12, alignItems: 'flex-start', paddingHorizontal: 18 },
  smallStatLabel: { color: colors.muted, fontSize: 9, textAlign: 'center' },
  smallStatLabelWide: { fontSize: 11, marginBottom: 4, textAlign: 'left' },
  smallStatValue: { color: colors.text, fontSize: 11, fontWeight: '900', textAlign: 'center' },
  smallStatValueWide: { fontSize: 16, color: colors.text, textAlign: 'left' },
  smallStatHint: { color: colors.muted, fontSize: 10, marginTop: 3 },
  section: { color: colors.text, fontWeight: '900', fontSize: 13, marginBottom: 10 },
  sectionWide: { fontSize: 16, marginBottom: 12 },
  alphaBox: { gap: 11 },
  alphaBoxWide: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.cardLight, padding: 24, gap: 14 },
  alphaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alphaRowWide: { minHeight: 20, gap: 16 },
  alphaLetter: { color: colors.text, width: 18, fontSize: 11, fontWeight: '700' },
  bar: { flex: 1, height: 6, backgroundColor: colors.input, borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.green, borderRadius: 999 },
  alphaCount: { width: 24, color: colors.text, textAlign: 'right', fontWeight: '800', fontSize: 12 },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 20 },
});
