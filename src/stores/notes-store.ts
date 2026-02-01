import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

export interface Thread {
  id: string;
  paragraphIndex: number;
  selectedText?: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

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
  threads: Record<number, Thread>; // keyed by paragraphIndex
  createdAt: number;
  updatedAt: number;
}

interface NotesState {
  articles: Record<string, ArticleNotes>;
  
  // Thread operations
  getThread: (url: string, paragraphIndex: number) => Thread | undefined;
  createThread: (url: string, title: string, paragraphIndex: number, selectedText?: string) => Thread;
  addMessageToThread: (url: string, paragraphIndex: number, message: Omit<Message, 'id' | 'createdAt'>) => void;
  
  // Legacy note operations (for export)
  addNote: (url: string, title: string, note: Omit<Note, 'id' | 'createdAt'>) => void;
  getArticleNotes: (url: string) => ArticleNotes | undefined;
  exportNotes: (url: string) => string;
  clearArticleNotes: (url: string) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      articles: {},

      getThread: (url, paragraphIndex) => {
        const article = get().articles[url];
        return article?.threads?.[paragraphIndex];
      },

      createThread: (url, title, paragraphIndex, selectedText) => {
        const now = Date.now();
        const thread: Thread = {
          id: `thread-${now}`,
          paragraphIndex,
          selectedText,
          messages: [],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => {
          const existing = state.articles[url];
          if (existing) {
            return {
              articles: {
                ...state.articles,
                [url]: {
                  ...existing,
                  threads: {
                    ...existing.threads,
                    [paragraphIndex]: thread,
                  },
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
                notes: [],
                threads: { [paragraphIndex]: thread },
                createdAt: now,
                updatedAt: now,
              },
            },
          };
        });

        return thread;
      },

      addMessageToThread: (url, paragraphIndex, message) => {
        const now = Date.now();
        const newMessage: Message = {
          ...message,
          id: `msg-${now}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: now,
        };

        set((state) => {
          const article = state.articles[url];
          if (!article?.threads?.[paragraphIndex]) return state;

          return {
            articles: {
              ...state.articles,
              [url]: {
                ...article,
                threads: {
                  ...article.threads,
                  [paragraphIndex]: {
                    ...article.threads[paragraphIndex],
                    messages: [...article.threads[paragraphIndex].messages, newMessage],
                    updatedAt: now,
                  },
                },
                updatedAt: now,
              },
            },
          };
        });
      },

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
                threads: {},
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
        if (!article) return '';

        const lines: string[] = [
          `# ${article.title}`,
          '',
          `> Source: ${article.url}`,
          `> Exported: ${new Date().toISOString()}`,
          '',
          '---',
          '',
        ];

        // Export threads
        const threadEntries = Object.values(article.threads || {}).sort((a, b) => a.paragraphIndex - b.paragraphIndex);
        
        threadEntries.forEach((thread) => {
          if (thread.messages.length === 0) return;
          
          lines.push(`## Paragraph ${thread.paragraphIndex + 1}`);
          if (thread.selectedText) {
            lines.push('');
            lines.push(`> "${thread.selectedText}"`);
          }
          lines.push('');

          thread.messages.forEach((msg) => {
            if (msg.role === 'user') {
              lines.push(`**Q:** ${msg.content}`);
            } else {
              lines.push(`**A:** ${msg.content}`);
            }
            lines.push('');
          });

          lines.push('---');
          lines.push('');
        });

        // Also export legacy notes
        article.notes.forEach((note, index) => {
          lines.push(`## Note ${index + 1}`);
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
