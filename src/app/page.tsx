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

  const themes: { key: Theme; icon: string }[] = [
    { key: 'light', icon: '☀️' },
    { key: 'dark', icon: '🌙' },
    { key: 'sepia', icon: '📜' },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-6xl mb-4"
          >
            📖
          </motion.div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            AI Reader
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Understand anything deeper
          </p>
        </div>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div 
            className="flex gap-2 p-2 rounded-xl"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste any article URL..."
              className="flex-1 px-4 py-3 bg-transparent outline-none"
              style={{ color: 'var(--text-primary)' }}
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

        {/* Demo link */}
        <div className="text-center mb-12">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--highlight)',
              color: 'var(--text-primary)',
            }}
          >
            <span>📚</span>
            <span>Try demo articles</span>
          </Link>
        </div>

        {/* Theme switcher */}
        <div className="flex justify-center gap-2 mb-16">
          {themes.map((t) => (
            <button
              key={t.key}
              onClick={() => setTheme(t.key)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                theme === t.key ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{
                backgroundColor: theme === t.key ? 'var(--accent)' : 'var(--bg-secondary)',
              }}
              title={`${t.key} mode`}
            >
              {t.icon}
            </button>
          ))}
        </div>

        {/* Features */}
        <div className="grid gap-3 text-sm">
          {[
            { icon: '✨', title: 'Select & explore', desc: 'Highlight text to dive deeper' },
            { icon: '🔍', title: 'Ask anything', desc: 'Get AI explanations instantly' },
            { icon: '📝', title: 'Save notes', desc: 'Export your highlights as markdown' },
          ].map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + idx * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <span className="text-lg">{feature.icon}</span>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{feature.title}</p>
                <p style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
              </div>
            </motion.div>
          ))}
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
        </p>
      </motion.div>
    </main>
  );
}
