import React, { useRef, useEffect, useState } from 'react';
import { GaugeIcon, ZapIcon } from './icons/Icons';

interface TypingArenaProps {
  sentence: string;
  charIndex: number;
  hasCharError: boolean;
  hasSpeedBurst?: boolean;
  wordStreak?: number;
  // Left Column Telemetry
  formattedTime: string;
  rank: number;
  totalRunners?: number;
  wpm: number;
  accuracy: number;
}

export const TypingArena: React.FC<TypingArenaProps> = ({
  sentence,
  charIndex,
  hasCharError,
  hasSpeedBurst = false,
  wordStreak = 0,
  formattedTime,
  rank,
  totalRunners = 4,
  wpm,
  accuracy
}) => {
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

      const offsetLeft = targetRect.left - containerRect.left + container.scrollLeft;
      const desiredScroll = offsetLeft - containerRect.width * 0.35;
      container.scrollTo({
        left: Math.max(0, desiredScroll),
        behavior: 'smooth'
      });
    }
  }, [charIndex]);

  const typedStr = sentence.slice(0, charIndex);
  const currentChar = sentence[charIndex] || '';
  const afterCursorStr = sentence.slice(charIndex + 1);

  return (
    <div className="fixed bottom-[clamp(0.75rem,2.2dvh,1.75rem)] left-1/2 -translate-x-1/2 w-[min(96dvw,1120px)] z-40 select-none">
      {/* 15-Word Streak Speed Burst Floating Badge */}
      {hasSpeedBurst && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-[#CCFF00] text-[#050811] font-display font-black text-xs tracking-wider shadow-[0_0_20px_rgba(204,255,0,0.7)] animate-bounce flex items-center gap-1.5 whitespace-nowrap z-50">
          <ZapIcon className="w-3.5 h-3.5 fill-current" />
          <span>JARI KILAT! (15 KATA BERSIH)</span>
        </div>
      )}

      {/* Dual-Column Sports Cockpit Dock */}
      <div className="w-full bg-[#0B101D]/95 backdrop-blur-2xl border border-white/14 rounded-2xl sm:rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.85)] p-2.5 sm:p-3.5 transition-all">
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] lg:grid-cols-[280px_1fr] gap-2.5 sm:gap-3 items-stretch">
          
          {/* SISI KIRI: Telemetry Cockpit (Timer, Posisi 4/4, WPM & ACC) */}
          <div className="bg-[#060913]/90 rounded-xl sm:rounded-2xl border border-white/[0.08] p-3 sm:p-3.5 flex flex-col justify-between gap-2.5 shrink-0">
            {/* Top Row: Stopwatch Timer & Position */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              {/* Timer */}
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                  <span className="font-sports text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Waktu
                  </span>
                </div>
                <div className="font-display font-black text-xl sm:text-2xl text-white tracking-widest font-mono-num leading-none">
                  {formattedTime}
                </div>
              </div>

              {/* Posisi (e.g. 1/4 atau 4/4) */}
              <div className="text-right">
                <span className="font-sports text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Posisi
                </span>
                <div className="font-display font-bold text-sm sm:text-base flex items-baseline justify-end leading-none">
                  <span className="text-[#CCFF00] text-xl sm:text-2xl font-black">{rank}</span>
                  <span className="text-slate-400 text-xs font-sports font-semibold">/{totalRunners}</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: WPM & Accuracy Telemetry */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-center">
                <div className="font-sports text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <GaugeIcon className="w-3 h-3 text-[#CCFF00]" />
                  <span>WPM</span>
                </div>
                <div className="font-display font-black text-lg sm:text-xl text-[#CCFF00] font-mono-num leading-none mt-1">
                  {wpm}
                </div>
              </div>

              <div className="p-1.5 sm:p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-center">
                <div className="font-sports text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  AKURASI
                </div>
                <div className="font-display font-black text-lg sm:text-xl text-white font-mono-num leading-none mt-1">
                  {accuracy}%
                </div>
              </div>
            </div>
          </div>

          {/* SISI KANAN: Area Penulisan Form yang Diperluas */}
          <div
            ref={promptBoxRef}
            className={`relative bg-[#060913]/90 rounded-xl sm:rounded-2xl border border-white/[0.08] px-4 sm:px-6 py-3.5 sm:py-4 flex items-center overflow-x-auto whitespace-pre min-h-[90px] sm:min-h-[105px] transition-all ${
              shakePrompt ? 'error-shake' : ''
            }`}
          >
            {/* Word Streak subtle indicator in top-right corner if user is on fire */}
            {wordStreak > 3 && !hasSpeedBurst && (
              <div className="absolute top-2 right-3 font-sports text-[10px] font-bold text-[#CCFF00]/80 uppercase tracking-wider">
                {wordStreak} KATA BERSIH
              </div>
            )}

            <div className="typing-target-text text-[clamp(1rem,2.1vw,1.4rem)] font-sports font-medium leading-relaxed sm:leading-loose">
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
    </div>
  );
};
