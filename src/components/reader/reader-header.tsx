'use client';

import Link from 'next/link';
import { Sun, Moon, BookOpen } from 'lucide-react';
import { useThemeStore, type Theme } from '@/stores/theme-store';
import { ShareButton } from './share-button';

interface ReaderHeaderProps {
  articleUrl?: string;
}

export function ReaderHeader({ articleUrl }: ReaderHeaderProps) {
  const { theme, setTheme } = useThemeStore();
  
  const themes: { key: Theme; icon: React.ReactNode }[] = [
    { key: 'light', icon: <Sun size={14} /> },
    { key: 'dark', icon: <Moon size={14} /> },
    { key: 'sepia', icon: <BookOpen size={14} /> },
  ];

  return (
    <header 
      className="sticky top-0 z-30 border-b"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="reader-container py-3 flex items-center justify-between">
        {/* Home link */}
        <Link 
          href="/"
          className="flex items-center gap-2 font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-primary)' }}
        >
          <span className="hidden sm:inline">AI Reader</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {articleUrl && <ShareButton url={articleUrl} title="Article" />}
          
          {/* Theme switcher */}
          <div className="flex items-center gap-px rounded-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {themes.map((t) => (
              <button
                key={t.key}
                onClick={() => setTheme(t.key)}
                className="w-8 h-8 flex items-center justify-center transition-all"
                style={{
                  backgroundColor: theme === t.key ? 'var(--bg-secondary)' : 'transparent',
                  color: theme === t.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
                title={`${t.key} mode`}
              >
                {t.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
