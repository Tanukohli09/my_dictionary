import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function LoadingState({ text = 'Turning the dictionary pages...' }: { text?: string }) {
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => { Animated.loop(Animated.sequence([Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }), Animated.timing(pulse, { toValue: .5, duration: 650, useNativeDriver: true })])).start(); }, [pulse]);
  return <View style={styles.wrap}><Animated.Text style={[styles.book, { opacity: pulse }]}>📖</Animated.Text><Text style={styles.text}>{text}</Text></View>;
}
const styles = StyleSheet.create({ wrap: { alignItems: 'center', padding: 20 }, book: { fontSize: 42 }, text: { color: colors.muted, marginTop: 8 } });
