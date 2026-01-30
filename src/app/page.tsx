'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sun, Moon, BookOpen, Link2, FileText } from 'lucide-react';
import { useThemeStore, type Theme } from '@/stores/theme-store';
import { useReaderStore } from '@/stores/reader-store';
import { parseContent } from '@/utils/parse-content';

type InputMode = 'url' | 'paste';

export default function Home() {
  const [mode, setMode] = useState<InputMode>('url');
  const [url, setUrl] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();
  const { setArticle } = useReaderStore();

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setIsLoading(true);
    setError(null);
    router.push(`/read?url=${encodeURIComponent(url)}`);
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedContent.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const article = parseContent(pastedContent, title || 'Pasted Content');
      
      if (!article || article.paragraphs.length === 0) {
        setError('Could not parse content. Try pasting more text or HTML.');
        setIsLoading(false);
        return;
      }
      
      // Store in reader store and navigate
      setArticle(article);
      router.push('/read?source=paste');
    } catch (err) {
      setError('Failed to parse content. Please try again.');
      setIsLoading(false);
    }
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Mull
          </h1>
          <p className="text-base mb-1" style={{ color: 'var(--text-secondary)' }}>
            Branch freely. Never start over.
          </p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            No more &quot;let me start a new chat&quot;
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex mb-4 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <button
            onClick={() => { setMode('url'); setError(null); }}
            className="flex-1 px-4 py-2.5 text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              backgroundColor: mode === 'url' ? 'var(--bg-secondary)' : 'transparent',
              color: mode === 'url' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <Link2 size={14} />
            <span>URL</span>
          </button>
          <button
            onClick={() => { setMode('paste'); setError(null); }}
            className="flex-1 px-4 py-2.5 text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              backgroundColor: mode === 'paste' ? 'var(--bg-secondary)' : 'transparent',
              color: mode === 'paste' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <FileText size={14} />
            <span>Paste</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg text-sm"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
          >
            {error}
          </motion.div>
        )}

        {/* URL Input */}
        {mode === 'url' && (
          <form onSubmit={handleUrlSubmit} className="mb-6">
            <div 
              className="flex rounded-lg overflow-hidden shadow-sm"
              style={{ border: '1px solid var(--border)' }}
            >
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste any URL..."
                className="flex-1 px-4 py-3 bg-transparent outline-none text-sm"
                style={{ color: 'var(--text-primary)' }}
                disabled={isLoading}
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="px-5 py-3 text-sm text-white font-medium transition-all hover:opacity-90 disabled:opacity-40 flex items-center gap-2 outline-none"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <span>{isLoading ? '...' : 'Mull'}</span>
                {!isLoading && <ArrowRight size={14} />}
              </button>
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-tertiary)' }}>
              Works best with articles, blog posts, documentation
            </p>
          </form>
        )}

        {/* Paste Input */}
        {mode === 'paste' && (
          <form onSubmit={handlePasteSubmit} className="mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full px-4 py-2.5 mb-2 bg-transparent outline-none text-sm rounded-lg"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              disabled={isLoading}
            />
            <textarea
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              placeholder="Paste your content here...&#10;&#10;Supports plain text, HTML, or copied web content."
              className="w-full px-4 py-3 bg-transparent outline-none text-sm rounded-lg resize-none"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--border)', minHeight: '150px' }}
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !pastedContent.trim()}
              className="w-full mt-2 px-5 py-3 text-sm text-white font-medium transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2 rounded-lg outline-none"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <span>{isLoading ? 'Parsing...' : 'Mull it over'}</span>
              {!isLoading && <ArrowRight size={14} />}
            </button>
          </form>
        )}

        {/* Demo link */}
        <div className="text-center mb-8">
          <Link
            href="/demo"
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)' }}
          >
            Try demo articles →
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { emoji: '🌳', title: 'Branch', desc: 'Tangents stay isolated' },
            { emoji: '📍', title: 'Anchored', desc: 'Source never buried' },
            { emoji: '🔄', title: 'Return', desc: 'Clean context awaits' },
          ].map((f) => (
            <div 
              key={f.title} 
              className="text-center p-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              <div className="text-lg mb-1">{f.emoji}</div>
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
        <p className="text-center text-xs mt-8" style={{ color: 'var(--text-tertiary)' }}>
          Ask tangents. Keep context.
        </p>
      </motion.div>
    </main>
  );
}
