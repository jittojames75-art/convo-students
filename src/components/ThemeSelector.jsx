import React, { useState, useRef, useEffect } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { Palette, Check, Sparkles } from 'lucide-react';

export const THEME_OPTIONS = [
  {
    id: 'theme-azure-light',
    name: 'Azure Light Glass',
    subtitle: 'White, blue & frosted glass',
    accentBg: 'bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500',
    previewCard: 'bg-white/80 border-blue-200 text-slate-800 shadow-sm',
    dots: ['#3b82f6', '#60a5fa', '#93c5fd']
  },
  {
    id: 'theme-obsidian-dark',
    name: 'Obsidian Dark Glass',
    subtitle: 'Black, charcoal & subtle accents',
    accentBg: 'bg-gradient-to-r from-slate-900 via-gray-900 to-blue-950',
    previewCard: 'bg-slate-900/90 border-slate-700 text-slate-100 shadow-sm',
    dots: ['#0f172a', '#334155', '#60a5fa']
  },
  {
    id: 'theme-pastel',
    name: 'Pastel Glass',
    subtitle: 'Lavender, pink and white',
    accentBg: 'bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400',
    previewCard: 'bg-purple-50/90 border-purple-200 text-purple-950 shadow-sm',
    dots: ['#e879f9', '#c084fc', '#f472b6']
  },
  {
    id: 'theme-minimal-light',
    name: 'Minimal Light',
    subtitle: 'Clean white and cyan gradients',
    accentBg: 'bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400',
    previewCard: 'bg-cyan-50/90 border-cyan-200 text-slate-900 shadow-sm',
    dots: ['#06b6d4', '#14b8a6', '#38bdf8']
  }
];

export default function ThemeSelector() {
  const { theme, setTheme, addToast } = useAcademy();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentTheme = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTheme = (themeId, themeName) => {
    setTheme(themeId);
    setIsOpen(false);
    addToast(`Switched theme to ${themeName}`, 'info');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-semibold glass-card glass-card-hover transition-all duration-200 shadow-sm cursor-pointer select-none border"
        title="Switch Glass Theme"
      >
        <span className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden sm:inline-block font-medium">{currentTheme.name}</span>
        </span>
        <div className="flex items-center gap-1">
          {currentTheme.dots.map((dotColor, idx) => (
            <span
              key={idx}
              className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs"
              style={{ backgroundColor: dotColor }}
            />
          ))}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 p-2 rounded-2xl glass-card shadow-2xl z-50 border border-white/50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-black/5 dark:border-white/10 mb-1 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Glass Theme Presets
            </span>
            <span className="text-[10px] opacity-60 font-mono">Design System</span>
          </div>

          <div className="space-y-1">
            {THEME_OPTIONS.map((item) => {
              const isSelected = item.id === theme;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTheme(item.id, item.name)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-500/15 border border-blue-500/30 font-semibold'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Visual Color Pill */}
                    <div className="flex flex-col gap-1 items-center justify-center p-1.5 rounded-lg border border-black/10 shadow-xs w-9 h-9 shrink-0">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.dots[0] }} />
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.dots[1] }} />
                      </div>
                      <span className="w-4 h-1.5 rounded-full" style={{ backgroundColor: item.dots[2] }} />
                    </div>

                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        {item.name}
                      </div>
                      <div className="text-[10px] opacity-65 font-normal">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
