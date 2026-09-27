import React from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResponsivePage } from '../components/ResponsivePage';
import { InfoKind } from '../navigation/navigationFlow';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const SUPPORT_URL = 'https://github.com/Tanukohli09/my_dictionary/issues';
const REPOSITORY_URL = 'https://github.com/Tanukohli09/my_dictionary';
const DATAMUSE_URL = 'https://www.datamuse.com/api/';
const WIKTIONARY_URL = 'https://en.wiktionary.org/';

type InfoScreenProps = {
  kind: InfoKind;
  onBack: () => void;
};

export function InfoScreen({ kind, onBack }: InfoScreenProps) {
  const { isTabletUp } = useResponsiveLayout();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const privacy = kind === 'privacy';

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, isTabletUp && styles.contentWide]} showsVerticalScrollIndicator={false}>
        <ResponsivePage>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back to app" onPress={onBack} style={styles.backButton}>
              <Text style={styles.back}>‹</Text>
            </Pressable>
            <Text accessibilityRole="header" style={[styles.headerTitle, isTabletUp && styles.headerTitleWide]}>{privacy ? 'Privacy' : 'Support'}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={[styles.hero, isTabletUp && styles.heroWide]}>
            <Text style={styles.eyebrow}>My Dictionary</Text>
            <Text style={[styles.title, isTabletUp && styles.titleWide]}>{privacy ? 'Your data, clearly explained.' : 'Need a hand?'}</Text>
            <Text style={styles.intro}>
              {privacy
                ? 'My Dictionary is designed to keep your personal wordbook on your browser or device while using a small dictionary service for new lookups.'
                : 'Most questions can be solved with a fresh lookup or a local backup. If something is not working, we are happy to hear about it.'}
            </Text>
          </View>

          {privacy ? <PrivacyContent styles={styles} /> : <SupportContent styles={styles} />}
        </ResponsivePage>
      </ScrollView>
    </SafeAreaView>
  );
}

function PrivacyContent({ styles }: { styles: InfoStyles }) {
  return (
    <View style={styles.sections}>
      <InfoSection styles={styles} title="What stays on your device">
        <Text style={styles.body}>Saved words, notes, favourites, review history, theme choice, and onboarding state are stored locally in this browser or device. My Dictionary does not require an account or upload your personal wordbook for sync.</Text>
      </InfoSection>
      <InfoSection styles={styles} title="What happens when you search">
        <Text style={styles.body}>The word you submit is sent to the My Dictionary server so it can request a definition. The service uses Datamuse as its primary provider and Wiktionary as a fallback. Those providers and the hosting platform may process requests under their own terms.</Text>
      </InfoSection>
      <InfoSection styles={styles} title="Operational data">
        <Text style={styles.body}>The server keeps a short-lived definition cache and records operational events such as request IDs, provider, status, latency, and cache hits. The app does not intentionally store your saved words or personal notes on the server.</Text>
      </InfoSection>
      <InfoSection styles={styles} title="Your choices">
        <Text style={styles.body}>Use Export backup before changing devices, and use Clear saved data in Profile when you want to remove the local wordbook. Clearing browser site data or uninstalling the app also removes local storage.</Text>
      </InfoSection>
      <InfoSection styles={styles} title="Dictionary sources">
        <Text style={styles.body}>Definitions are supplied by the configured dictionary providers. Review their policies for current terms and attribution details.</Text>
        <ExternalLink styles={styles} label="Open Datamuse API information" url={DATAMUSE_URL} />
        <ExternalLink styles={styles} label="Open Wiktionary" url={WIKTIONARY_URL} />
      </InfoSection>
      <Text style={styles.lastUpdated}>Last reviewed: September 2026. This notice should be reviewed again before a public launch with a custom domain, analytics, accounts, or additional providers.</Text>
    </View>
  );
}

function SupportContent({ styles }: { styles: InfoStyles }) {
  return (
    <View style={styles.sections}>
      <InfoSection styles={styles} title="Before reporting a problem">
        <Text style={styles.body}>Try the word again after a short wait, especially if the service has been inactive. Confirm that your browser is online, then export a backup before clearing local data.</Text>
      </InfoSection>
      <InfoSection styles={styles} title="What to include">
        <Text style={styles.body}>Include your browser and device, the word that failed, the approximate time, and the message shown on screen. Do not include private notes, backup files, passwords, or API keys.</Text>
      </InfoSection>
      <InfoSection styles={styles} title="Report an issue">
        <Text style={styles.body}>Support is currently handled through the project issue tracker. Please search existing reports first, then open a new issue with the details above.</Text>
        <ExternalLink styles={styles} label="Open My Dictionary support on GitHub" url={SUPPORT_URL} />
      </InfoSection>
      <InfoSection styles={styles} title="About this release">
        <Text style={styles.body}>My Dictionary is a local-first vocabulary app. Saved data is kept on your device, while new word searches use the hosted dictionary service.</Text>
        <ExternalLink styles={styles} label="Open the My Dictionary repository" url={REPOSITORY_URL} />
      </InfoSection>
    </View>
  );
}

function InfoSection({ title, children, styles }: { title: string; children: React.ReactNode; styles: InfoStyles }) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ExternalLink({ label, url, styles }: { label: string; url: string; styles: InfoStyles }) {
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={label} onPress={() => { void Linking.openURL(url); }} style={styles.linkButton}>
      <Text style={styles.link}>{label} ↗</Text>
    </Pressable>
  );
}

type InfoStyles = ReturnType<typeof createStyles>;

const createStyles = (colors: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },
  contentWide: { paddingHorizontal: 48, paddingTop: 30, paddingBottom: 64 },
  header: { flexDirection: 'row', alignItems: 'center', minHeight: 48, marginBottom: 26 },
  backButton: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  back: { color: colors.text, fontSize: 31, lineHeight: 36 },
  headerTitle: { flex: 1, color: colors.text, fontFamily: typography.serif, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  headerTitleWide: { fontSize: 32 },
  headerSpacer: { width: 44, height: 44 },
  hero: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.cardLight, padding: 22, marginBottom: 18 },
  heroWide: { padding: 30, maxWidth: 900, alignSelf: 'center', width: '100%' },
  eyebrow: { color: colors.greenDark, fontSize: 12, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  title: { color: colors.text, fontFamily: typography.serif, fontSize: 28, lineHeight: 34, fontWeight: '900', marginBottom: 10 },
  titleWide: { fontSize: 40, lineHeight: 46 },
  intro: { color: colors.muted, fontSize: 15, lineHeight: 24 },
  sections: { gap: 14, maxWidth: 900, alignSelf: 'center', width: '100%' },
  section: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.cardLight, padding: 20, gap: 10 },
  sectionTitle: { color: colors.text, fontFamily: typography.serif, fontSize: 20, lineHeight: 26, fontWeight: '900' },
  body: { color: colors.muted, fontSize: 14, lineHeight: 23 },
  linkButton: { alignSelf: 'flex-start', paddingVertical: 4 },
  link: { color: colors.greenDark, fontSize: 14, lineHeight: 22, fontWeight: '900' },
  lastUpdated: { color: colors.faint, fontSize: 12, lineHeight: 19, marginTop: 4 },
});
