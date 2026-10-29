'use client';

import React from 'react';
import { useI18n } from '@/i18n/I18nContext';

interface CountdownOverlayProps {
  countdownText: string;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ countdownText }) => {
  const { t } = useI18n();
  const isStartWord =
    countdownText === 'MULAI!' ||
    countdownText === 'GO!' ||
    countdownText === 'Mulai!' ||
    countdownText === 'MULA!' ||
    countdownText === '出发！' ||
    countdownText === t('go', 'GO!');

  return (
    <div className="fixed inset-0 z-50 bg-[#050811]/85 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none animate-apple-in">
      <div className="bg-[#0B101D] border border-white/14 shadow-[0_24px_60px_rgba(0,0,0,0.9)] px-5 sm:px-6 py-5 sm:py-6 text-center rounded-2xl w-[min(92vw,400px)] flex flex-col items-center justify-center transition-all duration-200">
        {/* Top Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 type-caption-1-semibold text-[#CCFF00] uppercase tracking-wider mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-ping" />
          <span>{t('starting_line', 'Starting Line')}</span>
        </div>

        {/* Big Number / "GO!" Display */}
        <div className="w-full flex items-center justify-center my-1 py-1 overflow-hidden">
          <span
            className={`font-display font-black text-[#CCFF00] leading-none drop-shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-transform duration-200 ${
              isStartWord
                ? 'text-[clamp(3rem,9vw,5rem)] tracking-tight sm:tracking-normal scale-105'
                : 'text-[clamp(4.5rem,14vw,7.5rem)] font-mono-num'
            }`}
          >
            {isStartWord ? t('go', 'GO!') : countdownText}
          </span>
        </div>

        {/* Motivational Microcopy */}
        <p className="type-subhead text-slate-300 mt-2 max-w-[65ch] leading-relaxed">
          {isStartWord
            ? t('start_typing_now', 'Start typing now.')
            : t('ready_starting_line', 'Get set at the starting line.')}
        </p>
      </div>
    </div>
  );
};
