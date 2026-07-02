import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function AppContent() {
  const { colors, isNightMode } = useTheme();

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.documentElement.style.backgroundColor = colors.background;
    document.body.style.backgroundColor = colors.background;
    document.body.style.margin = '0';
    const root = document.getElementById('root');
    if (root) { root.style.minHeight = '100vh'; root.style.backgroundColor = colors.background; }
  }, [colors.background]);

  return (
    <SafeAreaProvider>
      <StatusBar style={isNightMode ? 'light' : 'dark'} backgroundColor={colors.page} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
