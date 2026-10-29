import React from 'react';

interface StatistikPanelProps {
  wpm: number;
  accuracy: number;
  correctWords: number;
  wrongWords: number;
}

export const StatistikPanel: React.FC<StatistikPanelProps> = ({
  wpm,
  accuracy,
  correctWords,
  wrongWords
}) => {
  return (
    <aside className="w-[180px] sm:w-[220px] bg-[#0b1a30]/95 border border-[#254575] rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-xl shrink-0">
      <div className="text-center border-b border-white/[0.08] pb-1.5">
        <h2 className="type-headline uppercase tracking-wider text-white">
          Statistik
        </h2>
      </div>

      <div className="flex flex-col justify-around flex-1 divide-y divide-white/[0.08] px-1">
        {/* WPM Row */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-sky-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 14l4-4" strokeLinecap="round" />
              <path d="M3.34 19a10 10 0 1 1 17.32 0" strokeLinecap="round" />
            </svg>
            <span className="type-footnote-semibold text-slate-300 uppercase">KBM</span>
          </div>
          <span className="font-mono-num type-title-3 font-bold text-[#4cd93c]">
            {wpm}
          </span>
        </div>

        {/* ACCURACY Row */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-sky-300 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="15" cy="4" r="2" />
              <path d="M10.5 9.5L7 11v3h2v-1.8l2.1-.9L9 16l-4 1v2l5.5-1.4 1.8-3.6 2.7 2V21h2v-6.2l-2.7-2.3.9-2.5 2.3 1.5H20v-2h-1.8l-3.2-2.2c-.8-.5-1.8-.4-2.5.2z" />
            </svg>
            <span className="type-footnote-semibold text-slate-300 uppercase">Akurasi</span>
          </div>
          <span className="font-mono-num type-title-3 font-bold text-[#47b0f8]">
            {accuracy}%
          </span>
        </div>

        {/* KATA BENAR Row */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#41b834] flex items-center justify-center text-white shrink-0 shadow">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="type-footnote-semibold text-slate-300 uppercase">Kata Benar</span>
          </div>
          <span className="font-mono-num type-title-3 font-bold text-[#4cd93c]">
            {correctWords}
          </span>
        </div>

        {/* KATA SALAH Row */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#e53935] flex items-center justify-center text-white shrink-0 shadow">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="type-footnote-semibold text-slate-300 uppercase">Kesalahan</span>
          </div>
          <span className="font-mono-num type-title-3 font-bold text-[#f85149]">
            {wrongWords}
          </span>
        </div>
      </div>
    </aside>
  );
};
