'use client';

import React, { useEffect, useRef } from 'react';
import { TournamentState } from '@/types/tournament';
import { playButtonClick, playWarningChime } from '@/utils/audio';
import { ArrowLeftIcon, XCircleIcon } from './icons/Icons';
import { useI18n } from '@/i18n/I18nContext';

interface TournamentEliminatedScreenProps {
  tournament: TournamentState;
  soundEnabled?: boolean;
  onRetry: () => void;
  onExitToMenu: () => void;
}

export const TournamentEliminatedScreen: React.FC<TournamentEliminatedScreenProps> = ({
  tournament,
  soundEnabled = true,
  onRetry,
  onExitToMenu
}) => {
  const { t } = useI18n();
  const retryBtnRef = useRef<HTMLButtonElement>(null);
  const lastStat = tournament.playerHistory[tournament.playerHistory.length - 1];
  const roundName =
    tournament.eliminatedAtRound === 1
      ? t('quarter_final', 'Quarterfinal')
      : tournament.eliminatedAtRound === 2
      ? t('semifinal', 'Semifinal')
      : t('final_round', 'Championship Final');

  useEffect(() => {
    retryBtnRef.current?.focus();
    playWarningChime(soundEnabled);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        playButtonClick(soundEnabled);
        onRetry();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        playButtonClick(soundEnabled);
        onExitToMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRetry, onExitToMenu, soundEnabled]);

  const handleAction = (cb: () => void) => {
    playButtonClick(soundEnabled);
    cb();
  };

  const motivationHeadline =
    tournament.eliminatedAtRound === 3
      ? t('eliminated_final_desc', 'You fought all the way to the final! Train hard and the trophy is yours next time.')
      : t('eliminated_desc', 'Great effort! You finished #{rank} in this round. Keep practicing to shatter your limits!', {
          rank: lastStat?.rank || 3
        });

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-y-auto overflow-x-hidden flex flex-col justify-between bg-[#050811] text-white select-none animate-apple-in">
      {/* 1. Header Bar */}
      <header className="relative z-20 w-full px-4 sm:px-6 lg:px-8 pt-2.5 pb-2 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <button
          type="button"
          onClick={() => handleAction(onExitToMenu)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 -ml-1 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition cursor-pointer min-h-[36px]"
        >
          <ArrowLeftIcon className="w-4 h-4 text-slate-400 group-hover:text-white" />
          <span className="font-sports font-bold text-xs sm:text-sm tracking-wide">
            {t('back', 'Back')}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-sports text-xs font-bold text-rose-400 tracking-wider uppercase">
            {t('knockout_system', 'Knockout Stage')}
          </span>
        </div>
      </header>

      {/* 2. Main Eliminated Area */}
      <main className="relative z-20 flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col items-center justify-center text-center my-auto">
        {/* Eliminated Badge Icon */}
        <div className="relative mb-2.5 flex items-center justify-center">
          <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl transform scale-125" />
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-rose-500/15 border-2 border-rose-500/40 flex items-center justify-center relative z-10 text-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.3)]">
            <XCircleIcon className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
        </div>

        {/* Title */}
        <h1 className="type-large-title text-white">
          {t('eliminated_title', 'Eliminated in {round}', { round: roundName })}
        </h1>
        <p className="type-body text-slate-300 mt-1.5 max-w-[65ch] leading-[1.48]">
          {motivationHeadline}
        </p>

        {/* Last Round Stats Cards */}
        {lastStat && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-xl my-4">
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#0B101D] border border-white/10 shadow-lg text-center">
              <div className="type-caption-2-semibold text-slate-400 uppercase tracking-wider">
                {t('rank', 'Rank')}
              </div>
              <div className="font-stat-num type-title-2 font-bold text-rose-400 mt-0.5">
                #{lastStat.rank}
              </div>
              <div className="type-caption-2 text-slate-400 font-bold">{roundName}</div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[#0B101D] border border-white/10 shadow-lg text-center">
              <div className="type-caption-2-semibold text-slate-400 uppercase tracking-wider">
                {t('speed', 'Speed')}
              </div>
              <div className="font-stat-num type-title-2 font-bold text-[#CCFF00] mt-0.5">
                {lastStat.wpm}
              </div>
              <div className="type-caption-2 text-slate-400 font-bold">WPM</div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[#0B101D] border border-white/10 shadow-lg text-center">
              <div className="type-caption-2-semibold text-slate-400 uppercase tracking-wider">
                {t('accuracy', 'Accuracy')}
              </div>
              <div className="font-stat-num type-title-2 font-bold text-white mt-0.5">
                {lastStat.accuracy}%
              </div>
              <div className="type-caption-2 text-slate-400 font-bold">{t('accuracy', 'Accuracy')}</div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[#0B101D] border border-white/10 shadow-lg text-center">
              <div className="type-caption-2-semibold text-slate-400 uppercase tracking-wider">
                {t('time', 'Time')}
              </div>
              <div className="font-stat-num type-title-2 font-bold text-sky-300 mt-0.5">
                {lastStat.timeStr || `${lastStat.timeSec?.toFixed(1)}s`}
              </div>
              <div className="type-caption-2 text-slate-400 font-bold">{t('time', 'Duration')}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-md">
          <button
            ref={retryBtnRef}
            type="button"
            onClick={() => handleAction(onRetry)}
            className="w-full sm:flex-1 py-2.5 sm:py-3 px-6 min-h-[44px] type-headline uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[0_4px_16px_rgba(37,99,235,0.35)] active:scale-98 transition"
          >
            <span>{t('try_again', 'Try Again')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onExitToMenu)}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-3 min-h-[44px] type-callout-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/12 rounded-xl transition cursor-pointer active:scale-98"
          >
            {t('main_menu', 'Main Menu')}
          </button>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="relative z-20 w-full px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-xs font-sports text-slate-600 border-t border-white/[0.06] shrink-0">
        <span>Type Racing</span>
      </footer>
    </div>
  );
};
