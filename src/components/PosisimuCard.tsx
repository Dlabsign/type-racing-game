import React from 'react';

interface PosisimuCardProps {
  rank: number;
  totalRunners: number;
  progressPercent: number;
  onOpenMenu: () => void;
}

export const PosisimuCard: React.FC<PosisimuCardProps> = ({
  rank,
  totalRunners,
  progressPercent,
  onOpenMenu
}) => {
  const clampedPct = Math.min(100, Math.max(0, progressPercent));
  const runnerLeftPct = Math.max(4, Math.min(94, clampedPct));

  return (
    <aside className="w-[165px] sm:w-[210px] flex flex-col justify-between gap-2.5 shrink-0">
      {/* POSISIMU Card */}
      <div className="flex-1 bg-[#0b1a30]/95 border border-[#254575] rounded-xl p-2.5 sm:p-3 flex flex-col justify-between items-center shadow-xl">
        <h2 className="type-caption-1-semibold tracking-widest text-white uppercase">
          Posisi Anda
        </h2>

        {/* Big Rank Display */}
        <div className="flex items-baseline justify-center my-auto">
          <span className="font-display font-extrabold text-4xl sm:text-5xl leading-none text-[#4cd93c] drop-shadow">
            {rank}
          </span>
          <span className="type-title-3 text-slate-200 ml-1">
            /{totalRunners}
          </span>
        </div>

        {/* Mini Finish Line Progress Bar */}
        <div className="w-full pt-1 pb-0.5">
          <div className="relative w-full h-2.5 bg-[#1e3558] rounded-full flex items-center pr-3">
            {/* Green Fill */}
            <div
              className="h-full bg-gradient-to-r from-[#38a82b] to-[#5ee34d] rounded-full transition-all duration-150"
              style={{ width: `${clampedPct}%` }}
            />
            {/* Mini Green Runner Icon Moving on Progress Bar */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-150 text-[#5ee34d] drop-shadow"
              style={{ left: `${runnerLeftPct}%` }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="15" cy="4" r="2.2" />
                <path d="M10.5 9.5L7 11v3h2v-1.8l2.1-.9L9 16l-4 1v2l5.5-1.4 1.8-3.6 2.7 2V21h2v-6.2l-2.7-2.3.9-2.5 2.3 1.5H20v-2h-1.8l-3.2-2.2c-.8-.5-1.8-.4-2.5.2z" />
              </svg>
            </div>
            {/* Checkered Flag Icon at Right End */}
            <div className="absolute -right-1 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M4 3v18" stroke="#e2e8f0" strokeWidth="2.2" strokeLinecap="round" />
                <rect x="6" y="4" width="3.5" height="3.5" fill="#fff" />
                <rect x="9.5" y="4" width="3.5" height="3.5" fill="#0f172a" />
                <rect x="13" y="4" width="3.5" height="3.5" fill="#fff" />
                <rect x="16.5" y="4" width="3.5" height="3.5" fill="#0f172a" />
                <rect x="6" y="7.5" width="3.5" height="3.5" fill="#0f172a" />
                <rect x="9.5" y="7.5" width="3.5" height="3.5" fill="#fff" />
                <rect x="13" y="7.5" width="3.5" height="3.5" fill="#0f172a" />
                <rect x="16.5" y="7.5" width="3.5" height="3.5" fill="#fff" />
                <rect x="6" y="11" width="3.5" height="3.5" fill="#fff" />
                <rect x="9.5" y="11" width="3.5" height="3.5" fill="#0f172a" />
                <rect x="13" y="11" width="3.5" height="3.5" fill="#fff" />
                <rect x="16.5" y="11" width="3.5" height="3.5" fill="#0f172a" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* KELUAR / MENU Button */}
      <button
        type="button"
        onClick={onOpenMenu}
        className="btn-keluar w-full py-2 px-3.5 min-h-[40px] rounded-xl flex items-center justify-between type-callout-bold tracking-wider uppercase cursor-pointer"
      >
        <span className="mx-auto">Keluar</span>
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </aside>
  );
};
