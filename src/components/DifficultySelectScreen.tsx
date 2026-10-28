import React, { useEffect, useRef } from 'react';
import { DifficultyLevel, SentenceTheme } from '@/types/game';
import { DIFFICULTY_PRESETS } from '@/constants/sentences';
import { RunnerSvg } from './RunnerSvg';
import { playButtonClick } from '@/utils/audio';
import { ArrowLeftIcon, PlayIcon } from './icons/Icons';

interface DifficultySelectScreenProps {
  playerName: string;
  playerColor: string;
  difficulty: DifficultyLevel;
  theme: SentenceTheme;
  soundEnabled?: boolean;
  onUpdatePlayerName: (name: string) => void;
  onUpdatePlayerColor: (color: string) => void;
  onUpdateDifficulty: (difficulty: DifficultyLevel) => void;
  onUpdateTheme: (theme: SentenceTheme) => void;
  onStartRace: () => void;
  onBackToMenu: () => void;
}

const JERSEY_COLORS = [
  { label: 'Volt Lime', value: '#CCFF00' },
  { label: 'Royal Blue', value: '#2563EB' },
  { label: 'Crimson Red', value: '#EF4444' },
  { label: 'Amber Gold', value: '#F59E0B' },
  { label: 'Clean White', value: '#F8FAFC' }
];

const THEME_OPTIONS: { id: SentenceTheme; label: string }[] = [
  { id: 'motivasi', label: 'Bahasa Indonesia' },
  { id: 'fakta', label: 'Fakta Menarik' },
  { id: 'produktivitas', label: 'Aktivitas Harian' },
  { id: 'english', label: 'English' }
];

