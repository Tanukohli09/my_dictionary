import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const stamp = require('../assets/stamp-alpha.png');

export function SavedStamp({ message }: { message: string }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const scale = useRef(new Animated.Value(0.85)).current;
  useEffect(() => { Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start(); }, [scale]);
  return (
    <View style={styles.wrap}>
      <Text style={styles.msg}>{message.replace('Added to your Dictionary under ', 'Added to your Dictionary\nunder ')}</Text>
      <Animated.View style={[styles.stamp, { transform: [{ rotate: '-5deg' }, { scale }] }]}>
        <Image source={stamp} resizeMode="contain" style={styles.stampImage} />
      </Animated.View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  wrap: { backgroundColor: colors.card, borderColor: colors.yellow, borderWidth: 1, borderRadius: 10, paddingVertical: 16, paddingLeft: 16, paddingRight: 92, marginTop: 18, minHeight: 86, justifyContent: 'center', overflow: 'hidden' },
  msg: { color: colors.text, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  stamp: { position: 'absolute', right: 14, top: 15, width: 54, height: 54, alignItems: 'center', justifyContent: 'center' },
  stampImage: { width: '100%', height: '100%' },
});
