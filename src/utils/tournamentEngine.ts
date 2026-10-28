import {
  TournamentState,
  TournamentParticipant,
  TournamentRoundId,
  TournamentRoundStat
} from '@/types/tournament';
import { RunnerState } from '@/types/game';

// 7 Preset AI Rivals with distinct styles and colors
const AI_ROSTER_DEFAULTS = [
  { id: 'rival_kilat', name: 'Rival Kilat', color: '#EF4444', bib: '02', baseWpm: 63 },
  { id: 'rival_bayangan', name: 'Rival Bayangan', color: '#8B5CF6', bib: '03', baseWpm: 60 },
  { id: 'rival_turbo', name: 'Rival Turbo', color: '#F59E0B', bib: '04', baseWpm: 58 },
  { id: 'rival_petir', name: 'Rival Petir', color: '#06B6D4', bib: '05', baseWpm: 64 },
  { id: 'rival_badai', name: 'Rival Badai', color: '#10B981', bib: '06', baseWpm: 61 },
  { id: 'rival_meteor', name: 'Rival Meteor', color: '#F43F5E', bib: '07', baseWpm: 59 },
  { id: 'rival_alpha', name: 'Rival Alpha', color: '#6366F1', bib: '08', baseWpm: 62 }
];

export function createInitialTournament(
  playerName: string = 'Kamu',
  playerColor: string = '#CCFF00'
): TournamentState {
  const player: TournamentParticipant = {
    id: 'player',
    name: playerName.trim() || 'Kamu',
    isPlayer: true,
    color: playerColor || '#CCFF00',
    bib: '01',
    baseWpm: 0,
    status: 'pending'
  };

  const aiParticipants: TournamentParticipant[] = AI_ROSTER_DEFAULTS.map((r) => ({
    ...r,
    isPlayer: false,
    status: 'pending'
  }));

  // Round 1: Perempat Final (8 pelari, 2 heats)
  // Heat 1: Player + 3 AI (Kilat, Bayangan, Turbo)
  const qfHeat1: TournamentParticipant[] = [
    player,
    aiParticipants[0],
    aiParticipants[1],
    aiParticipants[2]
  ];

  // Heat 2: 4 AI (Petir, Badai, Meteor, Alpha)
  const qfHeat2: TournamentParticipant[] = [
    aiParticipants[3],
    aiParticipants[4],
    aiParticipants[5],
    aiParticipants[6]
  ];

  return {
    active: true,
    currentRound: 1,
    rounds: {
      qf: {
        id: 1,
        name: 'Perempat Final',
        subtitle: '8 Pelari • Ambil 2 Tercepat',
        targetWpm: 65,
        completed: false,
        heats: [
          {
            id: 'qf_heat_1',
            title: 'Heat 1 (Lintasan Kamu)',
            isPlayerHeat: true,
            completed: false,
            participants: qfHeat1
          },
          {
            id: 'qf_heat_2',
            title: 'Heat 2',
            isPlayerHeat: false,
            completed: false,
            participants: qfHeat2
          }
        ]
      },
      sf: {
        id: 2,
        name: 'Semifinal',
        subtitle: '4 Pelari • Ambil 2 Tercepat',
        targetWpm: 85,
        completed: false,
        heats: [
          {
            id: 'sf_heat_1',
            title: 'Heat Semifinal',
            isPlayerHeat: true,
            completed: false,
            participants: [] // Populated after QF
          }
        ]
      },
      gf: {
        id: 3,
        name: 'Grand Final',
        subtitle: '4 Finalis • Juara 1 Angkat Trofi',
        targetWpm: 105,
        completed: false,
        heats: [
          {
            id: 'gf_heat_1',
            title: 'Grand Final Match',
            isPlayerHeat: true,
            completed: false,
            participants: [] // Populated after SF
          }
        ]
      }
    },
    playerHistory: [],
    isEliminated: false,
    eliminatedAtRound: null,
    isChampion: false
  };
}

/**
 * Returns the current active heat participants as RunnerState objects for the race track.
 */
