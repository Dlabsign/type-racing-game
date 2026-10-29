'use client';

import React, { useEffect, useRef } from 'react';
import { playButtonClick, playModalClose } from '@/utils/audio';
import { AlertTriangleIcon, PlayIcon, LogOutIcon } from './icons/Icons';
import { useI18n } from '@/i18n/I18nContext';

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
  const { t } = useI18n();
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
      className="fixed inset-0 z-50 bg-[#050811]/85 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-4 select-none animate-apple-in"
      onClick={handleResume}
    >
      <div
        className="swiss-card w-[min(92vw,440px)] p-3.5 sm:p-4.5 text-white shadow-[0_24px_60px_rgba(0,0,0,0.85)] max-h-[88dvh] overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <AlertTriangleIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="type-title-2 text-white">
              {t('confirm_exit', 'Confirm Exit')}
            </h3>
            <span className="type-caption-1-semibold text-amber-400 uppercase tracking-wider block mt-0.5">
              {t('race_in_progress', 'Race In Progress')}
            </span>
          </div>
        </div>

        <p className="type-body text-slate-300 leading-[1.48] mb-3.5 max-w-[65ch]">
          {t('exit_confirm_msg', 'Are you sure you want to exit? Current race progress will not be saved.')}
        </p>

        {/* Action Buttons: Primary vs Destructive (py: 8px-10px, px: 14px-16px) */}
        <div className="flex flex-col sm:flex-row-reverse items-center gap-2">
          <button
            ref={resumeButtonRef}
            type="button"
            onClick={handleResume}
            className="btn-action-primary w-full sm:flex-1 py-2 sm:py-2.5 px-3.5 sm:px-4 min-h-[38px] sm:min-h-[40px] type-headline uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 rounded-xl shadow-md active:scale-97"
          >
            <PlayIcon className="w-4 h-4 fill-current" />
            {t('resume', 'Resume')}
          </button>

          <button
            type="button"
            onClick={handleExit}
            className="w-full sm:w-auto py-2 px-3.5 min-h-[38px] type-callout-semibold text-rose-400 hover:text-white bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 active:scale-97"
          >
            <LogOutIcon className="w-4 h-4" />
            {t('exit', 'Exit')}
          </button>
        </div>
      </div>
    </div>
  );
};
