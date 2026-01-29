'use client';

import Link from 'next/link';
import { useThemeStore, type Theme } from '@/stores/theme-store';

export function ReaderHeader() {
  const { theme, setTheme } = useThemeStore();
  
  const themes: Theme[] = ['light', 'dark', 'sepia'];

  return (
    <header 
      className="sticky top-0 z-30 border-b"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Home link */}
        <Link 
          href="/"
          className="flex items-center gap-2 font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-primary)' }}
        >
          <span className="text-lg">📖</span>
          <span className="hidden sm:inline">AI Reader</span>
        </Link>

        {/* Theme switcher */}
        <div className="flex items-center gap-1">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`w-8 h-8 rounded-md flex items-center justify-center text-sm transition-all ${
                theme === t ? 'ring-2 ring-offset-1' : ''
              }`}
              style={{
                backgroundColor: theme === t ? 'var(--accent)' : 'transparent',
                color: theme === t ? '#fff' : 'var(--text-secondary)',
              }}
              title={`${t} mode`}
            >
              {t === 'light' && '☀️'}
              {t === 'dark' && '🌙'}
              {t === 'sepia' && '📜'}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
