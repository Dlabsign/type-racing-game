'use client';

import React, { useEffect, useState } from 'react';
import { Achievement, TIER_CONFIG } from '@/config/achievements';
import { playAchievementChime } from '@/utils/audio';
import { useI18n } from '@/i18n/I18nContext';

interface AchievementToastProps {
  queue: Achievement[];
  soundEnabled?: boolean;
  onDismiss: (id: string) => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  queue,
  soundEnabled = true,
  onDismiss
}) => {
  const { t } = useI18n();
  const current = queue[0] || null;
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!current) return;
    playAchievementChime(soundEnabled);

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 3480);

    const dismissTimer = setTimeout(() => {
      onDismiss(current.id);
      setIsExiting(false);
    }, 3800);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(dismissTimer);
    };
  }, [current, soundEnabled, onDismiss]);

  if (!current) return null;

  const tier = TIER_CONFIG[current.tier];

  return (
    <div
      key={current.id}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
        isExiting
          ? 'opacity-0 -translate-y-4 scale-95'
          : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      <div className="relative swiss-card w-[min(92vw,420px)] p-2.5 sm:p-3 rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.85)] flex items-center justify-between gap-2.5 overflow-hidden">
        {/* Tier Accent Ambient Glow */}
        <div
          className="absolute -top-6 -left-6 w-28 h-28 rounded-full blur-2xl opacity-40 pointer-events-none"
          style={{ backgroundColor: tier.color }}
        />

        {/* Left Side: Tier Badge Icon */}
        <div className="relative flex items-center gap-2.5">
          <div
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center border ${tier.border} ${tier.badgeBg} ${tier.glow} shrink-0`}
          >
            <span className="text-lg sm:text-xl drop-shadow-md">
              {current.tier === 'diamond'
                ? '💎'
                : current.tier === 'gold'
                ? '🏆'
                : current.tier === 'silver'
                ? '🥈'
                : '🥉'}
            </span>
          </div>

          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className={`type-caption-2-semibold tracking-wider uppercase ${tier.textColor}`}>
                {t('achievement_unlocked', 'Achievement Unlocked')} • {tier.name}
              </span>
            </div>

            <div className="type-callout-bold text-white tracking-wide mt-0.5">
              {current.title}
            </div>

            <div className="type-footnote text-slate-300 line-clamp-1 max-w-[65ch]">
              {current.description}
            </div>
          </div>
        </div>

        {/* Right Side: XP Bonus Pill */}
        <div className="flex flex-col items-end shrink-0 pl-1">
          <div className="px-2.5 py-0.5 rounded-full bg-[#CCFF00]/15 border border-[#CCFF00]/40 text-[#CCFF00] type-caption-1 font-mono font-bold shadow-[0_0_12px_rgba(204,255,0,0.25)] flex items-center gap-1">
            <span>+{current.rewardXp}</span>
            <span className="type-caption-2">XP</span>
          </div>

          {current.rewardTitle && (
            <div className="type-caption-2 font-semibold text-slate-400 mt-1 max-w-[90px] truncate text-right">
              [{current.rewardTitle}]
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
