'use client';

import React, { useState, useEffect } from 'react';
import { StadiumPerspectiveBg } from './StadiumPerspectiveBg';
import { playButtonClick, playModalOpen, playModalClose } from '@/utils/audio';
import { UserProfile, LeaderboardEntry } from '@/types/auth';
import { fetchTopLeaderboard } from '@/services/firestoreService';
import { AchievementsGalleryModal } from './AchievementsGalleryModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '@/i18n/I18nContext';
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
  SettingsIcon
} from './icons/Icons';

interface MainMenuProps {
  playerName: string;
  playerLevel?: number;
  soundEnabled?: boolean;
  userProfile?: UserProfile | null;
  isAuthenticated?: boolean;
  onQuickRace: () => void;
  onTournament?: () => void;
  onPractice?: () => void;
  onOpenSettings?: () => void;
  onOpenAuth?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  playerName = 'Guest',
  playerLevel = 1,
  soundEnabled = true,
  userProfile = null,
  isAuthenticated = false,
  onQuickRace,
  onTournament,
  onPractice,
  onOpenSettings,
  onOpenAuth
}) => {
  const { t } = useI18n();
  const [activeModal, setActiveModal] = useState<'leaderboard' | 'achievements' | 'howToPlay' | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

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
    if (modal === 'leaderboard') {
      setLoadingLeaderboard(true);
      fetchTopLeaderboard(10)
        .then((records) => {
          setLeaderboardData(records);
        })
        .catch(console.warn)
        .finally(() => {
          setLoadingLeaderboard(false);
        });
    }
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
      <header className="relative z-20 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-1.5 flex items-center justify-between shrink-0">
        {/* Top-Left: Floating frosted pill card displaying user profile status */}
        <button
          type="button"
          onClick={() => {
            playButtonClick(soundEnabled);
            if (onOpenAuth) onOpenAuth();
          }}
          title={isAuthenticated ? t('manage_account', 'Manage Account') : t('login', 'Sign In')}
          className="apple-glass-pill px-3 py-1.5 flex items-center gap-2 transition hover:border-[#CCFF00]/50 hover:bg-[#0B101D] cursor-pointer bg-[#0B101D]/90 shadow-md border border-white/14 active:scale-97 text-left"
        >
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 border border-white/20 font-display font-black text-xs shadow-sm overflow-hidden"
            style={{
              backgroundColor: userProfile?.jerseyColor || '#CCFF00',
              color: '#050811'
            }}
          >
            {userProfile?.avatarUrl || userProfile?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userProfile.avatarUrl || userProfile.photoURL}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : userProfile?.bibNumber ? (
              `#${userProfile.bibNumber}`
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-[#050811]" />
            )}
          </div>
          <div className="leading-tight pr-1">
            <div className="type-callout-semibold text-white flex items-center gap-1.5">
              <span>{playerName || t('runner', 'Runner')}</span>
              <span className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]' : 'bg-slate-500'}`} />
            </div>
            <div className="type-caption-1 text-slate-400">
              {t('level_tag', 'Level')} {playerLevel} • {isAuthenticated ? t('connected', 'Connected') : t('not_connected', 'Not Signed In')}
            </div>
          </div>
        </button>

        {/* Right side Language Switcher (Segmented [EN] [MY] [CN]) & Settings */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="segmented" soundEnabled={soundEnabled} />

          {onOpenSettings && (
            <button
              type="button"
              onClick={() => {
                playButtonClick(soundEnabled);
                onOpenSettings();
              }}
              title={t('settings', 'Settings')}
              className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-[#0B101D]/80 hover:bg-[#0B101D] backdrop-blur-xl border border-white/10 shadow-md active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* 3. Center Hero Branding & 3 Menu Cards */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-2 shrink-0 my-auto">
        {/* Hero Branding Lockup */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="inline-flex items-center justify-center gap-2 sm:gap-2.5">
            <span className="type-hero italic text-white">
              TYPE
            </span>

            {/* Runner silhouette & speed streaks */}
            <div className="relative w-10 h-7 sm:w-12 sm:h-8 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 50">
                <line x1="8" y1="16" x2="42" y2="16" stroke="#CCFF00" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="2" y1="26" x2="38" y2="26" stroke="#CCFF00" strokeWidth="4.2" strokeLinecap="round" />
                <line x1="12" y1="36" x2="46" y2="36" stroke="#CCFF00" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-2 relative z-10" viewBox="0 0 24 24" fill="#CCFF00">
                <circle cx="13.5" cy="5.5" r="2.5" />
                <path d="M17.5 10.5c-.8 0-1.5-.4-1.9-1l-1.3-1.8c-.4-.5-1-.8-1.7-.8-.7 0-1.3.4-1.7.9l-2.4 3.2c-.3.4-.3.9 0 1.3l2.2 3.1v4.6c0 .6.4 1 1 1s1-.4 1-1v-4.2l-1.5-2.1 1.4-1.8 1.9 2.7c.4.6 1.1 1 1.9 1h3.1c.6 0 1-.4 1-1s-.4-1-1-1h-2.9l-1.8-2.6.8-1.1c.2-.3.6-.5 1-.5h3.4c.6 0 1-.4 1-1s-.4-1-1-1h-3.4zM6 13.8l2.5-3.3-1.6-1.6-2.5 3.3c-.4.5-.3 1.2.2 1.6.4.3 1 .2 1.4-.2z" />
              </svg>
            </div>
          </div>

          <div className="type-hero italic text-[#CCFF00] mt-0.5 drop-shadow-[0_0_20px_rgba(204,255,0,0.35)]">
            RACING
          </div>

          <p className="type-caption-1-semibold text-slate-400 mt-1.5 uppercase max-w-[65ch]">
            {t('app_subtitle', 'SPEED AND ACCURACY TYPING SPRINT')}
          </p>
        </div>

        {/* 3 Main Menu Action Cards (High-Interactivity Kinetic Buttons) */}
        <div className="w-full max-w-[380px] sm:max-w-[420px] flex flex-col gap-2.5">
          {/* Card 1: QUICK RACE (Athletic Volt & Electric Blue) */}
          <button
            type="button"
            onClick={() => handleAction(onQuickRace)}
            className="group relative w-full py-3.5 px-5 sm:px-6 min-h-[52px] sm:min-h-[56px] flex items-center justify-between text-left cursor-pointer overflow-hidden rounded-xl bg-[#0B101D]/90 hover:bg-[#0F172A] border border-white/12 hover:border-[#CCFF00]/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_28px_rgba(204,255,0,0.25)] transition-all duration-300 active:scale-[0.98] select-none hover:-translate-y-0.5 before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/12 before:to-transparent before:transition-transform before:duration-700 before:ease-out"
          >
            {/* Left Ambient Dynamic Glow */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[#CCFF00]/15 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Left Content: Interactive Speed Pill + Direct Title */}
            <div className="relative z-10 flex items-center gap-3.5">
              <span className="w-1.5 h-4.5 rounded-full bg-[#CCFF00]/60 group-hover:bg-[#CCFF00] group-hover:h-6 group-hover:w-2 group-hover:shadow-[0_0_12px_#CCFF00] transition-all duration-300 ease-out" />
              <span className="font-sports font-black text-lg sm:text-xl tracking-wider uppercase text-white group-hover:text-[#CCFF00] group-hover:translate-x-1 transition-all duration-300">
                {t('quick_race', 'Quick Race')}
              </span>
            </div>

            {/* Right Content: Dynamic Interactive Sprint Arrow */}
            <div className="relative z-10 flex items-center gap-1.5 text-slate-500 group-hover:text-[#CCFF00] transition-colors duration-300">
              <span className="hidden sm:inline-block font-mono text-[11px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-slate-400 group-hover:text-[#CCFF00]">
                GO
              </span>
              <div className="flex items-center -space-x-1.5 group-hover:translate-x-1 transition-transform duration-300">
                <svg className="w-4 h-4 stroke-[2.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <svg className="w-4 h-4 stroke-[2.8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Card 2: TOURNAMENT (Championship Gold) */}
          <button
            type="button"
            onClick={() => handleAction(onTournament || onQuickRace)}
            className="group relative w-full py-3.5 px-5 sm:px-6 min-h-[52px] sm:min-h-[56px] flex items-center justify-between text-left cursor-pointer overflow-hidden rounded-xl bg-[#0B101D]/90 hover:bg-[#0F172A] border border-white/12 hover:border-amber-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_28px_rgba(251,191,36,0.25)] transition-all duration-300 active:scale-[0.98] select-none hover:-translate-y-0.5 before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/12 before:to-transparent before:transition-transform before:duration-700 before:ease-out"
          >
            {/* Left Ambient Dynamic Glow */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-amber-400/15 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Left Content: Interactive Speed Pill + Direct Title */}
            <div className="relative z-10 flex items-center gap-3.5">
              <span className="w-1.5 h-4.5 rounded-full bg-amber-400/60 group-hover:bg-amber-400 group-hover:h-6 group-hover:w-2 group-hover:shadow-[0_0_12px_#F59E0B] transition-all duration-300 ease-out" />
              <span className="font-sports font-black text-lg sm:text-xl tracking-wider uppercase text-white group-hover:text-amber-300 group-hover:translate-x-1 transition-all duration-300">
                {t('tournament', 'Tournament')}
              </span>
            </div>

            {/* Right Content: Dynamic Interactive Sprint Arrow */}
            <div className="relative z-10 flex items-center gap-1.5 text-slate-500 group-hover:text-amber-400 transition-colors duration-300">
              <span className="hidden sm:inline-block font-mono text-[11px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-slate-400 group-hover:text-amber-400">
                CUP
              </span>
              <div className="flex items-center -space-x-1.5 group-hover:translate-x-1 transition-transform duration-300">
                <svg className="w-4 h-4 stroke-[2.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <svg className="w-4 h-4 stroke-[2.8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Card 3: PRACTICE (Electric Cyan) */}
          <button
            type="button"
            onClick={() => handleAction(onPractice || onQuickRace)}
            className="group relative w-full py-3.5 px-5 sm:px-6 min-h-[52px] sm:min-h-[56px] flex items-center justify-between text-left cursor-pointer overflow-hidden rounded-xl bg-[#0B101D]/90 hover:bg-[#0F172A] border border-white/12 hover:border-cyan-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_28px_rgba(6,182,212,0.25)] transition-all duration-300 active:scale-[0.98] select-none hover:-translate-y-0.5 before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/12 before:to-transparent before:transition-transform before:duration-700 before:ease-out"
          >
            {/* Left Ambient Dynamic Glow */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-cyan-400/15 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Left Content: Interactive Speed Pill + Direct Title */}
            <div className="relative z-10 flex items-center gap-3.5">
              <span className="w-1.5 h-4.5 rounded-full bg-cyan-400/60 group-hover:bg-cyan-400 group-hover:h-6 group-hover:w-2 group-hover:shadow-[0_0_12px_#06B6D4] transition-all duration-300 ease-out" />
              <span className="font-sports font-black text-lg sm:text-xl tracking-wider uppercase text-white group-hover:text-cyan-300 group-hover:translate-x-1 transition-all duration-300">
                {t('practice', 'Practice')}
              </span>
            </div>

            {/* Right Content: Dynamic Interactive Sprint Arrow */}
            <div className="relative z-10 flex items-center gap-1.5 text-slate-500 group-hover:text-cyan-400 transition-colors duration-300">
              <span className="hidden sm:inline-block font-mono text-[11px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-slate-400 group-hover:text-cyan-400">
                SOLO
              </span>
              <div className="flex items-center -space-x-1.5 group-hover:translate-x-1 transition-transform duration-300">
                <svg className="w-4 h-4 stroke-[2.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <svg className="w-4 h-4 stroke-[2.8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </main>

      {/* 4. Floating Dock Container (Strict 6px-8px Pill Cadence) */}
      <footer className="relative z-20 w-full px-4 sm:px-6 lg:px-8 pb-3 sm:pb-4 pt-1 flex justify-center shrink-0">
        <div className="pill-dock px-3 py-1 flex items-center gap-1.5 sm:gap-2 bg-[#0B101D]/90 border border-white/14 shadow-[0_12px_32px_rgba(0,0,0,0.7)]">
          {/* Dock Item 1: Leaderboard */}
          <button
            type="button"
            onClick={() => handleOpenDockModal('leaderboard')}
            className="flex items-center gap-1.5 px-2.5 py-1 min-h-[36px] rounded-lg type-footnote-semibold text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <MedalIcon className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{t('leaderboard', 'Leaderboard')}</span>
          </button>

          <div className="w-[1px] h-3.5 bg-white/15" />

          {/* Dock Item 2: Achievements */}
          <button
            type="button"
            onClick={() => handleOpenDockModal('achievements')}
            className="flex items-center gap-1.5 px-2.5 py-1 min-h-[36px] rounded-lg type-footnote-semibold text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <AwardIcon className="w-3.5 h-3.5 text-[#A855F7]" />
            <span>{t('achievements', 'Achievements')}</span>
          </button>

          <div className="w-[1px] h-3.5 bg-white/15" />

          {/* Dock Item 3: How to Play */}
          <button
            type="button"
            onClick={() => handleOpenDockModal('howToPlay')}
            className="flex items-center gap-1.5 px-2.5 py-1 min-h-[36px] rounded-lg type-footnote-semibold text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <HelpCircleIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{t('how_to_play', 'How to Play')}</span>
          </button>
        </div>
      </footer>

      {/* ======================================================================= */}
      {/* High-Speed Sports Dock Modal Sheets                                     */}
      {/* ======================================================================= */}

      {/* 1. How To Play Modal */}
      {activeModal === 'howToPlay' && (
        <div
          className="fixed inset-0 z-50 bg-[#050811]/85 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-4 animate-apple-in select-none"
          onClick={handleCloseDockModal}
        >
          <div
            className="swiss-card w-[min(92vw,460px)] p-3.5 sm:p-4.5 text-white shadow-[0_24px_60px_rgba(0,0,0,0.85)] max-h-[88dvh] overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2.5">
              <h3 className="type-title-2 text-white flex items-center gap-2">
                <HelpCircleIcon className="w-5 h-5 text-[#38BDF8]" />
                {t('how_to_play', 'How to Play')}
              </h3>
              <button
                type="button"
                onClick={handleCloseDockModal}
                className="w-7 h-7 min-w-[28px] min-h-[28px] rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 type-subhead text-slate-300 leading-[1.48] max-w-[65ch]">
              <div className="flex items-start gap-2.5 bg-[#060913] p-2.5 sm:p-3 rounded-xl border border-white/[0.08]">
                <PlayIcon className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5 fill-current" />
                <div>
                  <strong className="text-white type-subhead-semibold">{t('how_to_play_rule1_title', '1-Lap Sprint:')} </strong>
                  {t('how_to_play_rule1_desc', 'Type the displayed sentences quickly and accurately to propel your runner across the finish line.')}
                </div>
              </div>
              <div className="flex items-start gap-2.5 bg-[#060913] p-2.5 sm:p-3 rounded-xl border border-white/[0.08]">
                <GaugeIcon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white type-subhead-semibold">{t('how_to_play_rule2_title', 'Accuracy is Paramount:')} </strong>
                  {t('how_to_play_rule2_desc', 'Typing mistakes slow down your stride. Keep accuracy above 95% to maintain top acceleration.')}
                </div>
              </div>
              <div className="flex items-start gap-2.5 bg-[#060913] p-2.5 sm:p-3 rounded-xl border border-white/[0.08]">
                <KeyboardIcon className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white type-subhead-semibold">{t('how_to_play_rule3_title', 'Auto-Focus Keyboard:')} </strong>
                  {t('how_to_play_rule3_desc', 'Type directly without clicking text fields. Press [Esc] to pause the race.')}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseDockModal}
              className="mt-3.5 w-full btn-action-primary py-2 px-3.5 min-h-[38px] type-headline uppercase tracking-wider cursor-pointer rounded-xl active:scale-97 shadow-md"
            >
              {t('close', 'Close')}
            </button>
          </div>
        </div>
      )}

      {/* 2. Leaderboard Modal */}
      {activeModal === 'leaderboard' && (
        <div
          className="fixed inset-0 z-50 bg-[#050811]/85 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-4 animate-apple-in select-none"
          onClick={handleCloseDockModal}
        >
          <div
            className="swiss-card w-[min(92vw,480px)] p-3.5 sm:p-4.5 text-white shadow-[0_24px_60px_rgba(0,0,0,0.85)] max-h-[88dvh] overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2.5">
              <h3 className="type-title-2 text-white flex items-center gap-2">
                <MedalIcon className="w-5 h-5 text-amber-400" />
                {t('leaderboard', 'Leaderboard')}
              </h3>
              <button
                type="button"
                onClick={handleCloseDockModal}
                className="w-7 h-7 min-w-[28px] min-h-[28px] rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              {loadingLeaderboard ? (
                <div className="py-6 text-center text-slate-400 type-footnote animate-pulse">
                  {t('loading_leaderboard', 'Loading leaderboard...')}
                </div>
              ) : leaderboardData.length > 0 ? (
                leaderboardData.map((entry, idx) => {
                  const isCurrent = entry.displayName === playerName;
                  const rankBadge =
                    idx === 0
                      ? 'bg-amber-500 text-[#050811]'
                      : idx === 1
                      ? 'bg-slate-300 text-[#050811]'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-white/10 text-slate-300';

                  return (
                    <div
                      key={entry.userId || idx}
                      className={`flex items-center justify-between py-2.5 px-3 sm:px-3.5 rounded-xl border transition ${
                        isCurrent
                          ? 'bg-[#CCFF00]/10 border-[#CCFF00]/40'
                          : 'bg-[#060913] border-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center type-caption-1-semibold shadow-sm ${rankBadge}`}
                        >
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: entry.jerseyColor || '#CCFF00' }}
                          />
                          <span
                            className={`type-callout-semibold truncate max-w-[150px] ${
                              isCurrent ? 'text-[#CCFF00]' : 'text-white'
                            }`}
                          >
                            {entry.displayName || 'Anonymous'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-stat-num type-callout-bold text-[#CCFF00]">
                          {entry.highestWpm} WPM
                        </div>
                        {entry.careerScore > 0 && (
                          <div className="type-caption-2 text-slate-400 font-mono">
                            {entry.careerScore} pts
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="flex items-center justify-between py-2.5 px-3 sm:px-3.5 rounded-xl bg-[#060913] border border-amber-500/30">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-[#050811] flex items-center justify-center type-caption-1-semibold shadow-sm">1</span>
                      <span className="type-callout-semibold text-white">FlashSprinter</span>
                    </div>
                    <div className="font-stat-num type-callout-bold text-[#CCFF00]">
                      124 WPM <span className="text-slate-400 type-caption-1">(100%)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2.5 px-3 sm:px-3.5 rounded-xl bg-[#060913] border border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-300 text-[#050811] flex items-center justify-center type-caption-1-semibold">2</span>
                      <span className="type-callout-semibold text-white">TurboFingers</span>
                    </div>
                    <div className="font-stat-num type-callout-bold text-[#CCFF00]">
                      112 WPM <span className="text-slate-400 type-caption-1">(99%)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2.5 px-3 sm:px-3.5 rounded-xl bg-[#060913] border border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center type-caption-1-semibold">3</span>
                      <span className="type-callout-semibold text-white">PrecisionKing</span>
                    </div>
                    <div className="font-stat-num type-callout-bold text-[#CCFF00]">
                      98 WPM <span className="text-slate-400 type-caption-1">(98%)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2.5 px-3 sm:px-3.5 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/40 text-white">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#CCFF00] text-[#050811] flex items-center justify-center type-caption-1-semibold shadow-sm">4</span>
                      <span className="type-callout-semibold text-[#CCFF00]">{playerName || 'Player'}</span>
                    </div>
                    <div className="font-stat-num type-callout-bold text-[#CCFF00]">
                      92 WPM <span className="text-slate-300 type-caption-1">(97%)</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleCloseDockModal}
              className="mt-3.5 w-full bg-white/10 hover:bg-white/20 active:scale-97 text-slate-200 type-headline py-2 px-3.5 min-h-[38px] rounded-xl cursor-pointer transition"
            >
              {t('close', 'Close')}
            </button>
          </div>
        </div>
      )}

      {/* 3. Achievements Gallery Modal */}
      <AchievementsGalleryModal
        isOpen={activeModal === 'achievements'}
        soundEnabled={soundEnabled}
        userProfileUnlockedIds={userProfile?.unlockedAchievements || []}
        onClose={handleCloseDockModal}
      />
    </div>
  );
};
