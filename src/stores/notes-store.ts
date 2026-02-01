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

export interface ArticleNotes {
  url: string;
  title: string;
  threads: Record<number, Thread>;
  createdAt: number;
  updatedAt: number;
}

interface NotesState {
  articles: Record<string, ArticleNotes>;
  
  // Thread operations
  addMessageToThread: (url: string, title: string, paragraphIndex: number, message: Omit<Message, 'id' | 'createdAt'>, selectedText?: string) => void;
  
  // Read operations
  getArticleNotes: (url: string) => ArticleNotes | undefined;
  hasThreads: (url: string) => boolean;
  
  // Export
  exportNotes: (url: string) => string;
  
  // Cleanup
  clearArticleNotes: (url: string) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      articles: {},

      // Combined: creates thread if needed + adds message (atomic operation)
      addMessageToThread: (url, title, paragraphIndex, message, selectedText) => {
        const now = Date.now();
        const newMessage: Message = {
          ...message,
          id: `msg-${now}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: now,
        };

        set((state) => {
          const existingArticle = state.articles[url];
          const existingThread = existingArticle?.threads?.[paragraphIndex];

          // If thread exists, just add the message
          if (existingThread) {
            return {
              articles: {
                ...state.articles,
                [url]: {
                  ...existingArticle,
                  threads: {
                    ...existingArticle.threads,
                    [paragraphIndex]: {
                      ...existingThread,
                      messages: [...existingThread.messages, newMessage],
                      updatedAt: now,
                    },
                  },
                  updatedAt: now,
                },
              },
            };
          }

          // Create new thread with the message
          const newThread: Thread = {
            id: `thread-${now}`,
            paragraphIndex,
            selectedText,
            messages: [newMessage],
            createdAt: now,
            updatedAt: now,
          };

          // If article exists, add thread to it
          if (existingArticle) {
            return {
              articles: {
                ...state.articles,
                [url]: {
                  ...existingArticle,
                  threads: {
                    ...existingArticle.threads,
                    [paragraphIndex]: newThread,
                  },
                  updatedAt: now,
                },
              },
            };
          }

          // Create new article with thread
          return {
            articles: {
              ...state.articles,
              [url]: {
                url,
                title,
                threads: { [paragraphIndex]: newThread },
                createdAt: now,
                updatedAt: now,
              },
            },
          };
        });
      },

      getArticleNotes: (url) => get().articles[url],
      
      hasThreads: (url) => {
        const article = get().articles[url];
        return article ? Object.keys(article.threads).length > 0 : false;
      },

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

        // Export threads sorted by paragraph index
        const threadEntries = Object.values(article.threads || {})
          .filter(t => t.messages.length > 0)
          .sort((a, b) => a.paragraphIndex - b.paragraphIndex);
        
        if (threadEntries.length === 0) {
          lines.push('*No notes yet*');
          return lines.join('\n');
        }

        threadEntries.forEach((thread) => {
          lines.push(`## Paragraph ${thread.paragraphIndex + 1}`);
          
          if (thread.selectedText) {
            lines.push('');
            lines.push(`> "${thread.selectedText}"`);
          }
          lines.push('');

          // Group messages into Q&A pairs
          for (let i = 0; i < thread.messages.length; i += 2) {
            const userMsg = thread.messages[i];
            const assistantMsg = thread.messages[i + 1];
            
            if (userMsg?.role === 'user') {
              lines.push(`**Q:** ${userMsg.content}`);
              lines.push('');
            }
            if (assistantMsg?.role === 'assistant') {
              lines.push(`**A:** ${assistantMsg.content}`);
              lines.push('');
            }
          }

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
      version: 2, // Bump version to handle migration
      migrate: (persistedState: unknown, version: number) => {
        if (version === 1) {
          // Migrate from v1 (with notes array) to v2 (threads only)
          const state = persistedState as { articles: Record<string, { notes?: unknown[]; threads?: Record<number, Thread> }> };
          for (const key in state.articles) {
            if (state.articles[key]?.notes) {
              delete (state.articles[key] as { notes?: unknown[] }).notes;
            }
          }
        }
        return persistedState as NotesState;
      },
    }
  )
);
