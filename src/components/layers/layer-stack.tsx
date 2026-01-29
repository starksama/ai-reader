'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface LayerStackProps {
  children: ReactNode[];
  currentIndex: number;
  onSwipeBack?: () => void;
}

export function LayerStack({ children, currentIndex, onSwipeBack }: LayerStackProps) {
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Swipe right to go back
    if (info.offset.x > 100 && info.velocity.x > 0 && onSwipeBack) {
      onSwipeBack();
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      <AnimatePresence mode="popLayout">
        {children.map((child, index) => (
          <motion.div
            key={index}
            initial={{ x: index > 0 ? '100%' : 0, opacity: index > 0 ? 0 : 1 }}
            animate={{
              x: index < currentIndex ? '-100%' : index === currentIndex ? 0 : '100%',
              opacity: index === currentIndex ? 1 : 0,
            }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag={index > 0 && index === currentIndex ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0"
            style={{
              backgroundColor: 'var(--bg-primary)',
              zIndex: index === currentIndex ? 10 : 0,
            }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
