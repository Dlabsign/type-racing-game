import { Timestamp, FieldValue } from 'firebase/firestore';

export type FirestoreDateType = Timestamp | FieldValue | Date | string | number | null;

export type ActivityType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'RACE_FINISHED'
  | 'TOURNAMENT_WIN'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'PROFILE_UPDATED';

export interface UserCareerStats {
  highestWpm: number;
  avgAccuracy: number;
  totalRaces: number;
  racesWon: number;
  tournamentsWon: number;
  totalScore: number;
  level: number;
}

export interface UserLastSession {
  lastLoginAt: FirestoreDateType;
  lastLogoutAt?: FirestoreDateType;
  lastScore: number;
  lastWpm: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  isAnonymous: boolean;
  jerseyColor: string;
  bibNumber: string;
  avatarUrl?: string;
  photoURL?: string;
  createdAt: FirestoreDateType;
  updatedAt: FirestoreDateType;
  careerStats: UserCareerStats;
  lastSession?: UserLastSession;
  unlockedAchievements?: string[];
}

export interface ActivityLog {
  id?: string;
  userId: string;
  activityType: ActivityType;
  description: string;
  metadata: Record<string, unknown>;
  timestamp: FirestoreDateType;
}

export interface RaceHistoryRecord {
  id?: string;
  userId: string;
  gameMode: string;
  difficulty: string;
  wpm: number;
  accuracy: number;
  finalScore: number;
  comboStreak: number;
  finishRank: number;
  timeElapsedSeconds: number;
  errorsCount: number;
  timestamp: FirestoreDateType;
}

export interface TournamentRoundSummary {
  roundId: number;
  roundName: string;
  rank: number;
  wpm: number;
  accuracy: number;
  timeSec: number;
}

export interface TournamentRecord {
  id?: string;
  userId: string;
  tournamentName: string;
  highestRoundReached: number;
  isChampion: boolean;
  rounds: TournamentRoundSummary[];
  totalTournamentScore: number;
  completedAt: FirestoreDateType;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  highestWpm: number;
  careerScore: number;
  jerseyColor: string;
  avatarUrl?: string;
  updatedAt?: FirestoreDateType;
}
