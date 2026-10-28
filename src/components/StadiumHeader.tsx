import React from 'react';
import { playButtonClick } from '@/utils/audio';
import { ArrowLeftIcon, VolumeIcon, VolumeMuteIcon, SettingsIcon } from './icons/Icons';

interface StadiumHeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings?: () => void;
  onRequestExit?: () => void;
}

export const StadiumHeader: React.FC<StadiumHeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onRequestExit
}) => {
  return (
    <header className="fixed top-[clamp(0.5rem,1.8dvh,1.25rem)] left-0 right-0 z-40 select-none px-[clamp(1rem,3dvw,2rem)] flex items-center justify-between pointer-events-none">
      {/* 1. Back / Exit Button (Left) */}
      <div className="pointer-events-auto">
        {onRequestExit && (
          <button
            type="button"
            onClick={() => {
              playButtonClick(soundEnabled);
              onRequestExit();
            }}
            title="Jeda Balapan [ESC]"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white bg-[#0B101D]/80 hover:bg-[#0B101D] backdrop-blur-xl border border-white/10 shadow-md transition cursor-pointer min-h-[40px]"
          >
            <ArrowLeftIcon className="w-4 h-4 text-slate-400 group-hover:text-white" />
            <span className="font-sports font-bold text-xs tracking-wide">KEMBALI</span>
            <span className="text-[10px] font-mono text-slate-500">[ESC]</span>
          </button>
        )}
      </div>

      {/* 2. Controls: Sound & Settings (Right) */}
      <div className="flex items-center gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            playButtonClick(soundEnabled);
            onToggleSound();
          }}
          title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
          className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-[#0B101D]/80 hover:bg-[#0B101D] backdrop-blur-xl border border-white/10 shadow-md active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
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
            title="SETELAN"
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-[#0B101D]/80 hover:bg-[#0B101D] backdrop-blur-xl border border-white/10 shadow-md active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
