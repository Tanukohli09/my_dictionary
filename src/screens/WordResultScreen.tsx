import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BookmarkButton } from '../components/BookmarkButton';
import { ResponsivePage } from '../components/ResponsivePage';
import { SavedStamp } from '../components/SavedStamp';
import { WordDefinitionBlock } from '../components/WordDefinitionBlock';
import { WordEntry } from '../models/WordEntry';
import { toggleSavedWordFavourite } from '../modules/savedWordCollection';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

export function WordResultScreen({ word, created, onBack, onChanged }: { word: WordEntry; created: boolean; onBack: () => void; onChanged: (w: WordEntry) => void }) {
  const { isTabletUp } = useResponsiveLayout();
  async function toggleFavorite() { onChanged(await toggleSavedWordFavourite(word)); }
  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, isTabletUp && styles.contentWide]} showsVerticalScrollIndicator={false}>
      <ResponsivePage>
        <View style={styles.header}><Text onPress={onBack} style={styles.nav}>‹</Text><BookmarkButton active={word.is_favorite} onPress={toggleFavorite} /></View>
        <View style={[styles.layout, isTabletUp && styles.layoutWide]}>
          <View style={[styles.page, isTabletUp && styles.pageWide]}>
            <Text style={[styles.title, isTabletUp && styles.titleWide]}>{word.word}</Text>
            <View style={styles.soundRow}><Text style={styles.phonetic}>{word.phonetic || 'Pronunciation not available'}</Text>{word.audio_url ? <Text style={styles.speaker} onPress={() => Linking.openURL(word.audio_url!)}>↯</Text> : <Text style={[styles.speaker, { opacity: .35 }]}>↯</Text>}</View>
            {word.part_of_speech && <Text style={styles.pos}>{word.part_of_speech}</Text>}
            <WordDefinitionBlock word={word} />
          </View>
          <View style={styles.stampColumn}><SavedStamp message={created ? `Added to your Dictionary under ${word.first_letter}.` : 'Already in your Dictionary. Search count updated.'} /></View>
        </View>
      </ResponsivePage>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  content: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 40 },
  contentWide: { paddingHorizontal: 40, paddingTop: 28, paddingBottom: 54 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, gap: 8 },
  nav: { fontSize: 34, color: colors.text, lineHeight: 36, flex: 1 },
  layout: {},
  layoutWide: { flexDirection: 'row', gap: 34, alignItems: 'flex-start' },
  page: { minHeight: 535 },
  pageWide: { flex: 1, minWidth: 0, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.cardLight, padding: 30, minHeight: 460 },
  stampColumn: { minWidth: 0 },
  title: { fontFamily: typography.serif, fontSize: 32, fontWeight: '900', color: colors.text, marginBottom: 4 },
  titleWide: { fontSize: 56, marginBottom: 8 },
  soundRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  phonetic: { color: colors.text, fontSize: 15 },
  speaker: { fontSize: 16, color: colors.text, fontWeight: '900' },
  pos: { alignSelf: 'flex-start', color: colors.greenDark, fontWeight: '700', fontSize: 14, marginBottom: 22 },
});
