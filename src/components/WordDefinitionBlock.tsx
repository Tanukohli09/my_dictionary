import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WordEntry } from '../models/WordEntry';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { SynonymChips } from './SynonymChips';

export function WordDefinitionBlock({ word, full = false }: { word: WordEntry; full?: boolean }) {
  const defs = full ? word.definitions : word.definitions.slice(0, 2);
  return <View style={{ gap: spacing.lg }}>
    <View><Text style={styles.label}>Meaning</Text>{defs.map((d, i) => <Text key={`${d.definition}-${i}`} style={styles.body}>{defs.length > 1 ? `${i + 1}. ` : ''}{d.definition}</Text>)}</View>
    <View><Text style={styles.label}>Example</Text><Text style={styles.example}>{word.example || 'No example available yet.'}</Text></View>
    {!!word.synonyms.length && <View><Text style={styles.label}>Synonyms</Text><SynonymChips words={word.synonyms} /></View>}
  </View>;
}
const styles = StyleSheet.create({
  label: { fontFamily: typography.sans, color: colors.text, fontWeight: '800', fontSize: 13, marginBottom: 8 },
  body: { fontFamily: typography.sans, color: colors.text, fontSize: 15, lineHeight: 23, marginBottom: 6 },
  example: { fontFamily: typography.sans, color: colors.text, fontSize: 15, lineHeight: 23 },
});