export const DifficultySelectScreen: React.FC<DifficultySelectScreenProps> = ({
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
  onBackToMenu
}) => {
  const startBtnRef = useRef<HTMLButtonElement>(null);
  const preset = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.medium;

  // Handle ESC and ENTER shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        playButtonClick(soundEnabled);
        onBackToMenu();
      } else if (e.key === 'Enter') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'select') {
          e.preventDefault();
          playButtonClick(soundEnabled);
          onStartRace();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToMenu, onStartRace, soundEnabled]);

  const handleSelectDiff = (diff: DifficultyLevel) => {
    playButtonClick(soundEnabled);
    onUpdateDifficulty(diff);
  };

  const handleSelectColor = (col: string) => {
    playButtonClick(soundEnabled);
    onUpdatePlayerColor(col);
  };

  const handleSelectTheme = (thm: SentenceTheme) => {
    playButtonClick(soundEnabled);
    onUpdateTheme(thm);
  };

  const handleStart = () => {
    playButtonClick(soundEnabled);
    onStartRace();
  };

  const handleBack = () => {
    playButtonClick(soundEnabled);
    onBackToMenu();
  };

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-y-auto overflow-x-hidden flex flex-col justify-between bg-[#050811] text-white select-none animate-apple-in">
      {/* 1. Minimal Header Navigation */}
      <header className="relative z-20 w-full px-[clamp(1rem,3dvw,2.5rem)] pt-[clamp(0.5rem,1.5vh,1.25rem)] pb-2 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-1.5 -ml-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition cursor-pointer min-h-[40px]"
        >
          <ArrowLeftIcon className="w-4 h-4 text-slate-400 group-hover:text-white" />
          <span className="font-sports font-bold text-xs sm:text-sm tracking-wide">KEMBALI</span>
          <span className="text-[11px] font-mono text-slate-500 font-normal">[ESC]</span>
        </button>

        {/* Minimal empty spacer for visual balance (eliminates redundant header label) */}
        <div className="w-10 h-6" />
      </header>

      {/* 2. Main Full-Screen Layout: Clean 2-Column Split */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-[clamp(1rem,3dvw,2.5rem)] py-[clamp(0.75rem,2vh,1.5rem)] flex flex-col lg:flex-row items-stretch gap-6 lg:gap-10 overflow-y-auto overscroll-contain">
        
        {/* Panel Kiri: Lobi Balap & Karakter Preview */}
        <section className="flex-1 flex flex-col justify-between gap-5">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Lobi Balap
            </h1>
          </div>

          {/* Kartu Preview Pelari Utama */}
          <div className="relative w-full rounded-2xl bg-gradient-to-r from-white/[0.05] to-transparent p-5 sm:p-6 border-l-4 border-[#CCFF00] flex flex-col justify-between gap-4">
            <div className="text-xs font-sports font-bold text-slate-400 uppercase tracking-wider">
              Pelari
            </div>

            {/* Panggung Pelari dengan Garis Start */}
            <div className="relative w-full h-[clamp(80px,13vh,115px)] flex items-center justify-start border-b border-dashed border-white/20 px-2 sm:px-4">
              {/* Garis Awal */}
              <div className="absolute left-4 sm:left-6 top-2 bottom-0 w-2.5 bg-white/20 transform -skew-x-12" />
              
              {/* Avatar Pelari & Nama Pemain */}
              <div className="relative ml-8 sm:ml-10 flex items-center gap-4">
                <RunnerSvg
                  color={playerColor}
                  bibNum="01"
                  isPlayer={true}
                  className="w-[clamp(68px,10.5vh,100px)] h-[clamp(68px,10.5vh,100px)] overflow-visible drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)]"
                />

                <div>
                  <span className="font-display font-black text-xl sm:text-2xl text-white tracking-wide">
                    {playerName.trim() || 'Kamu'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Kartu Mini Lawan AI (Ringkas & Bersih) */}
            <div className="pt-1">
              <div className="text-xs font-sports font-bold text-slate-400 uppercase tracking-wider mb-2">
                Lawan Balap
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl bg-black/40 border border-white/[0.08]">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 shadow-sm" />
                  <div className="truncate">
                    <div className="text-xs font-sports font-bold text-slate-200 truncate">Rival Kilat</div>
                    <div className="text-[11px] font-mono font-semibold text-slate-400">~{preset.r1} WPM</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl bg-black/40 border border-white/[0.08]">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 shadow-sm" />
                  <div className="truncate">
                    <div className="text-xs font-sports font-bold text-slate-200 truncate">Rival Gesit</div>
                    <div className="text-[11px] font-mono font-semibold text-slate-400">~{preset.r2} WPM</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl bg-black/40 border border-white/[0.08]">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 shadow-sm" />
                  <div className="truncate">
                    <div className="text-xs font-sports font-bold text-slate-200 truncate">Rival Tangkas</div>
                    <div className="text-[11px] font-mono font-semibold text-slate-400">~{preset.r3} WPM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block" />
        </section>

        {/* Panel Kanan: Kontrol Setup Balapan */}
        <section className="w-full lg:w-[440px] xl:w-[480px] flex flex-col justify-between gap-5">
          
          {/* 1. Nama & Warna Jersey */}
          <div>
            <label className="block font-sports text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Nama & Warna Jersey
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={playerName}
                maxLength={15}
                onChange={(e) => onUpdatePlayerName(e.target.value)}
                className="flex-1 bg-white/[0.05] border border-white/15 focus:border-[#CCFF00] rounded-xl px-4 py-2.5 text-sm sm:text-base font-sports font-bold text-white outline-none transition min-h-[44px] placeholder:text-slate-500"
                placeholder="Ketik namamu..."
              />

              {/* Swatch Warna Jersey */}
              <div className="flex items-center justify-start gap-2.5 px-1 py-1 min-h-[44px]">
                {JERSEY_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleSelectColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all cursor-pointer active:scale-95 ${
                      playerColor === c.value
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#050811] scale-110 shadow-md'
                        : 'border border-white/20 hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 2. Kecepatan Lawan (3 Kartu Satu Baris Fleksibel) */}
          <div>
            <label className="block font-sports text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Kecepatan Lawan
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {/* Pemula */}
              <button
                type="button"
                onClick={() => handleSelectDiff('easy')}
                className={`py-3 px-2 sm:px-3 rounded-xl text-center transition cursor-pointer min-h-[62px] flex flex-col items-center justify-center gap-1 active:scale-97 ${
                  difficulty === 'easy'
                    ? 'bg-[#CCFF00] text-[#050811] font-black shadow-lg ring-2 ring-[#CCFF00]'
                    : 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 border border-white/10'
                }`}
              >
                <div className="font-display text-sm sm:text-base tracking-wide font-bold">
                  Pemula
                </div>
                <div className={`font-mono text-xs font-bold ${difficulty === 'easy' ? 'text-[#050811]' : 'text-[#CCFF00]'}`}>
                  ~40–45 WPM
                </div>
              </button>

              {/* Menengah */}
              <button
                type="button"
                onClick={() => handleSelectDiff('medium')}
                className={`py-3 px-2 sm:px-3 rounded-xl text-center transition cursor-pointer min-h-[62px] flex flex-col items-center justify-center gap-1 active:scale-97 ${
                  difficulty === 'medium'
                    ? 'bg-[#CCFF00] text-[#050811] font-black shadow-lg ring-2 ring-[#CCFF00]'
                    : 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 border border-white/10'
                }`}
              >
                <div className="font-display text-sm sm:text-base tracking-wide font-bold">
                  Menengah
                </div>
                <div className={`font-mono text-xs font-bold ${difficulty === 'medium' ? 'text-[#050811]' : 'text-amber-400'}`}>
                  ~70–75 WPM
                </div>
              </button>

              {/* Mahir */}
              <button
                type="button"
                onClick={() => handleSelectDiff('hard')}
                className={`py-3 px-2 sm:px-3 rounded-xl text-center transition cursor-pointer min-h-[62px] flex flex-col items-center justify-center gap-1 active:scale-97 ${
                  difficulty === 'hard'
                    ? 'bg-[#CCFF00] text-[#050811] font-black shadow-lg ring-2 ring-[#CCFF00]'
                    : 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 border border-white/10'
                }`}
              >
                <div className="font-display text-sm sm:text-base tracking-wide font-bold">
                  Mahir
                </div>
                <div className={`font-mono text-xs font-bold ${difficulty === 'hard' ? 'text-[#050811]' : 'text-rose-400'}`}>
                  ~95–110 WPM
                </div>
              </button>
            </div>
          </div>

          {/* 3. Pilihan Teks Kalimat (Tombol Kapsul Satu Baris dalam Grid 2x2) */}
          <div>
            <label className="block font-sports text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Pilihan Teks
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectTheme(opt.id)}
                  className={`px-3 py-2.5 rounded-xl text-center font-sports text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[44px] flex items-center justify-center active:scale-97 truncate ${
                    theme === opt.id
                      ? 'bg-blue-600 text-white font-bold border border-blue-400 shadow-md'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Tombol Utama: GAS BALAPAN */}
          <div className="pt-2">
            <button
              ref={startBtnRef}
              type="button"
              onClick={handleStart}
              className="w-full py-4 min-h-[54px] text-lg sm:text-xl font-display font-black tracking-wider uppercase cursor-pointer flex items-center justify-center gap-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-[0_8px_24px_rgba(37,99,235,0.45)] active:scale-98 transition"
            >
              <PlayIcon className="w-5 h-5 fill-current" />
              <span>GAS BALAP!</span>
              <span className="text-xs font-mono font-medium opacity-70 ml-0.5">[ENTER]</span>
            </button>
          </div>
        </section>
      </main>

      {/* 3. Footer Minimal */}
      <footer className="relative z-20 w-full px-[clamp(1rem,3dvw,2.5rem)] py-2.5 flex items-center justify-between text-xs font-sports text-slate-600 border-t border-white/[0.06] shrink-0">
        <span>Type Racing</span>
      </footer>
    </div>
  );
};
