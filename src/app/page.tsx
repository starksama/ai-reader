'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sun, Moon, BookOpen } from 'lucide-react';
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

  const themes: { key: Theme; label: string; icon: React.ReactNode }[] = [
    { key: 'light', label: 'Light', icon: <Sun size={12} /> },
    { key: 'dark', label: 'Dark', icon: <Moon size={12} /> },
    { key: 'sepia', label: 'Sepia', icon: <BookOpen size={12} /> },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Mull
          </h1>
          <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>
            Your second brain for complex ideas
          </p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Dive into rabbit holes. Never lose the thread.
          </p>
        </div>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div 
            className="flex rounded-lg overflow-hidden shadow-sm"
            style={{ border: '1px solid var(--border)' }}
          >
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste any URL to mull over..."
              className="flex-1 px-4 py-3 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-primary)' }}
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-5 py-3 text-sm text-white font-medium transition-all hover:opacity-90 disabled:opacity-40 flex items-center gap-2"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <span>{isLoading ? '...' : 'Mull'}</span>
              {!isLoading && <ArrowRight size={14} />}
            </button>
          </div>
        </form>

        {/* Demo link */}
        <div className="text-center mb-10">
          <Link
            href="/demo"
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)' }}
          >
            Try demo articles →
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { emoji: '🌳', title: 'Context Tree', desc: 'Branch infinitely' },
            { emoji: '💬', title: 'AI Dialogue', desc: 'Ask, clarify, understand' },
            { emoji: '✨', title: 'Highlights', desc: 'Mark & export' },
          ].map((f) => (
            <div 
              key={f.title} 
              className="text-center p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              <div className="text-xl mb-1">{f.emoji}</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{f.title}</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Theme */}
        <div className="flex justify-center gap-px rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {themes.map((t) => (
            <button
              key={t.key}
              onClick={() => setTheme(t.key)}
              className="flex-1 px-4 py-2 text-xs transition-all flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: theme === t.key ? 'var(--bg-secondary)' : 'transparent',
                color: theme === t.key ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-10" style={{ color: 'var(--text-tertiary)' }}>
          Stop skimming. Start understanding.
        </p>
      </motion.div>
    </main>
  );
}
