import React, { useEffect, useRef } from 'react';
import { playButtonClick, playModalClose } from '@/utils/audio';
import { AlertTriangleIcon, PlayIcon, LogOutIcon } from './icons/Icons';

interface ConfirmExitModalProps {
  isOpen: boolean;
  soundEnabled?: boolean;
  onResume: () => void;
  onConfirmExit: () => void;
}

export const ConfirmExitModal: React.FC<ConfirmExitModalProps> = ({
  isOpen,
  soundEnabled = true,
  onResume,
  onConfirmExit
}) => {
  const resumeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        resumeButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResume = () => {
    playModalClose(soundEnabled);
    onResume();
  };

  const handleExit = () => {
    playButtonClick(soundEnabled);
    onConfirmExit();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#050811]/85 backdrop-blur-md flex items-center justify-center p-[clamp(0.75rem,3vw,2rem)] select-none animate-apple-in"
      onClick={handleResume}
    >
      <div
        className="bg-[#0B101D] border border-white/14 shadow-[0_24px_60px_rgba(0,0,0,0.85)] max-w-md w-full p-[clamp(1.25rem,3.5vw,2rem)] text-white rounded-2xl sm:rounded-3xl max-h-[88dvh] overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3.5 mb-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <AlertTriangleIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-black text-white tracking-wide">
              YAKIN INGIN KELUAR?
            </h3>
            <span className="font-sports text-xs font-bold text-amber-400 uppercase tracking-wider">
              Balapan Sedang Berlangsung
            </span>
          </div>
        </div>

        <p className="font-sports text-sm text-slate-300 leading-relaxed mb-6">
          Balapan bakal dihentikan dan progres ketikanmu langsung hangus.
        </p>

        {/* Action Buttons: Primary vs Destructive (Touch friendly min 48px) */}
        <div className="flex flex-col sm:flex-row-reverse items-center gap-3 font-sports">
          <button
            ref={resumeButtonRef}
            type="button"
            onClick={handleResume}
            className="btn-action-primary w-full sm:flex-1 py-3 px-5 min-h-[48px] text-sm sm:text-base font-display font-black tracking-wider uppercase cursor-pointer flex items-center justify-center gap-2 rounded-xl shadow-md active:scale-97"
          >
            <PlayIcon className="w-4 h-4 fill-current" />
            LANJUT GAS [ESC]
          </button>

          <button
            type="button"
            onClick={handleExit}
            className="w-full sm:w-auto py-3 px-5 min-h-[48px] text-xs sm:text-sm font-sports font-bold text-rose-400 hover:text-white bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 active:scale-97"
          >
            <LogOutIcon className="w-4 h-4" />
            KELUAR
          </button>
        </div>
      </div>
    </div>
  );
};
