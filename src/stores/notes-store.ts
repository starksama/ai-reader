import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Note {
  id: string;
  paragraphIndex: number;
  paragraphText: string;
  question: string;
  answer: string;
  createdAt: number;
}

export interface ArticleNotes {
  url: string;
  title: string;
  notes: Note[];
  createdAt: number;
  updatedAt: number;
}

interface NotesState {
  articles: Record<string, ArticleNotes>;
  addNote: (url: string, title: string, note: Omit<Note, 'id' | 'createdAt'>) => void;
  getArticleNotes: (url: string) => ArticleNotes | undefined;
  exportNotes: (url: string) => string;
  clearArticleNotes: (url: string) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      articles: {},

      addNote: (url, title, note) => {
        const now = Date.now();
        const newNote: Note = {
          ...note,
          id: `note-${now}`,
          createdAt: now,
        };

        set((state) => {
          const existing = state.articles[url];
          if (existing) {
            return {
              articles: {
                ...state.articles,
                [url]: {
                  ...existing,
                  notes: [...existing.notes, newNote],
                  updatedAt: now,
                },
              },
            };
          }
          return {
            articles: {
              ...state.articles,
              [url]: {
                url,
                title,
                notes: [newNote],
                createdAt: now,
                updatedAt: now,
              },
            },
          };
        });
      },

      getArticleNotes: (url) => get().articles[url],

      exportNotes: (url) => {
        const article = get().articles[url];
        if (!article || article.notes.length === 0) {
          return '';
        }

        const lines: string[] = [
          `# ${article.title}`,
          '',
          `> Source: ${article.url}`,
          `> Exported: ${new Date().toISOString()}`,
          '',
          '---',
          '',
        ];

        article.notes.forEach((note, index) => {
          lines.push(`## Highlight ${index + 1}`);
          lines.push('');
          lines.push(`> ${note.paragraphText}`);
          lines.push('');
          lines.push(`**Q:** ${note.question}`);
          lines.push('');
          lines.push(`**A:** ${note.answer}`);
          lines.push('');
          lines.push('---');
          lines.push('');
        });

        return lines.join('\n');
      },

      clearArticleNotes: (url) => {
        set((state) => {
          const newArticles = { ...state.articles };
          delete newArticles[url];
          return { articles: newArticles };
        });
      },
    }),
    {
      name: 'mull-notes',
    }
  )
);
