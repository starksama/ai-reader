'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockArticles } from '@/data/mock-articles';

export default function DemoPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/"
            className="text-sm hover:underline"
            style={{ color: 'var(--text-secondary)' }}
          >
            ← Back to home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          📖 Demo Articles
        </h1>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
          Test the reader with mock local content (no URL parsing required)
        </p>

        <div className="space-y-4">
          {mockArticles.map((article) => (
            <Link
              key={article.id}
              href={`/demo/${article.id}`}
              className="block p-4 rounded-lg border transition-all hover:border-current"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {article.title}
              </h2>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                {article.byline} · {article.siteName}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {article.excerpt}
              </p>
              <div className="flex gap-3 mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>~{Math.ceil(article.wordCount / 200)} min read</span>
                <span>·</span>
                <span>{article.paragraphs.length} paragraphs</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
