import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function AppShell(props: ViewProps) {
  const { colors } = useTheme();
  return <View {...props} style={[{ flex: 1, backgroundColor: colors.background }, props.style]} />;
}
