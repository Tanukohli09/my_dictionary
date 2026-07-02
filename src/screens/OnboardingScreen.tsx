import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OwlMascot } from '../components/OwlMascot';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

export function OnboardingScreen({ onStart }: { onStart: () => void }) {
  const { isTabletUp } = useResponsiveLayout();
  return (
    <SafeAreaView style={[styles.screen, isTabletUp && styles.screenWide]}>
      <Text style={[styles.spark, styles.sparkLeft]}>✦</Text>
      <Text style={[styles.spark, styles.sparkRight]}>✦</Text>
      <View style={[styles.layout, isTabletUp && styles.layoutWide]}>
        <View style={styles.copyColumn}>
          <View style={[styles.titleBlock, isTabletUp && styles.titleBlockWide]}>
            <Text style={[styles.title, isTabletUp && styles.titleWide]}>My{`\n`}Dictionary</Text>
            <Text style={styles.subtitle}>Your words, your world.</Text>
          </View>
          <Text style={[styles.body, isTabletUp && styles.bodyWide]}>Search any word. We’ll show the meaning and save it alphabetically in your personal wordbook.</Text>
          <PrimaryButton title="Start with your first word" onPress={onStart} />
        </View>
        <View style={[styles.owlStage, isTabletUp && styles.owlStageWide]}><OwlMascot size={isTabletUp ? 280 : 205} variant="hero" /></View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  screenWide: { paddingHorizontal: 64 },
  layout: { alignItems: 'center' },
  layoutWide: { width: '100%', maxWidth: 980, flexDirection: 'row', justifyContent: 'center', gap: 72 },
  copyColumn: { alignItems: 'center', maxWidth: 430 },
  titleBlock: { alignItems: 'center', marginBottom: 22 },
  titleBlockWide: { alignItems: 'flex-start' },
  title: { fontFamily: typography.serif, color: '#5A301B', fontSize: 46, lineHeight: 50, fontWeight: '900', textAlign: 'center' },
  titleWide: { fontSize: 72, lineHeight: 76, textAlign: 'left' },
  subtitle: { color: '#5A301B', fontSize: 15, marginTop: 10 },
  owlStage: { width: 230, height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  owlStageWide: { width: 330, height: 320 },
  body: { color: colors.muted, textAlign: 'center', lineHeight: 23, fontSize: 14, marginBottom: 18 },
  bodyWide: { textAlign: 'left', fontSize: 17, lineHeight: 28, marginBottom: 24 },
  spark: { position: 'absolute', color: colors.yellow, fontSize: 22 },
  sparkLeft: { top: 86, left: 48 },
  sparkRight: { top: 86, right: 58 },
});
