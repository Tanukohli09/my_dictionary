import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LoadingState } from '../components/LoadingState';
import { OwlMascot } from '../components/OwlMascot';
import { PaperCard } from '../components/PaperCard';
import { ResponsivePage } from '../components/ResponsivePage';
import { SearchBar } from '../components/SearchBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { WordEntry } from '../models/WordEntry';
import { searchSavedWord } from '../modules/savedWordCollection';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { greeting } from '../utils/dateUtils';
import { normalizeWord } from '../utils/normalizeWord';

const sample = { word: 'Ephemeral', phonetic: '/ɪˈfemərəl/', meaning_short: 'existing for a very short time.' };

export function SearchScreen({ words, reload, openResult, openDetail, goDictionary, onMenu }: { words: WordEntry[]; reload: () => Promise<void>; openResult: (word: WordEntry, created: boolean) => void; openDetail: (word: WordEntry) => void; goDictionary: () => void; onMenu?: () => void }) {
  const { isTabletUp } = useResponsiveLayout();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const recent = [...words].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 3);
  const wordOfDay = words.find((word) => word.word === 'Ephemeral') || sample;

  async function search() {
    const normalized = normalizeWord(query);
    if (!normalized) return Alert.alert('A tiny blank page', 'Type a word to search.');
    setLoading(true);
    try {
      const saved = await searchSavedWord(normalized);
      await reload();
      openResult(saved.entry, saved.created);
      setQuery('');
    } catch {
      Alert.alert('Word not found', 'We could not find this word. Check the spelling and try again.');
    } finally { setLoading(false); }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, isTabletUp && styles.contentWide]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <ResponsivePage>
        <ScreenHeader title="My Dictionary" right="♧" onLeft={onMenu} onRight={goDictionary} leftLabel="Open navigation menu" rightLabel="Open your personal dictionary" />
        <View style={[styles.grid, isTabletUp && styles.gridWide]}>
          <View style={styles.mainColumn}>
            <View style={[styles.hero, isTabletUp && styles.heroWide]}>
              <View style={styles.heroText}>
                <Text style={styles.greeting}>{greeting()}</Text>
                <Text style={[styles.prompt, isTabletUp && styles.promptWide]}>What word shall we{`\n`}add today?</Text>
              </View>
              <View style={styles.heroOwl}><OwlMascot size={isTabletUp ? 132 : 88} variant="search" /></View>
            </View>
            <SearchBar placeholder="Search a word..." value={query} onChangeText={setQuery} onSubmitEditing={search} autoCapitalize="none" />
            {loading && <LoadingState />}
          </View>
          <View style={styles.sideColumn}>
            <PaperCard style={[styles.wotd, isTabletUp && styles.wotdWide]}>
              <View style={styles.wotdTop}><Text style={styles.tiny}>Word of the day</Text><Text style={styles.star}>★</Text></View>
              <Text style={styles.word}>{wordOfDay.word}</Text>
              <Text style={styles.phonetic}>{wordOfDay.phonetic}</Text>
              <Text style={styles.meaning}>{wordOfDay.meaning_short}</Text>
            </PaperCard>
            <View style={styles.recentHead}><Text style={styles.recentTitle}>Recently added</Text>{!!recent.length && <Text onPress={goDictionary} style={styles.seeAll}>See all</Text>}</View>
            <View style={styles.rows}>{(recent.length ? recent : ['Resilient', 'Curious', 'Benevolent']).map((item) => typeof item === 'string' ? <Text key={item} style={styles.rowText}>{item}</Text> : <Text key={item.id} onPress={() => openDetail(item)} style={styles.rowText}>{item.word}</Text>)}</View>
          </View>
        </View>
      </ResponsivePage>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  content: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 26 },
  contentWide: { paddingHorizontal: 36, paddingTop: 28, paddingBottom: 44 },
  grid: { gap: 13 },
  gridWide: { flexDirection: 'row', alignItems: 'flex-start', gap: 28 },
  mainColumn: { flex: 1, minWidth: 0 },
  sideColumn: { gap: 13 },
  hero: { flexDirection: 'row', alignItems: 'center', minHeight: 122, marginTop: 4 },
  heroWide: { minHeight: 240, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.cardLight, padding: 28 },
  heroText: { flex: 1, paddingTop: 4 },
  heroOwl: { width: 102, alignItems: 'flex-end', justifyContent: 'center' },
  greeting: { color: colors.text, fontSize: 13, marginBottom: 9 },
  prompt: { fontFamily: typography.sans, color: colors.text, fontSize: 15, lineHeight: 22 },
  promptWide: { fontFamily: typography.serif, fontSize: 34, lineHeight: 42, fontWeight: '900' },
  wotd: { padding: 15, backgroundColor: colors.card, borderRadius: 10, marginTop: 1 },
  wotdWide: { minWidth: 330, maxWidth: 390, padding: 22, borderRadius: 16 },
  wotdTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tiny: { color: colors.muted, fontSize: 11 },
  star: { color: colors.yellow, fontSize: 20 },
  word: { fontFamily: typography.serif, fontSize: 21, fontWeight: '800', color: colors.text, marginTop: 8 },
  phonetic: { color: colors.text, fontSize: 12, marginVertical: 3 },
  meaning: { color: colors.text, fontSize: 13, lineHeight: 20 },
  recentHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  recentTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  seeAll: { color: colors.muted, fontSize: 12 },
  rows: { borderTopWidth: 1, borderColor: colors.border },
  rowText: { color: colors.text, paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border, fontSize: 14, fontWeight: '600' },
});
