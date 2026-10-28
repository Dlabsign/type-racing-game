'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameStatus,
  ScreenState,
  ModalType,
  RunnerState,
  GameConfig,
  PlayerStats,
  GameMode
} from '@/types/game';
import {
  TournamentState
} from '@/types/tournament';
import {
  DIFFICULTY_PRESETS
} from '@/constants/sentences';
import { getCuratedSentence } from '@/utils/sentenceEngine';
import {
  createInitialTournament,
  getActiveRoundRunners,
  resolveTournamentRound
} from '@/utils/tournamentEngine';
import {
  playKeySound,
  playBeepSound,
  playFanfare,
  playModalOpen,
  playModalClose,
  playWarningChime,
  playSpeedBurstSound,
  playTrophyFanfare
} from '@/utils/audio';
import { StadiumHeader } from '@/components/StadiumHeader';
import { RunningTrack } from '@/components/RunningTrack';
import { TypingArena } from '@/components/TypingArena';
import { CountdownOverlay } from '@/components/CountdownOverlay';
import { FinishModal } from '@/components/FinishModal';
import { SettingsModal } from '@/components/SettingsModal';
import { DifficultySelectScreen } from '@/components/DifficultySelectScreen';
import { ConfirmExitModal } from '@/components/ConfirmExitModal';
import { MainMenu } from '@/components/MainMenu';
import { TournamentBracketScreen } from '@/components/TournamentBracketScreen';
import { TournamentChampionScreen } from '@/components/TournamentChampionScreen';
import { TournamentEliminatedScreen } from '@/components/TournamentEliminatedScreen';

