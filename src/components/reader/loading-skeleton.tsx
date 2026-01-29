'use client';

import { motion } from 'framer-motion';

export function LoadingSkeleton() {
  return (
    <div className="reader-container py-8">
      {/* Title skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <div 
          className="h-9 rounded-lg mb-3 w-4/5"
          style={{ backgroundColor: 'var(--border)' }}
        />
        <div 
          className="h-5 rounded-lg w-2/5"
          style={{ backgroundColor: 'var(--border)', opacity: 0.6 }}
        />
      </motion.div>

      {/* Stats skeleton */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3 mb-8"
      >
        <div 
          className="h-7 w-20 rounded-full"
          style={{ backgroundColor: 'var(--border)', opacity: 0.6 }}
        />
        <div 
          className="h-7 w-24 rounded-full"
          style={{ backgroundColor: 'var(--border)', opacity: 0.6 }}
        />
      </motion.div>

      {/* Paragraph skeletons */}
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.05 }}
          className="mb-6 p-4 rounded-xl"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <div 
            className="h-4 rounded mb-2 w-full"
            style={{ backgroundColor: 'var(--border)', opacity: 0.5 }}
          />
          <div 
            className="h-4 rounded mb-2 w-full"
            style={{ backgroundColor: 'var(--border)', opacity: 0.4 }}
          />
          <div 
            className="h-4 rounded w-3/4"
            style={{ backgroundColor: 'var(--border)', opacity: 0.3 }}
          />
        </motion.div>
      ))}
    </div>
  );
}
