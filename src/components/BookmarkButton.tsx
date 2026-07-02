import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

export function BookmarkButton({ active, onPress }: { active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.button, active && styles.active]}><Text style={styles.text}>{active ? '♥' : '♡'}</Text></Pressable>;
}
export function BookmarkRibbon() { return <Text style={styles.ribbon}>▾</Text>; }
const styles = StyleSheet.create({
  button: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  active: { backgroundColor: 'transparent' },
  text: { color: colors.bookmark, fontSize: 22 },
  ribbon: { position: 'absolute', right: 8, top: -2, color: colors.bookmark, fontSize: 42 },
});
