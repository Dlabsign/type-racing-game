export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type SentenceTheme = 'motivasi' | 'fakta' | 'produktivitas' | 'english';

export type GameStatus = 'idle' | 'countdown' | 'racing' | 'paused' | 'finished';

export type GameMode = 'QUICK_RACE' | 'TOURNAMENT' | 'PRACTICE';

export type ScreenState =
  | 'MAIN_MENU'
  | 'DIFFICULTY_SELECT'
  | 'COUNTDOWN'
  | 'RACING'
  | 'POST_RACE'
  | 'TOURNAMENT_BRACKET'
  | 'TOURNAMENT_ELIMINATED'
  | 'TOURNAMENT_CHAMPION';

export type ModalType = 'NONE' | 'SETTINGS' | 'LEADERBOARD' | 'ACHIEVEMENTS' | 'HOW_TO_PLAY' | 'EXIT_CONFIRM';

export interface RunnerState {
  id: string;
  lane: number;
  name: string;
  isPlayer: boolean;
  color: string;
  bib: string;
  sentences: string[];
  lap: number;
  charIndex: number;
  charAccumulator?: number;
  progress: number;
  visualProgress: number;
  wpm: number;
  targetWpm: number;
  rank: number;
  finished: boolean;
  finishTime: number | null;
}

export interface GameConfig {
  difficulty: DifficultyLevel;
  theme: SentenceTheme;
  playerName: string;
  playerColor: string;
}

export interface PlayerStats {
  currentLap: number;
  charIndex: number;
  hasCharError: boolean;
  currentWordHasError: boolean;
  correctKeystrokes: number;
  totalKeystrokes: number;
  correctWords: number;
  wrongWords: number;
  liveWpm: number;
  liveAccuracy: number;
  wordStreak: number;
  hasSpeedBurst: boolean;
}
