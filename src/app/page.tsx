'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  resolveTournamentRound,
  calculateTournamentStats
} from '@/utils/tournamentEngine';
import {
  playKeySound,
  playBeepSound,
  playFanfare,
  playModalOpen,
  playModalClose,
  playWarningChime,
  playSpeedBurstSound
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
import { AuthModal } from '@/components/AuthModal';
import { AchievementToast } from '@/components/AchievementToast';
import { AchievementsGalleryModal } from '@/components/AchievementsGalleryModal';
import { Achievement } from '@/config/achievements';
import { I18nProvider, useI18n } from '@/i18n/I18nContext';
import {
  evaluateRaceEnd,
  RaceTelemetryForAchievement
} from '@/services/achievementService';

import { User } from 'firebase/auth';
import { UserProfile } from '@/types/auth';
import { subscribeToAuthState } from '@/services/authService';
import { getAuthCookie, clearAuthCookie } from '@/utils/authCookies';
import {
  saveRaceHistory,
  updateCareerStats,
  upsertLeaderboard,
  logActivity,
  saveTournamentRecord,
  flushOfflineQueue
} from '@/services/firestoreService';

function formatRaceTime(sec: number): string {
  const mins = Math.floor(sec / 60);
  const remSec = Math.floor(sec % 60);
  const hundredths = Math.floor((sec - Math.floor(sec)) * 100);
  return `${String(mins).padStart(2, '0')}:${String(remSec).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}

function createInitialRunners(
  targetConfig: GameConfig,
  randomize: boolean = false,
  bibNumber: string = '01',
  isPractice: boolean = false
): RunnerState[] {
  const preset = DIFFICULTY_PRESETS[targetConfig.difficulty];
  const targetSentence = getCuratedSentence(targetConfig.theme, targetConfig.difficulty, !randomize);
  const sentences = [targetSentence];

  const playerRunner: RunnerState = {
    id: 'player',
    lane: 1,
    name: targetConfig.playerName || 'Player',
    isPlayer: true,
    color: targetConfig.playerColor || '#CCFF00',
    bib: bibNumber,
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
  };

  // Pada mode latihan, hapus lawan agar pengguna berlatih sendirian di lintasan
  if (isPractice) {
    return [playerRunner];
  }

  return [
    playerRunner,
    {
      id: 'rival1',
      lane: 2,
      name: 'Blitz Rival',
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
      name: 'Swift Rival',
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
      name: 'Agile Rival',
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
  theme: 'english',
  playerName: 'Player',
  playerColor: '#CCFF00'
};

function TypeRacingApp() {
  const router = useRouter();
  const { t, currentLanguage } = useI18n();
  // Navigation & Screen State Machine
  const [screenState, setScreenState] = useState<ScreenState>('MAIN_MENU');
  const [activeModal, setActiveModal] = useState<ModalType>('NONE');

  // Firebase Auth & User Profile State
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Game Configuration State
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);

  // Synchronize typing sentence theme with selected UI language automatically
  useEffect(() => {
    if (currentLanguage === 'zh') {
      setConfig((prev) => (prev.theme === 'chinese' ? prev : { ...prev, theme: 'chinese' }));
    } else if (currentLanguage === 'ms') {
      setConfig((prev) => (prev.theme === 'malay' ? prev : { ...prev, theme: 'malay' }));
    } else if (currentLanguage === 'en') {
      setConfig((prev) => (prev.theme === 'english' ? prev : { ...prev, theme: 'english' }));
    }
  }, [currentLanguage]);
  const [gameMode, setGameMode] = useState<GameMode>('QUICK_RACE');
  const [tournament, setTournament] = useState<TournamentState>(() =>
    createInitialTournament(DEFAULT_CONFIG.playerName, DEFAULT_CONFIG.playerColor)
  );

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [countdownText, setCountdownText] = useState<string>('3');
  const [elapsedTimeStr, setElapsedTimeStr] = useState<string>('00:00.00');
  const [winnerName, setWinnerName] = useState<string>('Player');
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

  // Achievement Notification & Gallery States
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [isAchievementsGalleryOpen, setIsAchievementsGalleryOpen] = useState<boolean>(false);

  // Telemetry trackers for subtle achievement criteria
  const backspaceCountRef = useRef<number>(0);
  const wasRank4AtHalfwayRef = useRef<boolean>(false);
  const maxComboStreakRef = useRef<number>(0);

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
    user: null as User | null,
    userProfile: null as UserProfile | null,
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

  useEffect(() => {
    stateRef.current.user = user;
    stateRef.current.userProfile = userProfile;
  }, [user, userProfile]);

  // Auth Cookie Protection Gate: verify cookie presence
  useEffect(() => {
    if (!getAuthCookie()) {
      router.replace('/login');
    }
  }, [router]);

  // Firebase Authentication Lifecycle Observer
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((currentUser, profile) => {
      setUser(currentUser);
      setUserProfile(profile);

      if (currentUser && profile) {
        // Hydrate player config & visual avatar
        setConfig((prev) => ({
          ...prev,
          playerName: profile.displayName || prev.playerName,
          playerColor: profile.jerseyColor || prev.playerColor
        }));

        setRunners((prevRunners) => {
          if (!prevRunners.length) return prevRunners;
          const copy = [...prevRunners];
          copy[0] = {
            ...copy[0],
            name: profile.displayName || copy[0].name,
            color: profile.jerseyColor || copy[0].color,
            bib: profile.bibNumber || copy[0].bib
          };
          return copy;
        });
      } else {
        // No authenticated session -> clear cookie & redirect to login
        clearAuthCookie();
        router.replace('/login');
      }
    });

    // Flush any pending offline queue items
    flushOfflineQueue().catch(console.warn);

    return () => unsubscribe();
  }, [router]);

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
    const finalElapsedSec = Math.round(finalElapsed * 100) / 100;
    s.elapsedBeforePause = finalElapsed;
    s.status = 'finished';
    setGameStatus('finished');

    const player = s.runners[0];
    const playerWon = winner.id === 'player' || player.rank === 1;
    const playerRank = player.rank;
    const playerWpm = s.playerStats.liveWpm;
    const playerAccuracy = s.playerStats.liveAccuracy;
    const comboStreak = s.playerStats.wordStreak || 0;
    const errorsCount = s.playerStats.wrongWords || 0;

    // Mode Latihan (PRACTICE) tidak memberikan EXP/Skor; Quick Race & Turnamen memberikan skor atletik penuh
    const isPractice = s.gameMode === 'PRACTICE';
    const finishBonus = isPractice ? 0 : playerRank === 1 ? 250 : playerRank === 2 ? 150 : playerRank === 3 ? 75 : 20;
    const raceScore = isPractice ? 0 : Math.max(10, Math.round((playerWpm * 10) * (playerAccuracy / 100) + finishBonus + (comboStreak * 5)));

    const userId = s.user?.uid || 'guest_local';
    const displayName = s.userProfile?.displayName || s.config.playerName || 'Player';
    const jerseyColor = s.userProfile?.jerseyColor || s.config.playerColor || '#CCFF00';

    // Calculate time difference from 2nd place runner (for photo_finish achievement)
    const secondRunner = s.runners.find((r) => r.rank === 2);
    let timeDiffFromSecondPlace: number | undefined = undefined;
    if (playerWon && secondRunner) {
      if (secondRunner.finishTime !== null) {
        timeDiffFromSecondPlace = Math.max(0, Math.round((secondRunner.finishTime - finalElapsed) * 1000) / 1000);
      } else {
        const sentenceLen = secondRunner.sentences[0]?.length || 50;
        const remainingChars = (1 - secondRunner.progress) * sentenceLen;
        const charsPerSec = (secondRunner.wpm * 5) / 60;
        timeDiffFromSecondPlace = charsPerSec > 0 ? remainingChars / charsPerSec : 1.0;
      }
    }

    const raceTelemetry: RaceTelemetryForAchievement = {
      wpm: playerWpm,
      accuracy: playerAccuracy,
      errorsCount,
      backspaceCount: backspaceCountRef.current,
      finishRank: playerRank,
      maxComboStreak: maxComboStreakRef.current,
      gameMode: s.gameMode,
      difficulty: s.config.difficulty,
      timeElapsedSeconds: finalElapsedSec,
      timeDiffFromSecondPlace,
      wasRank4AtHalfway: wasRank4AtHalfwayRef.current,
      correctWordsCount: s.playerStats.correctWords
    };

    // FIRE-AND-FORGET TELEMETRY DISPATCH (Smooth 60 FPS, detached from UI thread)
    const persistRaceTelemetry = async () => {
      try {
        // 1. Save telemetry to race_history/{raceId}
        await saveRaceHistory({
          userId,
          gameMode: s.gameMode,
          difficulty: s.config.difficulty,
          wpm: playerWpm,
          accuracy: playerAccuracy,
          finalScore: raceScore,
          comboStreak,
          finishRank: playerRank,
          timeElapsedSeconds: finalElapsedSec,
          errorsCount
        });

        // 2. Central real-time activity log
        await logActivity(userId, 'RACE_FINISHED', isPractice ? `Latihan selesai: ${playerWpm} KBM (Mode Latihan)` : `Balapan selesai: peringkat ${playerRank} (${playerWpm} KBM)`, {
          gameMode: s.gameMode,
          difficulty: s.config.difficulty,
          rank: playerRank,
          wpm: playerWpm,
          accuracy: playerAccuracy,
          score: raceScore
        });

        // 3. Update career stats & snappy leaderboard (Mode Latihan tidak menambah EXP / skor karir)
        if (s.user) {
          const updatedStats = await updateCareerStats(userId, {
            wpm: playerWpm,
            accuracy: playerAccuracy,
            score: isPractice ? 0 : raceScore,
            won: isPractice ? false : playerRank === 1
          });

          setUserProfile((prev) => prev ? { ...prev, careerStats: updatedStats } : null);

          if (!isPractice) {
            await upsertLeaderboard({
              userId,
              displayName,
              highestWpm: updatedStats.highestWpm,
              careerScore: updatedStats.totalScore,
              jerseyColor
            });
          }
        }

        // 4. Automatic Achievement Evaluation Engine
        const { newAchievements, allUnlockedIds } = await evaluateRaceEnd(
          raceTelemetry,
          s.user?.uid,
          s.userProfile?.unlockedAchievements,
          s.gameMode === 'TOURNAMENT' ? s.tournament : undefined
        );

        if (newAchievements.length > 0) {
          setAchievementQueue((prev) => [...prev, ...newAchievements]);
          setUserProfile((prev) => (prev ? { ...prev, unlockedAchievements: allUnlockedIds } : null));
        }
      } catch (telemetryErr) {
        console.warn('[Telemetry] Race persistence warning (handled gracefully):', telemetryErr);
      }
    };

    persistRaceTelemetry();

    setWinnerName(winner.name);

    if (s.gameMode === 'TOURNAMENT') {
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
        const tourneySummary = calculateTournamentStats(resolved.playerHistory);
        // Total poin turnamen bertingkat (Perempat Final + Semifinal + Grand Final) ditambah bonus WPM
        const tourneyScore = tourneySummary.totalPoints + resolved.playerHistory.reduce((acc, h) => acc + (h.wpm * 10), 0);

        const persistTournamentChampion = async () => {
          try {
            await saveTournamentRecord({
              userId,
              tournamentName: 'Turnamen Utama',
              highestRoundReached: 3,
              isChampion: true,
              rounds: resolved.playerHistory.map(h => ({
                roundId: h.roundId,
                roundName: h.roundName,
                rank: h.rank,
                wpm: h.wpm,
                accuracy: h.accuracy,
                timeSec: h.timeSec
              })),
              totalTournamentScore: tourneyScore
            });

            await logActivity(userId, 'TOURNAMENT_WIN', 'Juara Turnamen Utama', {
              trophyTier: 'GOLD',
              roundsCleared: 3,
              avgWpm: tourneySummary.avgWpm,
              totalScore: tourneyScore
            });

            // Evaluate Tournament Champion Achievements
            const { newAchievements: tourneyAchievements, allUnlockedIds: allTourneyIds } = await evaluateRaceEnd(
              raceTelemetry,
              userId,
              s.userProfile?.unlockedAchievements,
              resolved
            );

            if (tourneyAchievements.length > 0) {
              setAchievementQueue((prev) => [...prev, ...tourneyAchievements]);
              setUserProfile((prev) => (prev ? { ...prev, unlockedAchievements: allTourneyIds } : null));
            }

            if (s.user) {
              const updatedStats = await updateCareerStats(userId, {
                wpm: tourneySummary.avgWpm,
                accuracy: tourneySummary.avgAccuracy,
                score: tourneyScore,
                won: true,
                isTournamentWin: true
              });
              setUserProfile((prev) => prev ? { ...prev, careerStats: updatedStats } : null);
            }
          } catch (tErr) {
            console.warn('[Telemetry] Tournament champion persistence error:', tErr);
          }
        };

        persistTournamentChampion();
        setScreenState('TOURNAMENT_CHAMPION');
      } else if (resolved.isEliminated) {
        const tourneySummary = calculateTournamentStats(resolved.playerHistory);
        // Poin turnamen yang diperoleh hingga tahap gugur
        const tourneyScore = tourneySummary.totalPoints + resolved.playerHistory.reduce((acc, h) => acc + (h.wpm * 10), 0);

        const persistTournamentEliminated = async () => {
          try {
            await saveTournamentRecord({
              userId,
              tournamentName: 'Turnamen Utama',
              highestRoundReached: resolved.eliminatedAtRound || 1,
              isChampion: false,
              rounds: resolved.playerHistory.map(h => ({
                roundId: h.roundId,
                roundName: h.roundName,
                rank: h.rank,
                wpm: h.wpm,
                accuracy: h.accuracy,
                timeSec: h.timeSec
              })),
              totalTournamentScore: tourneyScore
            });
          } catch (tErr) {
            console.warn('[Telemetry] Tournament elimination record error:', tErr);
          }
        };

        persistTournamentEliminated();
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

    // Reset telemetry trackers for fresh race achievements
    backspaceCountRef.current = 0;
    wasRank4AtHalfwayRef.current = false;
    maxComboStreakRef.current = 0;

    const targetConfig = stateRef.current.config;
    const bib = stateRef.current.userProfile?.bibNumber || '01';
    const isPractice = stateRef.current.gameMode === 'PRACTICE';
    const initialRunners = createInitialRunners(targetConfig, true, bib, isPractice);
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
        setCountdownText(t('go', 'GO!'));
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

    // Reset telemetry trackers for fresh tournament round achievements
    backspaceCountRef.current = 0;
    wasRank4AtHalfwayRef.current = false;
    maxComboStreakRef.current = 0;

    const tourney = stateRef.current.tournament;
    const currentRound = tourney.currentRound;

    const roundDifficulty = currentRound === 1 ? 'easy' : currentRound === 2 ? 'medium' : 'hard';
    const targetSentence = getCuratedSentence(stateRef.current.config.theme, roundDifficulty, false);

    const roundRunners = getActiveRoundRunners(tourney, targetSentence);
    if (roundRunners[0]?.isPlayer) {
      if (stateRef.current.userProfile?.bibNumber) {
        roundRunners[0].bib = stateRef.current.userProfile.bibNumber;
      }
      if (stateRef.current.userProfile?.jerseyColor) {
        roundRunners[0].color = stateRef.current.userProfile.jerseyColor;
      }
      if (stateRef.current.userProfile?.displayName) {
        roundRunners[0].name = stateRef.current.userProfile.displayName;
      }
    }

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
        setCountdownText(t('go', 'GO!'));
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
    const pName = userProfile?.displayName || config.playerName || 'Player';
    const pColor = userProfile?.jerseyColor || config.playerColor || '#CCFF00';
    const initialTourney = createInitialTournament(pName, pColor);
    if (userProfile?.bibNumber && initialTourney.rounds.qf.heats[0]?.participants[0]) {
      initialTourney.rounds.qf.heats[0].participants[0].bib = userProfile.bibNumber;
    }
    stateRef.current.tournament = initialTourney;
    setTournament(initialTourney);
    setScreenState('TOURNAMENT_BRACKET');
  }, [config.playerName, config.playerColor, userProfile]);

  // Handle Keystroke
  const handleKeyInput = useCallback((key: string) => {
    const s = stateRef.current;
    if (s.status !== 'racing' || s.screenState !== 'RACING' || s.modal !== 'NONE') return;

    const player = s.runners[0];
    const sentence = player.sentences[0];
    if (!sentence) return;

    if (key === 'Backspace') {
      backspaceCountRef.current += 1;
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
          maxComboStreakRef.current = Math.max(maxComboStreakRef.current, s.playerStats.wordStreak);
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

        // Track halfway ranking (for clutch_comeback achievement)
        const pRunner = s.runners[0];
        if (pRunner && pRunner.progress >= 0.45 && pRunner.progress <= 0.55) {
          if (pRunner.rank === 4) {
            wasRank4AtHalfwayRef.current = true;
          }
        }

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
          playerName={userProfile?.displayName || config.playerName}
          playerLevel={userProfile?.careerStats?.level || 1}
          soundEnabled={soundEnabled}
          userProfile={userProfile}
          isAuthenticated={!!user}
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
          onOpenSettings={() => {
            playModalOpen(soundEnabled);
            setActiveModal('SETTINGS');
          }}
          onOpenAuth={() => {
            playModalOpen(soundEnabled);
            setIsAuthModalOpen(true);
          }}
        />
      )}

      {/* 2. SCREEN: DIFFICULTY_SELECT */}
      {screenState === 'DIFFICULTY_SELECT' && (
        <DifficultySelectScreen
          isPractice={gameMode === 'PRACTICE'}
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
          {/* Top Distraction-Free Streamlined Navigation Bar & Adaptive HUD Telemetry */}
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
            formattedTime={elapsedTimeStr}
            wpm={playerStats.liveWpm}
            accuracy={playerStats.liveAccuracy}
            rank={playerRunner.rank}
            totalRunners={runners.length || 4}
          />

          {/* Pure Athletic Running Track (Adaptive Aspect Ratio & Overflow Free) */}
          <main className="relative flex-1 w-full max-w-[1440px] mx-auto flex flex-col justify-center overflow-hidden select-none px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 pb-24 sm:pb-28">
            <RunningTrack
              runners={runners}
              isRacing={gameStatus === 'racing'}
              playerLiveWpm={playerStats.liveWpm}
              isPlayerTyping={isPlayerTyping}
              hasSpeedBurst={playerStats.hasSpeedBurst}
            />
          </main>

          {/* Ergonomic Floating Typing Island (width: min(94vw, 760px) + safe area bottom) */}
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
        isPractice={gameMode === 'PRACTICE'}
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
        onOpenAchievements={() => {
          playModalOpen(soundEnabled);
          setIsAchievementsGalleryOpen(true);
        }}
        onExitToMenu={handleConfirmExitToMenu}
      />

      {/* 6. SETTINGS MODAL */}
      <SettingsModal
        isOpen={activeModal === 'SETTINGS'}
        difficulty={config.difficulty}
        theme={config.theme}
        soundEnabled={soundEnabled}
        isAuthenticated={!!user}
        userDisplayName={userProfile?.displayName || user?.displayName || undefined}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
        onSelectDifficulty={(d) => setConfig(prev => ({ ...prev, difficulty: d }))}
        onSelectTheme={(thm) => setConfig(prev => ({ ...prev, theme: thm }))}
        onRestart={startCountdownAndRace}
        onClose={handleResumeRace}
        onExitToMenu={handleConfirmExitToMenu}
        onOpenAuth={() => {
          setIsAuthModalOpen(true);
        }}
      />

      {/* 7. CONFIRM EXIT MODAL (Error Prevention) */}
      <ConfirmExitModal
        isOpen={activeModal === 'EXIT_CONFIRM'}
        soundEnabled={soundEnabled}
        onResume={handleResumeRace}
        onConfirmExit={handleConfirmExitToMenu}
      />

      {/* 8. AUTHENTICATION & PROFILE MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        currentUser={user}
        userProfile={userProfile}
        soundEnabled={soundEnabled}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(newProfile) => {
          setUserProfile(newProfile);
          setConfig(prev => ({
            ...prev,
            playerName: newProfile.displayName || prev.playerName,
            playerColor: newProfile.jerseyColor || prev.playerColor
          }));
        }}
      />

      {/* 9. FLOATING ACHIEVEMENT UNLOCK TOAST */}
      <AchievementToast
        queue={achievementQueue}
        soundEnabled={soundEnabled}
        onDismiss={(id) => setAchievementQueue(prev => prev.filter(a => a.id !== id))}
      />

      {/* 10. ACHIEVEMENTS GALLERY MODAL */}
      <AchievementsGalleryModal
        isOpen={isAchievementsGalleryOpen}
        soundEnabled={soundEnabled}
        userProfileUnlockedIds={userProfile?.unlockedAchievements || []}
        onClose={() => setIsAchievementsGalleryOpen(false)}
      />
    </div>
  );
}

export default function TypeRacingPage() {
  return (
    <I18nProvider>
      <TypeRacingApp />
    </I18nProvider>
  );
}
