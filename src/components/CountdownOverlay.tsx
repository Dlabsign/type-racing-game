import React from 'react';

interface CountdownOverlayProps {
  countdownText: string;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ countdownText }) => {
  const isStartWord = countdownText === 'MULAI!' || countdownText === 'GAS!';

  return (
    <div className="fixed inset-0 z-50 bg-[#050811]/85 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none animate-apple-in">
      {/* High-Performance Sports Countdown Card with generous responsive width */}
      <div className="bg-[#0B101D] border border-white/14 shadow-[0_24px_60px_rgba(0,0,0,0.9)] px-6 sm:px-10 py-7 sm:py-9 text-center rounded-3xl w-[min(92vw,440px)] flex flex-col items-center justify-center transition-all duration-200">
        
        {/* Top Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 font-sports text-[11px] sm:text-xs font-bold text-[#CCFF00] uppercase tracking-wider mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-ping" />
          <span>SIAP DI GARIS START</span>
        </div>

        {/* Big Number / "MULAI!" Display - Sized with clamp so it never overflows */}
        <div className="w-full flex items-center justify-center my-1 py-1 overflow-hidden">
          <span
            className={`font-display font-black text-[#CCFF00] leading-none drop-shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-transform duration-200 ${
              isStartWord
                ? 'text-[clamp(3rem,9vw,5rem)] tracking-tight sm:tracking-normal scale-105'
                : 'text-[clamp(4.5rem,14vw,7.5rem)] font-mono-num'
            }`}
          >
            {countdownText}
          </span>
        </div>

        {/* Motivational Microcopy */}
        <p className="font-sports text-xs sm:text-sm text-slate-300 font-medium mt-2 max-w-xs leading-relaxed">
          {isStartWord ? 'Tancap gas! Jaga ritme ketukan jarimu!' : 'Fokus ke layar & siapkan jarimu di atas tuts!'}
        </p>
      </div>
    </div>
  );
};
