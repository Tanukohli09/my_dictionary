import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ResponsivePage } from '../components/ResponsivePage';
import { WordEntry } from '../models/WordEntry';
import { saveSavedWordMeaning, toggleSavedWordFavourite } from '../modules/savedWordCollection';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { formatDate } from '../utils/dateUtils';

export function WordDetailScreen({ word, onBack, onChanged, openNote }: { word: WordEntry; onBack: () => void; onChanged: (w: WordEntry) => void; openNote: (w: WordEntry) => void }) {
  const { isTabletUp } = useResponsiveLayout();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [myMeaning, setMyMeaning] = useState(word.my_meaning || '');
  async function saveMeaning() { onChanged(await saveSavedWordMeaning(word, myMeaning)); }
  async function toggleFavorite() { onChanged(await toggleSavedWordFavourite(word)); }
  const defs = word.definitions.slice(0, 2);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, isTabletUp && styles.contentWide]} showsVerticalScrollIndicator={false}>
      <ResponsivePage>
        <View style={styles.header}>
          <Text onPress={onBack} style={styles.back}>‹</Text>
        </View>
        {!isTabletUp && <Pressable onPress={toggleFavorite} style={styles.ribbonHit}><Text style={[styles.ribbon, !word.is_favorite && { opacity: 0.45 }]}>▾</Text></Pressable>}
        <View style={[styles.detailGrid, isTabletUp && styles.detailGridWide]}>
          <View style={styles.mainColumn}>
            <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.title, isTabletUp && styles.titleWide]}>{word.word}</Text>
            <View style={styles.soundRow}><Text style={styles.phonetic}>{word.phonetic || 'Pronunciation not available'}</Text>{word.audio_url ? <Text onPress={() => Linking.openURL(word.audio_url!)} style={styles.sound}>↯</Text> : <Text style={[styles.sound, { opacity: 0.35 }]}>↯</Text>}</View>
            {!!word.part_of_speech && <Text style={styles.pos}>{word.part_of_speech}</Text>}
            <View style={styles.entryBlock}>
              <Text style={styles.label}>Meaning</Text>
              {defs.map((d, i) => <Text key={`${d.definition}-${i}`} style={styles.body}>{defs.length > 1 ? `${i + 1}. ` : ''}{d.definition}</Text>)}
            </View>
            <View style={styles.entryBlock}>
              <Text style={styles.label}>Example</Text>
              <Text style={styles.body}>{word.example || 'No example available yet.'}</Text>
            </View>
            {!!word.synonyms.length && <View style={styles.entryBlock}><Text style={styles.label}>Synonyms</Text><Text style={styles.syn}>{word.synonyms.slice(0, 5).join(' · ')}</Text></View>}
          </View>
          <View style={styles.sideColumn}>
            {isTabletUp && <Pressable accessibilityRole="button" accessibilityLabel="Toggle favourite word" onPress={toggleFavorite} style={styles.favoritePill}><Text style={styles.favoriteText}>{word.is_favorite ? '★ Favourite' : '☆ Mark favourite'}</Text></Pressable>}
            <View style={[styles.myCard, isTabletUp && styles.myCardWide]}>
              <View style={styles.rowBetween}><Text style={styles.label}>My meaning</Text><Pressable onPress={() => openNote(word)} accessibilityRole="button" accessibilityLabel="Edit my meaning"><Text style={styles.edit}>✎</Text></Pressable></View>
              <TextInput multiline value={myMeaning} onChangeText={setMyMeaning} onBlur={saveMeaning} placeholder="Add your own simple meaning..." placeholderTextColor={colors.muted} style={styles.myInput} />
            </View>
            <Text style={styles.meta}>Searched {word.search_count} times{`\n`}Added on {formatDate(word.created_at)}</Text>
          </View>
        </View>
      </ResponsivePage>
    </ScrollView>
  );
}
const createStyles = (colors: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  content: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 42 },
  contentWide: { paddingHorizontal: 40, paddingTop: 28, paddingBottom: 54 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 24 },
  back: { flex: 1, color: colors.text, fontSize: 34, lineHeight: 38 },
  ribbonHit: { position: 'absolute', right: 24, top: 54, zIndex: 5 },
  ribbon: { color: colors.bookmark, fontSize: 42 },
  favoritePill: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardLight, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  favoriteText: { color: colors.greenDark, fontSize: 12, fontWeight: '900' },
  detailGrid: { gap: 13 },
  detailGridWide: { flexDirection: 'row', alignItems: 'flex-start', gap: 34 },
  mainColumn: { flex: 1, minWidth: 0 },
  sideColumn: { gap: 10 },
  title: { fontFamily: typography.serif, color: colors.text, fontWeight: '900', fontSize: 34, marginBottom: 4 },
  titleWide: { fontSize: 54, marginBottom: 8 },
  soundRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 9 },
  phonetic: { color: colors.text, fontSize: 14 },
  sound: { color: colors.text, fontWeight: '900' },
  pos: { color: colors.greenDark, fontSize: 13, fontWeight: '700', marginBottom: 13 },
  entryBlock: { marginTop: 13 },
  label: { color: colors.text, fontSize: 12, fontWeight: '900', marginBottom: 6 },
  body: { color: colors.text, fontSize: 13, lineHeight: 19 },
  syn: { color: colors.greenDark, fontSize: 13, lineHeight: 19, fontWeight: '800' },
  myCard: { marginTop: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.yellow, borderRadius: 9, padding: 12 },
  myCardWide: { width: 330, minHeight: 170, borderRadius: 16, padding: 18, marginTop: 0 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  edit: { color: colors.text, fontSize: 19 },
  myInput: { minHeight: 44, color: colors.text, fontSize: 13, lineHeight: 19, padding: 0 },
  meta: { marginTop: 10, color: colors.muted, fontSize: 11, lineHeight: 18 },
});
