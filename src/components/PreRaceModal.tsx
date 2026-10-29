import React from 'react';
import { DifficultyLevel, SentenceTheme } from '@/types/game';
import { playButtonClick } from '@/utils/audio';

interface PreRaceModalProps {
  isOpen: boolean;
  playerName: string;
  playerColor: string;
  difficulty: DifficultyLevel;
  theme: SentenceTheme;
  soundEnabled?: boolean;
  onUpdatePlayerName: (name: string) => void;
  onUpdatePlayerColor: (color: string) => void;
  onUpdateDifficulty: (diff: DifficultyLevel) => void;
  onUpdateTheme: (theme: SentenceTheme) => void;
  onStartRace: () => void;
  onClose?: () => void;
}

export const PreRaceModal: React.FC<PreRaceModalProps> = ({
  isOpen,
  playerName,
  playerColor,
  difficulty,
  theme,
  soundEnabled = true,
  onUpdatePlayerName,
  onUpdatePlayerColor,
  onUpdateDifficulty,
  onUpdateTheme,
  onStartRace,
  onClose
}) => {
  if (!isOpen) return null;

  const handleAction = (cb?: () => void) => {
    playButtonClick(soundEnabled);
    if (cb) cb();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="modal-panel-container max-w-lg w-full p-4 sm:p-4.5 rounded-2xl text-white relative shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
        {onClose && (
          <button
            type="button"
            onClick={() => handleAction(onClose)}
            className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white text-base font-bold p-1 cursor-pointer transition-colors"
            title="Tutup"
          >
            ✕
          </button>
        )}

        {/* Header Lockup */}
        <div className="text-center pb-2.5 border-b border-white/10 mb-3.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 type-caption-1-semibold uppercase tracking-widest mb-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" />
            </svg>
            Persiapan Balapan
          </div>
          <h1 className="font-display type-title-1 sm:type-large-title font-extrabold tracking-wide text-white">
            TYPE <span className="text-[#f59e0b]">RACING</span>
          </h1>
          <p className="font-ui text-slate-300 type-subhead mt-1">
            Balapan satu putaran untuk menguji kecepatan dan ketepatan.
          </p>
        </div>

        {/* Player Profile & Colorway Customizer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3.5">
          <div>
            <label className="block font-ui type-caption-1-semibold uppercase tracking-wider text-slate-300 mb-1">
              Nama Pelari
            </label>
            <input
              type="text"
              value={playerName}
              maxLength={15}
              onChange={(e) => onUpdatePlayerName(e.target.value)}
              className="w-full bg-[#070d17] border border-white/15 focus:border-emerald-400 rounded-xl px-3 py-2 min-h-[38px] type-callout-semibold font-ui text-white outline-none transition"
            />
          </div>
          <div>
            <label className="block font-ui type-caption-1-semibold uppercase tracking-wider text-slate-300 mb-1">
              Warna Jersei
            </label>
            <div className="flex items-center gap-2 pt-0.5">
              {[
                { hex: '#22c55e', name: 'Hijau Neon' },
                { hex: '#06b6d4', name: 'Biru Sian' },
                { hex: '#f43f5e', name: 'Merah Kirmizi' },
                { hex: '#eab308', name: 'Jingga' }
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => handleAction(() => onUpdatePlayerColor(c.hex))}
                  className={`w-7 h-7 rounded-full border-2 transition cursor-pointer ${
                    playerColor === c.hex
                      ? 'border-white ring-2 ring-emerald-400 scale-110 shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                      : 'border-transparent opacity-75 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty Level Selector (16px rounded-2xl, uniform hover) */}
        <div className="mb-3.5">
          <label className="block font-ui type-caption-1-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Tingkat Kesulitan
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleAction(() => onUpdateDifficulty('easy'))}
              className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                difficulty === 'easy'
                  ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_4px_16px_rgba(22,163,74,0.25)]'
                  : 'border-white/10 bg-[#070d17] hover:border-emerald-400/50 hover:scale-[1.02]'
              }`}
            >
              <div className="font-display type-callout-bold text-white">Pemula</div>
              <div className="font-stat-num type-caption-2-semibold text-emerald-400 mt-0.5">~40–45 WPM</div>
              <div className="font-ui type-caption-2 text-slate-400 mt-0.5">Kosakata sederhana</div>
            </button>

            <button
              type="button"
              onClick={() => handleAction(() => onUpdateDifficulty('medium'))}
              className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                difficulty === 'medium'
                  ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_4px_16px_rgba(22,163,74,0.25)]'
                  : 'border-white/10 bg-[#070d17] hover:border-emerald-400/50 hover:scale-[1.02]'
              }`}
            >
              <div className="font-display type-callout-bold text-white">Menengah</div>
              <div className="font-stat-num type-caption-2-semibold text-amber-400 mt-0.5">~70–75 WPM</div>
              <div className="font-ui type-caption-2 text-slate-400 mt-0.5">Kecepatan standar</div>
            </button>

            <button
              type="button"
              onClick={() => handleAction(() => onUpdateDifficulty('hard'))}
              className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                difficulty === 'hard'
                  ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_4px_16px_rgba(22,163,74,0.25)]'
                  : 'border-white/10 bg-[#070d17] hover:border-emerald-400/50 hover:scale-[1.02]'
              }`}
            >
              <div className="font-display type-callout-bold text-white">Mahir</div>
              <div className="font-stat-num type-caption-2-semibold text-rose-400 mt-0.5">~95–110 WPM</div>
              <div className="font-ui type-caption-2 text-slate-400 mt-0.5">Kecepatan tinggi</div>
            </button>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="mb-4">
          <label className="block font-ui type-caption-1-semibold uppercase tracking-wider text-slate-300 mb-1">
            Tema Kalimat
          </label>
          <select
            value={theme}
            onChange={(e) => onUpdateTheme(e.target.value as SentenceTheme)}
            className="w-full bg-[#070d17] border border-white/15 rounded-xl px-3 py-2 min-h-[38px] type-callout font-ui font-medium text-slate-200 outline-none"
          >
            <option value="motivasi">Bahasa Indonesia (Motivasi)</option>
            <option value="fakta">Fakta Menarik Dunia</option>
            <option value="produktivitas">Aktivitas Harian & Produktivitas</option>
          </select>
        </div>

        {/* Primary CTA Button (rounded-2xl, ambient drop shadow) */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleAction(onStartRace)}
            className="btn-action-primary w-full py-2.5 sm:py-3 px-4 min-h-[40px] rounded-xl flex items-center justify-center gap-2 font-display type-headline text-white tracking-wider uppercase cursor-pointer"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
            </svg>
            Mulai Balapan
          </button>
          {onClose && (
            <button
              type="button"
              onClick={() => handleAction(onClose)}
              className="w-full bg-white/10 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white font-ui type-callout-semibold py-2 px-3.5 min-h-[38px] rounded-xl transition cursor-pointer"
            >
              Menu Utama
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
