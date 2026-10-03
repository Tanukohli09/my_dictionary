import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { OwlMascot } from './OwlMascot';
import { PrimaryButton } from './PrimaryButton';

export function ErrorState({ message = 'We could not find this word. Check the spelling and try again.', onRetry, retryLabel = 'Try again' }: { message?: string; onRetry?: () => void; retryLabel?: string }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return <View style={styles.wrap}><OwlMascot size={64} /><Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.text}>{message}</Text>{onRetry && <PrimaryButton title={retryLabel} onPress={onRetry} variant="ghost" />}</View>;
}
const createStyles = (colors: AppColors) => StyleSheet.create({ wrap: { alignItems: 'center', padding: 18, gap: 10 }, text: { color: colors.error, textAlign: 'center', lineHeight: 21, maxWidth: 500 } });
