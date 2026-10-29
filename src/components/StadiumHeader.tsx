'use client';

import React from 'react';
import { playButtonClick } from '@/utils/audio';
import { ArrowLeftIcon, VolumeIcon, VolumeMuteIcon, SettingsIcon, GaugeIcon } from './icons/Icons';
import { useI18n } from '@/i18n/I18nContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface StadiumHeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings?: () => void;
  onRequestExit?: () => void;
  // Real-time Telemetry for Adaptive HUD
  formattedTime?: string;
  wpm?: number;
  accuracy?: number;
  rank?: number;
  totalRunners?: number;
}

export const StadiumHeader: React.FC<StadiumHeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onRequestExit,
  formattedTime,
  wpm = 0,
  accuracy = 100,
  rank = 1,
  totalRunners = 4
}) => {
  const { t } = useI18n();

  return (
    <header className="fixed top-3 sm:top-3.5 left-0 right-0 z-40 select-none px-4 sm:px-6 lg:px-8 flex items-center justify-between pointer-events-none">
      {/* 1. Back / Exit Button (Left) */}
      <div className="pointer-events-auto shrink-0">
        {onRequestExit && (
          <button
            type="button"
            onClick={() => {
              playButtonClick(soundEnabled);
              onRequestExit();
            }}
            title={t('back', 'Back')}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white bg-[#0B101D]/85 hover:bg-[#0B101D] backdrop-blur-xl border border-white/10 shadow-md transition cursor-pointer min-h-[38px] sm:min-h-[40px] active:scale-95"
          >
            <ArrowLeftIcon className="w-4 h-4 text-slate-400 group-hover:text-white" />
            <span className="type-caption-1-semibold hidden sm:inline">
              {t('back', 'Back')}
            </span>
          </button>
        )}
      </div>

      {/* 2. Adaptive Telemetry HUD (Center) */}
      {formattedTime && (
        <div className="pointer-events-auto shrink-0 mx-2">
          {/* Desktop & Tablet (>= 768px): Full Horizontal Bar (Compact Swiss density) */}
          <div className="hidden md:flex items-center gap-3.5 lg:gap-4 px-4 py-1.5 sm:py-2 rounded-2xl bg-[#0B101D]/90 backdrop-blur-2xl border border-white/14 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            {/* Stopwatch Timer */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
              <div>
                <span className="type-caption-2-semibold text-slate-400 uppercase block">
                  {t('time', 'Time')}
                </span>
                <span className="type-callout-bold text-white font-mono-num block">
                  {formattedTime}
                </span>
              </div>
            </div>

            <div className="w-[1px] h-5 bg-white/12" />

            {/* WPM Speedometer */}
            <div className="flex items-center gap-2">
              <GaugeIcon className="w-4 h-4 text-[#CCFF00]" />
              <div>
                <span className="type-caption-2-semibold text-slate-400 uppercase block">
                  {t('speed', 'Speed')}
                </span>
                <span className="type-callout-bold text-[#CCFF00] font-mono-num block">
                  {wpm} <span className="type-caption-2 text-slate-400">WPM</span>
                </span>
              </div>
            </div>

            <div className="w-[1px] h-5 bg-white/12" />

            {/* Accuracy */}
            <div>
              <span className="type-caption-2-semibold text-slate-400 uppercase block">
                {t('accuracy', 'Accuracy')}
              </span>
              <span className="type-callout-bold text-sky-400 font-mono-num block">
                {accuracy}%
              </span>
            </div>

            <div className="w-[1px] h-5 bg-white/12" />

            {/* Position / Mode */}
            <div>
              <span className="type-caption-2-semibold text-slate-400 uppercase block">
                {totalRunners > 1 ? t('rank', 'Rank') : t('practice', 'Practice')}
              </span>
              {totalRunners > 1 ? (
                <span className="type-callout-bold text-white block">
                  <span className="text-[#CCFF00]">#{rank}</span>
                  <span className="text-slate-400 type-caption-1">/{totalRunners}</span>
                </span>
              ) : (
                <span className="type-caption-1-semibold text-amber-400 uppercase block">
                  {t('solo_practice', 'Solo Practice')}
                </span>
              )}
            </div>
          </div>

          {/* Mobile View (< 768px): Compact Frosted Mini-Chips */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0B101D]/90 backdrop-blur-xl border border-white/12 shadow-md">
            {/* Timer */}
            <span className="type-footnote-semibold text-white font-mono-num">
              {formattedTime}
            </span>

            <span className="text-white/20">•</span>

            {/* WPM */}
            <span className="type-footnote-semibold text-[#CCFF00] font-mono-num">
              {wpm}w
            </span>

            <span className="text-white/20">•</span>

            {/* Rank / Mode */}
            {totalRunners > 1 ? (
              <span className="type-footnote-semibold text-white">
                <span className="text-[#CCFF00]">#{rank}</span>
                <span className="text-slate-400 type-caption-2">/{totalRunners}</span>
              </span>
            ) : (
              <span className="type-caption-2-semibold text-amber-400 uppercase">
                {t('practice', 'Practice')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3. Controls: Language Switcher, Sound & Settings (Right) */}
      <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
        <LanguageSwitcher variant="compact" soundEnabled={soundEnabled} />

        <button
          type="button"
          onClick={() => {
            playButtonClick(soundEnabled);
            onToggleSound();
          }}
          title={soundEnabled ? t('mute_sound', 'Mute Sound') : t('unmute_sound', 'Unmute Sound')}
          className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-xl bg-[#0B101D]/85 hover:bg-[#0B101D] backdrop-blur-xl border border-white/10 shadow-md active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
        >
          {soundEnabled ? (
            <VolumeIcon className="w-4 h-4 text-[#CCFF00]" />
          ) : (
            <VolumeMuteIcon className="w-4 h-4 text-rose-400" />
          )}
        </button>

        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            title={t('settings', 'Settings')}
            className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] rounded-xl bg-[#0B101D]/85 hover:bg-[#0B101D] backdrop-blur-xl border border-white/10 shadow-md active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
