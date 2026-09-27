import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { WordEntry } from '../models/WordEntry';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

function sourceDetails(source: string, word: string) {
  const normalized = source.toLowerCase();
  if (normalized.includes('wiktionary')) {
    return { label: 'Wiktionary', url: `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}` };
  }
  if (normalized.includes('datamuse')) {
    return { label: 'Datamuse', url: 'https://www.datamuse.com/api/' };
  }
  if (normalized.includes('dictionaryapi')) {
    return { label: 'Free Dictionary API', url: 'https://dictionaryapi.dev/' };
  }
  return { label: source && source !== 'configured-provider' ? source : 'Configured dictionary provider', url: null };
}

export function SourceAttribution({ word }: { word: WordEntry }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const details = sourceDetails(word.source, word.normalized_word);
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>Definition source: {details.label}</Text>
      {details.url && <Pressable accessibilityRole="link" accessibilityLabel={`Open ${details.label} source`} onPress={() => Linking.openURL(details.url!)}><Text style={styles.link}>View source</Text></Pressable>}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 4 },
  text: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  link: { color: colors.greenDark, fontSize: 11, fontWeight: '800' },
});
