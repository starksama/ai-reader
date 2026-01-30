'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { mockArticles } from '@/data/mock-articles';

export default function DemoPage() {
  return (
    <main className="min-h-screen py-12" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="reader-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70 mb-6"
              style={{ color: 'var(--accent)' }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </Link>

            <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Demo Articles
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Try Mull with sample content
            </p>
          </div>

          {/* Article list */}
          <div className="space-y-3">
            {mockArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Link
                  href={`/demo/${article.id}`}
                  className="block p-4 rounded-md transition-colors hover:bg-[var(--bg-secondary)]"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <h2 
                    className="font-medium mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {article.title}
                  </h2>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {article.byline}
                  </p>
                  <div className="flex gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>{Math.ceil(article.wordCount / 200)} min</span>
                    <span>·</span>
                    <span>{article.paragraphs.length} paragraphs</span>
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
