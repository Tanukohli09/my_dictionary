import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { radius } from '../theme/spacing';

export function PhoneFrame({ children }: ViewProps) {
  const { isTabletUp } = useResponsiveLayout();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  if (Platform.OS !== 'web' || !isTabletUp) return <View style={styles.mobileApp}>{children}</View>;

  return (
    <View style={styles.desktopCanvas}>
      <View style={styles.desktopApp}>{children}</View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  mobileApp: { flex: 1, backgroundColor: colors.page },
  desktopCanvas: { flex: 1, backgroundColor: colors.background, padding: 24 },
  desktopApp: {
    flex: 1,
    width: '100%',
    maxWidth: 1440,
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.page,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
});
