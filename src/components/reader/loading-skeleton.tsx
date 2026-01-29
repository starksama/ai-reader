'use client';

import { motion } from 'framer-motion';

export function LoadingSkeleton() {
  return (
    <div className="reader-container py-8">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6"
      >
        <div 
          className="h-7 mb-3 w-4/5"
          style={{ backgroundColor: 'var(--border)' }}
        />
        <div 
          className="h-4 w-2/5"
          style={{ backgroundColor: 'var(--border)', opacity: 0.5 }}
        />
      </motion.div>

      {/* Meta */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex gap-3 mb-8"
      >
        <div 
          className="h-4 w-16"
          style={{ backgroundColor: 'var(--border)', opacity: 0.4 }}
        />
        <div 
          className="h-4 w-20"
          style={{ backgroundColor: 'var(--border)', opacity: 0.4 }}
        />
      </motion.div>

      {/* Paragraphs */}
      {[1, 2, 3, 4].map((i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 + i * 0.03 }}
          className="mb-5 p-4"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <div 
            className="h-4 mb-2 w-full"
            style={{ backgroundColor: 'var(--border)', opacity: 0.3 }}
          />
          <div 
            className="h-4 mb-2 w-full"
            style={{ backgroundColor: 'var(--border)', opacity: 0.25 }}
          />
          <div 
            className="h-4 w-3/4"
            style={{ backgroundColor: 'var(--border)', opacity: 0.2 }}
          />
        </motion.div>
      ))}
    </div>
  );
}
