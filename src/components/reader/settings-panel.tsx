'use client';

import { useState } from 'react';
import { Settings, Sun, Moon, BookOpen, Check } from 'lucide-react';
import { Popup } from '@/components/ui/popup';
import { useThemeStore, type Theme, type FontSize, type HighlightColor } from '@/stores/theme-store';

const highlightColors: { id: HighlightColor; color: string; label: string }[] = [
  { id: 'yellow', color: '#fef08a', label: 'Yellow' },
  { id: 'green', color: '#bbf7d0', label: 'Green' },
  { id: 'blue', color: '#bfdbfe', label: 'Blue' },
  { id: 'pink', color: '#fbcfe8', label: 'Pink' },
  { id: 'orange', color: '#fed7aa', label: 'Orange' },
];

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, fontSize, highlightColor, setTheme, setFontSize, setHighlightColor } = useThemeStore();

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
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
        }}
        title="Settings"
      >
        <Settings size={16} />
      </button>

      <Popup 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Settings"
        position="top-right"
      >
        {/* Theme */}
        <div className="mb-5">
          <label 
            className="block text-xs font-medium mb-2 uppercase tracking-wider"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Theme
          </label>
          <div className="flex gap-1">
            {themes.map((t) => (
              <button
                key={t.key}
                onClick={() => setTheme(t.key)}
                className="flex-1 h-9 flex items-center justify-center gap-1.5 text-xs rounded-lg transition-all"
                style={{
                  backgroundColor: theme === t.key ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: theme === t.key ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="mb-5">
          <label 
            className="block text-xs font-medium mb-2 uppercase tracking-wider"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Font Size
          </label>
          <div className="flex gap-1">
            {fontSizes.map((f) => (
              <button
                key={f.key}
                onClick={() => setFontSize(f.key)}
                className="flex-1 h-9 flex items-center justify-center text-sm font-medium rounded-lg transition-all"
                style={{
                  backgroundColor: fontSize === f.key ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: fontSize === f.key ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Color */}
        <div>
          <label 
            className="block text-xs font-medium mb-2 uppercase tracking-wider"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Highlight Color
          </label>
          <div className="flex gap-2">
            {highlightColors.map((c) => (
              <button
                key={c.id}
                onClick={() => setHighlightColor(c.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ 
                  backgroundColor: c.color,
                  border: highlightColor === c.id ? '2px solid var(--accent)' : '2px solid transparent',
                }}
                title={c.label}
              >
                {highlightColor === c.id && (
                  <Check size={14} style={{ color: 'var(--text-primary)' }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </Popup>
    </>
  );
}
