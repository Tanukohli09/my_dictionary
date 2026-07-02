import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ResponsivePage } from '../components/ResponsivePage';
import { WordEntry } from '../models/WordEntry';
import { saveSavedWordMeaning } from '../modules/savedWordCollection';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const flower = require('../assets/flower.png');

export function NoteScreen({ word, onBack, onSaved }: { word: WordEntry; onBack: () => void; onSaved: (w: WordEntry) => void }) {
  const { isTabletUp } = useResponsiveLayout();
  const [note, setNote] = useState(word.my_meaning || '');
  async function save() { onSaved(await saveSavedWordMeaning(word, note)); }
  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, isTabletUp && styles.contentWide]} showsVerticalScrollIndicator={false}>
      <ResponsivePage style={isTabletUp && styles.pageWide}>
        <View style={styles.header}><Text onPress={onBack} style={styles.back}>‹</Text><Text style={[styles.title, isTabletUp && styles.titleWide]}>My Meaning</Text><Text onPress={save} style={styles.check}>✓</Text></View>
        <View style={[styles.notePaper, isTabletUp && styles.notePaperWide]}>
          <TextInput multiline value={note} onChangeText={setNote} placeholder="Write your own simple meaning..." placeholderTextColor={colors.muted} textAlignVertical="top" style={[styles.area, isTabletUp && styles.areaWide]} />
          <Image source={flower} resizeMode="contain" style={[styles.flower, isTabletUp && styles.flowerWide]} />
        </View>
      </ResponsivePage>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 28 },
  contentWide: { paddingHorizontal: 40, paddingTop: 30, paddingBottom: 52 },
  pageWide: { maxWidth: 880 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  back: { color: colors.text, fontSize: 34, lineHeight: 38, flex: 1 },
  title: { fontFamily: typography.serif, color: colors.text, fontSize: 21, fontWeight: '800', flex: 2, textAlign: 'center' },
  titleWide: { fontSize: 32 },
  check: { flex: 1, color: colors.greenDark, fontSize: 20, fontWeight: '900', textAlign: 'right' },
  notePaper: { minHeight: 455, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16, overflow: 'hidden' },
  notePaperWide: { minHeight: 520, borderRadius: 18, padding: 28 },
  area: { width: 252, minHeight: 390, color: colors.text, fontSize: 19, lineHeight: 30, fontFamily: typography.serif, padding: 0, outlineStyle: 'none' as any },
  areaWide: { width: '82%' as any, minHeight: 440, fontSize: 22, lineHeight: 34 },
  flower: { position: 'absolute', bottom: 18, right: 24, width: 78, height: 96 },
  flowerWide: { width: 126, height: 156, right: 36, bottom: 28 },
});
