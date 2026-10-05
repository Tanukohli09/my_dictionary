import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getCloudSyncSnapshot, subscribeCloudSync } from '../services/cloudSync';
import type { CloudSyncSnapshot } from '../services/cloudSync';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { PrimaryButton } from './PrimaryButton';

export function AccountCard({ compact = false }: { compact?: boolean }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { deleteAccount, error, isBusy, isConfigured, isLoading, signInWithGoogle, signOut, user } = useAuth();
  const [sync, setSync] = useState<CloudSyncSnapshot>(getCloudSyncSnapshot());
  const displayName = String(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Google account');

  useEffect(() => subscribeCloudSync(setSync), []);

  const syncMessage = sync.status === 'syncing'
    ? 'Syncing your local dictionary…'
    : sync.status === 'error'
      ? 'Your local data is safe. Cloud sync will retry when the connection is available.'
      : 'Your saved words and review history sync when you are online.';

  async function requestDeleteAccount() {
    const message = 'This permanently deletes your My Dictionary account, synchronized words, notes, and review history. Local data on this device will also be removed. Your Google account remains active. Export a backup first if you need one.';
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm(`Delete your account?\n\n${message}`)) await deleteAccount();
      return;
    }
    await new Promise<void>((resolve) => {
      Alert.alert('Delete account?', message, [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve() },
        { text: 'Delete account', style: 'destructive', onPress: () => { void deleteAccount().finally(resolve); } },
      ], { cancelable: true, onDismiss: resolve });
    });
  }

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <Text style={styles.eyebrow}>Account</Text>
      {isLoading ? <Text style={styles.description}>Checking your account…</Text> : user ? (
        <>
          <Text style={styles.title}>Signed in</Text>
          <Text style={styles.description}>{displayName}</Text>
          <Text style={styles.hint}>{syncMessage}</Text>
          <PrimaryButton disabled={isBusy} busy={isBusy} title={isBusy ? 'Signing out…' : 'Sign out'} onPress={signOut} variant="ghost" accessibilityHint="End your current Google session on this device." />
          <Text style={styles.deleteHint}>Deleting your account removes synchronized data permanently.</Text>
          <PrimaryButton disabled={isBusy} busy={isBusy} title={isBusy ? 'Working…' : 'Delete account'} onPress={requestDeleteAccount} variant="danger" accessibilityHint="Permanently delete your account and synchronized data." />
        </>
      ) : isConfigured ? (
        <>
          <Text style={styles.title}>Save your progress with Google</Text>
          <Text style={styles.description}>Sign in once to prepare your account for secure sync across devices.</Text>
          <PrimaryButton disabled={isBusy} busy={isBusy} title={isBusy ? 'Opening Google…' : 'Continue with Google'} onPress={signInWithGoogle} accessibilityHint="Open Google sign-in to sync your dictionary across devices." />
        </>
      ) : (
        <>
          <Text style={styles.title}>Local-first account access</Text>
          <Text style={styles.description}>You can use the dictionary without an account. Google sign-in will appear when authentication is configured for this release.</Text>
        </>
      )}
      {!!error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  card: { marginTop: 24, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.cardLight, padding: 16, gap: 9 },
  cardCompact: { marginTop: 18, width: '100%', maxWidth: 430 },
  eyebrow: { color: colors.greenDark, fontSize: 11, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: colors.text, fontFamily: typography.serif, fontSize: 20, lineHeight: 25, fontWeight: '900' },
  description: { color: colors.muted, fontSize: 12, lineHeight: 19 },
  hint: { color: colors.faint, fontSize: 11, lineHeight: 17 },
  error: { color: colors.error, fontSize: 12, lineHeight: 18 },
  deleteHint: { color: colors.muted, fontSize: 11, lineHeight: 16 },
});
