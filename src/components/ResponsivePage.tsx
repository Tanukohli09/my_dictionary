import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { layout } from '../theme/breakpoints';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

export function ResponsivePage({ children, style, ...props }: ViewProps) {
  const { isTabletUp } = useResponsiveLayout();
  return (
    <View {...props} style={[styles.wrap, isTabletUp && styles.wide, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  wide: { maxWidth: layout.pageMaxWidth, alignSelf: 'center' },
});
