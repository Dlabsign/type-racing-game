'use client';

import React, { useEffect, useRef } from 'react';
import { DifficultyLevel, SentenceTheme } from '@/types/game';
import { DIFFICULTY_PRESETS } from '@/constants/sentences';
import { RunnerSvg } from './RunnerSvg';
import { playButtonClick } from '@/utils/audio';
import { ArrowLeftIcon, PlayIcon } from './icons/Icons';
import { useI18n } from '@/i18n/I18nContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface DifficultySelectScreenProps {
  playerName: string;
  playerColor: string;
  difficulty: DifficultyLevel;
  theme: SentenceTheme;
  soundEnabled?: boolean;
  isPractice?: boolean;
  onUpdatePlayerName: (name: string) => void;
  onUpdatePlayerColor: (color: string) => void;
  onUpdateDifficulty: (difficulty: DifficultyLevel) => void;
  onUpdateTheme: (theme: SentenceTheme) => void;
  onStartRace: () => void;
  onBackToMenu: () => void;
}

const JERSEY_COLORS = [
  { label: 'Volt', value: '#CCFF00' },
  { label: 'Blue', value: '#2563EB' },
  { label: 'Crimson', value: '#EF4444' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'White', value: '#F8FAFC' }
];

export const DifficultySelectScreen: React.FC<DifficultySelectScreenProps> = ({
  playerName,
  playerColor,
  difficulty,
  theme,
  soundEnabled = true,
  isPractice = false,
  onUpdatePlayerName,
  onUpdatePlayerColor,
  onUpdateDifficulty,
  onUpdateTheme,
  onStartRace,
  onBackToMenu
}) => {
  const { t } = useI18n();
  const startBtnRef = useRef<HTMLButtonElement>(null);
  const preset = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.medium;

  const THEME_OPTIONS: { id: SentenceTheme; label: string }[] = [
    { id: 'english', label: 'English (EN)' },
    { id: 'malay', label: 'Bahasa Melayu (MY)' },
    { id: 'chinese', label: '中文 (CN / Hanzi)' },
    { id: 'motivasi', label: 'Bahasa Indonesia' },
    { id: 'fakta', label: 'Fakta Menarik' },
    { id: 'produktivitas', label: 'Produktivitas' }
  ];

  // Handle ESC and ENTER shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        playButtonClick(soundEnabled);
        onBackToMenu();
      } else if (e.key === 'Enter') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'select') {
          e.preventDefault();
          playButtonClick(soundEnabled);
          onStartRace();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToMenu, onStartRace, soundEnabled]);

  const handleSelectDiff = (diff: DifficultyLevel) => {
    playButtonClick(soundEnabled);
    onUpdateDifficulty(diff);
  };

  const handleSelectColor = (col: string) => {
    playButtonClick(soundEnabled);
    onUpdatePlayerColor(col);
  };

  const handleSelectTheme = (thm: SentenceTheme) => {
    playButtonClick(soundEnabled);
    onUpdateTheme(thm);
  };

  const handleStart = () => {
    playButtonClick(soundEnabled);
    onStartRace();
  };

  const handleBack = () => {
    playButtonClick(soundEnabled);
    onBackToMenu();
  };

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-y-auto overflow-x-hidden flex flex-col justify-between bg-[#050811] text-white select-none animate-apple-in">
      {/* 1. Header Navigation */}
      <header className="relative z-20 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-1.5 -ml-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition cursor-pointer min-h-[40px]"
        >
          <ArrowLeftIcon className="w-4 h-4 text-slate-400 group-hover:text-white" />
          <span className="type-callout-semibold tracking-wide">
            {t('back', 'Back')}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="segmented" soundEnabled={soundEnabled} />
        </div>
      </header>

      {/* 2. Main Full-Screen Layout: Disciplined 2-Column Split */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col lg:flex-row items-stretch gap-5 lg:gap-8 overflow-y-auto overscroll-contain">
        {/* Left Panel: Preview & Rivals */}
        <section className="flex-1 flex flex-col justify-between gap-4">
          <div>
            <h1 className="type-large-title text-white">
              {isPractice ? t('practice_prep', 'Practice Setup') : t('race_prep', 'Race Setup')}
            </h1>
          </div>

          {/* Runner Preview Card (Disciplined 14px-18px padding) */}
          <div className="relative w-full rounded-2xl bg-gradient-to-r from-white/[0.05] to-transparent p-3.5 sm:p-4.5 border-l-4 border-[#CCFF00] flex flex-col justify-between gap-3.5">
            <div className="type-footnote-semibold text-slate-400 uppercase tracking-wider">
              {isPractice ? t('solo_runner', 'Solo Runner') : t('runner_profile', 'Runner Profile')}
            </div>

            {/* Track Platform */}
            <div className="relative w-full h-[clamp(76px,12vh,105px)] flex items-center justify-start border-b border-dashed border-white/20 px-2 sm:px-4">
              <div className="absolute left-4 sm:left-6 top-2 bottom-0 w-2.5 bg-white/20 transform -skew-x-12" />

              <div className="relative ml-8 sm:ml-10 flex items-center gap-4">
                <RunnerSvg
                  color={playerColor}
                  bibNum="01"
                  isPlayer={true}
                  className="w-[clamp(64px,10vh,92px)] h-[clamp(64px,10vh,92px)] overflow-visible drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)]"
                />

                <div>
                  <span className="type-title-2 text-white">
                    {playerName.trim() || t('runner', 'Runner')}
                  </span>
                </div>
              </div>
            </div>

            {/* Competitors List vs Solo Mode (10px-12px / 12px-14px) */}
            {isPractice ? (
              <div className="pt-0.5">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 type-headline">
                    SOLO
                  </div>
                  <div>
                    <div className="type-subhead-semibold text-amber-300">
                      {t('practice', 'Practice')} • {t('solo_runner', 'Solo Runner')}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-0.5">
                <div className="type-footnote-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  {t('rival_list', 'Rival Lineup')}
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-black/40 border border-white/[0.08]">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 shadow-sm" />
                    <div className="truncate">
                      <div className="type-subhead-semibold text-slate-200 truncate">
                        {t('rival_blitz', 'Blitz Rival')}
                      </div>
                      <div className="type-caption-1 font-mono text-slate-400">~{preset.r1} WPM</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-black/40 border border-white/[0.08]">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 shadow-sm" />
                    <div className="truncate">
                      <div className="type-subhead-semibold text-slate-200 truncate">
                        {t('rival_swift', 'Swift Rival')}
                      </div>
                      <div className="type-caption-1 font-mono text-slate-400">~{preset.r2} WPM</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-black/40 border border-white/[0.08]">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 shadow-sm" />
                    <div className="truncate">
                      <div className="type-subhead-semibold text-slate-200 truncate">
                        {t('rival_agile', 'Agile Rival')}
                      </div>
                      <div className="type-caption-1 font-mono text-slate-400">~{preset.r3} WPM</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:block" />
        </section>

        {/* Right Panel: Controls & Sentence Themes (Strict Gestalt Spacing Hierarchy) */}
        <section className="w-full lg:w-[420px] xl:w-[460px] flex flex-col justify-between gap-4">
          {/* 1. Name & Jersey */}
          <div>
            <label className="block type-footnote-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {t('name_jersey_color', 'Runner Name & Jersey Color')}
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <input
                type="text"
                value={playerName}
                maxLength={15}
                onChange={(e) => onUpdatePlayerName(e.target.value)}
                className="flex-1 bg-white/[0.05] border border-white/15 focus:border-[#CCFF00] rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 type-headline text-white outline-none transition min-h-[40px] placeholder:text-slate-500"
                placeholder={t('username', 'Username')}
              />

              <div className="flex items-center justify-start gap-2 px-1 py-1 min-h-[40px]">
                {JERSEY_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleSelectColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all cursor-pointer active:scale-95 ${
                      playerColor === c.value
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#050811] scale-110 shadow-md'
                        : 'border border-white/20 hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 2. Difficulty Level */}
          <div>
            <label className="block type-footnote-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {t('difficulty', 'Difficulty')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectDiff('easy')}
                className={`py-2.5 px-2 sm:px-3 rounded-xl text-center transition cursor-pointer min-h-[52px] flex flex-col items-center justify-center gap-0.5 active:scale-97 ${
                  difficulty === 'easy'
                    ? 'bg-[#CCFF00] text-[#050811] font-black shadow-lg ring-2 ring-[#CCFF00]'
                    : 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 border border-white/10'
                }`}
              >
                <div className="type-callout-bold uppercase tracking-wider">
                  {t('beginner', 'Beginner')}
                </div>
                <div className={`font-mono type-footnote-semibold ${difficulty === 'easy' ? 'text-[#050811]' : 'text-[#CCFF00]'}`}>
                  ~40–45 WPM
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDiff('medium')}
                className={`py-2.5 px-2 sm:px-3 rounded-xl text-center transition cursor-pointer min-h-[52px] flex flex-col items-center justify-center gap-0.5 active:scale-97 ${
                  difficulty === 'medium'
                    ? 'bg-[#CCFF00] text-[#050811] font-black shadow-lg ring-2 ring-[#CCFF00]'
                    : 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 border border-white/10'
                }`}
              >
                <div className="type-callout-bold uppercase tracking-wider">
                  {t('intermediate', 'Intermediate')}
                </div>
                <div className={`font-mono type-footnote-semibold ${difficulty === 'medium' ? 'text-[#050811]' : 'text-amber-400'}`}>
                  ~70–75 WPM
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDiff('hard')}
                className={`py-2.5 px-2 sm:px-3 rounded-xl text-center transition cursor-pointer min-h-[52px] flex flex-col items-center justify-center gap-0.5 active:scale-97 ${
                  difficulty === 'hard'
                    ? 'bg-[#CCFF00] text-[#050811] font-black shadow-lg ring-2 ring-[#CCFF00]'
                    : 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 border border-white/10'
                }`}
              >
                <div className="type-callout-bold uppercase tracking-wider">
                  {t('expert', 'Expert')}
                </div>
                <div className={`font-mono type-footnote-semibold ${difficulty === 'hard' ? 'text-[#050811]' : 'text-rose-400'}`}>
                  ~95–110 WPM
                </div>
              </button>
            </div>
          </div>

          {/* 3. Typing Sentence Bank Options */}
          <div>
            <label className="block type-footnote-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {t('sentence_theme', 'Sentence Theme')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectTheme(opt.id)}
                  className={`px-3 py-2 rounded-xl text-center type-footnote-semibold transition cursor-pointer min-h-[38px] flex items-center justify-center active:scale-97 truncate ${
                    theme === opt.id
                      ? 'bg-blue-600 text-white border border-blue-400 shadow-md'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Action Button (Optically centered tap target) */}
          <div className="pt-1">
            <button
              ref={startBtnRef}
              type="button"
              onClick={handleStart}
              className={`w-full py-2.5 sm:py-3 px-4 min-h-[44px] type-title-3 font-display uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2.5 rounded-xl active:scale-98 transition ${
                isPractice
                  ? 'bg-amber-500 hover:bg-amber-400 text-[#050811] shadow-[0_8px_24px_rgba(245,158,11,0.45)]'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_8px_24px_rgba(37,99,235,0.45)]'
              }`}
            >
              <PlayIcon className="w-4.5 h-4.5 fill-current" />
              <span>{isPractice ? t('start_practice', 'Start Practice') : t('start_race', 'Start Race')}</span>
            </button>
          </div>
        </section>
      </main>

      {/* 3. Minimal Footer */}
      <footer className="relative z-20 w-full px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs font-sports text-slate-600 border-t border-white/[0.06] shrink-0">
        <span>Type Racing</span>
      </footer>
    </div>
  );
};
