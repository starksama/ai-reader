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
      highlightColor: 'green',
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

// Highlight colors - sophisticated, muted tones inspired by Greptile's aesthetic
// Less "highlighter" bright, more elegant and readable
export const highlightColorMap: Record<Theme, Record<HighlightColor, string>> = {
  light: {
    // Muted, sophisticated tones with good readability
    yellow: 'rgba(234, 197, 95, 0.35)',   // Warm gold, not neon yellow
    green: 'rgba(76, 140, 87, 0.28)',     // Sage/forest green like Greptile
    blue: 'rgba(90, 145, 185, 0.30)',     // Muted steel blue
    pink: 'rgba(195, 125, 145, 0.30)',    // Dusty rose
    orange: 'rgba(210, 140, 85, 0.32)',   // Warm terracotta
  },
  dark: {
    // Slightly more saturated for dark backgrounds
    yellow: 'rgba(234, 197, 95, 0.25)',   // Warm gold
    green: 'rgba(86, 160, 100, 0.22)',    // Sage green
    blue: 'rgba(100, 155, 195, 0.22)',    // Steel blue
    pink: 'rgba(200, 135, 155, 0.22)',    // Dusty rose
    orange: 'rgba(215, 150, 95, 0.24)',   // Terracotta
  },
  sepia: {
    // Warmer, earth tones that complement sepia
    yellow: 'rgba(195, 165, 75, 0.32)',   // Antique gold
    green: 'rgba(95, 130, 85, 0.28)',     // Olive sage
    blue: 'rgba(110, 135, 155, 0.28)',    // Slate blue
    pink: 'rgba(175, 120, 130, 0.28)',    // Mauve
    orange: 'rgba(185, 130, 80, 0.30)',   // Burnt sienna
  },
};

// Helper to get highlight color for current theme
export function getHighlightColor(theme: Theme, color: HighlightColor): string {
  return highlightColorMap[theme][color];
}
