import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'sepia';
export type FontSize = 'small' | 'medium' | 'large';

interface ThemeState {
  theme: Theme;
  fontSize: FontSize;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 'medium',
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    {
      name: 'mull-theme',
    }
  )
);

export const fontSizeMap: Record<FontSize, { base: number; mobile: number }> = {
  small: { base: 16, mobile: 15 },
  medium: { base: 18, mobile: 17 },
  large: { base: 20, mobile: 19 },
};
