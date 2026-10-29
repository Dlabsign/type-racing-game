'use client';

import React, { useEffect } from 'react';
import { DifficultyLevel, SentenceTheme } from '@/types/game';
import { playButtonClick, playModalClose } from '@/utils/audio';
import { SettingsIcon, RotateCcwIcon, LogOutIcon, CloseIcon, UserIcon } from './icons/Icons';
import { useI18n } from '@/i18n/I18nContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface SettingsModalProps {
  isOpen: boolean;
  difficulty: DifficultyLevel;
  theme: SentenceTheme;
  soundEnabled: boolean;
  isAuthenticated?: boolean;
  userDisplayName?: string;
  onToggleSound: () => void;
  onSelectDifficulty: (d: DifficultyLevel) => void;
  onSelectTheme: (theme: SentenceTheme) => void;
  onRestart: () => void;
  onClose: () => void;
  onExitToMenu?: () => void;
  onOpenAuth?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  difficulty,
  theme,
  soundEnabled,
  isAuthenticated = false,
  userDisplayName,
  onToggleSound,
  onSelectDifficulty,
  onSelectTheme,
  onRestart,
  onClose,
  onExitToMenu,
  onOpenAuth
}) => {
  const { t } = useI18n();

  // ESC key listener to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        playModalClose(soundEnabled);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, soundEnabled]);

  if (!isOpen) return null;

  const handleAction = (cb?: () => void) => {
    playButtonClick(soundEnabled);
    if (cb) cb();
  };

  const handleClose = () => {
    playModalClose(soundEnabled);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#050811]/85 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-4 select-none animate-apple-in"
      onClick={handleClose}
    >
      <div
        className="swiss-card w-[min(92vw,480px)] p-3.5 sm:p-4.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.85)] max-h-[88dvh] overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2.5">
          <h3 className="type-title-2 text-white flex items-center gap-2">
            <SettingsIcon className="w-4.5 h-4.5 text-[#CCFF00]" />
            {t('settings', 'Settings')}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 min-w-[28px] min-h-[28px] rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <CloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 1. Language Selector (Segmented Apple Glassmorphism Pill Dock) */}
        <div className="py-2 sm:py-2.5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="type-headline text-white">{t('language', 'Language')}</div>
            <div className="type-footnote text-slate-400 mt-0.5">
              English • Bahasa Melayu • 中文
            </div>
          </div>
          <LanguageSwitcher variant="segmented" soundEnabled={soundEnabled} />
        </div>

        {/* 2. Audio Toggle */}
        <div className="flex items-center justify-between py-2 sm:py-2.5 border-b border-white/[0.08]">
          <div>
            <div className="type-headline text-white">{t('sound_effects', 'Sound Effects')}</div>
            <div className="type-footnote text-slate-400 mt-0.5">{t('sound_desc', 'Keystroke and stadium sound effects')}</div>
          </div>
          <button
            type="button"
            onClick={() => handleAction(onToggleSound)}
            className={`w-11 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center active:scale-95 ${
              soundEnabled ? 'bg-[#CCFF00]' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-5.5 h-5.5 rounded-full bg-[#050811] shadow-md transform transition-transform ${
                soundEnabled ? 'translate-x-4.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 3. Difficulty Control */}
        <div className="py-2 sm:py-2.5 border-b border-white/[0.08]">
          <label className="block type-footnote-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            {t('difficulty', 'Difficulty')}
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-[#060913] p-1 rounded-xl border border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                playButtonClick(soundEnabled);
                onSelectDifficulty('easy');
              }}
              className={`py-1.5 min-h-[36px] type-callout-semibold rounded-lg transition cursor-pointer text-center active:scale-97 ${
                difficulty === 'easy'
                  ? 'bg-[#CCFF00] text-[#050811] font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('beginner', 'Beginner')}
            </button>
            <button
              type="button"
              onClick={() => {
                playButtonClick(soundEnabled);
                onSelectDifficulty('medium');
              }}
              className={`py-1.5 min-h-[36px] type-callout-semibold rounded-lg transition cursor-pointer text-center active:scale-97 ${
                difficulty === 'medium'
                  ? 'bg-[#CCFF00] text-[#050811] font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('intermediate', 'Intermediate')}
            </button>
            <button
              type="button"
              onClick={() => {
                playButtonClick(soundEnabled);
                onSelectDifficulty('hard');
              }}
              className={`py-1.5 min-h-[36px] type-callout-semibold rounded-lg transition cursor-pointer text-center active:scale-97 ${
                difficulty === 'hard'
                  ? 'bg-[#CCFF00] text-[#050811] font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('expert', 'Expert')}
            </button>
          </div>
        </div>

        {/* 4. Sentence Theme Selector */}
        <div className="py-2 sm:py-2.5 border-b border-white/[0.08] mb-3">
          <label className="block type-footnote-semibold uppercase tracking-wider text-slate-400 mb-1">
            {t('sentence_theme', 'Sentence Theme')}
          </label>
          <div className="relative">
            <select
              value={theme}
              onChange={(e) => onSelectTheme(e.target.value as SentenceTheme)}
              className="w-full bg-[#060913] border border-white/14 focus:border-[#CCFF00] rounded-xl px-3.5 py-2 min-h-[38px] type-callout-semibold text-white outline-none appearance-none cursor-pointer"
            >
              <option value="english" className="bg-[#0B101D] text-white">English (EN)</option>
              <option value="malay" className="bg-[#0B101D] text-white">Bahasa Melayu (MS)</option>
              <option value="chinese" className="bg-[#0B101D] text-white">中文 (ZH Hanzi)</option>
              <option value="motivasi" className="bg-[#0B101D] text-white">Bahasa Indonesia (Motivasi)</option>
              <option value="fakta" className="bg-[#0B101D] text-white">Fakta Menarik</option>
              <option value="produktivitas" className="bg-[#0B101D] text-white">Produktivitas</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {/* 5. Account / Cloud Sync Option */}
        {onOpenAuth && (
          <div className="py-2 sm:py-2.5 border-b border-white/[0.08] flex items-center justify-between">
            <div>
              <div className="type-footnote-semibold uppercase tracking-wider text-slate-400">
                {t('cloud_sync', 'Account & Cloud Sync')}
              </div>
              <div className="type-subhead text-white mt-0.5">
                {isAuthenticated ? userDisplayName || t('connected', 'Connected') : t('not_connected', 'Not Signed In')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                handleClose();
                onOpenAuth();
              }}
              className="px-2.5 py-1 rounded-xl bg-[#CCFF00]/15 hover:bg-[#CCFF00]/25 text-[#CCFF00] border border-[#CCFF00]/30 type-caption-1-semibold uppercase transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{isAuthenticated ? t('manage_account', 'Manage Account') : t('login', 'Sign In')}</span>
            </button>
          </div>
        )}

        {/* 6. Action Buttons */}
        <div className="flex flex-col gap-2 mt-3">
          <button
            type="button"
            onClick={() => handleAction(onRestart)}
            className="btn-action-primary w-full py-2 sm:py-2.5 px-3.5 sm:px-4 min-h-[38px] sm:min-h-[40px] type-headline uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 rounded-xl shadow-md active:scale-97"
          >
            <RotateCcwIcon className="w-4 h-4" />
            {t('restart_race', 'Restart Race')}
          </button>

          {onExitToMenu && (
            <button
              type="button"
              onClick={() => handleAction(onExitToMenu)}
              className="w-full py-2 px-3.5 min-h-[38px] type-callout-semibold bg-white/10 hover:bg-white/20 border border-white/12 text-slate-200 hover:text-white rounded-xl transition cursor-pointer flex items-center justify-center gap-2 active:scale-97"
            >
              <LogOutIcon className="w-4 h-4" />
              {t('main_menu', 'Main Menu')}
            </button>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="w-full text-slate-400 hover:text-white type-callout-semibold py-1 transition cursor-pointer text-center"
          >
            {t('resume', 'Resume')}
          </button>
        </div>
      </div>
    </div>
  );
};
