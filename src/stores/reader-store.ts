import { create } from 'zustand';
import type { ParsedArticle } from '@/utils/parse-content';

interface ReaderState {
  // Pasted article (stored in memory, not fetched)
  pastedArticle: ParsedArticle | null;
  
  // Loading state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setArticle: (article: ParsedArticle) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearPastedArticle: () => void;
  reset: () => void;
}

export const useReaderStore = create<ReaderState>((set) => ({
  pastedArticle: null,
  isLoading: false,
  error: null,

  setArticle: (article) => set({ pastedArticle: article, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clearPastedArticle: () => set({ pastedArticle: null }),
  reset: () => set({ pastedArticle: null, isLoading: false, error: null }),
}));
