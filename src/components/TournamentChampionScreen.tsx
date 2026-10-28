import React, { useEffect, useRef } from 'react';
import { TournamentState } from '@/types/tournament';
import { calculateTournamentStats } from '@/utils/tournamentEngine';
import { playButtonClick, playTrophyFanfare } from '@/utils/audio';
import { ArrowLeftIcon, GrandTrophyIcon } from './icons/Icons';

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
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-sports text-xs font-bold text-amber-400 tracking-wider uppercase">
            PODIUM UTAMA
          </span>
        </div>
      </header>

      {/* 2. Main Champion Podium Area */}
      <main className="relative z-20 flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col items-center justify-center text-center my-auto">
        
        {/* Championship Golden Trophy Vector (better-icons: solar:cup-star-bold-duotone) */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-400/25 rounded-full blur-3xl transform scale-125" />
          <GrandTrophyIcon className="w-24 h-24 sm:w-32 sm:h-32 relative z-10 text-amber-400 drop-shadow-[0_12px_28px_rgba(251,191,36,0.65)] animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase">
          JUARA! GAK ADA LAWAN!
        </h1>
        <p className="font-sports text-sm sm:text-base text-slate-300 mt-2 max-w-lg">
          Gila, enteng banget jarinya! Seluruh babak disapu bersih tanpa ampun sampai bawa pulang trofi kejuaraan.
        </p>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-xl my-5">
          <div className="p-3 sm:p-4 rounded-2xl bg-[#0B101D] border border-amber-400/40 shadow-lg text-center">
            <div className="text-[11px] font-sports font-bold text-slate-400 uppercase tracking-wider">
              Rata-rata WPM
            </div>
            <div className="font-stat-num text-2xl sm:text-3xl font-black text-[#CCFF00] mt-1">
              {stats.avgWpm}
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-[#0B101D] border border-white/10 shadow-lg text-center">
            <div className="text-[11px] font-sports font-bold text-slate-400 uppercase tracking-wider">
              Akurasi
            </div>
            <div className="font-stat-num text-2xl sm:text-3xl font-black text-white mt-1">
              {stats.avgAccuracy}%
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-[#0B101D] border border-white/10 shadow-lg text-center">
            <div className="text-[11px] font-sports font-bold text-slate-400 uppercase tracking-wider">
              Total Waktu
            </div>
            <div className="font-stat-num text-2xl sm:text-3xl font-black text-amber-300 mt-1">
              {stats.totalTimeStr}
            </div>
          </div>
        </div>

        {/* Per-Round History Card */}
        <div className="w-full max-w-xl rounded-2xl bg-[#0B101D]/80 border border-white/10 p-3.5 mb-5">
          <div className="text-xs font-sports font-bold text-slate-400 uppercase tracking-wider text-left mb-2">
            Riwayat 3 Babak
          </div>
          <div className="space-y-1.5">
            {tournament.playerHistory.map((h) => (
              <div
                key={h.roundId}
                className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-sports"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{h.roundName}</span>
                  <span className="text-[11px] text-amber-400 font-bold">
                    Podium #{h.rank}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-slate-300">
                  <span>{h.wpm} WPM</span>
                  <span>{h.accuracy}%</span>
                  <span>{h.timeStr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          <button
            ref={ctaBtnRef}
            type="button"
            onClick={() => handleAction(onPlayAgain)}
            className="w-full sm:flex-1 py-3.5 px-6 min-h-[48px] text-base sm:text-lg font-display font-black tracking-wider uppercase cursor-pointer flex items-center justify-center gap-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[0_8px_25px_rgba(37,99,235,0.45)] active:scale-98 transition"
          >
            <span>GAS LAGI!</span>
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
