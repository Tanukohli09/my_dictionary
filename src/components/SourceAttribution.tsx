import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { WordEntry } from '../models/WordEntry';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

function sourceDetails(source: string, word: string) {
  const normalized = source.toLowerCase();
  if (normalized.includes('wiktionary')) {
    const title = encodeURIComponent(word);
    return {
      contributorsUrl: `https://en.wiktionary.org/w/index.php?title=${title}&action=history`,
      label: 'Wiktionary',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      url: `https://en.wiktionary.org/wiki/${title}`,
    };
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
      <View style={styles.sourceRow}>
        <Text style={styles.text}>Definition source: {details.label}</Text>
        {details.url && <Pressable accessibilityRole="link" accessibilityLabel={`Open ${details.label} source`} onPress={() => Linking.openURL(details.url!)}><Text style={styles.link}>View source</Text></Pressable>}
      </View>
      {'contributorsUrl' in details && details.contributorsUrl && <>
        <Text style={styles.text}>Wiktionary contributors · text normalized and reformatted by My Dictionary · generally available under CC BY-SA 4.0 or GFDL.</Text>
        <View style={styles.sourceRow}>
          <Pressable accessibilityRole="link" accessibilityLabel="View Wiktionary contributors" onPress={() => Linking.openURL(details.contributorsUrl!)}><Text style={styles.link}>View contributors</Text></Pressable>
          <Pressable accessibilityRole="link" accessibilityLabel="Read the CC BY-SA 4.0 license" onPress={() => Linking.openURL(details.licenseUrl!)}><Text style={styles.link}>CC BY-SA 4.0 license</Text></Pressable>
          <Pressable accessibilityRole="link" accessibilityLabel="Read the GNU Free Documentation License" onPress={() => Linking.openURL('https://www.gnu.org/licenses/fdl-1.3.html')}><Text style={styles.link}>GFDL</Text></Pressable>
          <Pressable accessibilityRole="link" accessibilityLabel="Read Wiktionary copyright and licensing details" onPress={() => Linking.openURL('https://en.wiktionary.org/wiki/Wiktionary:Copyrights')}><Text style={styles.link}>Wiktionary copyright details</Text></Pressable>
        </View>
      </>}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  wrap: { gap: 4, marginTop: 4 },
  sourceRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  text: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  link: { color: colors.greenDark, fontSize: 11, fontWeight: '800' },
});
