'use client';

import Link from 'next/link';
import { ShareButton } from './share-button';
import { SettingsPanel } from './settings-panel';

interface ReaderHeaderProps {
  articleUrl?: string;
}

export function ReaderHeader({ articleUrl }: ReaderHeaderProps) {
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
        <div className="flex items-center gap-2">
          {articleUrl && <ShareButton url={articleUrl} title="Article" />}
          <SettingsPanel />
        </div>
      </div>
    </header>
  );
}
