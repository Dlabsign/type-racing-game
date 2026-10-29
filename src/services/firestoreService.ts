import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';
import {
  UserProfile,
  UserCareerStats,
  ActivityType,
  RaceHistoryRecord,
  TournamentRecord,
  LeaderboardEntry
} from '@/types/auth';
import {
  enqueueOfflineItem,
  getOfflineQueue,
  saveOfflineQueue
} from './offlineQueue';

// ============================================================================
// DEFAULT DATA GENERATORS & HELPERS
// ============================================================================

export function createDefaultCareerStats(): UserCareerStats {
  return {
    highestWpm: 0,
    avgAccuracy: 100,
    totalRaces: 0,
    racesWon: 0,
    tournamentsWon: 0,
    totalScore: 0,
    level: 1
  };
}

export function calculateLevelFromScore(totalScore: number): number {
  if (totalScore <= 0) return 1;
  return Math.max(1, Math.floor(Math.sqrt(totalScore / 100)) + 1);
}

// Generate a random 2-digit bib number for fresh players (e.g., '07', '42')
export function generateRandomBib(): string {
  const num = Math.floor(Math.random() * 89) + 10;
  return String(num);
}

// ============================================================================
// A. USERS COLLECTION: users/{userId}
// ============================================================================

/**
 * Hydrates full user profile from Firestore.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return null;
    }

    return snap.data() as UserProfile;
  } catch (err) {
    console.warn(`[Firestore] getUserProfile failed for ${userId}:`, err);
    return null;
  }
}

/**
 * Creates or overwrites user profile document with initial career stats.
 */
export async function createUserProfile(
  userId: string,
  initialData: {
    displayName?: string;
    email?: string | null;
    isAnonymous?: boolean;
    jerseyColor?: string;
    bibNumber?: string;
  }
): Promise<UserProfile> {
  const now = serverTimestamp();
  const profile: UserProfile = {
    uid: userId,
    displayName: initialData.displayName?.trim() || (initialData.isAnonymous ? 'Tamu' : 'Pelari'),
    email: initialData.email || null,
    isAnonymous: !!initialData.isAnonymous,
    jerseyColor: initialData.jerseyColor || '#CCFF00',
    bibNumber: initialData.bibNumber || generateRandomBib(),
    createdAt: now,
    updatedAt: now,
    careerStats: createDefaultCareerStats(),
    lastSession: {
      lastLoginAt: now,
      lastScore: 0,
      lastWpm: 0
    }
  };

  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    console.warn(`[Firestore] createUserProfile offline fallback for ${userId}:`, err);
    enqueueOfflineItem('UPDATE_CAREER', { userId, profile: profile as unknown as Record<string, unknown> });
  }

  return profile;
}

/**
 * Updates partial user profile fields (e.g. jersey color, display name, bib number).
 */
export async function updateUserProfile(
  userId: string,
  partial: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...partial,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.warn(`[Firestore] updateUserProfile failed, queued offline:`, err);
    enqueueOfflineItem('UPDATE_CAREER', { userId, partial: partial as unknown as Record<string, unknown> });
  }
}

/**
 * Updates careerStats after a race or tournament.
 */
export async function updateCareerStats(
  userId: string,
  raceDelta: {
    wpm: number;
    accuracy: number;
    score: number;
    won: boolean;
    isTournamentWin?: boolean;
  }
): Promise<UserCareerStats> {
  const currentProfile = await getUserProfile(userId);
  const prevStats = currentProfile?.careerStats || createDefaultCareerStats();

  const newTotalRaces = prevStats.totalRaces + 1;
  const newRacesWon = prevStats.racesWon + (raceDelta.won ? 1 : 0);
  const newTournamentsWon = prevStats.tournamentsWon + (raceDelta.isTournamentWin ? 1 : 0);
  const newHighestWpm = Math.max(prevStats.highestWpm, Math.round(raceDelta.wpm));
  const newTotalScore = prevStats.totalScore + Math.max(0, Math.round(raceDelta.score));
  const newLevel = calculateLevelFromScore(newTotalScore);

  // Weighted rolling average accuracy
  const newAvgAccuracy = Math.round(
    ((prevStats.avgAccuracy * prevStats.totalRaces) + raceDelta.accuracy) / newTotalRaces * 10
  ) / 10;

  const updatedCareerStats: UserCareerStats = {
    highestWpm: newHighestWpm,
    avgAccuracy: newAvgAccuracy,
    totalRaces: newTotalRaces,
    racesWon: newRacesWon,
    tournamentsWon: newTournamentsWon,
    totalScore: newTotalScore,
    level: newLevel
  };

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      careerStats: updatedCareerStats,
      updatedAt: serverTimestamp(),
      'lastSession.lastScore': Math.round(raceDelta.score),
      'lastSession.lastWpm': Math.round(raceDelta.wpm)
    });
  } catch (err) {
    console.warn('[Firestore] updateCareerStats failed, enqueued offline:', err);
    enqueueOfflineItem('UPDATE_CAREER', { userId, updatedCareerStats: updatedCareerStats as unknown as Record<string, unknown> });
  }

  return updatedCareerStats;
}

