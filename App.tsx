import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.documentElement.style.backgroundColor = '#F7ECD9';
    document.body.style.backgroundColor = '#F7ECD9';
    document.body.style.margin = '0';
    const root = document.getElementById('root');
    if (root) { root.style.minHeight = '100vh'; root.style.backgroundColor = '#F7ECD9'; }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#FFF7E8" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
