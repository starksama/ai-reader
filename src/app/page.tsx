'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
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

  const themes: { key: Theme; label: string }[] = [
    { key: 'light', label: 'Light' },
    { key: 'dark', label: 'Dark' },
    { key: 'sepia', label: 'Sepia' },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold mb-1 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            AI Reader
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Understand anything deeper
          </p>
        </div>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div 
            className="flex gap-2"
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
              className="px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {isLoading ? '...' : 'Read'}
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

        {/* Theme */}
        <div className="flex justify-center gap-1 mb-12">
          {themes.map((t) => (
            <button
              key={t.key}
              onClick={() => setTheme(t.key)}
              className="px-3 py-1.5 text-xs transition-all"
              style={{
                backgroundColor: theme === t.key ? 'var(--bg-secondary)' : 'transparent',
                color: theme === t.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: theme === t.key ? '1px solid var(--border)' : '1px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Features */}
        <div className="space-y-3 text-sm">
          {[
            { label: 'Select text to dive deeper' },
            { label: 'Ask questions, get explanations' },
            { label: 'Export notes as markdown' },
          ].map((feature, idx) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
              className="flex items-center gap-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span style={{ color: 'var(--accent)' }}>•</span>
              <span>{feature.label}</span>
            </motion.div>
          ))}
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
