import React, { useRef, useEffect, useState } from 'react';
import { ZapIcon } from './icons/Icons';
import { useI18n } from '@/i18n/I18nContext';

interface TypingArenaProps {
  sentence: string;
  charIndex: number;
  hasCharError: boolean;
  hasSpeedBurst?: boolean;
  wordStreak?: number;
  // Optional telemetry values for compatibility
  formattedTime?: string;
  rank?: number;
  totalRunners?: number;
  wpm?: number;
  accuracy?: number;
}

export const TypingArena: React.FC<TypingArenaProps> = ({
  sentence,
  charIndex,
  hasCharError,
  hasSpeedBurst = false,
  wordStreak = 0
}) => {
  const { t } = useI18n();
  const promptBoxRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);
  const [shakePrompt, setShakePrompt] = useState<boolean>(false);

  // Trigger container error shake effect
  useEffect(() => {
    if (hasCharError) {
      const frame = requestAnimationFrame(() => {
        setShakePrompt(true);
      });
      const timer = setTimeout(() => {
        setShakePrompt(false);
      }, 200);
      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(timer);
      };
    }
  }, [hasCharError]);

  // Smooth auto-scroll following the active caret position
  useEffect(() => {
    if (promptBoxRef.current && activeCharRef.current) {
      const container = promptBoxRef.current;
      const target = activeCharRef.current;
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      // Scroll vertically if wrapped, or horizontally if overflowing
      const offsetTop = targetRect.top - containerRect.top + container.scrollTop;
      const desiredScrollY = offsetTop - containerRect.height * 0.4;
      container.scrollTo({
        top: Math.max(0, desiredScrollY),
        behavior: 'smooth'
      });
    }
  }, [charIndex]);

  const typedStr = sentence.slice(0, charIndex);
  const currentChar = sentence[charIndex] || '';
  const afterCursorStr = sentence.slice(charIndex + 1);

  return (
    <div className="fixed bottom-[max(0.6rem,env(safe-area-inset-bottom,0.6rem))] left-1/2 -translate-x-1/2 w-[min(94vw,760px)] z-40 select-none px-2 sm:px-0">
      {/* 15-Word Streak Speed Burst Floating Badge */}
      {hasSpeedBurst && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#CCFF00] text-[#050811] type-caption-2-semibold tracking-wider shadow-[0_0_16px_rgba(204,255,0,0.7)] animate-bounce flex items-center gap-1.5 whitespace-nowrap z-50">
          <ZapIcon className="w-3.5 h-3.5 fill-current" />
          <span>{t('streak_15_badge', '15-Word Flawless Streak')}</span>
        </div>
      )}

      {/* Ergonomic Floating Typing Island (Disciplined 14px padding, 65ch measure) */}
      <div className="w-full bg-[#0B101D]/95 backdrop-blur-2xl border border-white/14 rounded-2xl sm:rounded-3xl shadow-[0_16px_45px_rgba(0,0,0,0.85)] p-2.5 sm:p-3.5 transition-all">
        <div
          ref={promptBoxRef}
          className={`relative bg-[#060913]/90 rounded-xl sm:rounded-2xl border border-white/[0.08] px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center min-h-[64px] sm:min-h-[72px] max-h-[135px] overflow-y-auto overscroll-contain transition-all ${
            shakePrompt ? 'error-shake' : ''
          }`}
        >
          {/* Word Streak subtle indicator in top-right corner */}
          {wordStreak > 3 && !hasSpeedBurst && (
            <div className="absolute top-1.5 right-3 type-caption-2-semibold text-[#CCFF00]/80 uppercase tracking-wider">
              {wordStreak} {t('streak', 'Streak')}
            </div>
          )}

          <div className="typing-target-text type-body w-full max-w-[65ch] mx-auto break-words whitespace-pre-wrap select-none text-left leading-[1.48]">
            {/* 1. Karakter Terketik Benar: Volt Neon Glow */}
            <span className="text-[#CCFF00] font-bold tracking-tight">
              {typedStr}
            </span>

            {/* 2. Karakter Aktif di Bawah Kursor Volt Berkedip */}
            {charIndex < sentence.length ? (
              <span ref={activeCharRef} className="inline-flex items-baseline relative">
                <span className="active-caret-volt" />
                {hasCharError ? (
                  <span className="error-char-microshake px-1 font-bold">
                    {currentChar === ' ' ? '␣' : currentChar}
                  </span>
                ) : (
                  <span className="text-white font-extrabold underline decoration-[#CCFF00] decoration-2 underline-offset-4">
                    {currentChar === ' ' ? <span className="space-char-indicator">&nbsp;</span> : currentChar}
                  </span>
                )}
              </span>
            ) : (
              <span ref={activeCharRef} className="active-caret-volt" />
            )}

            {/* 3. Karakter Berikutnya: Slate Redup Jelas */}
            <span className="text-slate-400 font-normal">
              {afterCursorStr}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
