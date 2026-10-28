import React, { useState, useEffect } from 'react';
import { StadiumPerspectiveBg } from './StadiumPerspectiveBg';
import { playButtonClick, playModalOpen, playModalClose } from '@/utils/audio';
import {
  UserIcon,
  PlayIcon,
  TrophyIcon,
  KeyboardIcon,
  MedalIcon,
  AwardIcon,
  HelpCircleIcon,
  CloseIcon,
  GaugeIcon,
  ZapIcon
} from './icons/Icons';

interface MainMenuProps {
  playerName: string;
  playerLevel?: number;
  soundEnabled?: boolean;
  onQuickRace: () => void;
  onTournament?: () => void;
  onPractice?: () => void;
  onOpenSettings?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  playerName = 'Guest',
  playerLevel = 1,
  soundEnabled = true,
  onQuickRace,
  onTournament,
  onPractice,
  onOpenSettings
}) => {
  const [activeModal, setActiveModal] = useState<'leaderboard' | 'achievements' | 'howToPlay' | null>(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        e.preventDefault();
        playModalClose(soundEnabled);
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, soundEnabled]);

  const handleAction = (cb?: () => void) => {
    playButtonClick(soundEnabled);
    if (cb) cb();
  };

  const handleOpenDockModal = (modal: 'leaderboard' | 'achievements' | 'howToPlay') => {
    playModalOpen(soundEnabled);
    setActiveModal(modal);
  };

  const handleCloseDockModal = () => {
    playModalClose(soundEnabled);
    setActiveModal(null);
  };

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-y-auto overflow-x-hidden flex flex-col justify-between select-none bg-[#050811] text-white animate-apple-in">
      {/* 1. Perspective Athletic Stadium Vector Background */}
      <StadiumPerspectiveBg />

      {/* 2. Top Header Bar */}
      <header className="relative z-20 w-full px-[clamp(1rem,3dvw,2rem)] pt-[clamp(0.5rem,1.5vh,1.25rem)] pb-1 flex items-center justify-between shrink-0">
        {/* Top-Left: Floating frosted pill card displaying user profile status */}
        <div className="apple-glass-pill px-3.5 py-1.5 flex items-center gap-2.5 transition hover:border-white/25 cursor-pointer bg-[#0B101D]/90 shadow-md border border-white/14">
          <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/15">
            <UserIcon className="w-4 h-4 text-[#CCFF00]" />
          </div>
          <div className="leading-tight pr-1">
            <div className="font-ui font-bold text-white text-xs sm:text-sm">
              {playerName || 'Kamu'}
            </div>
            <div className="font-ui font-medium text-slate-400 text-[10px] sm:text-xs">
              Level {playerLevel}
            </div>
          </div>
        </div>

        {/* Right side spacer for visual balance */}
        <div className="w-8 h-8" />
      </header>

      {/* 3. Center Hero Branding & 3 Menu Cards (Proportionally Scaled with vh/clamp) */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-[clamp(0.25rem,1.2vh,1rem)] shrink-0 my-auto">
        {/* Hero Branding Lockup */}
        <div className="text-center mb-[clamp(0.6rem,1.8vh,1.5rem)]">
          <div className="inline-flex items-center justify-center gap-2 sm:gap-3">
            <span className="font-display italic font-black text-[clamp(2.25rem,5.5vh,4.75rem)] leading-none text-white tracking-wide">
              TYPE
            </span>

            {/* Runner silhouette & speed streaks */}
            <div className="relative w-[clamp(36px,5vh,52px)] h-[clamp(24px,3.6vh,38px)] flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 50">
                <line x1="8" y1="16" x2="42" y2="16" stroke="#CCFF00" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="2" y1="26" x2="38" y2="26" stroke="#CCFF00" strokeWidth="4.2" strokeLinecap="round" />
                <line x1="12" y1="36" x2="46" y2="36" stroke="#CCFF00" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
              <svg className="w-[clamp(20px,3.2vh,28px)] h-[clamp(20px,3.2vh,28px)] ml-2 relative z-10" viewBox="0 0 24 24" fill="#CCFF00">
                <circle cx="13.5" cy="5.5" r="2.5" />
                <path d="M17.5 10.5c-.8 0-1.5-.4-1.9-1l-1.3-1.8c-.4-.5-1-.8-1.7-.8-.7 0-1.3.4-1.7.9l-2.4 3.2c-.3.4-.3.9 0 1.3l2.2 3.1v4.6c0 .6.4 1 1 1s1-.4 1-1v-4.2l-1.5-2.1 1.4-1.8 1.9 2.7c.4.6 1.1 1 1.9 1h3.1c.6 0 1-.4 1-1s-.4-1-1-1h-2.9l-1.8-2.6.8-1.1c.2-.3.6-.5 1-.5h3.4c.6 0 1-.4 1-1s-.4-1-1-1h-3.4zM6 13.8l2.5-3.3-1.6-1.6-2.5 3.3c-.4.5-.3 1.2.2 1.6.4.3 1 .2 1.4-.2z" />
              </svg>
            </div>
          </div>

          <div className="font-display italic font-black text-[clamp(2.25rem,5.5vh,4.75rem)] leading-none text-[#CCFF00] tracking-wide mt-0.5 drop-shadow-[0_0_20px_rgba(204,255,0,0.35)]">
            RACING
          </div>

          <p className="font-sports font-semibold text-slate-400 tracking-wider text-[clamp(9px,1.2vh,11px)] mt-1.5">
            LATIHAN KETIK CEPAT & PRESISI
          </p>
        </div>

        {/* 3 Main Menu Cards */}
        <div className="w-full max-w-[360px] sm:max-w-[400px] flex flex-col gap-[clamp(0.4rem,1.1vh,0.75rem)]">
          {/* Card 1: QUICK RACE (Athletic Blue) */}
          <button
            type="button"
            onClick={() => handleAction(onQuickRace)}
            className="w-full p-[clamp(0.45rem,1vh,0.75rem)] px-3.5 min-h-[clamp(48px,6.8vh,62px)] flex items-center gap-3 sm:gap-3.5 text-left cursor-pointer group bg-[#0B101D]/90 hover:bg-[#0F1626] border border-white/12 hover:border-[#CCFF00]/50 rounded-xl sm:rounded-2xl transition-all shadow-[0_6px_20px_rgba(0,0,0,0.5)] active:scale-97"
          >
            <div className="w-[clamp(36px,4.8vh,44px)] h-[clamp(36px,4.8vh,44px)] rounded-xl bg-blue-600 flex items-center justify-center shrink-0 text-white group-hover:scale-105 transition-transform shadow-md shadow-blue-500/30">
              <PlayIcon className="w-[clamp(18px,2.4vh,22px)] h-[clamp(18px,2.4vh,22px)] fill-current ml-0.5" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-black text-[clamp(0.95rem,2vh,1.25rem)] text-white tracking-wider uppercase leading-none">
                QUICK RACE
              </div>
              <div className="font-sports text-[clamp(10px,1.2vh,12px)] text-slate-400 font-medium mt-0.5 leading-tight">
                Adu cepat langsung gas bareng AI
              </div>
            </div>
          </button>

          {/* Card 2: TOURNAMENT (Athletic Emerald) */}
          <button
            type="button"
            onClick={() => handleAction(onTournament || onQuickRace)}
            className="w-full p-[clamp(0.45rem,1vh,0.75rem)] px-3.5 min-h-[clamp(48px,6.8vh,62px)] flex items-center gap-3 sm:gap-3.5 text-left cursor-pointer group bg-[#0B101D]/90 hover:bg-[#0F1626] border border-white/12 hover:border-[#CCFF00]/50 rounded-xl sm:rounded-2xl transition-all shadow-[0_6px_20px_rgba(0,0,0,0.5)] active:scale-97"
          >
            <div className="w-[clamp(36px,4.8vh,44px)] h-[clamp(36px,4.8vh,44px)] rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 text-white group-hover:scale-105 transition-transform shadow-md shadow-emerald-500/30">
              <TrophyIcon className="w-[clamp(18px,2.4vh,22px)] h-[clamp(18px,2.4vh,22px)]" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-black text-[clamp(0.95rem,2vh,1.25rem)] text-white tracking-wider uppercase leading-none">
                TOURNAMENT
              </div>
              <div className="font-sports text-xs text-slate-400 font-medium mt-0.5 leading-tight">
                3 ronde gugur, sikat sampai final
              </div>
            </div>
          </button>

          {/* Card 3: PRACTICE (Athletic Amber) */}
          <button
            type="button"
            onClick={() => handleAction(onPractice || onQuickRace)}
            className="w-full p-[clamp(0.45rem,1vh,0.75rem)] px-3.5 min-h-[clamp(48px,6.8vh,62px)] flex items-center gap-3 sm:gap-3.5 text-left cursor-pointer group bg-[#0B101D]/90 hover:bg-[#0F1626] border border-white/12 hover:border-[#CCFF00]/50 rounded-xl sm:rounded-2xl transition-all shadow-[0_6px_20px_rgba(0,0,0,0.5)] active:scale-97"
          >
            <div className="w-[clamp(36px,4.8vh,44px)] h-[clamp(36px,4.8vh,44px)] rounded-xl bg-amber-500 flex items-center justify-center shrink-0 text-white group-hover:scale-105 transition-transform shadow-md shadow-amber-500/30">
              <KeyboardIcon className="w-[clamp(18px,2.4vh,22px)] h-[clamp(18px,2.4vh,22px)]" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-black text-[clamp(0.95rem,2vh,1.25rem)] text-white tracking-wider uppercase leading-none">
                PRACTICE
              </div>
              <div className="font-sports text-xs text-slate-400 font-medium mt-0.5 leading-tight">
                Santai asah ritme tanpa lawan
              </div>
            </div>
          </button>
        </div>
      </main>

      {/* 4. Floating Dock Container (Touch-friendly min 40px) */}
      <footer className="relative z-20 w-full px-4 pb-[clamp(0.5rem,1.8vh,1.25rem)] pt-1 flex justify-center shrink-0">
        <div className="apple-glass-pill px-2.5 sm:px-3.5 py-1 sm:py-1.5 flex items-center gap-1 sm:gap-2 bg-[#0B101D]/90 border border-white/14 shadow-[0_12px_32px_rgba(0,0,0,0.7)]">
          {/* Dock Item 1: Leaderboard */}
          <button
            type="button"
            onClick={() => handleOpenDockModal('leaderboard')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[38px] rounded-full text-xs font-ui font-bold text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <MedalIcon className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>LEADERBOARD</span>
          </button>

          <div className="w-[1px] h-3.5 bg-white/15" />

          {/* Dock Item 2: Achievements */}
          <button
            type="button"
            onClick={() => handleOpenDockModal('achievements')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[38px] rounded-full text-xs font-ui font-bold text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <AwardIcon className="w-3.5 h-3.5 text-[#A855F7]" />
            <span>ACHIEVEMENTS</span>
          </button>

          <div className="w-[1px] h-3.5 bg-white/15" />

          {/* Dock Item 3: How to Play */}
          <button
            type="button"
            onClick={() => handleOpenDockModal('howToPlay')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[38px] rounded-full text-xs font-ui font-bold text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <HelpCircleIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>CARA MAIN</span>
          </button>
        </div>
      </footer>

      {/* ======================================================================= */}
      {/* High-Speed Sports Dock Modal Sheets                                     */}
      {/* ======================================================================= */}

      {/* 1. How To Play Modal */}
      {activeModal === 'howToPlay' && (
        <div
          className="fixed inset-0 z-50 bg-[#050811]/85 backdrop-blur-md flex items-center justify-center p-[clamp(0.75rem,3vw,2rem)] animate-apple-in select-none"
          onClick={handleCloseDockModal}
        >
          <div
            className="bg-[#0B101D] border border-white/14 max-w-md w-full p-[clamp(1.25rem,3.5vw,2rem)] text-white rounded-2xl sm:rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] max-h-[88dvh] overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/12 pb-3 mb-4">
              <h3 className="font-display text-xl font-black text-white flex items-center gap-2.5">
                <HelpCircleIcon className="w-5 h-5 text-[#38BDF8]" />
                Cara Main
              </h3>
              <button
                type="button"
                onClick={handleCloseDockModal}
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-ui text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="flex items-start gap-3 bg-[#060913] p-3.5 rounded-2xl border border-white/10">
                <PlayIcon className="w-5 h-5 text-[#CCFF00] shrink-0 mt-0.5 fill-current" />
                <div>
                  <strong className="text-white">Balapan Sprint 1 Putaran:</strong> Ketik kalimat target secepat mungkin untuk menggerakkan pelarimu menuju garis finis.
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[#060913] p-3.5 rounded-2xl border border-white/10">
                <GaugeIcon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Akurasi Menentukan Kemenangan:</strong> Salah ketik akan memicu rem sesaat. Pertahankan akurasi di atas 95% untuk kecepatan maksimum!
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[#060913] p-3.5 rounded-2xl border border-white/10">
                <KeyboardIcon className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Auto-Focus Keyboard:</strong> Ketik langsung tanpa perlu mengklik kotak teks. Tekan [ESC] kapan saja untuk jeda balap.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseDockModal}
              className="mt-6 w-full btn-action-primary py-3.5 min-h-[48px] text-sm font-display font-black uppercase tracking-wider cursor-pointer rounded-xl active:scale-97 shadow-md"
            >
              SIAP, GAS BALAP!
            </button>
          </div>
        </div>
      )}

      {/* 2. Leaderboard Modal */}
      {activeModal === 'leaderboard' && (
        <div
          className="fixed inset-0 z-50 bg-[#050811]/85 backdrop-blur-md flex items-center justify-center p-[clamp(0.75rem,3vw,2rem)] animate-apple-in select-none"
          onClick={handleCloseDockModal}
        >
          <div
            className="bg-[#0B101D] border border-white/14 max-w-md w-full p-[clamp(1.25rem,3.5vw,2rem)] text-white rounded-2xl sm:rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] max-h-[88dvh] overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/12 pb-3 mb-4">
              <h3 className="font-display text-xl font-black text-white flex items-center gap-2.5">
                <MedalIcon className="w-5 h-5 text-amber-400" />
                Papan Peringkat
              </h3>
              <button
                type="button"
                onClick={handleCloseDockModal}
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 font-ui">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#060913] border border-amber-500/30">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-[#050811] flex items-center justify-center text-xs font-black font-display shadow-sm">1</span>
                  <span className="font-bold text-sm text-white">FlashSprinter</span>
                </div>
                <div className="font-stat-num text-xs sm:text-sm font-bold text-[#CCFF00]">
                  124 WPM <span className="text-slate-400 font-normal">(100%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#060913] border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-300 text-[#050811] flex items-center justify-center text-xs font-black font-display">2</span>
                  <span className="font-bold text-sm text-white">TurboFingers</span>
                </div>
                <div className="font-stat-num text-xs sm:text-sm font-bold text-[#CCFF00]">
                  112 WPM <span className="text-slate-400 font-normal">(99%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#060913] border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center text-xs font-black font-display">3</span>
                  <span className="font-bold text-sm text-white">PrecisionKing</span>
                </div>
                <div className="font-stat-num text-xs sm:text-sm font-bold text-[#CCFF00]">
                  98 WPM <span className="text-slate-400 font-normal">(98%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/40 text-white">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#CCFF00] text-[#050811] flex items-center justify-center text-xs font-black font-display shadow-sm">4</span>
                  <span className="font-bold text-sm text-[#CCFF00]">{playerName || 'Kamu'}</span>
                </div>
                <div className="font-stat-num text-xs sm:text-sm font-bold text-[#CCFF00]">
                  92 WPM <span className="text-slate-300 font-normal">(97%)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseDockModal}
              className="mt-6 w-full bg-white/10 hover:bg-white/20 active:scale-97 text-slate-200 font-ui font-bold py-3 min-h-[44px] rounded-xl cursor-pointer transition"
            >
              Tutup [ESC]
            </button>
          </div>
        </div>
      )}

      {/* 3. Achievements Modal */}
      {activeModal === 'achievements' && (
        <div
          className="fixed inset-0 z-50 bg-[#050811]/85 backdrop-blur-md flex items-center justify-center p-[clamp(0.75rem,3vw,2rem)] animate-apple-in select-none"
          onClick={handleCloseDockModal}
        >
          <div
            className="bg-[#0B101D] border border-white/14 max-w-md w-full p-[clamp(1.25rem,3.5vw,2rem)] text-white rounded-2xl sm:rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] max-h-[88dvh] overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/12 pb-3 mb-4">
              <h3 className="font-display text-xl font-black text-white flex items-center gap-2.5">
                <AwardIcon className="w-5 h-5 text-purple-400" />
                Pencapaian
              </h3>
              <button
                type="button"
                onClick={handleCloseDockModal}
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-ui">
              <div className="flex items-center gap-3 p-3 rounded-2xl border bg-emerald-500/10 border-emerald-500/30 text-white">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <ZapIcon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-white">First Sprint</div>
                  <div className="text-[11px] text-slate-400">Selesaikan balapan pertamamu</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl border bg-[#CCFF00]/10 border-[#CCFF00]/30 text-white">
                <div className="w-9 h-9 rounded-xl bg-[#CCFF00]/20 flex items-center justify-center shrink-0">
                  <ZapIcon className="w-5 h-5 text-[#CCFF00]" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-white">Speed Demon</div>
                  <div className="text-[11px] text-slate-400">Raih kecepatan di atas 80 WPM</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl border bg-[#060913] border-white/10 text-slate-500 opacity-60">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <MedalIcon className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-300">Flawless Victory</div>
                  <div className="text-[11px] text-slate-500">Menangkan balapan dengan 100% akurasi</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl border bg-[#060913] border-white/10 text-slate-500 opacity-60">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <TrophyIcon className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-300">Grand Champion</div>
                  <div className="text-[11px] text-slate-500">Kalahkan AI tingkat Mahir</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseDockModal}
              className="mt-6 w-full bg-white/10 hover:bg-white/20 active:scale-97 text-slate-200 font-ui font-bold py-3 min-h-[44px] rounded-xl cursor-pointer transition"
            >
              Tutup [ESC]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
