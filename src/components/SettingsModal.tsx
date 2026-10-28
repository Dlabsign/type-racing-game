import React, { useEffect } from 'react';
import { DifficultyLevel, SentenceTheme } from '@/types/game';
import { playButtonClick, playModalClose } from '@/utils/audio';
import { SettingsIcon, RotateCcwIcon, LogOutIcon, CloseIcon } from './icons/Icons';

interface SettingsModalProps {
  isOpen: boolean;
  difficulty: DifficultyLevel;
  theme: SentenceTheme;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSelectDifficulty: (d: DifficultyLevel) => void;
  onSelectTheme: (theme: SentenceTheme) => void;
  onRestart: () => void;
  onClose: () => void;
  onExitToMenu?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  difficulty,
  theme,
  soundEnabled,
  onToggleSound,
  onSelectDifficulty,
  onSelectTheme,
  onRestart,
  onClose,
  onExitToMenu
}) => {
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
      className="fixed inset-0 z-50 bg-[#050811]/85 backdrop-blur-md flex items-center justify-center p-[clamp(0.75rem,3vw,2rem)] select-none animate-apple-in"
      onClick={handleClose}
    >
      <div
        className="bg-[#0B101D] border border-white/14 shadow-[0_24px_60px_rgba(0,0,0,0.85)] max-w-md w-full p-[clamp(1.25rem,3.5vw,2rem)] text-white rounded-2xl sm:rounded-3xl max-h-[88dvh] overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/12 pb-3.5 mb-5">
          <h3 className="font-display text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-[#CCFF00]" />
            SETELAN
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Audio Toggle */}
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <div>
            <div className="font-sports text-sm font-bold text-white">Efek Suara</div>
            <div className="font-sports text-xs text-slate-400">Suara ketukan tuts dan balapan</div>
          </div>
          <button
            type="button"
            onClick={() => handleAction(onToggleSound)}
            className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer flex items-center active:scale-95 ${
              soundEnabled ? 'bg-[#CCFF00]' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-[#050811] shadow-md transform transition-transform ${
                soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Difficulty Control */}
        <div className="py-3 border-b border-white/10">
          <label className="block font-sports text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Tingkat Lawan AI
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-[#060913] p-1.5 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                playButtonClick(soundEnabled);
                onSelectDifficulty('easy');
              }}
              className={`py-2.5 min-h-[44px] text-xs sm:text-sm font-sports font-bold rounded-lg transition cursor-pointer text-center active:scale-97 ${
                difficulty === 'easy'
                  ? 'bg-[#CCFF00] text-[#050811] font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pemula
            </button>
            <button
              type="button"
              onClick={() => {
                playButtonClick(soundEnabled);
                onSelectDifficulty('medium');
              }}
              className={`py-2.5 min-h-[44px] text-xs sm:text-sm font-sports font-bold rounded-lg transition cursor-pointer text-center active:scale-97 ${
                difficulty === 'medium'
                  ? 'bg-[#CCFF00] text-[#050811] font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Menengah
            </button>
            <button
              type="button"
              onClick={() => {
                playButtonClick(soundEnabled);
                onSelectDifficulty('hard');
              }}
              className={`py-2.5 min-h-[44px] text-xs sm:text-sm font-sports font-bold rounded-lg transition cursor-pointer text-center active:scale-97 ${
                difficulty === 'hard'
                  ? 'bg-[#CCFF00] text-[#050811] font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mahir
            </button>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="py-3 border-b border-white/10 mb-6">
          <label className="block font-sports text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Tema Kalimat
          </label>
          <div className="relative">
            <select
              value={theme}
              onChange={(e) => onSelectTheme(e.target.value as SentenceTheme)}
              className="w-full bg-[#060913] border border-white/14 focus:border-[#CCFF00] rounded-xl px-4 py-3 min-h-[44px] text-xs sm:text-sm font-sports font-bold text-white outline-none appearance-none cursor-pointer"
            >
              <option value="motivasi" className="bg-[#0B101D] text-white">Bahasa Indonesia</option>
              <option value="fakta" className="bg-[#0B101D] text-white">Fakta Menarik</option>
              <option value="produktivitas" className="bg-[#0B101D] text-white">Aktivitas Harian</option>
              <option value="english" className="bg-[#0B101D] text-white">English Sentences</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons (Touch friendly min 48px) */}
        <div className="flex flex-col gap-2.5 font-sports">
          <button
            type="button"
            onClick={() => handleAction(onRestart)}
            className="btn-action-primary w-full py-3.5 min-h-[48px] text-sm sm:text-base font-display font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 rounded-xl shadow-md active:scale-97"
          >
            <RotateCcwIcon className="w-4 h-4" />
            TANDING ULANG
          </button>

          {onExitToMenu && (
            <button
              type="button"
              onClick={() => handleAction(onExitToMenu)}
              className="w-full py-3 min-h-[48px] text-xs sm:text-sm font-sports font-bold bg-white/10 hover:bg-white/20 border border-white/12 text-slate-200 hover:text-white rounded-xl transition cursor-pointer flex items-center justify-center gap-2 active:scale-97"
            >
              <LogOutIcon className="w-4 h-4" />
              &lt; KEMBALI KE MENU
            </button>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="w-full text-slate-400 hover:text-white font-semibold py-2.5 text-xs transition cursor-pointer text-center"
          >
            LANJUT MAIN [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