function formatRaceTime(sec: number): string {
  const mins = Math.floor(sec / 60);
  const remSec = Math.floor(sec % 60);
  const hundredths = Math.floor((sec - Math.floor(sec)) * 100);
  return `${String(mins).padStart(2, '0')}:${String(remSec).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}

function createInitialRunners(targetConfig: GameConfig, randomize: boolean = false): RunnerState[] {
  const preset = DIFFICULTY_PRESETS[targetConfig.difficulty];
  const targetSentence = getCuratedSentence(targetConfig.theme, targetConfig.difficulty, !randomize);
  const sentences = [targetSentence];

  return [
    {
      id: 'player',
      lane: 1,
      name: targetConfig.playerName || 'Kamu',
      isPlayer: true,
      color: targetConfig.playerColor || '#CCFF00',
      bib: '01',
      sentences,
      lap: 1,
      charIndex: 0,
      progress: 0,
      visualProgress: 0,
      wpm: 0,
      targetWpm: 0,
      rank: 1,
      finished: false,
      finishTime: null
    },
    {
      id: 'rival1',
      lane: 2,
      name: 'Rival Kilat',
      isPlayer: false,
      color: '#DC2626',
      bib: '02',
      sentences,
      lap: 1,
      charIndex: 0,
      charAccumulator: 0,
      progress: 0,
      visualProgress: 0,
      wpm: preset.r1,
      targetWpm: preset.r1,
      rank: 2,
      finished: false,
      finishTime: null
    },
    {
      id: 'rival2',
      lane: 3,
      name: 'Rival Gesit',
      isPlayer: false,
      color: '#D97706',
      bib: '03',
      sentences,
      lap: 1,
      charIndex: 0,
      charAccumulator: 0,
      progress: 0,
      visualProgress: 0,
      wpm: preset.r2,
      targetWpm: preset.r2,
      rank: 3,
      finished: false,
      finishTime: null
    },
    {
      id: 'rival3',
      lane: 4,
      name: 'Rival Tangkas',
      isPlayer: false,
      color: '#7C3AED',
      bib: '04',
      sentences,
      lap: 1,
      charIndex: 0,
      charAccumulator: 0,
      progress: 0,
      visualProgress: 0,
      wpm: preset.r3,
      targetWpm: preset.r3,
      rank: 4,
      finished: false,
      finishTime: null
    }
  ];
}

const DEFAULT_CONFIG: GameConfig = {
  difficulty: 'medium',
  theme: 'motivasi',
  playerName: 'Kamu',
  playerColor: '#CCFF00'
};

export default function TypeRacingPage() {
  // Navigation & Screen State Machine
  const [screenState, setScreenState] = useState<ScreenState>('MAIN_MENU');
  const [activeModal, setActiveModal] = useState<ModalType>('NONE');

  // Game Configuration State
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [gameMode, setGameMode] = useState<GameMode>('QUICK_RACE');
  const [tournament, setTournament] = useState<TournamentState>(() =>
    createInitialTournament(DEFAULT_CONFIG.playerName, DEFAULT_CONFIG.playerColor)
  );

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [countdownText, setCountdownText] = useState<string>('3');
  const [elapsedTimeStr, setElapsedTimeStr] = useState<string>('00:00.00');
  const [winnerName, setWinnerName] = useState<string>('Kamu');
  const [isPlayerTyping, setIsPlayerTyping] = useState<boolean>(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Player telemetry
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    currentLap: 1,
    charIndex: 0,
    hasCharError: false,
    currentWordHasError: false,
    correctKeystrokes: 0,
    totalKeystrokes: 0,
    correctWords: 0,
    wrongWords: 0,
    liveWpm: 0,
    liveAccuracy: 100,
    wordStreak: 0,
    hasSpeedBurst: false
  });

  // Runners state
  const [runners, setRunners] = useState<RunnerState[]>(() => createInitialRunners(DEFAULT_CONFIG));

  // Refs for animation loop & input handling to avoid stale state
  const stateRef = useRef({
    screenState: 'MAIN_MENU' as ScreenState,
    modal: 'NONE' as ModalType,
    status: 'idle' as GameStatus,
    gameMode: 'QUICK_RACE' as GameMode,
    tournament: createInitialTournament(DEFAULT_CONFIG.playerName, DEFAULT_CONFIG.playerColor),
    startTime: 0,
    elapsedBeforePause: 0,
    lastFrameTime: 0,
    playerStats: {
      currentLap: 1,
      charIndex: 0,
      hasCharError: false,
      currentWordHasError: false,
      correctKeystrokes: 0,
      totalKeystrokes: 0,
      correctWords: 0,
      wrongWords: 0,
      liveWpm: 0,
      liveAccuracy: 100,
      wordStreak: 0,
      hasSpeedBurst: false
    } as PlayerStats,
    runners: createInitialRunners(DEFAULT_CONFIG),
    config: DEFAULT_CONFIG,
    soundEnabled: true
  });

  // Sync refs with state
  useEffect(() => {
    stateRef.current.screenState = screenState;
  }, [screenState]);

  useEffect(() => {
    stateRef.current.modal = activeModal;
  }, [activeModal]);

  useEffect(() => {
    stateRef.current.soundEnabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    stateRef.current.config = config;
  }, [config]);

  useEffect(() => {
    stateRef.current.gameMode = gameMode;
  }, [gameMode]);

  useEffect(() => {
    stateRef.current.tournament = tournament;
  }, [tournament]);

  const getElapsedSeconds = useCallback(() => {
    const s = stateRef.current;
    if (s.status === 'idle' || s.status === 'countdown') return 0;
    if (s.status === 'paused' || s.status === 'finished') {
      return s.elapsedBeforePause;
    }
    return s.elapsedBeforePause + (performance.now() - s.startTime) / 1000;
  }, []);

  // Finish Race Handler
  const finishRace = useCallback((winner: RunnerState) => {
    const s = stateRef.current;
    if (s.status === 'finished') return;

    const finalElapsed = s.elapsedBeforePause + (performance.now() - s.startTime) / 1000;
    s.elapsedBeforePause = finalElapsed;
    s.status = 'finished';
    setGameStatus('finished');

    const player = s.runners[0];
    const playerWon = winner.id === 'player' || player.rank === 1;

    setWinnerName(winner.name);

    if (s.gameMode === 'TOURNAMENT') {
      const playerRank = player.rank;
      const playerWpm = s.playerStats.liveWpm;
      const playerAccuracy = s.playerStats.liveAccuracy;
      const playerTimeSec = finalElapsed;
      const playerTimeStr = formatRaceTime(finalElapsed);

      const resolved = resolveTournamentRound(
        s.tournament,
        playerRank,
        playerWpm,
        playerAccuracy,
        playerTimeSec,
        playerTimeStr,
        s.runners
      );
      s.tournament = resolved;
      setTournament(resolved);

      if (resolved.isChampion) {
        setScreenState('TOURNAMENT_CHAMPION');
      } else if (resolved.isEliminated) {
        setScreenState('TOURNAMENT_ELIMINATED');
      } else {
        playFanfare(true, s.soundEnabled);
        setScreenState('TOURNAMENT_BRACKET');
      }
    } else {
      playFanfare(playerWon, s.soundEnabled);
      setScreenState('POST_RACE');
    }
  }, []);

  // Start / Restart Race Countdown (Quick Race / Practice)
  const startCountdownAndRace = useCallback(() => {
    setActiveModal('NONE');

    const targetConfig = stateRef.current.config;
    const initialRunners = createInitialRunners(targetConfig, true);
    const initialStats: PlayerStats = {
      currentLap: 1,
      charIndex: 0,
      hasCharError: false,
      currentWordHasError: false,
      correctKeystrokes: 0,
      totalKeystrokes: 0,
      correctWords: 0,
      wrongWords: 0,
      liveWpm: 0,
      liveAccuracy: 100,
      wordStreak: 0,
      hasSpeedBurst: false
    };

    stateRef.current.status = 'countdown';
    stateRef.current.startTime = 0;
    stateRef.current.elapsedBeforePause = 0;
    stateRef.current.playerStats = { ...initialStats };
    stateRef.current.runners = initialRunners;

    setScreenState('COUNTDOWN');
    setGameStatus('countdown');
    setPlayerStats(initialStats);
    setRunners(initialRunners);
    setElapsedTimeStr('00:00.00');

    // Countdown sequence: 3 -> 2 -> 1 -> MULAI!
    let count = 3;
    setCountdownText(String(count));
    playBeepSound(520, 0.12, stateRef.current.soundEnabled);

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownText(String(count));
        playBeepSound(520, 0.12, stateRef.current.soundEnabled);
      } else if (count === 0) {
        setCountdownText('MULAI!');
        playBeepSound(880, 0.25, stateRef.current.soundEnabled);
      } else {
        clearInterval(interval);
        stateRef.current.status = 'racing';
        stateRef.current.startTime = performance.now();
        stateRef.current.lastFrameTime = performance.now();
        setScreenState('RACING');
        setGameStatus('racing');
      }
    }, 750);
  }, []);

  // Start Tournament Championship Round Race
  const startTournamentRoundRace = useCallback(() => {
    setActiveModal('NONE');

    const tourney = stateRef.current.tournament;
    const currentRound = tourney.currentRound;

    const roundDifficulty = currentRound === 1 ? 'easy' : currentRound === 2 ? 'medium' : 'hard';
    const targetSentence = getCuratedSentence(stateRef.current.config.theme, roundDifficulty, false);

    const roundRunners = getActiveRoundRunners(tourney, targetSentence);
    const initialStats: PlayerStats = {
      currentLap: 1,
      charIndex: 0,
      hasCharError: false,
      currentWordHasError: false,
      correctKeystrokes: 0,
      totalKeystrokes: 0,
      correctWords: 0,
      wrongWords: 0,
      liveWpm: 0,
      liveAccuracy: 100,
      wordStreak: 0,
      hasSpeedBurst: false
    };

    stateRef.current.status = 'countdown';
    stateRef.current.startTime = 0;
    stateRef.current.elapsedBeforePause = 0;
    stateRef.current.playerStats = { ...initialStats };
    stateRef.current.runners = roundRunners;

    setScreenState('COUNTDOWN');
    setGameStatus('countdown');
    setPlayerStats(initialStats);
    setRunners(roundRunners);
    setElapsedTimeStr('00:00.00');

    let count = 3;
    setCountdownText(String(count));
    playBeepSound(520, 0.12, stateRef.current.soundEnabled);

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownText(String(count));
        playBeepSound(520, 0.12, stateRef.current.soundEnabled);
      } else if (count === 0) {
        setCountdownText('MULAI!');
        playBeepSound(880, 0.25, stateRef.current.soundEnabled);
      } else {
        clearInterval(interval);
        stateRef.current.status = 'racing';
        stateRef.current.startTime = performance.now();
        stateRef.current.lastFrameTime = performance.now();
        setScreenState('RACING');
        setGameStatus('racing');
      }
    }, 750);
  }, []);

  // Initialize Tournament from Main Menu
  const handleStartTournament = useCallback(() => {
    setGameMode('TOURNAMENT');
    stateRef.current.gameMode = 'TOURNAMENT';
    const initialTourney = createInitialTournament(config.playerName, config.playerColor);
    stateRef.current.tournament = initialTourney;
    setTournament(initialTourney);
    setScreenState('TOURNAMENT_BRACKET');
  }, [config.playerName, config.playerColor]);

  // Handle Keystroke
  const handleKeyInput = useCallback((key: string) => {
    const s = stateRef.current;
    if (s.status !== 'racing' || s.screenState !== 'RACING' || s.modal !== 'NONE') return;

    const player = s.runners[0];
    const sentence = player.sentences[0];
    if (!sentence) return;

    if (key === 'Backspace') {
      playKeySound(true, s.soundEnabled);
      if (s.playerStats.hasCharError) {
        s.playerStats.hasCharError = false;
        setPlayerStats({ ...s.playerStats });
      }
      return;
    }

    if (key.length > 1) return;

    const expectedChar = sentence[s.playerStats.charIndex];
    if (!expectedChar) return;

    setIsPlayerTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsPlayerTyping(false);
    }, 1200);

    s.playerStats.totalKeystrokes++;

    const isMatch = (key === expectedChar);

    if (isMatch) {
      s.playerStats.correctKeystrokes++;
      s.playerStats.hasCharError = false;
      s.playerStats.charIndex++;
      player.charIndex = s.playerStats.charIndex;

      playKeySound(true, s.soundEnabled);

      if (expectedChar === ' ' || s.playerStats.charIndex === sentence.length) {
        if (!s.playerStats.currentWordHasError) {
          s.playerStats.correctWords++;
          s.playerStats.wordStreak = (s.playerStats.wordStreak || 0) + 1;
          if (s.playerStats.wordStreak >= 15 && !s.playerStats.hasSpeedBurst) {
            s.playerStats.hasSpeedBurst = true;
            playSpeedBurstSound(s.soundEnabled);
          }
        }
        s.playerStats.currentWordHasError = false;
      }

      player.progress = s.playerStats.charIndex / sentence.length;

      if (s.playerStats.charIndex >= sentence.length) {
        player.progress = 1;
        player.visualProgress = 1;
        player.finished = true;
        player.finishTime = getElapsedSeconds();
        setPlayerStats({ ...s.playerStats });
        setRunners([...s.runners]);
        finishRace(player);
        return;
      }

      const elapsedSec = Math.max(0.5, getElapsedSeconds());
      const elapsedMin = elapsedSec / 60;
      const rawWpm = Math.round((s.playerStats.correctKeystrokes / 5) / elapsedMin);
      s.playerStats.liveWpm = s.playerStats.correctKeystrokes > 0 ? Math.min(220, rawWpm) : 0;
      player.wpm = s.playerStats.liveWpm;

      s.playerStats.liveAccuracy = s.playerStats.totalKeystrokes > 0
        ? Math.max(0, Math.round((s.playerStats.correctKeystrokes / s.playerStats.totalKeystrokes) * 100))
        : 100;

      setPlayerStats({ ...s.playerStats });
      setRunners([...s.runners]);
    } else {
      s.playerStats.hasCharError = true;
      s.playerStats.wordStreak = 0;
      s.playerStats.hasSpeedBurst = false;
      if (!s.playerStats.currentWordHasError) {
        s.playerStats.currentWordHasError = true;
        s.playerStats.wrongWords++;
      }

      playKeySound(false, s.soundEnabled);

      s.playerStats.liveAccuracy = s.playerStats.totalKeystrokes > 0
        ? Math.max(0, Math.round((s.playerStats.correctKeystrokes / s.playerStats.totalKeystrokes) * 100))
        : 100;

      setPlayerStats({ ...s.playerStats });
    }
  }, [finishRace, getElapsedSeconds]);

  // Request Exit Confirmation (when during race or pressing ESC)
  const handleRequestExit = useCallback(() => {
    if (stateRef.current.status === 'racing') {
      stateRef.current.elapsedBeforePause = getElapsedSeconds();
      stateRef.current.status = 'paused';
      setGameStatus('paused');
      playWarningChime(stateRef.current.soundEnabled);
      setActiveModal('EXIT_CONFIRM');
    }
  }, [getElapsedSeconds]);

  // Resume Race from pause/modal
  const handleResumeRace = useCallback(() => {
    setActiveModal('NONE');
    if (stateRef.current.status === 'paused') {
      stateRef.current.startTime = performance.now();
      stateRef.current.status = 'racing';
      setGameStatus('racing');
    }
  }, []);

  // Exit race to Main Menu
  const handleConfirmExitToMenu = useCallback(() => {
    setActiveModal('NONE');
    setGameStatus('idle');
    stateRef.current.status = 'idle';
    setScreenState('MAIN_MENU');
  }, []);

  // Physical keyboard listeners & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentScreen = stateRef.current.screenState;
      const currentModal = stateRef.current.modal;

      // 1. ESC Key Ergonomics
      if (e.key === 'Escape') {
        e.preventDefault();

        // If a modal is open, close it
        if (currentModal === 'EXIT_CONFIRM') {
          handleResumeRace();
          return;
        }
        if (currentModal === 'SETTINGS') {
          playModalClose(stateRef.current.soundEnabled);
          if (stateRef.current.status === 'paused') {
            handleResumeRace();
          } else {
            setActiveModal('NONE');
          }
          return;
        }

        // If on DIFFICULTY_SELECT, go back to MAIN_MENU
        if (currentScreen === 'DIFFICULTY_SELECT') {
          setScreenState('MAIN_MENU');
          return;
        }

        // If currently in RACING, trigger Exit Confirmation modal
        if (currentScreen === 'RACING') {
          handleRequestExit();
          return;
        }

        // If in POST_RACE, return to MAIN_MENU
        if (currentScreen === 'POST_RACE') {
          handleConfirmExitToMenu();
          return;
        }
        return;
      }

      // 2. ENTER Key Confirmation Shortcut
      if (e.key === 'Enter') {
        if (currentScreen === 'DIFFICULTY_SELECT') {
          e.preventDefault();
          startCountdownAndRace();
          return;
        }
        if (currentScreen === 'POST_RACE') {
          e.preventDefault();
          startCountdownAndRace();
          return;
        }
        if (currentModal === 'EXIT_CONFIRM') {
          e.preventDefault();
          handleResumeRace();
          return;
        }
      }

      // 3. Typing during RACING
      if (currentScreen !== 'RACING' || currentModal !== 'NONE') return;

      if (e.key === ' ' || e.key === 'Backspace' || e.key === 'Tab' || e.key === "'" || e.key === '/') {
        e.preventDefault();
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKeyInput(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleConfirmExitToMenu,
    handleKeyInput,
    handleRequestExit,
    handleResumeRace,
    startCountdownAndRace
  ]);

  // Main 60fps simulation loop
  useEffect(() => {
    let animId: number;

    const step = (now: number) => {
      const s = stateRef.current;
      const dt = Math.min(0.1, (now - s.lastFrameTime) / 1000);
      s.lastFrameTime = now;

      if (s.status === 'racing') {
        const elapsed = getElapsedSeconds();
        setElapsedTimeStr(formatRaceTime(elapsed));

        // Advance AI opponents
        for (let i = 1; i < s.runners.length; i++) {
          const ai = s.runners[i];
          if (ai.finished) continue;

          const wave = Math.sin(elapsed * 1.6 + i * 2.2) * 3;
          ai.wpm = Math.max(20, Math.round(ai.targetWpm + wave));

          const charsPerSec = (ai.wpm * 5) / 60;
          ai.charAccumulator = (ai.charAccumulator || 0) + charsPerSec * dt;

          const currentSentence = ai.sentences[0] || '';
          while (ai.charAccumulator >= 1 && !ai.finished) {
            ai.charAccumulator -= 1;
            ai.charIndex += 1;

            if (ai.charIndex >= currentSentence.length) {
              ai.finished = true;
              ai.progress = 1;
              ai.visualProgress = 1;
              ai.finishTime = elapsed;
              if (s.runners[0].rank === 1 && !s.runners[0].finished) {
                finishRace(ai);
              }
              break;
            }
          }

          if (!ai.finished) {
            ai.progress = currentSentence.length > 0 ? ai.charIndex / currentSentence.length : 0;
          }
        }

        // Smooth visual progress interpolation
        s.runners.forEach((runner) => {
          if (runner.finished) {
            runner.visualProgress = 1;
          } else {
            const diff = runner.progress - runner.visualProgress;
            runner.visualProgress += diff * Math.min(1, dt * 14);
          }
        });

        // Compute rankings
        const ranked = [...s.runners].sort((a, b) => {
          if (a.finished && b.finished) return (a.finishTime || 0) - (b.finishTime || 0);
          if (a.finished) return -1;
          if (b.finished) return 1;
          return b.progress - a.progress;
        });

        ranked.forEach((r, idx) => {
          const target = s.runners.find(x => x.id === r.id);
          if (target) target.rank = idx + 1;
        });

        setRunners([...s.runners]);
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [finishRace, getElapsedSeconds]);

  const playerRunner = runners[0] || { rank: 1, visualProgress: 0, progress: 0 };
  const currentSentence = runners[0]?.sentences[0] || '';

  return (
    <div className="flex flex-col h-[100dvh] w-[100dvw] max-h-[100dvh] max-w-[100dvw] overflow-hidden select-none bg-[#050811] text-white">
      {/* 1. SCREEN: MAIN_MENU */}
      {screenState === 'MAIN_MENU' && (
        <MainMenu
          playerName={config.playerName}
          playerLevel={1}
          soundEnabled={soundEnabled}
          onQuickRace={() => {
            setGameMode('QUICK_RACE');
            stateRef.current.gameMode = 'QUICK_RACE';
            setScreenState('DIFFICULTY_SELECT');
          }}
          onTournament={handleStartTournament}
          onPractice={() => {
            setGameMode('PRACTICE');
            stateRef.current.gameMode = 'PRACTICE';
            setScreenState('DIFFICULTY_SELECT');
          }}
        />
      )}

      {/* 2. SCREEN: DIFFICULTY_SELECT */}
      {screenState === 'DIFFICULTY_SELECT' && (
        <DifficultySelectScreen
          playerName={config.playerName}
          playerColor={config.playerColor}
          difficulty={config.difficulty}
          theme={config.theme}
          soundEnabled={soundEnabled}
          onUpdatePlayerName={(name) => setConfig(prev => ({ ...prev, playerName: name }))}
          onUpdatePlayerColor={(col) => setConfig(prev => ({ ...prev, playerColor: col }))}
          onUpdateDifficulty={(diff) => setConfig(prev => ({ ...prev, difficulty: diff }))}
          onUpdateTheme={(thm) => setConfig(prev => ({ ...prev, theme: thm }))}
          onStartRace={startCountdownAndRace}
          onBackToMenu={() => setScreenState('MAIN_MENU')}
        />
      )}

      {/* 3. SCREEN: TOURNAMENT BRACKET */}
      {screenState === 'TOURNAMENT_BRACKET' && (
        <TournamentBracketScreen
          tournament={tournament}
          soundEnabled={soundEnabled}
          onStartRoundRace={startTournamentRoundRace}
          onExitTournament={handleConfirmExitToMenu}
        />
      )}

      {/* 4. SCREEN: TOURNAMENT CHAMPION PODIUM */}
      {screenState === 'TOURNAMENT_CHAMPION' && (
        <TournamentChampionScreen
          tournament={tournament}
          soundEnabled={soundEnabled}
          onPlayAgain={handleStartTournament}
          onExitToMenu={handleConfirmExitToMenu}
        />
      )}

      {/* 5. SCREEN: TOURNAMENT ELIMINATED */}
      {screenState === 'TOURNAMENT_ELIMINATED' && (
        <TournamentEliminatedScreen
          tournament={tournament}
          soundEnabled={soundEnabled}
          onRetry={handleStartTournament}
          onExitToMenu={handleConfirmExitToMenu}
        />
      )}

      {/* 6. SCREEN: COUNTDOWN / RACING / POST_RACE Arena */}
      {(screenState === 'COUNTDOWN' || screenState === 'RACING' || screenState === 'POST_RACE') && (
        <div className="relative flex-1 w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden select-none">
          {/* Top Distraction-Free Streamlined Navigation Bar */}
          <StadiumHeader
            soundEnabled={soundEnabled}
            onToggleSound={() => {
              setSoundEnabled(prev => !prev);
              if (!soundEnabled) {
                playBeepSound(784, 0.08, true);
              }
            }}
            onOpenSettings={() => {
              if (stateRef.current.status === 'racing') {
                stateRef.current.elapsedBeforePause = getElapsedSeconds();
                stateRef.current.status = 'paused';
                setGameStatus('paused');
              }
              playModalOpen(soundEnabled);
              setActiveModal('SETTINGS');
            }}
            onRequestExit={handleRequestExit}
          />

          {/* Pure Athletic Running Track (Stealth Obsidian Carbon, Zero Text on Track) */}
          <main className="relative flex-1 w-full max-w-[1440px] mx-auto flex flex-col justify-center overflow-hidden select-none px-[clamp(0.5rem,2dvw,1.5rem)] pt-[clamp(2.5rem,5dvh,4rem)] pb-[clamp(7.5rem,17dvh,10rem)]">
            <RunningTrack
              runners={runners}
              isRacing={gameStatus === 'racing'}
              playerLiveWpm={playerStats.liveWpm}
              isPlayerTyping={isPlayerTyping}
              hasSpeedBurst={playerStats.hasSpeedBurst}
            />
          </main>

          {/* Dual-Column High-Energy Bottom Dock: Sisi Kiri Telemetry & Sisi Kanan Area Penulisan */}
          <TypingArena
            sentence={currentSentence}
            charIndex={playerStats.charIndex}
            hasCharError={playerStats.hasCharError}
            hasSpeedBurst={playerStats.hasSpeedBurst}
            wordStreak={playerStats.wordStreak}
            formattedTime={elapsedTimeStr}
            rank={playerRunner.rank}
            totalRunners={runners.length || 4}
            wpm={playerStats.liveWpm}
            accuracy={playerStats.liveAccuracy}
          />
        </div>
      )}

      {/* 7. COUNTDOWN OVERLAY */}
      {screenState === 'COUNTDOWN' && (
        <CountdownOverlay countdownText={countdownText} />
      )}

      {/* 5. POST-RACE PODIUM SHEET */}
      <FinishModal
        isOpen={screenState === 'POST_RACE'}
        playerRank={playerRunner.rank}
        winnerName={winnerName}
        finishTimeStr={elapsedTimeStr}
        wpm={playerStats.liveWpm}
        accuracy={playerStats.liveAccuracy}
        correctWords={playerStats.correctWords}
        wrongWords={playerStats.wrongWords}
        runners={runners}
        soundEnabled={soundEnabled}
        onPlayAgain={startCountdownAndRace}
        onOpenSettings={() => {
          playModalOpen(soundEnabled);
          setActiveModal('SETTINGS');
        }}
        onExitToMenu={handleConfirmExitToMenu}
      />

      {/* 6. SETTINGS MODAL */}
      <SettingsModal
        isOpen={activeModal === 'SETTINGS'}
        difficulty={config.difficulty}
        theme={config.theme}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
        onSelectDifficulty={(d) => setConfig(prev => ({ ...prev, difficulty: d }))}
        onSelectTheme={(thm) => setConfig(prev => ({ ...prev, theme: thm }))}
        onRestart={startCountdownAndRace}
        onClose={handleResumeRace}
        onExitToMenu={handleConfirmExitToMenu}
      />

      {/* 7. CONFIRM EXIT MODAL (Error Prevention) */}
      <ConfirmExitModal
        isOpen={activeModal === 'EXIT_CONFIRM'}
        soundEnabled={soundEnabled}
        onResume={handleResumeRace}
        onConfirmExit={handleConfirmExitToMenu}
      />
    </div>
  );
}
