import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { OwlMascot } from './OwlMascot';

export function ErrorState({ message = 'We could not find this word. Check the spelling and try again.' }: { message?: string }) {
  return <View style={styles.wrap}><OwlMascot size={64} /><Text style={styles.text}>{message}</Text></View>;
}
const styles = StyleSheet.create({ wrap: { alignItems: 'center', padding: 18, gap: 10 }, text: { color: colors.error, textAlign: 'center', lineHeight: 21 } });
