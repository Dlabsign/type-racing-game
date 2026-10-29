import {
  ACHIEVEMENTS,
  Achievement
} from '@/config/achievements';
import { GameMode, DifficultyLevel } from '@/types/game';
import { TournamentState } from '@/types/tournament';
import {
  unlockAchievementsInFirestore,
  logActivity
} from './firestoreService';

const UNLOCKED_KEY = 'typeracing_unlocked_achievements';
const CUMULATIVE_STATS_KEY = 'typeracing_cumulative_tracker';

export interface CumulativeStats {
  totalWordsTyped: number;
  totalRacesCount: number;
  careerScore: number;
  consecutiveHighAccRaces: number;
  highestWpm: number;
}

export interface RaceTelemetryForAchievement {
  wpm: number;
  accuracy: number;
  errorsCount: number;
  backspaceCount: number;
  finishRank: number;
  maxComboStreak: number;
  gameMode: GameMode;
  difficulty: DifficultyLevel;
  timeElapsedSeconds: number;
  timeDiffFromSecondPlace?: number;
  wasRank4AtHalfway?: boolean;
  timeOfDayHour?: number;
  correctWordsCount: number;
}

/**
 * Retrieves the list of unlocked achievement IDs from localStorage.
 */
export function getLocalUnlockedAchievements(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(UNLOCKED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[AchievementService] Failed to read unlocked achievements:', err);
    return [];
  }
}

/**
 * Persists unlocked achievement IDs to localStorage.
 */
export function saveLocalUnlockedAchievements(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const unique = Array.from(new Set(ids));
    localStorage.setItem(UNLOCKED_KEY, JSON.stringify(unique));
  } catch (err) {
    console.warn('[AchievementService] Failed to save unlocked achievements:', err);
  }
}

/**
 * Retrieves cumulative tracking statistics from localStorage.
 */
export function getLocalCumulativeStats(): CumulativeStats {
  if (typeof window === 'undefined') {
    return {
      totalWordsTyped: 0,
      totalRacesCount: 0,
      careerScore: 0,
      consecutiveHighAccRaces: 0,
      highestWpm: 0
    };
  }
  try {
    const raw = localStorage.getItem(CUMULATIVE_STATS_KEY);
    if (!raw) {
      return {
        totalWordsTyped: 0,
        totalRacesCount: 0,
        careerScore: 0,
        consecutiveHighAccRaces: 0,
        highestWpm: 0
      };
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[AchievementService] Failed to read cumulative stats:', err);
    return {
      totalWordsTyped: 0,
      totalRacesCount: 0,
      careerScore: 0,
      consecutiveHighAccRaces: 0,
      highestWpm: 0
    };
  }
}

/**
 * Updates cumulative statistics in localStorage and returns the updated state.
 */
export function updateLocalCumulativeStats(delta: {
  wordsTyped?: number;
  raceCount?: number;
  scoreGained?: number;
  accuracy?: number;
  wpm?: number;
}): CumulativeStats {
  const current = getLocalCumulativeStats();

  const newTotalWords = current.totalWordsTyped + (delta.wordsTyped || 0);
  const newRacesCount = current.totalRacesCount + (delta.raceCount || 1);
  const newCareerScore = current.careerScore + (delta.scoreGained || 0);
  const newHighestWpm = Math.max(current.highestWpm, delta.wpm || 0);

  // High accuracy consecutive tracker (>= 98%)
  let newConsecutiveHighAcc = current.consecutiveHighAccRaces;
  if (delta.accuracy !== undefined) {
    if (delta.accuracy >= 98) {
      newConsecutiveHighAcc += 1;
    } else {
      newConsecutiveHighAcc = 0;
    }
  }

  const updated: CumulativeStats = {
    totalWordsTyped: newTotalWords,
    totalRacesCount: newRacesCount,
    careerScore: newCareerScore,
    consecutiveHighAccRaces: newConsecutiveHighAcc,
    highestWpm: newHighestWpm
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUMULATIVE_STATS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('[AchievementService] Failed to save cumulative stats:', err);
    }
  }

  return updated;
}

/**
 * Evaluates achievements at the end of a race.
 * Compares race telemetry and updated cumulative statistics against locked achievements.
 * Returns newly unlocked achievements and updates storage/Firestore.
 */
