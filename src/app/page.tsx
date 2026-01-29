'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore, type Theme } from '@/stores/theme-store';

export default function Home() {
  const [url, setUrl] = useState('');
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      router.push(`/read?url=${encodeURIComponent(url)}`);
    }
  };

  const themes: Theme[] = ['light', 'dark', 'sepia'];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            AI Reader
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Explainpaper for everything
          </p>
        </div>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste article URL..."
              className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Read
            </button>
          </div>
        </form>

        {/* Theme Switcher */}
        <div className="flex justify-center gap-2">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-4 py-2 rounded-md text-sm capitalize transition-all ${
                theme === t ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: theme === t ? 'var(--accent)' : 'var(--bg-secondary)',
                color: theme === t ? '#fff' : 'var(--text-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-start gap-3">
            <span>📖</span>
            <span>Clean reader view — no distractions</span>
          </div>
          <div className="flex items-start gap-3">
            <span>✨</span>
            <span>Tap any paragraph to ask questions</span>
          </div>
          <div className="flex items-start gap-3">
            <span>📝</span>
            <span>Export your highlights and notes</span>
          </div>
        </div>
      </div>
    </main>
  );
}
