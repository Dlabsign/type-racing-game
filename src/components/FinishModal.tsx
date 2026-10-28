import React, { useEffect } from 'react';
import { RunnerState } from '@/types/game';
import { playButtonClick } from '@/utils/audio';
import { RotateCcwIcon, SettingsIcon } from './icons/Icons';

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
  onPlayAgain: () => void;
  onOpenSettings?: () => void;
  onExitToMenu?: () => void;
}

export const FinishModal: React.FC<FinishModalProps> = ({
  isOpen,
  playerRank,
  winnerName,
  finishTimeStr,
  wpm,
  accuracy,
  correctWords,
  wrongWords,
  runners,
  soundEnabled = true,
  onPlayAgain,
  onOpenSettings,
  onExitToMenu
}) => {
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
  if (isPlayerWinner) {
    if (wpm >= 100) commentary = 'GILA, JARI KILAT! GAK ADA LAWAN!';
    else if (wpm >= 75) commentary = 'NGEBUT BANGET! PODIUM AMAN!';
    else commentary = 'PODIUM 1! MANTAP!';
  } else if (playerRank === 2) {
    commentary = 'NYARIS DAPET PODIUM 1! BEDA TIPIS!';
  } else if (playerRank === 3) {
    commentary = 'MASUK 3 BESAR! NAFAS DULU, GAS LAGI!';
  } else {
    commentary = 'KEPANASAN YA? COBA SEKALI LAGI!';
  }

  const handleAction = (cb?: () => void) => {
    playButtonClick(soundEnabled);
    if (cb) cb();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050811]/85 backdrop-blur-md flex items-center justify-center p-[clamp(0.75rem,3vw,2rem)] select-none animate-apple-in">
      {/* High-Speed Sports Poster Result Card */}
      <div className="bg-[#0B101D] border border-white/14 max-w-xl w-full p-[clamp(1.25rem,3.5vw,2rem)] text-white rounded-2xl sm:rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] max-h-[88dvh] overflow-y-auto overscroll-contain">
        {/* Header with Rank & Time */}
        <div className="flex items-center justify-between border-b border-white/12 pb-4">
          <div>
            <span
              className={`inline-block text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full mb-2 font-display shadow-sm ${
                isPlayerWinner ? 'bg-[#CCFF00] text-[#050811]' : 'bg-white/15 text-white'
              }`}
            >
              {isPlayerWinner ? 'PODIUM 1 🏆' : `PODIUM #${playerRank}`}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-wider">
              {commentary}
            </h2>
          </div>
          <div className="text-right shrink-0 pl-3">
            <div className="font-sports text-[10px] sm:text-xs text-slate-400 uppercase font-bold">Waktu</div>
            <div className="font-display text-2xl sm:text-3xl font-black text-[#CCFF00] tracking-widest font-mono-num">
              {finishTimeStr}
            </div>
          </div>
        </div>

        {/* Segregated Stat Chips */}
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5 my-5">
          {/* 1. Kecepatan / WPM */}
          <div className="bg-[#060913] border border-white/10 rounded-2xl p-2.5 sm:p-3 text-center">
            <div className="font-sports text-[10px] font-bold text-slate-400 uppercase">WPM</div>
            <div className="font-display text-xl sm:text-3xl font-black text-[#CCFF00] tracking-wider font-mono-num">
              {wpm}
            </div>
            <div className="font-sports text-[9px] sm:text-[10px] text-slate-400 font-bold">Kecepatan</div>
          </div>

          {/* 2. Akurasi */}
          <div className="bg-[#060913] border border-white/10 rounded-2xl p-2.5 sm:p-3 text-center">
            <div className="font-sports text-[10px] font-bold text-slate-400 uppercase">Akurasi</div>
            <div className="font-display text-xl sm:text-3xl font-black text-sky-400 tracking-wider font-mono-num">
              {accuracy}%
            </div>
            <div className="font-sports text-[9px] sm:text-[10px] text-slate-400 font-bold">Ketepatan</div>
          </div>

          {/* 3. Kata Benar */}
          <div className="bg-[#060913] border border-white/10 rounded-2xl p-2.5 sm:p-3 text-center">
            <div className="font-sports text-[10px] font-bold text-slate-400 uppercase">Kata Benar</div>
            <div className="font-display text-xl sm:text-3xl font-black text-emerald-400 tracking-wider font-mono-num">
              {correctWords}
            </div>
            <div className="font-sports text-[9px] sm:text-[10px] text-slate-400 font-bold">Kata</div>
          </div>

          {/* 4. Salah Ketik */}
          <div className="bg-[#060913] border border-white/10 rounded-2xl p-2.5 sm:p-3 text-center">
            <div className="font-sports text-[10px] font-bold text-slate-400 uppercase">Salah</div>
            <div className="font-display text-xl sm:text-3xl font-black text-rose-500 tracking-wider font-mono-num">
              {wrongWords}
            </div>
            <div className="font-sports text-[9px] sm:text-[10px] text-slate-400 font-bold">Koreksi</div>
          </div>
        </div>

        {/* Leaderboard Sprint Finish */}
        <div className="font-sports text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Urutan Finis
        </div>
        <div className="space-y-2 mb-6 font-sports">
          {sortedRunners.map((runner) => (
            <div
              key={runner.id}
              className={`flex items-center justify-between p-2.5 rounded-2xl border transition ${
                runner.isPlayer
                  ? 'bg-[#CCFF00]/10 border-[#CCFF00]/40 text-white shadow-sm'
                  : 'bg-white/5 border-white/10 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center font-display font-black text-xs text-[#050811] shadow-xs"
                  style={{
                    backgroundColor: runner.color || (runner.isPlayer ? '#CCFF00' : '#64748B'),
                  }}
                >
                  {runner.rank}
                </span>
                <span className={`font-bold text-xs sm:text-sm ${runner.isPlayer ? 'text-[#CCFF00]' : 'text-slate-200'}`}>
                  {runner.name} {runner.isPlayer && '(Kamu)'}
                </span>
              </div>
              <div className="flex items-center gap-3 font-display text-sm sm:text-base">
                <span className={`font-black font-mono-num ${runner.isPlayer ? 'text-[#CCFF00]' : 'text-slate-200'}`}>
                  {runner.wpm} WPM
                </span>
                <span className="text-slate-400 text-xs font-sports">
                  {runner.finishTime !== null ? `${runner.finishTime.toFixed(1)}s` : 'DNF'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 font-sports">
          <button
            type="button"
            onClick={() => handleAction(onPlayAgain)}
            className="btn-action-primary w-full sm:flex-1 py-3.5 px-5 min-h-[48px] text-base sm:text-lg font-display font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 rounded-2xl shadow-md active:scale-97"
          >
            <RotateCcwIcon className="w-5 h-5" />
            GAS LAGI [ENTER]
          </button>

          {onExitToMenu && (
            <button
              type="button"
              onClick={() => handleAction(onExitToMenu)}
              className="w-full sm:w-auto py-3.5 px-6 min-h-[48px] rounded-2xl bg-white/10 hover:bg-white/20 active:scale-97 border border-white/12 text-slate-200 hover:text-white font-sports font-bold text-xs sm:text-sm transition cursor-pointer"
            >
              &lt; MENU [ESC]
            </button>
          )}

          {onOpenSettings && (
            <button
              type="button"
              onClick={() => handleAction(onOpenSettings)}
              className="p-3.5 min-w-[48px] min-h-[48px] rounded-2xl bg-white/10 hover:bg-white/20 active:scale-97 border border-white/12 cursor-pointer text-slate-300 hover:text-white transition flex items-center justify-center"
              title="SETELAN"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
