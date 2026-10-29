'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/i18n/languages';
import { playButtonClick } from '@/utils/audio';

interface LanguageSwitcherProps {
  variant?: 'segmented' | 'dropdown' | 'compact';
  soundEnabled?: boolean;
  className?: string;
  onLanguageChange?: (lang: SupportedLanguage) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'segmented',
  soundEnabled = true,
  className = '',
  onLanguageChange
}) => {
  const { currentLanguage, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (lang: SupportedLanguage) => {
    playButtonClick(soundEnabled);
    setLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
    setIsOpen(false);
  };

  const currentOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  // Segmented Pill Dock: Direct, highly accessible [EN] [MY] [CN] buttons
  if (variant === 'segmented') {
    return (
      <div
        className={`pill-dock inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.25)] ${className}`}
        role="group"
        aria-label="Language Selector"
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isActive = currentLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className={`min-h-[32px] sm:min-h-[34px] px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-sports font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-[0_2px_12px_rgba(37,99,235,0.45)] border border-blue-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
              title={lang.nativeName}
              aria-pressed={isActive}
            >
              <span className="text-sm sm:text-base leading-none">{lang.flag}</span>
              <span className="font-sports font-bold uppercase">{lang.displayCode}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown / Compact Mode (for cramped HUD spaces like StadiumHeader)
  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => {
          playButtonClick(soundEnabled);
          setIsOpen((prev) => !prev);
        }}
        className="min-h-[34px] sm:min-h-[36px] px-2.5 sm:px-3 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 backdrop-blur-xl border border-white/10 text-white font-sports font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.2)]"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Change Language"
      >
        <span className="text-sm sm:text-base leading-none">{currentOption.flag}</span>
        <span className="font-bold uppercase tracking-wider">{currentOption.displayCode}</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-48 rounded-xl bg-[#0b1120] backdrop-blur-2xl border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.7)] p-1 z-[100] flex flex-col gap-1 pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
          role="listbox"
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  handleSelect(lang.code);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(lang.code);
                }}
                className={`w-full min-h-[36px] px-2.5 py-1.5 rounded-lg text-left type-callout flex items-center justify-between transition cursor-pointer select-none ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
                role="option"
                aria-selected={isActive}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span className="font-bold">{lang.displayCode}</span>
                  <span className="text-slate-400 text-xs truncate">({lang.label})</span>
                </div>
                {isActive && (
                  <svg className="w-3.5 h-3.5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

