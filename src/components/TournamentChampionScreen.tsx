'use client';

import React, { useEffect, useRef } from 'react';
import { TournamentState } from '@/types/tournament';
import { calculateTournamentStats } from '@/utils/tournamentEngine';
import { playButtonClick, playTrophyFanfare } from '@/utils/audio';
import { ArrowLeftIcon, GrandTrophyIcon } from './icons/Icons';
import { useI18n } from '@/i18n/I18nContext';

interface TournamentChampionScreenProps {
  tournament: TournamentState;
  soundEnabled?: boolean;
  onPlayAgain: () => void;
  onExitToMenu: () => void;
}

export const TournamentChampionScreen: React.FC<TournamentChampionScreenProps> = ({
  tournament,
  soundEnabled = true,
  onPlayAgain,
  onExitToMenu
}) => {
  const { t } = useI18n();
  const ctaBtnRef = useRef<HTMLButtonElement>(null);
  const stats = calculateTournamentStats(tournament.playerHistory);

  useEffect(() => {
    ctaBtnRef.current?.focus();
    playTrophyFanfare(soundEnabled);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        playButtonClick(soundEnabled);
        onPlayAgain();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        playButtonClick(soundEnabled);
        onExitToMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayAgain, onExitToMenu, soundEnabled]);

  const handleAction = (cb: () => void) => {
    playButtonClick(soundEnabled);
    cb();
  };

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
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-sports text-xs font-bold text-amber-400 tracking-wider uppercase">
            {t('main_podium', 'Championship Podium')}
          </span>
        </div>
      </header>

      {/* 2. Main Champion Podium Area */}
      <main className="relative z-20 flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col items-center justify-center text-center my-auto">
        {/* Championship Golden Trophy Vector */}
        <div className="relative mb-2.5 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-400/25 rounded-full blur-3xl transform scale-125" />
          <GrandTrophyIcon className="w-20 h-20 sm:w-24 sm:h-24 relative z-10 text-amber-400 drop-shadow-[0_8px_20px_rgba(251,191,36,0.55)] animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="type-large-title text-white uppercase">
          {t('tournament_champion', 'Tournament Champion')}
        </h1>
        <p className="type-body text-slate-300 mt-1.5 max-w-[65ch] leading-[1.48]">
          {t('champion_desc', 'Glory awaits! You swept every round opponent to capture the gold trophy!')}
        </p>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-xl my-4">
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#0B101D] border border-amber-400/50 shadow-[0_0_18px_rgba(251,191,36,0.15)] text-center">
            <div className="type-caption-2-semibold text-amber-400 uppercase tracking-wider">
              {t('total_prize', 'Total Points')}
            </div>
            <div className="font-stat-num type-title-2 font-bold text-amber-300 mt-0.5">
              +{stats.totalPoints.toLocaleString()}
            </div>
            <div className="type-caption-2 text-slate-400 font-bold">
              {t('points', 'XP')}
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-[#0B101D] border border-white/10 shadow-lg text-center">
            <div className="type-caption-2-semibold text-slate-400 uppercase tracking-wider">
              {t('avg_speed', 'Average Speed')}
            </div>
            <div className="font-stat-num type-title-2 font-bold text-[#CCFF00] mt-0.5">
              {stats.avgWpm}
            </div>
            <div className="type-caption-2 text-slate-400 font-bold">
              WPM
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-[#0B101D] border border-white/10 shadow-lg text-center">
            <div className="type-caption-2-semibold text-slate-400 uppercase tracking-wider">
              {t('avg_accuracy', 'Average Accuracy')}
            </div>
            <div className="font-stat-num type-title-2 font-bold text-white mt-0.5">
              {stats.avgAccuracy}%
            </div>
            <div className="type-caption-2 text-slate-400 font-bold">
              {t('accuracy', 'Accuracy')}
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-[#0B101D] border border-white/10 shadow-lg text-center">
            <div className="type-caption-2-semibold text-slate-400 uppercase tracking-wider">
              {t('total_time', 'Total Time')}
            </div>
            <div className="font-stat-num type-title-2 font-bold text-sky-300 mt-0.5">
              {stats.totalTimeStr}
            </div>
            <div className="type-caption-2 text-slate-400 font-bold">
              {t('time', 'Duration')}
            </div>
          </div>
        </div>

        {/* Per-Round History Card */}
        <div className="w-full max-w-xl rounded-xl bg-[#0B101D]/80 border border-white/10 p-3 mb-4">
          <div className="type-footnote-semibold text-slate-400 uppercase tracking-wider text-left mb-1.5 flex items-center justify-between">
            <span>{t('round_history', 'Three-Round Match History')}</span>
            <span className="type-caption-2 text-amber-400 font-bold">
              {t('points_accumulated', 'Accumulated Points')}
            </span>
          </div>
          <div className="space-y-1">
            {tournament.playerHistory.map((h) => (
              <div
                key={h.roundId}
                className="flex items-center justify-between p-2 sm:px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] type-footnote"
              >
                <div className="flex items-center gap-2">
                  <span className="type-callout-semibold text-white">{h.roundName}</span>
                  <span className="type-caption-1 text-amber-400 font-bold">
                    #{h.rank}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 font-mono text-slate-300">
                  <span>{h.wpm} WPM</span>
                  <span>{h.accuracy}%</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#CCFF00]/15 text-[#CCFF00] font-bold type-caption-2 border border-[#CCFF00]/25">
                    +{(h.points || 0).toLocaleString()} {t('points', 'PTS')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-md">
          <button
            ref={ctaBtnRef}
            type="button"
            onClick={() => handleAction(onPlayAgain)}
            className="w-full sm:flex-1 py-2.5 sm:py-3 px-6 min-h-[44px] type-headline uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[0_4px_16px_rgba(37,99,235,0.35)] active:scale-98 transition"
          >
            <span>{t('try_again', 'Play Again')}</span>
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