export function getActiveRoundRunners(
  tournament: TournamentState,
  targetSentence: string
): RunnerState[] {
  const currentRound = tournament.currentRound;
  let participants: TournamentParticipant[] = [];

  if (currentRound === 1) {
    participants = tournament.rounds.qf.heats[0].participants;
  } else if (currentRound === 2) {
    participants = tournament.rounds.sf.heats[0].participants;
  } else {
    participants = tournament.rounds.gf.heats[0].participants;
  }

  // Target WPM based on tournament round
  const roundTargetWpm =
    currentRound === 1 ? 65 : currentRound === 2 ? 85 : 105;

  return participants.map((p, idx) => {
    // Add realistic wave/offset to each AI
    const aiTarget = p.isPlayer ? 0 : roundTargetWpm - 4 + idx * 3;

    return {
      id: p.id,
      lane: idx + 1,
      name: p.name,
      isPlayer: p.isPlayer,
      color: p.color,
      bib: p.bib,
      sentences: [targetSentence],
      lap: 1,
      charIndex: 0,
      charAccumulator: 0,
      progress: 0,
      visualProgress: 0,
      wpm: p.isPlayer ? 0 : aiTarget,
      targetWpm: p.isPlayer ? 0 : aiTarget,
      rank: idx + 1,
      finished: false,
      finishTime: null
    };
  });
}

/**
 * Simulates results for an AI-only heat (e.g. QF Heat 2)
 */
function simulateAiHeat(
  participants: TournamentParticipant[],
  baseWpm: number
): TournamentParticipant[] {
  const randomized = participants.map((p, idx) => {
    const variance = (Math.random() - 0.5) * 8;
    const finalWpm = Math.round(baseWpm + variance + (idx === 0 ? 3 : 0));
    return {
      ...p,
      wpm: finalWpm
    };
  });

  // Sort by WPM descending
  randomized.sort((a, b) => (b.wpm || 0) - (a.wpm || 0));

  return randomized.map((p, idx) => ({
    ...p,
    rank: idx + 1,
    status: idx < 2 ? 'qualified' : 'eliminated'
  }));
}

/**
 * Process the race completion for the current tournament round.
 */
