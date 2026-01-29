import { create } from 'zustand';

export interface Paragraph {
  id: string;
  index: number;
  text: string;
  hasHighlight: boolean;
}

export interface Article {
  url?: string;
  title: string;
  content: string;
  paragraphs: Paragraph[];
  readProgress: number;
}

interface ReaderState {
  article: Article | null;
  isLoading: boolean;
  error: string | null;
  setArticle: (article: Article) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateProgress: (progress: number) => void;
  markParagraphHighlighted: (index: number) => void;
  reset: () => void;
}

export const useReaderStore = create<ReaderState>((set) => ({
  article: null,
  isLoading: false,
  error: null,

  setArticle: (article) => set({ article, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  
  updateProgress: (progress) =>
    set((state) => ({
      article: state.article
        ? { ...state.article, readProgress: progress }
        : null,
    })),

  markParagraphHighlighted: (index) =>
    set((state) => ({
      article: state.article
        ? {
            ...state.article,
            paragraphs: state.article.paragraphs.map((p) =>
              p.index === index ? { ...p, hasHighlight: true } : p
            ),
          }
        : null,
    })),

  reset: () => set({ article: null, isLoading: false, error: null }),
}));
