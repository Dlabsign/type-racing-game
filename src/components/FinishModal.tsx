'use client';

import React, { useEffect } from 'react';
import { RunnerState } from '@/types/game';
import { playButtonClick } from '@/utils/audio';
import { RotateCcwIcon, SettingsIcon, AwardIcon } from './icons/Icons';
import { useI18n } from '@/i18n/I18nContext';

interface FinishModalProps {
  isOpen: boolean;
  playerRank: number;
  winnerName: string;
  finishTimeStr: string;
  wpm: number;
  accuracy: number;
  correctWords: number;
  wrongWords: number;
  runners: RunnerState[];
  soundEnabled?: boolean;
  isPractice?: boolean;
  onPlayAgain: () => void;
  onOpenSettings?: () => void;
  onExitToMenu?: () => void;
  onOpenAchievements?: () => void;
}

export const FinishModal: React.FC<FinishModalProps> = ({
  isOpen,
  playerRank,
  finishTimeStr,
  wpm,
  accuracy,
  correctWords,
  wrongWords,
  runners,
  soundEnabled = true,
  isPractice = false,
  onPlayAgain,
  onOpenSettings,
  onExitToMenu,
  onOpenAchievements
}) => {
  const { t } = useI18n();

  // Listen for ENTER to play again and ESC to exit to menu
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        playButtonClick(soundEnabled);
        onPlayAgain();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        playButtonClick(soundEnabled);
        if (onExitToMenu) onExitToMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onPlayAgain, onExitToMenu, soundEnabled]);

  if (!isOpen) return null;

  const isPlayerWinner = playerRank === 1;
  const sortedRunners = [...runners].sort((a, b) => a.rank - b.rank);

  // Conversational reaction feedback
  let commentary = '';
  if (isPractice) {
    if (wpm >= 100) commentary = t('practice_feedback_master', 'Your typing velocity reached master sprint level.');
    else if (wpm >= 75) commentary = t('practice_feedback_great', 'Excellent rhythm and accuracy on the track.');
    else commentary = t('practice_feedback_good', 'Practice complete. Keep pushing to elevate your speed.');
  } else if (isPlayerWinner) {
    if (wpm >= 100) commentary = t('winner_feedback_master', 'Sensational sprint! Legendary velocity.');
    else commentary = t('first_place', 'First Place Victory!');
  } else if (playerRank === 2) {
    commentary = t('second_place', 'Second Place Podium!');
  } else if (playerRank === 3) {
    commentary = t('third_place', 'Third Place Finish!');
  } else {
    commentary = t('fourth_place', 'Good race! Continue training to top the podium.');
  }

  const handleAction = (cb?: () => void) => {
    playButtonClick(soundEnabled);
    if (cb) cb();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050811]/85 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-4 select-none animate-apple-in">
      <div className="swiss-card w-[min(92vw,500px)] p-3.5 sm:p-4.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.85)] max-h-[88dvh] overflow-y-auto overscroll-contain">
        {/* Header with Rank & Time */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2.5">
          <div>
            <span
              className={`inline-block type-caption-1-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1 shadow-sm ${
                isPractice
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : isPlayerWinner
                  ? 'bg-[#CCFF00] text-[#050811]'
                  : 'bg-white/15 text-white'
              }`}
            >
              {isPractice
                ? t('practice', 'Practice')
                : isPlayerWinner
                ? t('first_place', '1st Place')
                : `${t('rank', 'Rank')} ${playerRank}`}
            </span>
            <h2 className="type-title-2 text-white mt-1">
              {commentary}
            </h2>
          </div>
          <div className="text-right shrink-0 pl-3">
            <div className="type-caption-2-semibold text-slate-400 uppercase">
              {t('time', 'Time')}
            </div>
            <div className="type-title-1 text-[#CCFF00] font-mono-num leading-tight">
              {finishTimeStr}
            </div>
          </div>
        </div>

        {/* Segregated Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2.5">
          {/* 1. Kecepatan / WPM */}
          <div className="bg-[#060913] border border-white/[0.08] rounded-xl p-2 sm:p-2.5 text-center">
            <div className="type-caption-2-semibold text-slate-400 uppercase">WPM</div>
            <div className="type-title-2 text-[#CCFF00] font-mono-num leading-tight mt-0.5">
              {wpm}
            </div>
            <div className="type-caption-2 text-slate-400">
              {t('speed', 'Speed')}
            </div>
          </div>

          {/* 2. Akurasi */}
          <div className="bg-[#060913] border border-white/[0.08] rounded-xl p-2 sm:p-2.5 text-center">
            <div className="type-caption-2-semibold text-slate-400 uppercase">
              {t('accuracy', 'Accuracy')}
            </div>
            <div className="type-title-2 text-sky-400 font-mono-num leading-tight mt-0.5">
              {accuracy}%
            </div>
            <div className="type-caption-2 text-slate-400">
              {t('accuracy', 'Accuracy')}
            </div>
          </div>

          {/* 3. Kata Benar */}
          <div className="bg-[#060913] border border-white/[0.08] rounded-xl p-2 sm:p-2.5 text-center">
            <div className="type-caption-2-semibold text-slate-400 uppercase">
              {t('correct_words', 'Correct Words')}
            </div>
            <div className="type-title-2 text-emerald-400 font-mono-num leading-tight mt-0.5">
              {correctWords}
            </div>
            <div className="type-caption-2 text-slate-400">
              {t('words', 'Words')}
            </div>
          </div>

          {/* 4. Salah Ketik */}
          <div className="bg-[#060913] border border-white/[0.08] rounded-xl p-2 sm:p-2.5 text-center">
            <div className="type-caption-2-semibold text-slate-400 uppercase">
              {t('errors', 'Errors')}
            </div>
            <div className="type-title-2 text-rose-500 font-mono-num leading-tight mt-0.5">
              {wrongWords}
            </div>
            <div className="type-caption-2 text-slate-400">
              {t('mistakes', 'Chars')}
            </div>
          </div>
        </div>

        {/* Practice Mode Notice */}
        {isPractice && (
          <div className="mb-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between type-footnote">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{t('practice', 'Practice Mode')}</span>
            </div>
            <span className="font-mono type-caption-1 font-bold text-amber-200/90">
              0 {t('points', 'XP')}
            </span>
          </div>
        )}

        {/* Leaderboard Sprint Finish (Strict py: 10px-12px, px: 12px-14px) */}
        <div className="type-footnote-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          {isPractice ? t('practice_results', 'Practice Results') : t('race_finish_order', 'Finish Order')}
        </div>
        <div className="space-y-1.5 mb-3.5">
          {sortedRunners.map((runner) => (
            <div
              key={runner.id}
              className={`flex items-center justify-between py-2.5 px-3 sm:px-3.5 rounded-xl border transition ${
                runner.isPlayer
                  ? 'bg-[#CCFF00]/10 border-[#CCFF00]/40 text-white shadow-sm'
                  : 'bg-white/5 border-white/[0.08] text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-5.5 h-5.5 rounded-full flex items-center justify-center type-caption-1-semibold text-[#050811] shadow-xs"
                  style={{
                    backgroundColor: runner.color || (runner.isPlayer ? '#CCFF00' : '#64748B'),
                  }}
                >
                  {runner.rank}
                </span>
                <span className={`type-callout-semibold ${runner.isPlayer ? 'text-[#CCFF00]' : 'text-slate-200'}`}>
                  {runner.name} {runner.isPlayer && `(${t('you', 'You')})`}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className={`type-callout-bold font-mono-num ${runner.isPlayer ? 'text-[#CCFF00]' : 'text-slate-200'}`}>
                  {runner.wpm} WPM
                </span>
                <span className="text-slate-400 type-footnote font-mono">
                  {runner.finishTime !== null ? `${runner.finishTime.toFixed(1)}s` : 'DNF'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Primary Action Buttons (py: 8px-10px, px: 14px-16px) */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <button
            type="button"
            onClick={() => handleAction(onPlayAgain)}
            className="btn-action-primary w-full sm:flex-1 py-2 sm:py-2.5 px-3.5 sm:px-4 min-h-[38px] sm:min-h-[40px] type-headline uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 rounded-xl shadow-md active:scale-97"
          >
            <RotateCcwIcon className="w-4 h-4" />
            {isPractice ? t('practice_again', 'Practice Again') : t('race_again', 'Race Again')}
          </button>

          {onExitToMenu && (
            <button
              type="button"
              onClick={() => handleAction(onExitToMenu)}
              className="w-full sm:w-auto py-2 px-3.5 min-h-[38px] rounded-xl bg-white/10 hover:bg-white/20 active:scale-97 border border-white/12 text-slate-200 hover:text-white type-callout-semibold transition cursor-pointer"
            >
              {t('main_menu', 'Main Menu')}
            </button>
          )}

          {onOpenAchievements && (
            <button
              type="button"
              onClick={() => handleAction(onOpenAchievements)}
              className="p-2 min-w-[38px] min-h-[38px] rounded-xl bg-white/10 hover:bg-white/20 active:scale-97 border border-white/12 cursor-pointer text-slate-300 hover:text-white transition flex items-center justify-center"
              title={t('achievements', 'Achievements')}
            >
              <AwardIcon className="w-4 h-4 text-amber-400" />
            </button>
          )}

          {onOpenSettings && (
            <button
              type="button"
              onClick={() => handleAction(onOpenSettings)}
              className="p-2 min-w-[38px] min-h-[38px] rounded-xl bg-white/10 hover:bg-white/20 active:scale-97 border border-white/12 cursor-pointer text-slate-300 hover:text-white transition flex items-center justify-center"
              title={t('settings', 'Settings')}
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
