import { Linking } from 'react-native';

/**
 * Open only secure remote pronunciation URLs and report whether the handoff
 * to the platform audio/browser handler succeeded.
 */
export async function openPronunciationAudio(url: string): Promise<boolean> {
  if (!url.toLowerCase().startsWith('https://')) return false;

  try {
    if (!(await Linking.canOpenURL(url))) return false;
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
