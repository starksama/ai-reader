'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'sepia');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}
