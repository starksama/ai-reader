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

// Highlight colors with proper opacity for readability
// Format: { light: color, dark: color, sepia: color }
export const highlightColorMap: Record<Theme, Record<HighlightColor, string>> = {
  light: {
    yellow: 'rgba(253, 224, 71, 0.4)',  // yellow-300
    green: 'rgba(134, 239, 172, 0.4)',   // green-300
    blue: 'rgba(147, 197, 253, 0.4)',    // blue-300
    pink: 'rgba(249, 168, 212, 0.4)',    // pink-300
    orange: 'rgba(253, 186, 116, 0.4)',  // orange-300
  },
  dark: {
    yellow: 'rgba(253, 224, 71, 0.25)',  // Less opacity for dark mode
    green: 'rgba(134, 239, 172, 0.25)',
    blue: 'rgba(147, 197, 253, 0.25)',
    pink: 'rgba(249, 168, 212, 0.25)',
    orange: 'rgba(253, 186, 116, 0.25)',
  },
  sepia: {
    yellow: 'rgba(217, 169, 57, 0.35)',  // Warmer yellow for sepia
    green: 'rgba(101, 163, 103, 0.35)',  // Muted green
    blue: 'rgba(122, 158, 189, 0.35)',   // Muted blue
    pink: 'rgba(199, 139, 156, 0.35)',   // Muted pink
    orange: 'rgba(210, 150, 94, 0.35)',  // Warmer orange
  },
};

// Helper to get highlight color for current theme
export function getHighlightColor(theme: Theme, color: HighlightColor): string {
  return highlightColorMap[theme][color];
}
