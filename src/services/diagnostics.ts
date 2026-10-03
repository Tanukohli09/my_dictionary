import { Platform, Share } from 'react-native';
import { getCloudSyncSnapshot } from './cloudSync';
import { getDictionaryLookupDiagnostics } from './dictionaryApi';

function runtimeEnvironment() {
  return typeof process !== 'undefined' ? process.env.NODE_ENV || 'unknown' : 'unknown';
}

export function buildSupportDiagnostics() {
  return JSON.stringify({
    app: 'My Dictionary',
    cloudSync: getCloudSyncSnapshot().status,
    dictionaryLookup: getDictionaryLookupDiagnostics(),
    environment: runtimeEnvironment(),
    generatedAt: new Date().toISOString(),
    platform: Platform.OS,
    platformVersion: String(Platform.Version ?? 'unknown'),
  }, null, 2);
}

export async function shareSupportDiagnostics(): Promise<'copied' | 'shared'> {
  const report = buildSupportDiagnostics();
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(report);
      return 'copied';
    }
    if (typeof window !== 'undefined') {
      window.prompt('Copy these privacy-safe diagnostics into your support report:', report);
      return 'copied';
    }
  }
  await Share.share({ message: report, title: 'My Dictionary diagnostics' });
  return 'shared';
}
