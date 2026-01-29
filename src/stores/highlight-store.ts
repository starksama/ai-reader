import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Highlight {
  id: string;
  paragraphIndex: number;
  text: string;
  startOffset: number;
  endOffset: number;
  createdAt: number;
}

interface HighlightState {
  highlights: Record<string, Highlight[]>; // keyed by article URL
  addHighlight: (url: string, highlight: Omit<Highlight, 'id' | 'createdAt'>) => void;
  removeHighlight: (url: string, highlightId: string) => void;
  getHighlights: (url: string) => Highlight[];
  clearHighlights: (url: string) => void;
}

export const useHighlightStore = create<HighlightState>()(
  persist(
    (set, get) => ({
      highlights: {},

      addHighlight: (url, highlight) => {
        const id = `hl-${Date.now()}`;
        const newHighlight: Highlight = {
          ...highlight,
          id,
          createdAt: Date.now(),
        };

        set((state) => ({
          highlights: {
            ...state.highlights,
            [url]: [...(state.highlights[url] || []), newHighlight],
          },
        }));
      },

      removeHighlight: (url, highlightId) => {
        set((state) => ({
          highlights: {
            ...state.highlights,
            [url]: (state.highlights[url] || []).filter((h) => h.id !== highlightId),
          },
        }));
      },

      getHighlights: (url) => get().highlights[url] || [],

      clearHighlights: (url) => {
        set((state) => {
          const { [url]: _, ...rest } = state.highlights;
          return { highlights: rest };
        });
      },
    }),
    {
      name: 'ai-reader-highlights',
    }
  )
);
