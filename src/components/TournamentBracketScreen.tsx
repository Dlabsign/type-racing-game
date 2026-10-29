'use client';

import React, { useEffect, useRef } from 'react';
import { TournamentState, TournamentParticipant } from '@/types/tournament';
import { TOURNAMENT_STAGE_REWARDS } from '@/utils/tournamentEngine';
import { playButtonClick } from '@/utils/audio';
import { ArrowLeftIcon, PlayIcon } from './icons/Icons';
import { useI18n } from '@/i18n/I18nContext';

interface TournamentBracketScreenProps {
  tournament: TournamentState;
  soundEnabled?: boolean;
  onStartRoundRace: () => void;
  onExitTournament: () => void;
}

export const TournamentBracketScreen: React.FC<TournamentBracketScreenProps> = ({
  tournament,
  soundEnabled = true,
  onStartRoundRace,
  onExitTournament
}) => {
  const { t } = useI18n();
  const ctaBtnRef = useRef<HTMLButtonElement>(null);
  const currentRound = tournament.currentRound;

  // Keyboard navigation: ENTER to proceed, ESC to back
  useEffect(() => {
    ctaBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        playButtonClick(soundEnabled);
        onStartRoundRace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        playButtonClick(soundEnabled);
        onExitTournament();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartRoundRace, onExitTournament, soundEnabled]);

  const handleStart = () => {
    playButtonClick(soundEnabled);
    onStartRoundRace();
  };

  const handleExit = () => {
    playButtonClick(soundEnabled);
    onExitTournament();
  };

  const roundHeadline =
    currentRound === 1
      ? t('bracket_r1_headline', 'Finish top 2 to qualify for the Semifinal (~65 WPM)')
      : currentRound === 2
      ? t('bracket_r2_headline', 'Finish top 2 to qualify for the Championship Final (~85 WPM)')
      : t('bracket_r3_headline', 'Finish 1st to capture the Championship Trophy (~105 WPM)');

  const renderParticipantPill = (p: TournamentParticipant, isCurrentRoundActive: boolean) => {
    const isPlayer = p.isPlayer;
    const isQualified = p.status === 'qualified';
    const isEliminated = p.status === 'eliminated';
    const isChampion = p.status === 'champion';

    let borderClass = 'border-white/10';
    let bgClass = 'bg-white/[0.03]';

    if (isPlayer) {
      borderClass = 'border-[#CCFF00] ring-1 ring-[#CCFF00]/40';
      bgClass = 'bg-[#CCFF00]/15';
    } else if (isChampion) {
      borderClass = 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)]';
      bgClass = 'bg-amber-400/20';
    } else if (isQualified) {
      borderClass = 'border-[#CCFF00]/60';
      bgClass = 'bg-[#CCFF00]/10';
    } else if (isEliminated) {
      borderClass = 'border-white/5 opacity-40';
      bgClass = 'bg-black/40';
    }

    return (
      <div
        key={p.id}
        className={`flex items-center justify-between px-3 py-1.5 sm:py-2 rounded-xl border ${borderClass} ${bgClass} transition-all duration-300 min-h-[36px]`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: p.color }}
          />
          <span
            className={`type-callout-semibold truncate ${
              isPlayer ? 'text-[#CCFF00]' : isEliminated ? 'text-slate-500 line-through' : 'text-slate-200'
            }`}
          >
            {p.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {p.wpm && p.wpm > 0 && (
            <span className="font-mono type-caption-1 text-slate-400 font-semibold">
              {p.wpm}w
            </span>
          )}

          {isChampion && (
            <span className="text-amber-400 type-caption-2-semibold">🏆 {t('champion', 'Champion')}</span>
          )}
          {isQualified && !isChampion && (
            <span className="text-[#CCFF00] type-caption-2-semibold">✓ {t('qualified', 'Qualified')}</span>
          )}
          {isEliminated && (
            <span className="text-rose-400/70 type-caption-2">{t('eliminated', 'Eliminated')}</span>
          )}
          {!isQualified && !isEliminated && !isChampion && isCurrentRoundActive && (
            <span className="text-blue-400 type-caption-2 font-mono">{t('ready', 'Ready')}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col justify-between bg-[#050811] text-white select-none animate-apple-in">
      {/* 1. Header Bar */}
      <header className="relative z-20 w-full px-4 sm:px-6 lg:px-8 pt-2.5 pb-2 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <button
          type="button"
          onClick={handleExit}
          className="flex items-center gap-1.5 px-2.5 py-1.5 -ml-1 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition cursor-pointer min-h-[36px]"
        >
          <ArrowLeftIcon className="w-4 h-4 text-slate-400 group-hover:text-white" />
          <span className="type-callout-semibold tracking-wide">
            {t('back', 'Back')}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
          <span className="type-caption-1-semibold text-[#CCFF00] tracking-wider uppercase">
            {t('knockout_system', 'Knockout Stage')}
          </span>
        </div>
      </header>

      {/* 2. Main Tournament Bracket Area */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col justify-between overflow-y-auto overscroll-contain">
        {/* Title & Round Badge */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 mb-2.5 shrink-0">
          <div>
            <h1 className="type-large-title text-white">
              {t('tournament_bracket', 'Tournament Bracket')}
            </h1>
            <p className="type-subhead text-slate-300 mt-0.5">
              <span className="text-[#CCFF00] type-subhead-semibold">{roundHeadline}</span>
            </p>
          </div>

          <div className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 type-footnote text-slate-300 font-semibold self-start sm:self-auto shrink-0">
            {t('round_indicator', 'Round {round} of 3', { round: currentRound })}
          </div>
        </div>

        {/* 3-Column Tournament Tree */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 items-stretch my-auto">
          {/* TIER 1: PEREMPAT FINAL */}
          <div
            className={`rounded-xl p-3 sm:p-3.5 flex flex-col justify-between gap-2.5 transition-all duration-300 ${
              currentRound === 1
                ? 'bg-[#0B101D] border-2 border-[#CCFF00]/80 shadow-[0_0_24px_rgba(204,255,0,0.18)]'
                : 'bg-[#0B101D]/70 border border-white/10'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
              <div>
                <div className="type-title-3 text-white">
                  {t('quarter_final', 'Quarterfinal')}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="type-footnote text-slate-400">
                    {t('top_2_advance', '8 Runners • Top 2')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#CCFF00]/15 border border-[#CCFF00]/30 text-[#CCFF00] font-mono type-caption-2-semibold">
                    +{TOURNAMENT_STAGE_REWARDS[1].prizePoints.toLocaleString()} {t('points', 'PTS')}
                  </span>
                </div>
              </div>
              <span className={`type-caption-2-semibold px-2 py-0.5 rounded-full ${
                tournament.rounds.qf.completed
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : currentRound === 1
                  ? 'bg-[#CCFF00]/20 text-[#CCFF00]'
                  : 'bg-white/10 text-slate-400'
              }`}>
                {tournament.rounds.qf.completed ? t('completed', 'Completed') : t('active', 'Active')}
              </span>
            </div>

            {/* Heat 1 */}
            <div className="space-y-1">
              <div className="type-caption-2-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Heat 1 ({t('your_heat', 'Your Heat')})</span>
                <span className="type-caption-2 text-[#CCFF00]">{t('top_2_qualify', 'Top 2 Qualify')}</span>
              </div>
              <div className="space-y-1">
                {tournament.rounds.qf.heats[0].participants.map((p) =>
                  renderParticipantPill(p, currentRound === 1)
                )}
              </div>
            </div>

            {/* Heat 2 */}
            <div className="space-y-1 pt-1.5 border-t border-white/[0.06]">
              <div className="type-caption-2-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Heat 2</span>
                <span className="type-caption-2 text-slate-400">{t('top_2_qualify', 'Top 2 Qualify')}</span>
              </div>
              <div className="space-y-1">
                {tournament.rounds.qf.heats[1].participants.map((p) =>
                  renderParticipantPill(p, currentRound === 1)
                )}
              </div>
            </div>
          </div>

          {/* TIER 2: SEMIFINAL */}
          <div
            className={`rounded-xl p-3 sm:p-3.5 flex flex-col justify-between gap-2.5 transition-all duration-300 ${
              currentRound === 2
                ? 'bg-[#0B101D] border-2 border-[#CCFF00]/80 shadow-[0_0_24px_rgba(204,255,0,0.18)]'
                : 'bg-[#0B101D]/70 border border-white/10'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
              <div>
                <div className="type-title-3 text-white">
                  {t('semifinal', 'Semifinal')}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="type-footnote text-slate-400">
                    {t('top_2_advance', '4 Runners • Top 2')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#CCFF00]/15 border border-[#CCFF00]/30 text-[#CCFF00] font-mono type-caption-2-semibold">
                    +{TOURNAMENT_STAGE_REWARDS[2].prizePoints.toLocaleString()} {t('points', 'PTS')}
                  </span>
                </div>
              </div>
              <span className={`type-caption-2-semibold px-2 py-0.5 rounded-full ${
                tournament.rounds.sf.completed
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : currentRound === 2
                  ? 'bg-[#CCFF00]/20 text-[#CCFF00]'
                  : 'bg-white/10 text-slate-400'
              }`}>
                {tournament.rounds.sf.completed
                  ? t('completed', 'Completed')
                  : currentRound === 2
                  ? t('active', 'Active')
                  : t('waiting', 'Waiting')}
              </span>
            </div>

            <div className="space-y-1 flex-1 flex flex-col justify-center">
              <div className="type-caption-2-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>{t('semifinal_runners', 'Semifinal Runners')}</span>
                <span className="type-caption-2 text-[#CCFF00]">{t('top_2_qualify', 'Top 2 Qualify')}</span>
              </div>

              {tournament.rounds.sf.heats[0].participants.length > 0 ? (
                <div className="space-y-1">
                  {tournament.rounds.sf.heats[0].participants.map((p) =>
                    renderParticipantPill(p, currentRound === 2)
                  )}
                </div>
              ) : (
                <div className="py-4 text-center type-footnote text-slate-500 border border-dashed border-white/10 rounded-xl">
                  {t('waiting_for_qf', 'Waiting for quarterfinal results...')}
                </div>
              )}
            </div>

            <div className="type-caption-2 text-slate-500 text-center">
              {t('target_speed', 'Target speed')}: ~85 WPM
            </div>
          </div>

          {/* TIER 3: GRAND FINAL */}
          <div
            className={`rounded-xl p-3 sm:p-3.5 flex flex-col justify-between gap-2.5 transition-all duration-300 ${
              currentRound === 3
                ? 'bg-[#0B101D] border-2 border-amber-400 shadow-[0_0_28px_rgba(251,191,36,0.25)]'
                : 'bg-[#0B101D]/70 border border-white/10'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
              <div>
                <div className="type-title-3 text-white">
                  {t('final_round', 'Grand Final')}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="type-footnote text-slate-400">
                    4 {t('finalists', 'Finalists')} • {t('champion', 'Champion')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono type-caption-2-semibold">
                    🏆 +{TOURNAMENT_STAGE_REWARDS[3].prizePoints.toLocaleString()} {t('points', 'PTS')}
                  </span>
                </div>
              </div>
              <span className={`type-caption-2-semibold px-2 py-0.5 rounded-full ${
                tournament.rounds.gf.completed
                  ? 'bg-amber-400/20 text-amber-400'
                  : currentRound === 3
                  ? 'bg-amber-400/20 text-amber-300'
                  : 'bg-white/10 text-slate-400'
              }`}>
                {tournament.rounds.gf.completed
                  ? t('champion', 'Champion')
                  : currentRound === 3
                  ? t('final_round', 'Championship Final')
                  : t('waiting', 'Waiting')}
              </span>
            </div>

            <div className="space-y-1 flex-1 flex flex-col justify-center">
              <div className="type-caption-2-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>{t('championship_finalists', 'Championship Finalists')}</span>
                <span className="text-amber-400 type-caption-2-semibold">1st {t('place', 'Place')}</span>
              </div>

              {tournament.rounds.gf.heats[0].participants.length > 0 ? (
                <div className="space-y-1">
                  {tournament.rounds.gf.heats[0].participants.map((p) =>
                    renderParticipantPill(p, currentRound === 3)
                  )}
                </div>
              ) : (
                <div className="py-4 text-center type-footnote text-slate-500 border border-dashed border-white/10 rounded-xl">
                  {t('waiting_for_sf', 'Waiting for semifinal results...')}
                </div>
              )}
            </div>

            <div className="type-caption-2 text-amber-400/80 text-center font-medium">
              {t('target_speed', 'Target speed')}: ~105 WPM
            </div>
          </div>
        </div>

        {/* 3. Action CTA Button */}
        <div className="pt-2 sm:pt-2.5 flex justify-end shrink-0">
          <button
            ref={ctaBtnRef}
            type="button"
            onClick={handleStart}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 min-h-[44px] type-headline uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[0_4px_16px_rgba(37,99,235,0.35)] active:scale-98 transition"
          >
            <PlayIcon className="w-4 h-4 fill-current" />
            <span>{t('start_round', 'Start Round {round}', { round: currentRound })}</span>
          </button>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="relative z-20 w-full px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-xs font-sports text-slate-600 border-t border-white/[0.06] shrink-0">
        <span>Type Racing</span>
      </footer>
    </div>
  );
};
