import React, { useEffect, useRef } from 'react';
import { TournamentState } from '@/types/tournament';
import { playButtonClick, playWarningChime } from '@/utils/audio';
import { ArrowLeftIcon, XCircleIcon } from './icons/Icons';

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
  const retryBtnRef = useRef<HTMLButtonElement>(null);
  const lastStat = tournament.playerHistory[tournament.playerHistory.length - 1];
  const roundName =
    tournament.eliminatedAtRound === 1
      ? 'Perempat Final'
      : tournament.eliminatedAtRound === 2
      ? 'Semifinal'
      : 'Grand Final';

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
      ? 'Nyaris dapet piala! Lawan di final memang ganas, tapi jarimu udah sangar.'
      : `Nyaris dapet podium! Kamu finis di urutan #${lastStat?.rank || 3}. Kepanasan ya? Coba sekali lagi!`;

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-y-auto overflow-x-hidden flex flex-col justify-between bg-[#050811] text-white select-none animate-apple-in">
      {/* 1. Header Bar */}
      <header className="relative z-20 w-full px-[clamp(1rem,3dvw,2.5rem)] pt-[clamp(0.5rem,1.5vh,1.25rem)] pb-2 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <button
          type="button"
          onClick={() => handleAction(onExitToMenu)}
          className="flex items-center gap-2 px-3 py-1.5 -ml-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition cursor-pointer min-h-[40px]"
        >
          <ArrowLeftIcon className="w-4 h-4 text-slate-400 group-hover:text-white" />
          <span className="font-sports font-bold text-xs sm:text-sm tracking-wide">KEMBALI</span>
          <span className="text-[11px] font-mono text-slate-500 font-normal">[ESC]</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="font-sports text-xs font-bold text-rose-400 tracking-wider uppercase">
            HASIL BABAK
          </span>
        </div>
      </header>

      {/* 2. Main Elimination Card Area */}
      <main className="relative z-20 flex-1 w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center text-center my-auto">
        
        {/* Elimination Alert Icon (better-icons: lucide:x-circle) */}
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400">
          <XCircleIcon className="w-8 h-8" />
        </div>

        {/* Title */}
        <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
          GUGUR DI {roundName.toUpperCase()}
        </h1>
        <p className="font-sports text-sm sm:text-base text-slate-300 mt-1.5 max-w-md">
          {motivationHeadline}
        </p>

        {/* Telemetry Card */}
        {lastStat && (
          <div className="w-full rounded-2xl bg-[#0B101D] border border-white/10 p-3.5 my-5">
            <div className="text-xs font-sports font-bold text-slate-400 uppercase tracking-wider text-left mb-2.5">
              Catatan {roundName}
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[11px] font-sports text-slate-400">Kecepatan</div>
                <div className="font-stat-num text-xl sm:text-2xl font-bold text-white mt-0.5">
                  {lastStat.wpm} <span className="text-xs font-normal text-slate-400">WPM</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[11px] font-sports text-slate-400">Akurasi</div>
                <div className="font-stat-num text-xl sm:text-2xl font-bold text-white mt-0.5">
                  {lastStat.accuracy}%
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[11px] font-sports text-slate-400">Waktu</div>
                <div className="font-stat-num text-xl sm:text-2xl font-bold text-white mt-0.5">
                  {lastStat.timeStr}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            ref={retryBtnRef}
            type="button"
            onClick={() => handleAction(onRetry)}
            className="w-full sm:flex-1 py-3.5 px-6 min-h-[48px] text-base sm:text-lg font-display font-black tracking-wider uppercase cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[0_8px_25px_rgba(37,99,235,0.45)] active:scale-98 transition"
          >
            <span>TANDING ULANG!</span>
            <span className="text-xs font-mono font-medium opacity-70">[ENTER]</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onExitToMenu)}
            className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] text-xs sm:text-sm font-sports font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/12 rounded-xl transition cursor-pointer active:scale-98"
          >
            &lt; MENU [ESC]
          </button>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="relative z-20 w-full px-[clamp(1rem,3dvw,2.5rem)] py-1.5 flex items-center justify-between text-xs font-sports text-slate-600 border-t border-white/[0.06] shrink-0">
        <span>Type Racing</span>
      </footer>
    </div>
  );
};
