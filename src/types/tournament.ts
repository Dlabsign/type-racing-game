export type TournamentRoundId = 1 | 2 | 3;

export interface TournamentParticipant {
  id: string;
  name: string;
  isPlayer: boolean;
  color: string;
  bib: string;
  baseWpm: number;
  wpm?: number;
  rank?: number;
  status: 'pending' | 'qualified' | 'eliminated' | 'champion';
  finishTimeStr?: string;
}

export interface TournamentHeat {
  id: string;
  title: string;
  participants: TournamentParticipant[];
  completed: boolean;
  isPlayerHeat: boolean;
}

export interface TournamentRound {
  id: TournamentRoundId;
  name: string;
  subtitle: string;
  targetWpm: number;
  heats: TournamentHeat[];
  completed: boolean;
  prizePoints?: number;
}

export interface TournamentRoundStat {
  roundId: TournamentRoundId;
  roundName: string;
  rank: number;
  wpm: number;
  accuracy: number;
  timeSec: number;
  timeStr: string;
  qualified: boolean;
  points?: number;
}

export interface TournamentState {
  active: boolean;
  currentRound: TournamentRoundId;
  rounds: {
    qf: TournamentRound; // Round 1: Perempat Final (2 heats x 4 runners = 8)
    sf: TournamentRound; // Round 2: Semifinal (1 heat x 4 runners)
    gf: TournamentRound; // Round 3: Grand Final (1 heat x 4 finalists)
  };
  playerHistory: TournamentRoundStat[];
  isEliminated: boolean;
  eliminatedAtRound: TournamentRoundId | null;
  isChampion: boolean;
}
