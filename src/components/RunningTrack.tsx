import React from 'react';
import { RunnerState } from '@/types/game';
import { RunnerSvg } from './RunnerSvg';

interface RunningTrackProps {
  runners: RunnerState[];
  isRacing: boolean;
  playerLiveWpm: number;
  isPlayerTyping?: boolean;
  hasSpeedBurst?: boolean;
}

export const RunningTrack: React.FC<RunningTrackProps> = ({
  runners,
  isRacing,
  playerLiveWpm,
  isPlayerTyping = false,
  hasSpeedBurst = false
}) => {
  return (
    <section className="running-track w-full flex-1 max-h-full flex flex-col justify-between overflow-hidden relative select-none rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] border-y-2 sm:border-y-3 border-[#CCFF00]">
      {/* 4 Stealth Obsidian Carbon Lanes */}
      <div className="w-full h-full flex flex-col justify-between">
        {runners.map((runner) => {
          const isPlayer = runner.isPlayer;

          // Determine movement status
          const isMoving =
            isRacing &&
            ((!isPlayer && !runner.finished) ||
              (isPlayer && !runner.finished && (isPlayerTyping || playerLiveWpm > 0 || runner.progress > 0)));

          // Dynamically sync leg stride & arm swing cycle duration with real-time WPM
          const wpmForAnim = Math.max(35, runner.wpm || 60);
          const cycleSec = Math.max(0.16, Math.min(0.42, 24 / wpmForAnim));

          // Visual track progress mapped from start block (2%) to finish line (93.5%)
          const progressClamp = Math.min(1, Math.max(0, runner.visualProgress));
          const trackLeftPct = 2 + progressClamp * 91.5;

          return (
            <div
              key={runner.id}
              className={`track-lane flex-1 min-h-[clamp(48px,11.5dvh,96px)] flex items-center relative overflow-hidden ${
                isPlayer ? 'player-lane-aura' : ''
              }`}
            >
              {/* Lane Telemetry (Left): Rank Circle & Runner Bib Name */}
              <div className="w-[clamp(76px,14vw,160px)] shrink-0 z-20 flex items-center gap-[clamp(0.25rem,0.8vw,0.6rem)] pl-[clamp(0.4rem,1.2vw,1rem)]">
                <div
                  className="w-[clamp(1.5rem,2.4vw,2rem)] h-[clamp(1.5rem,2.4vw,2rem)] rounded-full border border-white/80 flex items-center justify-center font-display font-black text-white text-[clamp(0.7rem,1.1vw,0.875rem)] shadow-md shrink-0"
                  style={{
                    backgroundColor: runner.color,
                    color: isPlayer ? '#050811' : '#FFFFFF'
                  }}
                >
                  {runner.rank}
                </div>

                {/* Desktop & Tablet Badge */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/12 bg-[#0E1526]/90 backdrop-blur-md shadow-sm">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: runner.color }}
                  />
                  <span className="font-sports font-bold text-white text-xs truncate max-w-[65px] md:max-w-[95px]">
                    {runner.name}
                  </span>
                  <span className="font-stat-num text-xs font-bold ml-0.5 text-[#CCFF00]">
                    {runner.wpm}w
                  </span>
                </div>

                {/* Mobile Compact Badge */}
                <div className="flex sm:hidden items-center px-1.5 py-0.5 rounded-full border border-white/10 bg-[#0E1526]/90 text-[10px] font-bold text-slate-300 font-sports">
                  <span className="font-stat-num text-[#CCFF00]">{runner.wpm}</span>
                </div>
              </div>

              {/* Running Surface Track Area */}
              <div className="flex-1 relative h-full overflow-visible">
                {/* Checkered Finish Line Strip on Every Lane */}
                <div className="finish-line-strip" />

                {/* 2D Geometric Athletic Sprinter Rig */}
                <div
                  className={`runner-anchor ${isMoving ? 'runner-active' : 'runner-idle'}`}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translate(-50%, -55%)',
                    left: `${trackLeftPct}%`,
                    zIndex: 20,
                    pointerEvents: 'none',
                    willChange: 'left',
                    ['--run-cycle' as string]: `${cycleSec.toFixed(2)}s`
                  }}
                >
                  <RunnerSvg
                    color={runner.color}
                    bibNum={runner.bib}
                    isPlayer={runner.isPlayer}
                    hasSpeedBurst={runner.isPlayer && hasSpeedBurst}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
