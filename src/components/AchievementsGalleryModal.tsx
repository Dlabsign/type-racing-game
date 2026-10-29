'use client';

import React, { useEffect, useMemo } from 'react';
import {
  ACHIEVEMENTS,
  Achievement,
  TIER_CONFIG
} from '@/config/achievements';
import {
  getLocalUnlockedAchievements,
  getLocalCumulativeStats,
  getAchievementProgress
} from '@/services/achievementService';
import { playModalClose } from '@/utils/audio';
import { useI18n } from '@/i18n/I18nContext';
import {
  CloseIcon,
  LockIcon,
  AwardIcon,
  ZapIcon,
  GaugeIcon,
  KeyboardIcon,
  TrophyIcon,
  MedalIcon,
  GrandTrophyIcon,
  SolidCheckCircleIcon
} from './icons/Icons';

interface AchievementsGalleryModalProps {
  isOpen: boolean;
  soundEnabled?: boolean;
  userProfileUnlockedIds?: string[];
  onClose: () => void;
}

export const AchievementsGalleryModal: React.FC<AchievementsGalleryModalProps> = ({
  isOpen,
  soundEnabled = true,
  userProfileUnlockedIds = [],
  onClose
}) => {
  const { t } = useI18n();
  // Hydrate unlocked IDs on render using useMemo
  const unlockedIds = useMemo(() => {
    if (!isOpen) return [];
    const localIds = getLocalUnlockedAchievements();
    return Array.from(new Set([...localIds, ...userProfileUnlockedIds]));
  }, [isOpen, userProfileUnlockedIds]);

  // Hydrate cumulative tracking stats
  const cumulativeStats = useMemo(() => {
    if (!isOpen) {
      return {
        totalWordsTyped: 0,
        totalRacesCount: 0,
        careerScore: 0,
        consecutiveHighAccRaces: 0,
        highestWpm: 0
      };
    }
    return getLocalCumulativeStats();
  }, [isOpen]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        playModalClose(soundEnabled);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, soundEnabled, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    playModalClose(soundEnabled);
    onClose();
  };

  const totalCount = ACHIEVEMENTS.length;
  const unlockedCount = unlockedIds.length;
  const overallPercentage = Math.round((unlockedCount / totalCount) * 100);

  // Total XP gained from unlocked achievements
  const totalEarnedXp = ACHIEVEMENTS.filter((ach) =>
    unlockedIds.includes(ach.id)
  ).reduce((acc, ach) => acc + ach.rewardXp, 0);

  const renderIcon = (ach: Achievement, isUnlocked: boolean) => {
    const tier = TIER_CONFIG[ach.tier];

    if (!isUnlocked) {
      return (
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-500 shrink-0">
          <LockIcon className="w-4 h-4" />
        </div>
      );
    }

    let IconComp = AwardIcon;
    if (ach.iconName === 'zap') IconComp = ZapIcon;
    else if (ach.iconName === 'gauge') IconComp = GaugeIcon;
    else if (ach.iconName === 'keyboard') IconComp = KeyboardIcon;
    else if (ach.iconName === 'trophy') IconComp = TrophyIcon;
    else if (ach.iconName === 'grand-trophy') IconComp = GrandTrophyIcon;
    else if (ach.iconName === 'medal') IconComp = MedalIcon;

    return (
      <div
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border ${tier.border} ${tier.badgeBg} ${tier.glow} shrink-0`}
      >
        <IconComp className={`w-5 h-5 ${tier.textColor}`} />
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#050811]/85 backdrop-blur-md flex items-center justify-center p-[clamp(0.75rem,3vw,1.5rem)] select-none animate-apple-in"
      onClick={handleClose}
    >
      {/* Swiss Minimalist Modal Container (14px-18px padding) */}
      <div
        className="relative swiss-card w-[min(94vw,740px)] p-3.5 sm:p-4.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white overflow-hidden flex flex-col max-h-[88dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Ambient */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-28 bg-[#CCFF00]/15 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Modal Header */}
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#CCFF00]/15 flex items-center justify-center border border-[#CCFF00]/30 text-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.25)]">
              <AwardIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="type-title-2 text-white uppercase leading-none">
                {t('achievements', 'Achievements')}
              </h2>
              <p className="type-footnote text-slate-400 mt-0.5 max-w-[65ch]">
                {t('achievements_desc', 'List of achievements and typing progress.')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            title={t('close', 'Close')}
            className="w-7 h-7 min-w-[28px] min-h-[28px] rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <CloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. Global Progress Banner */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-black/40 border border-white/[0.08] mb-2.5 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="type-callout-semibold text-white tracking-wider uppercase">
                {t('overall_progress', 'Overall Progress')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#CCFF00]/15 border border-[#CCFF00]/30 text-[#CCFF00] font-mono type-caption-1 font-bold">
                {unlockedCount} / {totalCount} {t('unlocked', 'Unlocked')}
              </span>
            </div>

            <div className="font-mono type-caption-1 text-[#CCFF00] font-bold">
              +{totalEarnedXp.toLocaleString()} XP
            </div>
          </div>

          {/* Neon Volt Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#CCFF00] to-[#99E600] rounded-full transition-all duration-500 shadow-[0_0_12px_#CCFF00]"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

        {/* 3. Achievements List (Responsive, Clean Horizontal List View) */}
        <div className="flex-1 overflow-y-auto overscroll-contain pr-1 sm:pr-2 flex flex-col gap-2">
          {ACHIEVEMENTS.map((ach) => {
            const progress = getAchievementProgress(
              ach,
              unlockedIds,
              cumulativeStats
            );
            const isUnlocked = progress.isUnlocked;
            const tier = TIER_CONFIG[ach.tier];

            return (
              <div
                key={ach.id}
                className={`p-2.5 sm:py-2.5 sm:px-3.5 rounded-xl transition-all relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 ${
                  isUnlocked
                    ? `bg-[#060913]/90 border ${tier.border} shadow-[0_4px_16px_rgba(0,0,0,0.45)]`
                    : 'bg-[#060913]/50 border border-dashed border-white/10 opacity-75'
                }`}
              >
                {/* Left Side: Icon + Details */}
                <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                  {renderIcon(ach, isUnlocked)}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`type-caption-2-semibold uppercase ${
                          isUnlocked ? tier.textColor : 'text-slate-500'
                        }`}
                      >
                        {tier.name}
                      </span>

                      {isUnlocked && (
                        <span className="flex items-center gap-0.5 text-emerald-400 type-caption-2-semibold">
                          <SolidCheckCircleIcon className="w-3 h-3" />
                          {t('unlocked', 'Unlocked')}
                        </span>
                      )}
                    </div>

                    <div
                      className={`type-callout-bold truncate ${
                        isUnlocked ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {ach.title}
                    </div>

                    <p className="type-footnote text-slate-400 leading-snug line-clamp-2 mt-0.5 max-w-[65ch]">
                      {ach.description}
                    </p>

                    {isUnlocked && ach.rewardTitle && (
                      <div className="mt-1 flex items-center gap-1.5 type-caption-2">
                        <span className="text-slate-400">{t('reward_title', 'Title')}:</span>
                        <span className="font-bold text-[#CCFF00]">
                          [{ach.rewardTitle}]
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: XP Badge & Progress Bar */}
                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center shrink-0 gap-2 sm:gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06] min-w-[125px]">
                  <div
                    className={`px-2.5 py-1 rounded-full type-caption-1 font-mono font-bold shrink-0 ${
                      isUnlocked
                        ? 'bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 shadow-[0_0_10px_rgba(204,255,0,0.15)]'
                        : 'bg-white/5 text-slate-500 border border-white/10'
                    }`}
                  >
                    +{ach.rewardXp} XP
                  </div>

                  {!isUnlocked && (
                    <div className="w-28 sm:w-32">
                      <div className="flex items-center justify-between font-mono type-caption-2 text-slate-400 mb-0.5">
                        <span>{t('progress', 'Progress')}</span>
                        <span>{progress.displayProgress}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-slate-400 to-[#CCFF00] rounded-full transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. Footer Dismiss Button */}
        <div className="pt-2.5 mt-2 border-t border-white/[0.08] shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2 px-3.5 min-h-[38px] sm:min-h-[40px] rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/12 text-slate-200 type-callout-semibold uppercase tracking-wider transition cursor-pointer active:scale-98"
          >
            {t('close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
