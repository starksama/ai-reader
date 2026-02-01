'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sun, Moon, FileText, Upload, Link2, GitBranch, Anchor, RotateCcw, ChevronDown, Loader2 } from 'lucide-react';
import { useThemeStore, type Theme } from '@/stores/theme-store';
import { useReaderStore } from '@/stores/reader-store';
import { parseContent } from '@/utils/parse-content';
import { parsePDF } from '@/utils/parse-pdf';
import { LoginButton } from '@/components/auth/login-button';
import { HistorySidebar } from '@/components/history/history-sidebar';

type InputMode = 'paste' | 'upload' | 'url';

export default function Home() {
  const [mode, setMode] = useState<InputMode>('paste');
  const [pastedContent, setPastedContent] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();
  const { setArticle } = useReaderStore();

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedContent.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const article = parseContent(pastedContent, title || 'Pasted Content');
      
      if (!article || article.paragraphs.length === 0) {
        setError('Could not parse content. Try pasting more text.');
        setIsLoading(false);
        return;
      }
      
      setArticle(article);
      router.push('/read?source=paste');
    } catch {
      setError('Failed to parse content.');
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const article = await parsePDF(file);
        
        if (article.paragraphs.length === 0) {
          setError('Could not extract text from PDF.');
          setIsLoading(false);
          return;
        }
        
        setArticle(article);
        router.push('/read?source=pdf');
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text();
        const article = parseContent(text, file.name.replace(/\.(txt|md)$/i, ''));
        
        if (!article || article.paragraphs.length === 0) {
          setError('Could not parse file.');
          setIsLoading(false);
          return;
        }
        
        setArticle(article);
        router.push('/read?source=file');
      } else {
        setError('Unsupported file type. Try PDF, TXT, or MD files.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('File parse error:', err);
      setError('Failed to parse file. Try a different format.');
      setIsLoading(false);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setIsLoading(true);
    setError(null);
    router.push(`/read?url=${encodeURIComponent(url)}`);
  };

  const themes: { key: Theme; label: string; icon: React.ReactNode }[] = [
    { key: 'light', label: 'Light', icon: <Sun size={12} /> },
    { key: 'dark', label: 'Dark', icon: <Moon size={12} /> },
  ];

  const inputModes: { key: InputMode; label: string; icon: React.ReactNode }[] = [
    { key: 'paste', label: 'Paste', icon: <FileText size={14} /> },
    { key: 'upload', label: 'Upload', icon: <Upload size={14} /> },
    { key: 'url', label: 'URL', icon: <Link2 size={14} /> },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 pb-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Top bar with auth and history */}
      <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
        <HistorySidebar />
        <LoginButton />
      </div>

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
          {inputModes.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setError(null); }}
              className="flex-1 px-3 py-2.5 text-sm flex items-center justify-center gap-2 transition-all outline-none"
              style={{
                backgroundColor: mode === m.key ? 'var(--bg-secondary)' : 'transparent',
                color: mode === m.key ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
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
              placeholder="Paste any content here...&#10;&#10;Articles, notes, markdown, code — anything you want to explore."
              className="w-full px-4 py-3 bg-transparent outline-none text-sm rounded-lg resize-none"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--border)', minHeight: '140px' }}
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !pastedContent.trim()}
              className="w-full mt-2 px-5 py-3 text-sm text-white font-medium transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2 rounded-lg outline-none"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              <span>{isLoading ? 'Processing...' : 'Start exploring'}</span>
            </button>
          </form>
        )}

        {/* Upload Input */}
        {mode === 'upload' && (
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full py-12 rounded-lg border-2 border-dashed transition-all hover:border-[var(--accent)] disabled:opacity-40"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
            >
              <div className="flex flex-col items-center gap-3">
                {isLoading ? (
                  <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
                ) : (
                  <Upload size={32} style={{ color: 'var(--text-tertiary)' }} />
                )}
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {isLoading ? 'Processing...' : 'Drop a file or click to upload'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    PDF, TXT, Markdown
                  </p>
                </div>
              </div>
            </button>
          </div>
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
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              </button>
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-tertiary)' }}>
              ⚠️ URL fetching may not work for all sites. Paste works best.
            </p>
          </form>
        )}

        {/* Demo link */}
        <div className="text-center mb-6">
          <Link
            href="/demo"
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)' }}
          >
            Try demo articles →
          </Link>
        </div>

        {/* Expandable Features */}
        <div className="mb-8 space-y-2">
          {[
            { 
              id: 'branch',
              icon: GitBranch, 
              title: 'Branch', 
              short: 'Every question can spawn a thread',
              detail: 'Ask a follow-up, go three levels deep—your other questions stay untouched. No more "let me start a new chat" when you want to explore something else.'
            },
            { 
              id: 'anchor',
              icon: Anchor, 
              title: 'Anchored', 
              short: 'Always know where you came from',
              detail: 'Each conversation knows which paragraph or selection started it. Jump anywhere in your exploration—the source is always one tap away.'
            },
            { 
              id: 'return',
              icon: RotateCcw, 
              title: 'Return', 
              short: 'Pop back to clean context',
              detail: 'Done exploring? Go back. The AI remembers exactly where you were—no confusion, no context pollution. Each thread has its own memory.'
            },
          ].map((f) => (
            <motion.div 
              key={f.id}
              className="rounded-lg overflow-hidden"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              <button
                onClick={() => setExpandedFeature(expandedFeature === f.id ? null : f.id)}
                className="w-full px-4 py-3 flex items-center gap-3 text-left outline-none"
              >
                <f.icon size={18} style={{ color: 'var(--accent)' }} />
                <div className="flex-1">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{f.title}</span>
                  <span className="text-sm ml-2" style={{ color: 'var(--text-tertiary)' }}>— {f.short}</span>
                </div>
                <motion.div
                  animate={{ rotate: expandedFeature === f.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} style={{ color: 'var(--text-tertiary)' }} />
                </motion.div>
              </button>
              
              <motion.div
                initial={false}
                animate={{ 
                  height: expandedFeature === f.id ? 'auto' : 0,
                  opacity: expandedFeature === f.id ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p 
                  className="px-4 pb-4 text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {f.detail}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Explore freely. Return cleanly.
        </p>
      </motion.div>

      {/* Theme Toggle - Fixed at bottom */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <div 
          className="flex gap-px rounded-lg overflow-hidden shadow-lg"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          {themes.map((t) => (
            <button
              key={t.key}
              onClick={() => setTheme(t.key)}
              className="px-4 py-2 text-xs transition-all flex items-center justify-center gap-1.5 outline-none"
              style={{
                backgroundColor: theme === t.key ? 'var(--highlight)' : 'transparent',
                color: theme === t.key ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
