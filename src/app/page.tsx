'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore, type Theme } from '@/stores/theme-store';

export default function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsLoading(true);
    router.push(`/read?url=${encodeURIComponent(url)}`);
  };

  const themes: Theme[] = ['light', 'dark', 'sepia'];

  const exampleUrls = [
    {
      label: 'Paul Graham Essay',
      url: 'http://www.paulgraham.com/greatwork.html',
    },
    {
      label: 'Wait But Why',
      url: 'https://waitbutwhy.com/2014/05/fermi-paradox.html',
    },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">📖</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            AI Reader
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Explainpaper for everything
          </p>
        </div>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste any article URL..."
              className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-shadow"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {isLoading ? '...' : 'Read'}
            </button>
          </div>
        </form>

        {/* Example URLs */}
        <div className="mb-8">
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Try an example:
          </p>
          <div className="flex flex-wrap gap-2">
            {exampleUrls.map((example) => (
              <button
                key={example.url}
                onClick={() => setUrl(example.url)}
                className="px-3 py-1.5 rounded-full text-sm border transition-colors hover:border-current"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Switcher */}
        <div className="flex justify-center gap-2 mb-12">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-4 py-2 rounded-md text-sm capitalize transition-all ${
                theme === t ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{
                backgroundColor: theme === t ? 'var(--accent)' : 'var(--bg-secondary)',
                color: theme === t ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {t === 'light' && '☀️'} {t === 'dark' && '🌙'} {t === 'sepia' && '📜'} {t}
            </button>
          ))}
        </div>

        {/* Features */}
        <div className="grid gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <span className="text-lg">✨</span>
            <div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Tap to explore</p>
              <p>Click any paragraph to dive deeper with AI</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <span className="text-lg">📝</span>
            <div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Export notes</p>
              <p>Save your highlights and Q&A as markdown</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <span className="text-lg">🎨</span>
            <div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Reading-first</p>
              <p>Clean view, smooth navigation, no distractions</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-12" style={{ color: 'var(--text-secondary)' }}>
          Built by{' '}
          <a 
            href="https://github.com/starksama" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:opacity-70"
          >
            @starksama
          </a>
          {' '}· Open source on{' '}
          <a 
            href="https://github.com/starksama/ai-reader" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:opacity-70"
          >
            GitHub
          </a>
        </p>
      </div>
    </main>
  );
}
