import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WordEntry } from '../models/WordEntry';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { BookmarkRibbon } from './BookmarkButton';

export function WordCard({ word, onPress, meta }: { word: WordEntry; onPress: () => void; meta?: string }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: .75 }]}>{word.is_favorite && <BookmarkRibbon />}<View style={{ paddingRight: 18 }}><Text style={styles.word}>{word.word}</Text><Text numberOfLines={1} style={styles.meaning}>{word.part_of_speech || 'word'} · {word.meaning_short}</Text>{!!meta && <Text style={styles.meta}>{meta}</Text>}</View></Pressable>;
}
const styles = StyleSheet.create({
  row: { backgroundColor: colors.cardLight, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 10, paddingHorizontal: 12, overflow: 'hidden' },
  word: { fontFamily: typography.sans, fontSize: 15, color: colors.text, fontWeight: '800', marginBottom: 3 },
  meaning: { fontFamily: typography.sans, color: colors.muted, fontSize: 12, lineHeight: 17 },
  meta: { color: colors.greenDark, marginTop: 4, fontSize: 11, fontWeight: '800' },
});