export async function evaluateRaceEnd(
  telemetry: RaceTelemetryForAchievement,
  userId?: string | null,
  alreadyUnlockedInProfile?: string[],
  tournamentContext?: TournamentState
): Promise<{ newAchievements: Achievement[]; allUnlockedIds: string[] }> {
  // Merge locally known unlocked achievements with user profile's unlockedAchievements
  const localUnlocked = getLocalUnlockedAchievements();
  const unlockedSet = new Set<string>([
    ...localUnlocked,
    ...(alreadyUnlockedInProfile || [])
  ]);

  // Update cumulative statistics
  const cumulative = updateLocalCumulativeStats({
    wordsTyped: telemetry.correctWordsCount,
    raceCount: 1,
    scoreGained: Math.round(telemetry.wpm * 10 * (telemetry.accuracy / 100)),
    accuracy: telemetry.accuracy,
    wpm: telemetry.wpm
  });

  const hourOfDay = telemetry.timeOfDayHour ?? new Date().getHours();
  const newlyUnlocked: Achievement[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (unlockedSet.has(ach.id)) continue;

    let unlocked = false;

    switch (ach.id) {
      // --- 1. Kecepatan ---
      case 'speed_50':
        unlocked = telemetry.wpm >= 50;
        break;
      case 'speed_80':
        unlocked = telemetry.wpm >= 80;
        break;
      case 'speed_100':
        unlocked = telemetry.wpm >= 100 && telemetry.gameMode === 'QUICK_RACE';
        break;
      case 'speed_120':
        unlocked = telemetry.wpm >= 120 && telemetry.accuracy >= 95;
        break;

      // --- 2. Presisi ---
      case 'flawless_run':
        unlocked = telemetry.accuracy === 100 && telemetry.backspaceCount === 0;
        break;
      case 'zen_focus':
        unlocked = cumulative.consecutiveHighAccRaces >= 3;
        break;
      case 'iron_cadence':
        unlocked = telemetry.maxComboStreak >= 30;
        break;
      case 'cold_fingers':
        unlocked = telemetry.difficulty === 'hard' && telemetry.errorsCount === 0;
        break;

      // --- 3. Turnamen ---
      case 'circuit_debut':
        unlocked = telemetry.gameMode === 'QUICK_RACE' && telemetry.finishRank === 1;
        break;
      case 'finalist':
        if (tournamentContext) {
          unlocked = tournamentContext.currentRound === 3 || tournamentContext.rounds.sf.completed;
        }
        break;
      case 'apex_champion':
        if (tournamentContext) {
          unlocked = !!tournamentContext.isChampion;
        }
        break;
      case 'clean_sweep':
        if (tournamentContext?.isChampion && tournamentContext.playerHistory.length >= 3) {
          unlocked = tournamentContext.playerHistory.every((h) => h.rank === 1);
        }
        break;

      // --- 4. Dedikasi ---
      case 'warmup_500':
        unlocked = cumulative.totalWordsTyped >= 500;
        break;
      case 'marathon_5k':
        unlocked = cumulative.totalWordsTyped >= 5000;
        break;
      case 'veteran_50':
        unlocked = cumulative.totalRacesCount >= 50;
        break;
      case 'score_100k':
        unlocked = cumulative.careerScore >= 100000;
        break;

      // --- 5. Momen Dramatis ---
      case 'clutch_comeback':
        unlocked = telemetry.finishRank === 1 && telemetry.wasRank4AtHalfway === true;
        break;
      case 'photo_finish':
        unlocked =
          telemetry.finishRank === 1 &&
          telemetry.timeDiffFromSecondPlace !== undefined &&
          telemetry.timeDiffFromSecondPlace > 0 &&
          telemetry.timeDiffFromSecondPlace < 0.2;
        break;
      case 'night_crawler':
        unlocked = hourOfDay >= 0 && hourOfDay < 4;
        break;

      default:
        break;
    }

    if (unlocked) {
      newlyUnlocked.push(ach);
      unlockedSet.add(ach.id);
    }
  }

  const allUnlockedIds = Array.from(unlockedSet);

  if (newlyUnlocked.length > 0) {
    // 1. Save to localStorage
    saveLocalUnlockedAchievements(allUnlockedIds);

    // 2. Sync to Cloud Firestore if logged in
    if (userId && userId !== 'guest_local') {
      const newIds = newlyUnlocked.map((a) => a.id);
      unlockAchievementsInFirestore(userId, newIds).catch(console.warn);

      newlyUnlocked.forEach((ach) => {
        logActivity(
          userId,
          'ACHIEVEMENT_UNLOCKED',
          `Pencapaian Terbuka: ${ach.title} (+${ach.rewardXp} XP)`,
          {
            achievementId: ach.id,
            tier: ach.tier,
            title: ach.title,
            rewardXp: ach.rewardXp,
            rewardTitle: ach.rewardTitle
          }
        ).catch(console.warn);
      });
    }
  }

  return { newAchievements: newlyUnlocked, allUnlockedIds };
}

/**
 * Calculates current progress for a given achievement.
 */
export function getAchievementProgress(
  achievement: Achievement,
  unlockedIds: string[],
  cumulativeStats: CumulativeStats
): {
  isUnlocked: boolean;
  current: number;
  target: number;
  percentage: number;
  displayProgress: string;
} {
  const isUnlocked = unlockedIds.includes(achievement.id);
  const target = achievement.targetValue;
  let current = 0;

  if (isUnlocked) {
    return {
      isUnlocked: true,
      current: target,
      target,
      percentage: 100,
      displayProgress: `${target.toLocaleString()} / ${target.toLocaleString()} ${achievement.unit}`
    };
  }

  switch (achievement.id) {
    case 'speed_50':
    case 'speed_80':
    case 'speed_100':
    case 'speed_120':
      current = Math.min(target, cumulativeStats.highestWpm || 0);
      break;

    case 'zen_focus':
      current = Math.min(target, cumulativeStats.consecutiveHighAccRaces || 0);
      break;

    case 'warmup_500':
    case 'marathon_5k':
      current = Math.min(target, cumulativeStats.totalWordsTyped || 0);
      break;

    case 'veteran_50':
      current = Math.min(target, cumulativeStats.totalRacesCount || 0);
      break;

    case 'score_100k':
      current = Math.min(target, cumulativeStats.careerScore || 0);
      break;

    default:
      // Binary / Condition based achievements (0 or 1)
      current = 0;
      break;
  }

  const percentage = Math.min(100, Math.round((current / target) * 100));
  const displayProgress =
    target === 1
      ? current === 1
        ? 'Tercapai'
        : 'Terkunci'
      : `${current.toLocaleString()} / ${target.toLocaleString()} ${achievement.unit}`;

  return {
    isUnlocked: false,
    current,
    target,
    percentage,
    displayProgress
  };
}