export function resolveTournamentRound(
  prevTournament: TournamentState,
  playerRank: number,
  playerWpm: number,
  playerAccuracy: number,
  playerTimeSec: number,
  playerTimeStr: string,
  raceRunners: RunnerState[]
): TournamentState {
  const current = JSON.parse(JSON.stringify(prevTournament)) as TournamentState;
  const roundId = current.currentRound;

  // 1. Update player stats history
  const roundName =
    roundId === 1 ? 'Perempat Final' : roundId === 2 ? 'Semifinal' : 'Grand Final';
  
  // Qualification criteria:
  // Round 1 (QF): Top 2
  // Round 2 (SF): Top 2
  // Round 3 (GF): Rank 1 (Winner)
  const isQualified = (roundId < 3 && playerRank <= 2) || (roundId === 3 && playerRank === 1);

  const stat: TournamentRoundStat = {
    roundId,
    roundName,
    rank: playerRank,
    wpm: playerWpm,
    accuracy: playerAccuracy,
    timeSec: playerTimeSec,
    timeStr: playerTimeStr,
    qualified: isQualified
  };
  current.playerHistory.push(stat);

  if (!isQualified) {
    current.isEliminated = true;
    current.eliminatedAtRound = roundId;
    return current;
  }

  // 2. Update current round's participant results
  if (roundId === 1) {
    // QF Heat 1 (Player's Heat)
    const heat1 = current.rounds.qf.heats[0];
    heat1.completed = true;
    heat1.participants = heat1.participants.map((p) => {
      const runner = raceRunners.find((r) => r.id === p.id);
      const rank = runner ? runner.rank : p.rank || 4;
      const wpm = p.isPlayer ? playerWpm : runner ? runner.wpm : 60;
      return {
        ...p,
        rank,
        wpm,
        status: rank <= 2 ? 'qualified' : 'eliminated'
      };
    });
    heat1.participants.sort((a, b) => (a.rank || 4) - (b.rank || 4));

    // QF Heat 2 (AI Heat)
    const heat2 = current.rounds.qf.heats[1];
    heat2.completed = true;
    heat2.participants = simulateAiHeat(heat2.participants, 65);

    current.rounds.qf.completed = true;

    // Advance Top 2 from Heat 1 + Top 2 from Heat 2 to Semifinal
    const qf1Advancers = heat1.participants.filter((p) => p.status === 'qualified');
    const qf2Advancers = heat2.participants.filter((p) => p.status === 'qualified');

    // Reset status for next round
    const sfParticipants = [...qf1Advancers, ...qf2Advancers].map((p, idx) => ({
      ...p,
      status: 'pending' as const,
      bib: `0${idx + 1}`
    }));

    current.rounds.sf.heats[0].participants = sfParticipants;
    current.currentRound = 2;
  } else if (roundId === 2) {
    // Semifinal (1 Heat)
    const sfHeat = current.rounds.sf.heats[0];
    sfHeat.completed = true;
    sfHeat.participants = sfHeat.participants.map((p) => {
      const runner = raceRunners.find((r) => r.id === p.id);
      const rank = runner ? runner.rank : p.rank || 4;
      const wpm = p.isPlayer ? playerWpm : runner ? runner.wpm : 82;
      return {
        ...p,
        rank,
        wpm,
        status: rank <= 2 ? 'qualified' : 'eliminated'
      };
    });
    sfHeat.participants.sort((a, b) => (a.rank || 4) - (b.rank || 4));
    current.rounds.sf.completed = true;

    // Advance Top 2 from SF to Grand Final + 2 elite wildcards for a 4-runner showdown!
    const sfAdvancers = sfHeat.participants.filter((p) => p.status === 'qualified');

    // Elite wildcard rivals to complete the 4-runner Grand Final
    const grandFinalists: TournamentParticipant[] = [
      ...sfAdvancers.map((p, idx) => ({ ...p, status: 'pending' as const, bib: `0${idx + 1}` })),
      {
        id: 'rival_legend',
        name: 'Rival Titik Api',
        isPlayer: false,
        color: '#F97316',
        bib: '03',
        baseWpm: 102,
        status: 'pending'
      },
      {
        id: 'rival_omega',
        name: 'Rival Omega',
        isPlayer: false,
        color: '#E11D48',
        bib: '04',
        baseWpm: 104,
        status: 'pending'
      }
    ];

    current.rounds.gf.heats[0].participants = grandFinalists;
    current.currentRound = 3;
  } else if (roundId === 3) {
    // Grand Final
    const gfHeat = current.rounds.gf.heats[0];
    gfHeat.completed = true;
    gfHeat.participants = gfHeat.participants.map((p) => {
      const runner = raceRunners.find((r) => r.id === p.id);
      const rank = runner ? runner.rank : p.rank || 4;
      const wpm = p.isPlayer ? playerWpm : runner ? runner.wpm : 100;
      return {
        ...p,
        rank,
        wpm,
        status: rank === 1 ? 'champion' : 'eliminated'
      };
    });
    gfHeat.participants.sort((a, b) => (a.rank || 4) - (b.rank || 4));
    current.rounds.gf.completed = true;

    if (playerRank === 1) {
      current.isChampion = true;
    } else {
      current.isEliminated = true;
      current.eliminatedAtRound = 3;
    }
  }

  return current;
}

/**
 * Calculates aggregated performance metrics across all played tournament rounds.
 */
export function calculateTournamentStats(history: TournamentRoundStat[]) {
  if (history.length === 0) {
    return { avgWpm: 0, avgAccuracy: 100, totalTimeSec: 0, totalTimeStr: '00:00.00' };
  }

  const totalWpm = history.reduce((acc, h) => acc + h.wpm, 0);
  const totalAcc = history.reduce((acc, h) => acc + h.accuracy, 0);
  const totalTime = history.reduce((acc, h) => acc + h.timeSec, 0);

  const avgWpm = Math.round(totalWpm / history.length);
  const avgAccuracy = Math.round((totalAcc / history.length) * 10) / 10;

  const mins = Math.floor(totalTime / 60);
  const secs = Math.floor(totalTime % 60);
  const hundredths = Math.floor((totalTime - Math.floor(totalTime)) * 100);
  const totalTimeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;

  return { avgWpm, avgAccuracy, totalTimeSec: totalTime, totalTimeStr };
}
