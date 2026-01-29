'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { mockArticles } from '@/data/mock-articles';

export default function DemoPage() {
  return (
    <main className="min-h-screen py-12" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium mb-8 transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent)' }}
            >
              ← Back home
            </Link>

            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Demo Articles
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Try the reader with sample content
            </p>
          </div>

          {/* Article list */}
          <div className="space-y-4">
            {mockArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Link
                  href={`/demo/${article.id}`}
                  className="block p-5 rounded-xl border transition-all hover:border-[var(--accent)] hover:shadow-sm group"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <h2 
                    className="text-lg font-semibold mb-2 group-hover:text-[var(--accent)] transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {article.title}
                  </h2>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {article.byline} · {article.siteName}
                  </p>
                  <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {article.excerpt}
                  </p>
                  <div className="flex gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span className="px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--highlight)' }}>
                      {Math.ceil(article.wordCount / 200)} min read
                    </span>
                    <span className="px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--highlight)' }}>
                      {article.paragraphs.length} paragraphs
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
