import React, { useState } from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResponsivePage } from '../components/ResponsivePage';
import { InfoKind } from '../navigation/navigationFlow';
import { shareSupportDiagnostics } from '../services/diagnostics';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const SUPPORT_URL = 'https://github.com/Tanukohli09/my_dictionary/issues';
const REPOSITORY_URL = 'https://github.com/Tanukohli09/my_dictionary';
const PRIVACY_POLICY_URL = 'https://tanukohli09.github.io/my_dictionary/privacy-policy.html';
const ACCOUNT_DELETION_URL = 'https://tanukohli09.github.io/my_dictionary/delete-account.html';
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
        <Text style={styles.body}>Saved words, notes, favourites, review history, theme choice, and onboarding state are stored locally in this browser or device. An optional Google account can be used for sign-in; in configured releases, cloud synchronization links this wordbook to the authenticated user.</Text>
      </InfoSection>
      <InfoSection styles={styles} title="Optional Google sign-in">
        <Text style={styles.body}>When enabled, Google and the authentication provider process the account identity details needed to create and maintain your session, such as your email address and display name. You can continue using the local dictionary without signing in.</Text>
      </InfoSection>
      <InfoSection styles={styles} title="What happens when you search">
        <Text style={styles.body}>The word you submit is sent to the dictionary endpoint configured for this build. The hosted My Dictionary service uses Datamuse as its primary provider and Wiktionary as a fallback; builds without a hosted endpoint can use the Free Dictionary API. The selected provider and hosting platform may process requests under their own terms.</Text>
      </InfoSection>
      <InfoSection styles={styles} title="Operational data">
        <Text style={styles.body}>The dictionary service keeps a short-lived definition cache and records operational events such as request IDs, provider, status, latency, and cache hits. In configured account-sync releases, the Supabase database also stores user-scoped saved words, notes, and review history for synchronization.</Text>
      </InfoSection>
      <InfoSection styles={styles} title="Your choices">
        <Text style={styles.body}>Use Export backup before changing devices, and use Clear saved data in Profile when you want to remove the local wordbook. If you sign in, you can sign out from Profile or request account deletion in the app. Clearing browser site data or uninstalling the app also removes local storage.</Text>
        <ExternalLink styles={styles} label="Read the full Privacy Policy" url={PRIVACY_POLICY_URL} />
        <ExternalLink styles={styles} label="Request account and cloud-data deletion" url={ACCOUNT_DELETION_URL} />
      </InfoSection>
      <InfoSection styles={styles} title="Dictionary sources">
        <Text style={styles.body}>Definitions are supplied by the configured dictionary providers. Review their policies for current terms and attribution details.</Text>
        <ExternalLink styles={styles} label="Open Datamuse API information" url={DATAMUSE_URL} />
        <ExternalLink styles={styles} label="Open Wiktionary" url={WIKTIONARY_URL} />
      </InfoSection>
      <Text style={styles.lastUpdated}>Last reviewed: October 2026. Review this notice whenever the app's providers, account-sync behavior, or data handling change.</Text>
    </View>
  );
}

function SupportContent({ styles }: { styles: InfoStyles }) {
  const [diagnosticStatus, setDiagnosticStatus] = useState<string | null>(null);

  async function shareDiagnostics() {
    try {
      const result = await shareSupportDiagnostics();
      setDiagnosticStatus(result === 'copied' ? 'Privacy-safe diagnostics copied.' : 'Privacy-safe diagnostics are ready to share.');
    } catch {
      setDiagnosticStatus('Could not prepare diagnostics. Please include your device and the visible error instead.');
    }
  }

  return (
    <View style={styles.sections}>
      <InfoSection styles={styles} title="Before reporting a problem">
        <Text style={styles.body}>Try the word again after a short wait, especially if the service has been inactive. Confirm that your browser is online, then export a backup before clearing local data.</Text>
      </InfoSection>
      <InfoSection styles={styles} title="What to include">
        <Text style={styles.body}>Include your browser and device, the word that failed, the approximate time, and the message shown on screen. Do not include private notes, backup files, passwords, or API keys.</Text>
      </InfoSection>
      <InfoSection styles={styles} title="Technical diagnostics">
        <Text style={styles.body}>Use this only when support asks for technical details. The report contains app runtime, cloud-sync status, and the latest dictionary request ID/provider; it does not include saved words, notes, backups, tokens, or account details.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Copy technical diagnostics" onPress={() => { void shareDiagnostics(); }} style={styles.diagnosticsButton}>
          <Text style={styles.link}>Copy technical diagnostics</Text>
        </Pressable>
        {!!diagnosticStatus && <Text accessibilityLiveRegion="polite" style={styles.diagnosticStatus}>{diagnosticStatus}</Text>}
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
  diagnosticsButton: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  link: { color: colors.greenDark, fontSize: 14, lineHeight: 22, fontWeight: '900' },
  diagnosticStatus: { color: colors.muted, fontSize: 12, lineHeight: 19 },
  lastUpdated: { color: colors.faint, fontSize: 12, lineHeight: 19, marginTop: 4 },
});
