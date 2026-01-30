import { create } from 'zustand';
import type { ParsedArticle } from '@/utils/parse-content';

const STORAGE_KEY = 'mull-reader-article';

interface ReaderState {
  // Article (stored temporarily for navigation)
  pastedArticle: ParsedArticle | null;
  
  // Loading state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setArticle: (article: ParsedArticle) => void;
  loadArticle: () => ParsedArticle | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearPastedArticle: () => void;
  reset: () => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  pastedArticle: null,
  isLoading: false,
  error: null,

  setArticle: (article) => {
    // Write to sessionStorage FIRST (sync), then update state
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(article));
      } catch (e) {
        console.error('Failed to save article to sessionStorage:', e);
      }
    }
    set({ pastedArticle: article, error: null });
  },
  
  loadArticle: () => {
    // Try to load from sessionStorage if not in state
    const current = get().pastedArticle;
    if (current) return current;
    
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const article = JSON.parse(stored) as ParsedArticle;
          set({ pastedArticle: article });
          return article;
        }
      } catch (e) {
        console.error('Failed to load article from sessionStorage:', e);
      }
    }
    return null;
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  
  clearPastedArticle: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    set({ pastedArticle: null });
  },
  
  reset: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    set({ pastedArticle: null, isLoading: false, error: null });
  },
}));
