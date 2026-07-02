import React from 'react';
import { View, ViewProps } from 'react-native';
import { colors } from '../theme/colors';

export function AppShell(props: ViewProps) {
  return <View {...props} style={[{ flex: 1, backgroundColor: colors.background }, props.style]} />;
}
