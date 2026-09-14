import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, type AppColors } from './index';

const THEME_KEY = '@app_theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: AppColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  colors: lightColors,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');

  // Load persisted preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(saved => {
      if (saved === 'light' || saved === 'dark') setMode(saved);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const value: ThemeContextValue = {
    mode,
    colors: mode === 'dark' ? darkColors : lightColors,
    isDark: mode === 'dark',
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
