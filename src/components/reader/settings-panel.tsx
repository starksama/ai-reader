'use client';

import { useState, useRef, useEffect } from 'react';
import { Settings, Sun, Moon, BookOpen, Minus, Plus } from 'lucide-react';
import { useThemeStore, type Theme, type FontSize, fontSizeMap } from '@/stores/theme-store';

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, fontSize, setTheme, setFontSize } = useThemeStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const themes: { key: Theme; label: string; icon: React.ReactNode }[] = [
    { key: 'light', label: 'Light', icon: <Sun size={14} /> },
    { key: 'dark', label: 'Dark', icon: <Moon size={14} /> },
    { key: 'sepia', label: 'Sepia', icon: <BookOpen size={14} /> },
  ];

  const fontSizes: { key: FontSize; label: string }[] = [
    { key: 'small', label: 'S' },
    { key: 'medium', label: 'M' },
    { key: 'large', label: 'L' },
  ];

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 flex items-center justify-center rounded-sm transition-all"
        style={{
          backgroundColor: isOpen ? 'var(--bg-secondary)' : 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
        }}
        title="Settings"
      >
        <Settings size={14} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 p-4 rounded-sm shadow-lg z-50 min-w-[200px]"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Theme */}
          <div className="mb-4">
            <label 
              className="block text-xs font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Theme
            </label>
            <div className="flex gap-px rounded-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {themes.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTheme(t.key)}
                  className="flex-1 h-8 flex items-center justify-center gap-1.5 text-xs transition-all"
                  style={{
                    backgroundColor: theme === t.key ? 'var(--bg-tertiary)' : 'transparent',
                    color: theme === t.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {t.icon}
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label 
              className="block text-xs font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Font Size
            </label>
            <div className="flex gap-px rounded-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {fontSizes.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFontSize(f.key)}
                  className="flex-1 h-8 flex items-center justify-center text-xs font-medium transition-all"
                  style={{
                    backgroundColor: fontSize === f.key ? 'var(--bg-tertiary)' : 'transparent',
                    color: fontSize === f.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p 
              className="text-xs mt-2 text-center"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {fontSizeMap[fontSize].base}px
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
