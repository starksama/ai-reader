import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'sepia';
export type FontSize = 'small' | 'medium' | 'large';
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange';

interface ThemeState {
  theme: Theme;
  fontSize: FontSize;
  highlightColor: HighlightColor;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  setHighlightColor: (color: HighlightColor) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 'medium',
      highlightColor: 'yellow',
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setHighlightColor: (highlightColor) => set({ highlightColor }),
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

export const highlightColorMap: Record<HighlightColor, string> = {
  yellow: '#fef08a',
  green: '#bbf7d0',
  blue: '#bfdbfe',
  pink: '#fbcfe8',
  orange: '#fed7aa',
};
