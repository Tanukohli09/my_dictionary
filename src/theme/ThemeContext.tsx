import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { AppColors, darkColors, lightColors } from './colors';

export type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  colors: AppColors;
  mode: ThemeMode;
  isNightMode: boolean;
  toggleNightMode: () => void;
};

const THEME_STORAGE_KEY = 'my-dictionary-theme-mode';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') setMode(stored);
    })();
  }, []);

  const toggleNightMode = () => {
    setMode((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => undefined);
      return next;
    });
  };

  const value = useMemo<ThemeContextValue>(() => ({
    colors: mode === 'dark' ? darkColors : lightColors,
    mode,
    isNightMode: mode === 'dark',
    toggleNightMode,
  }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