/**
 * Tracks login and logout session timestamps.
 */
export async function recordUserSession(
  userId: string,
  type: 'LOGIN' | 'LOGOUT',
  sessionData?: { score?: number; wpm?: number }
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    if (type === 'LOGIN') {
      await updateDoc(userRef, {
        'lastSession.lastLoginAt': serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(userRef, {
        'lastSession.lastLogoutAt': serverTimestamp(),
        ...(sessionData?.score !== undefined ? { 'lastSession.lastScore': sessionData.score } : {}),
        ...(sessionData?.wpm !== undefined ? { 'lastSession.lastWpm': sessionData.wpm } : {}),
        updatedAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn(`[Firestore] recordUserSession (${type}) warning:`, err);
  }
}

// ============================================================================
// B. ACTIVITY LOGS COLLECTION: activity_logs/{logId}
// ============================================================================

/**
 * Central event logging service for audit trails and telemetry.
 */
export async function logActivity(
  userId: string,
  activityType: ActivityType,
  description: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const payload = {
    userId,
    activityType,
    description,
    metadata,
    timestamp: serverTimestamp()
  };

  try {
    const logsCol = collection(db, 'activity_logs');
    await addDoc(logsCol, payload);
  } catch (err) {
    console.warn(`[Firestore] logActivity (${activityType}) offline fallback:`, err);
    enqueueOfflineItem('LOG_ACTIVITY', payload as unknown as Record<string, unknown>);
  }
}

// ============================================================================
// C. RACE HISTORY COLLECTION: race_history/{raceId}
// ============================================================================

/**
 * Saves full telemetry upon crossing the finish line.
 */
export async function saveRaceHistory(
  raceData: Omit<RaceHistoryRecord, 'id' | 'timestamp'>
): Promise<string> {
  const payload = {
    ...raceData,
    timestamp: serverTimestamp()
  };

  try {
    const raceCol = collection(db, 'race_history');
    const docRef = await addDoc(raceCol, payload);
    return docRef.id;
  } catch (err) {
    console.warn('[Firestore] saveRaceHistory offline fallback:', err);
    enqueueOfflineItem('SAVE_RACE', payload as unknown as Record<string, unknown>);
    return `offline_${Date.now()}`;
  }
}

// ============================================================================
// D. TOURNAMENT RECORDS COLLECTION: tournament_records/{tournamentId}
// ============================================================================

/**
 * Persists complete tournament run bracket & trophies.
 */
export async function saveTournamentRecord(
  tournamentData: Omit<TournamentRecord, 'id' | 'completedAt'>
): Promise<string> {
  const payload = {
    ...tournamentData,
    completedAt: serverTimestamp()
  };

  try {
    const tourneyCol = collection(db, 'tournament_records');
    const docRef = await addDoc(tourneyCol, payload);
    return docRef.id;
  } catch (err) {
    console.warn('[Firestore] saveTournamentRecord offline fallback:', err);
    enqueueOfflineItem('SAVE_TOURNAMENT', payload as unknown as Record<string, unknown>);
    return `offline_tourney_${Date.now()}`;
  }
}

// ============================================================================
// E. LEADERBOARDS COLLECTION: leaderboards/{userId}
// ============================================================================

/**
 * Upserts lightweight leaderboard record (merge: true).
 */
export async function upsertLeaderboard(entry: LeaderboardEntry): Promise<void> {
  const payload = {
    ...entry,
    updatedAt: serverTimestamp()
  };

  try {
    const lbRef = doc(db, 'leaderboards', entry.userId);
    await setDoc(lbRef, payload, { merge: true });
  } catch (err) {
    console.warn('[Firestore] upsertLeaderboard offline fallback:', err);
    enqueueOfflineItem('UPSERT_LEADERBOARD', payload as unknown as Record<string, unknown>);
  }
}

/**
 * Fetches top global players from Firestore for instant leaderboard ranking.
 */
export async function fetchTopLeaderboard(limitCount = 10): Promise<LeaderboardEntry[]> {
  try {
    const lbCol = collection(db, 'leaderboards');
    const q = query(lbCol, orderBy('highestWpm', 'desc'), limit(limitCount));
    const snap = await getDocs(q);

    return snap.docs.map((docSnap) => docSnap.data() as LeaderboardEntry);
  } catch (err) {
    console.warn('[Firestore] fetchTopLeaderboard failed (falling back):', err);
    return [];
  }
}

/**
 * Persists unlocked achievement IDs to users/{userId}.
 */
export async function unlockAchievementsInFirestore(
  userId: string,
  achievementIds: string[]
): Promise<void> {
  if (!userId || achievementIds.length === 0) return;

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      unlockedAchievements: arrayUnion(...achievementIds),
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('[Firestore] unlockAchievementsInFirestore failed, queued offline:', err);
    enqueueOfflineItem('UNLOCK_ACHIEVEMENT', { userId, achievementIds });
  }
}

// ============================================================================
// RESILIENCE: OFFLINE QUEUE FLUSH ENGINE
// ============================================================================

let isFlushing = false;

export async function flushOfflineQueue(): Promise<{ processed: number; remaining: number }> {
  if (isFlushing || typeof window === 'undefined' || !navigator.onLine) {
    return { processed: 0, remaining: getOfflineQueue().length };
  }

  isFlushing = true;
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    isFlushing = false;
    return { processed: 0, remaining: 0 };
  }

  console.info(`[OfflineQueue] Flushing ${queue.length} pending items...`);
  const remaining: typeof queue = [];
  let processed = 0;

  for (const item of queue) {
    try {
      if (item.type === 'LOG_ACTIVITY') {
        const logsCol = collection(db, 'activity_logs');
        await addDoc(logsCol, { ...item.payload, timestamp: serverTimestamp() });
        processed++;
      } else if (item.type === 'SAVE_RACE') {
        const raceCol = collection(db, 'race_history');
        await addDoc(raceCol, { ...item.payload, timestamp: serverTimestamp() });
        processed++;
      } else if (item.type === 'SAVE_TOURNAMENT') {
        const tourneyCol = collection(db, 'tournament_records');
        await addDoc(tourneyCol, { ...item.payload, completedAt: serverTimestamp() });
        processed++;
      } else if (item.type === 'UPSERT_LEADERBOARD') {
        const userId = String(item.payload.userId || '');
        if (userId) {
          const lbRef = doc(db, 'leaderboards', userId);
          await setDoc(lbRef, { ...item.payload, updatedAt: serverTimestamp() }, { merge: true });
          processed++;
        }
      } else if (item.type === 'UPDATE_CAREER') {
        const userId = String(item.payload.userId || '');
        if (userId) {
          const userRef = doc(db, 'users', userId);
          await setDoc(userRef, { ...item.payload, updatedAt: serverTimestamp() }, { merge: true });
          processed++;
        }
      } else if (item.type === 'UNLOCK_ACHIEVEMENT') {
        const userId = String(item.payload.userId || '');
        const achievementIds = (item.payload.achievementIds as string[]) || [];
        if (userId && achievementIds.length > 0) {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            unlockedAchievements: arrayUnion(...achievementIds),
            updatedAt: serverTimestamp()
          });
          processed++;
        }
      }
    } catch (err) {
      console.warn(`[OfflineQueue] Failed to process item ${item.id}, retaining:`, err);
      item.attempts += 1;
      if (item.attempts < 5) {
        remaining.push(item);
      }
    }
  }

  saveOfflineQueue(remaining);
  isFlushing = false;
  console.info(`[OfflineQueue] Flush finished: ${processed} synced, ${remaining.length} remaining.`);
  return { processed, remaining: remaining.length };
}

// Auto-register browser online event
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.info('[Network] Online detected. Initiating offline queue sync...');
    flushOfflineQueue().catch(console.warn);
  });
}
