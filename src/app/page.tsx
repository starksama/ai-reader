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
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-xl font-medium mb-1 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            AI Reader
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Understand anything deeper
          </p>
        </div>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div 
            className="flex rounded-sm overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste article URL"
              className="flex-1 px-3 py-2.5 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-primary)' }}
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-4 py-2.5 text-sm text-white transition-all hover:opacity-90 disabled:opacity-40 flex items-center gap-2"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <span>{isLoading ? '...' : 'Read'}</span>
              {!isLoading && <ArrowRight size={12} />}
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
            Try demo articles
          </Link>
        </div>

        {/* Theme */}
        <div className="flex justify-center gap-px rounded-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {themes.map((t) => (
            <button
              key={t.key}
              onClick={() => setTheme(t.key)}
              className="flex-1 px-3 py-1.5 text-xs transition-all flex items-center justify-center gap-1.5"
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

        {/* Features */}
        <div className="space-y-2 text-sm mt-12" style={{ color: 'var(--text-secondary)' }}>
          <p>Select text to dive deeper</p>
          <p>Ask questions, get explanations</p>
          <p>Highlight and export notes</p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-12" style={{ color: 'var(--text-secondary)' }}>
          <a 
            href="https://github.com/starksama/ai-reader" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-70"
          >
            GitHub
          </a>
        </p>
      </motion.div>
    </main>
  );
}
