import React, { useEffect, useRef } from 'react';
import { TournamentState, TournamentParticipant } from '@/types/tournament';
import { playButtonClick } from '@/utils/audio';
import { ArrowLeftIcon, PlayIcon } from './icons/Icons';

interface TournamentBracketScreenProps {
  tournament: TournamentState;
  soundEnabled?: boolean;
  onStartRoundRace: () => void;
  onExitTournament: () => void;
}

export const TournamentBracketScreen: React.FC<TournamentBracketScreenProps> = ({
  tournament,
  soundEnabled = true,
  onStartRoundRace,
  onExitTournament
}) => {
  const ctaBtnRef = useRef<HTMLButtonElement>(null);
  const currentRound = tournament.currentRound;

  // Keyboard navigation: ENTER to proceed, ESC to back
  useEffect(() => {
    ctaBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        playButtonClick(soundEnabled);
        onStartRoundRace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        playButtonClick(soundEnabled);
        onExitTournament();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartRoundRace, onExitTournament, soundEnabled]);

  const handleStart = () => {
    playButtonClick(soundEnabled);
    onStartRoundRace();
  };

  const handleExit = () => {
    playButtonClick(soundEnabled);
    onExitTournament();
  };

  const roundHeadline =
    currentRound === 1
      ? 'Amankan Top 2 biar lolos ke semifinal! (~65 WPM)'
      : currentRound === 2
      ? 'Tembus 2 tercepat buat tiket babak penentuan! (~85 WPM)'
      : 'Wajib juara 1 buat angkat piala! (~105 WPM)';

  const renderParticipantPill = (p: TournamentParticipant, isCurrentRoundActive: boolean) => {
    const isPlayer = p.isPlayer;
    const isQualified = p.status === 'qualified';
    const isEliminated = p.status === 'eliminated';
    const isChampion = p.status === 'champion';

    let borderClass = 'border-white/10';
    let bgClass = 'bg-white/[0.03]';

    if (isPlayer) {
      borderClass = 'border-[#CCFF00] ring-1 ring-[#CCFF00]/40';
      bgClass = 'bg-[#CCFF00]/15';
    } else if (isChampion) {
      borderClass = 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)]';
      bgClass = 'bg-amber-400/20';
    } else if (isQualified) {
      borderClass = 'border-[#CCFF00]/60';
      bgClass = 'bg-[#CCFF00]/10';
    } else if (isEliminated) {
      borderClass = 'border-white/5 opacity-40';
      bgClass = 'bg-black/40';
    }

    return (
      <div
        key={p.id}
        className={`flex items-center justify-between px-3 py-1.5 sm:py-2 rounded-xl border ${borderClass} ${bgClass} transition-all duration-300 min-h-[36px]`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: p.color }}
          />
          <span
            className={`font-sports text-xs sm:text-sm font-bold truncate ${
              isPlayer ? 'text-[#CCFF00]' : isEliminated ? 'text-slate-500 line-through' : 'text-slate-200'
            }`}
          >
            {p.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {p.wpm && p.wpm > 0 && (
            <span className="font-mono text-[11px] text-slate-400 font-semibold">
              {p.wpm}w
            </span>
          )}

          {isChampion && (
            <span className="text-amber-400 text-xs font-bold font-sports">🏆 JUARA</span>
          )}
          {isQualified && !isChampion && (
            <span className="text-[#CCFF00] text-[11px] font-bold font-sports">✓ LOLOS</span>
          )}
          {isEliminated && (
            <span className="text-rose-400/70 text-[10px] font-medium font-sports">GUGUR</span>
          )}
          {!isQualified && !isEliminated && !isChampion && isCurrentRoundActive && (
            <span className="text-blue-400 text-[10px] font-mono">SIAP</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col justify-between bg-[#050811] text-white select-none animate-apple-in">
      {/* 1. Header Bar */}
      <header className="relative z-20 w-full px-[clamp(1rem,3dvw,2.5rem)] pt-[clamp(0.5rem,1.5vh,1rem)] pb-2 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <button
          type="button"
          onClick={handleExit}
          className="flex items-center gap-2 px-3 py-1.5 -ml-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition cursor-pointer min-h-[40px]"
        >
          <ArrowLeftIcon className="w-4 h-4 text-slate-400 group-hover:text-white" />
          <span className="font-sports font-bold text-xs sm:text-sm tracking-wide">KEMBALI</span>
          <span className="text-[11px] font-mono text-slate-500 font-normal">[ESC]</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
          <span className="font-sports text-xs font-bold text-[#CCFF00] tracking-wider uppercase">
            SISTEM GUGUR
          </span>
        </div>
      </header>

      {/* 2. Main Tournament Bracket Area */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-[clamp(1rem,3dvw,2.5rem)] py-[clamp(0.5rem,1.5vh,1.25rem)] flex flex-col justify-between overflow-y-auto overscroll-contain">
        
        {/* Title & Round Badge */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 mb-3 shrink-0">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
              Bagan Turnamen
            </h1>
            <p className="font-sports text-xs sm:text-sm text-slate-300 mt-0.5">
              <span className="text-[#CCFF00] font-bold">{roundHeadline}</span>
            </p>
          </div>

          <div className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 font-sports text-xs text-slate-300 font-semibold self-start sm:self-auto shrink-0">
            Babak {currentRound} dari 3
          </div>
        </div>

        {/* 3-Column Tournament Tree (Apple Glassmorphism Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 lg:gap-5 items-stretch my-auto">
          
          {/* TIER 1: PEREMPAT FINAL (8 Pelari, 2 Heats) */}
          <div
            className={`rounded-2xl p-3.5 sm:p-4.5 flex flex-col justify-between gap-3 transition-all duration-300 ${
              currentRound === 1
                ? 'bg-[#0B101D] border-2 border-[#CCFF00]/80 shadow-[0_0_30px_rgba(204,255,0,0.2)]'
                : 'bg-[#0B101D]/70 border border-white/10'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <div className="font-display font-black text-base sm:text-lg text-white">
                  Perempat Final
                </div>
                <div className="font-sports text-xs text-slate-400">
                  8 Pelari • Ambil 2 Tercepat
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                tournament.rounds.qf.completed
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : currentRound === 1
                  ? 'bg-[#CCFF00]/20 text-[#CCFF00]'
                  : 'bg-white/10 text-slate-400'
              }`}>
                {tournament.rounds.qf.completed ? 'Selesai' : 'Aktif'}
              </span>
            </div>

            {/* Heat 1 (Player's Heat) */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-sports font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Heat 1 (Lintasan Kamu)</span>
                <span className="text-[10px] text-[#CCFF00]">Top 2 Lolos</span>
              </div>
              <div className="space-y-1">
                {tournament.rounds.qf.heats[0].participants.map((p) =>
                  renderParticipantPill(p, currentRound === 1)
                )}
              </div>
            </div>

            {/* Heat 2 (AI Heat) */}
            <div className="space-y-1.5 pt-1.5 border-t border-white/[0.06]">
              <div className="text-[11px] font-sports font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Heat 2</span>
                <span className="text-[10px] text-slate-400">Top 2 Lolos</span>
              </div>
              <div className="space-y-1">
                {tournament.rounds.qf.heats[1].participants.map((p) =>
                  renderParticipantPill(p, currentRound === 1)
                )}
              </div>
            </div>
          </div>

          {/* TIER 2: SEMIFINAL (4 Pelari Terbaik) */}
          <div
            className={`rounded-2xl p-3.5 sm:p-4.5 flex flex-col justify-between gap-3 transition-all duration-300 ${
              currentRound === 2
                ? 'bg-[#0B101D] border-2 border-[#CCFF00]/80 shadow-[0_0_30px_rgba(204,255,0,0.2)]'
                : 'bg-[#0B101D]/70 border border-white/10'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <div className="font-display font-black text-base sm:text-lg text-white">
                  Semifinal
                </div>
                <div className="font-sports text-xs text-slate-400">
                  4 Pelari • Ambil 2 Tercepat
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                tournament.rounds.sf.completed
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : currentRound === 2
                  ? 'bg-[#CCFF00]/20 text-[#CCFF00]'
                  : 'bg-white/10 text-slate-400'
              }`}>
                {tournament.rounds.sf.completed
                  ? 'Selesai'
                  : currentRound === 2
                  ? 'Aktif'
                  : 'Menunggu'}
              </span>
            </div>

            <div className="space-y-1.5 flex-1 flex flex-col justify-center">
              <div className="text-[11px] font-sports font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Peserta Semifinal</span>
                <span className="text-[10px] text-[#CCFF00]">Top 2 Lolos</span>
              </div>

              {tournament.rounds.sf.heats[0].participants.length > 0 ? (
                <div className="space-y-1.5">
                  {tournament.rounds.sf.heats[0].participants.map((p) =>
                    renderParticipantPill(p, currentRound === 2)
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-xs font-sports text-slate-500 border border-dashed border-white/10 rounded-xl">
                  Nunggu hasil perempat final...
                </div>
              )}
            </div>

            <div className="text-[11px] font-sports text-slate-500 text-center">
              Target lawan: ~85 WPM
            </div>
          </div>

          {/* TIER 3: GRAND FINAL (Perebutan Piala) */}
          <div
            className={`rounded-2xl p-3.5 sm:p-4.5 flex flex-col justify-between gap-3 transition-all duration-300 ${
              currentRound === 3
                ? 'bg-[#0B101D] border-2 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.3)]'
                : 'bg-[#0B101D]/70 border border-white/10'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <div className="font-display font-black text-base sm:text-lg text-white flex items-center gap-2">
                  <span>Grand Final</span>
                  <span className="text-amber-400">🏆</span>
                </div>
                <div className="font-sports text-xs text-slate-400">
                  4 Finalis • Juara 1 Angkat Trofi
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                tournament.rounds.gf.completed
                  ? 'bg-amber-400/20 text-amber-400'
                  : currentRound === 3
                  ? 'bg-amber-400/20 text-amber-300'
                  : 'bg-white/10 text-slate-400'
              }`}>
                {tournament.rounds.gf.completed
                  ? 'Juara'
                  : currentRound === 3
                  ? 'Babak Final'
                  : 'Menunggu'}
              </span>
            </div>

            <div className="space-y-1.5 flex-1 flex flex-col justify-center">
              <div className="text-[11px] font-sports font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Finalis Kejuaraan</span>
                <span className="text-amber-400 text-[10px] font-bold">Wajib Juara 1</span>
              </div>

              {tournament.rounds.gf.heats[0].participants.length > 0 ? (
                <div className="space-y-1.5">
                  {tournament.rounds.gf.heats[0].participants.map((p) =>
                    renderParticipantPill(p, currentRound === 3)
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-xs font-sports text-slate-500 border border-dashed border-white/10 rounded-xl">
                  Nunggu finalis terbaik...
                </div>
              )}
            </div>

            <div className="text-[11px] font-sports text-amber-400/80 text-center font-medium">
              Target lawan: ~105 WPM
            </div>
          </div>
        </div>

        {/* 3. Action CTA Button (Always visible) */}
        <div className="pt-2 sm:pt-3 flex justify-end shrink-0">
          <button
            ref={ctaBtnRef}
            type="button"
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] text-base sm:text-lg font-display font-black tracking-wider uppercase cursor-pointer flex items-center justify-center gap-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[0_8px_25px_rgba(37,99,235,0.45)] active:scale-98 transition"
          >
            <PlayIcon className="w-5 h-5 fill-current" />
            <span>GAS BABAK {currentRound}!</span>
            <span className="text-xs font-mono font-medium opacity-70 ml-1">[ENTER]</span>
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
