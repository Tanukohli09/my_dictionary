import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AlphabetIndex } from '../components/AlphabetIndex';
import { DictionarySection } from '../components/DictionarySection';
import { EmptyState } from '../components/EmptyState';
import { ResponsivePage } from '../components/ResponsivePage';
import { SearchBar } from '../components/SearchBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { WordCard } from '../components/WordCard';
import { prepareDictionaryList, emptyDictionaryTitle } from '../modules/dictionaryList';
import { SortMode, WordEntry } from '../models/WordEntry';
import { colors } from '../theme/colors';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

export function DictionaryScreen({ words, openDetail, goSearch, sort, onSortOpen, onMenu }: { words: WordEntry[]; openDetail: (w: WordEntry) => void; goSearch: () => void; sort: SortMode; onSortOpen: () => void; onMenu?: () => void }) {
  const { isTabletUp } = useResponsiveLayout();
  const [query, setQuery] = useState('');
  const scroll = useRef<ScrollView>(null);
  const positions = useRef<Record<string, number>>({});
  const list = useMemo(() => prepareDictionaryList(words, query, sort), [words, query, sort]);

  return <View style={styles.screen}>
    <ScrollView ref={scroll} contentContainerStyle={[styles.content, isTabletUp && styles.contentWide]} showsVerticalScrollIndicator={false}>
      <ResponsivePage>
        <ScreenHeader title="My Dictionary" right="⌁" onLeft={onMenu} onRight={onSortOpen} leftLabel="Open navigation menu" rightLabel="Sort dictionary" />
        <View style={isTabletUp && styles.searchWide}><SearchBar placeholder="Search your words..." value={query} onChangeText={setQuery} /></View>
        {list.empty ? <EmptyState title={emptyDictionaryTitle(sort)} subtitle="Search a word and it will appear here alphabetically." button="Search First Word" onPress={goSearch} /> : list.mode === 'sections'
          ? <View style={isTabletUp && styles.sectionsWide}>{list.sections.map((section) => <View key={section.letter} onLayout={(event) => { positions.current[section.letter] = event.nativeEvent.layout.y; }}><DictionarySection letter={section.letter} words={section.words} onWordPress={openDetail} /></View>)}</View>
          : <View style={[styles.list, isTabletUp && styles.listWide]}>{list.rows.map(({ word, meta }) => <WordCard key={word.id} word={word} onPress={() => openDetail(word)} meta={meta} />)}</View>}
      </ResponsivePage>
    </ScrollView>
    {list.mode === 'sections' && !!list.letters.length && <AlphabetIndex available={list.letters} onPress={(letter) => scroll.current?.scrollTo({ y: positions.current[letter] || 0, animated: true })} />}
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  content: { paddingHorizontal: 22, paddingTop: 10, paddingRight: 34, paddingBottom: 42 },
  contentWide: { paddingHorizontal: 36, paddingTop: 28, paddingRight: 52, paddingBottom: 52 },
  searchWide: { maxWidth: 620 },
  sectionsWide: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.cardLight, paddingHorizontal: 8, paddingBottom: 12, marginTop: 18 },
  list: { borderWidth: 1, borderColor: colors.border, borderRadius: 9, overflow: 'hidden', marginTop: 16 },
  listWide: { borderRadius: 16, backgroundColor: colors.cardLight },
});
