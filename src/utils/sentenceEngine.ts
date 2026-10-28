import { DifficultyLevel, SentenceTheme } from '@/types/game';
import { SENTENCE_THEMES } from '@/constants/sentences';

// In-memory session history tracking recently used sentence indices
const sessionSentenceHistory = new Map<string, number[]>();

export function getCuratedSentence(
  theme: SentenceTheme,
  difficulty: DifficultyLevel,
  isPrerender: boolean = false
): string {
  const pool = SENTENCE_THEMES[theme]?.[difficulty] || SENTENCE_THEMES.motivasi.medium;

  // For deterministic static pre-rendering (Next.js SSR safety)
  if (isPrerender) {
    return pool[0] || 'Secangkir kopi hangat selalu terasa nikmat di pagi hari yang sejuk.';
  }

  const key = `${theme}:${difficulty}`;
  const usedIndices = sessionSentenceHistory.get(key) || [];

  // Filter available candidate indices that were not recently used
  const availableIndices: number[] = [];
  for (let i = 0; i < pool.length; i++) {
    if (!usedIndices.includes(i)) {
      availableIndices.push(i);
    }
  }

  // If all or almost all were used, reset history except the very last one
  let candidateIndices = availableIndices;
  if (candidateIndices.length === 0) {
    const lastUsed = usedIndices[usedIndices.length - 1];
    candidateIndices = [];
    for (let i = 0; i < pool.length; i++) {
      if (i !== lastUsed) {
        candidateIndices.push(i);
      }
    }
    // Fallback if pool only has 1 sentence
    if (candidateIndices.length === 0) {
      candidateIndices = [0];
    }
  }

  // Pick randomly among non-repeated candidates
  const pickedIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];

  // Update session history (keep up to pool.length - 1 items)
  const maxHistory = Math.max(1, pool.length - 1);
  const updatedHistory = [...usedIndices.filter(idx => idx !== pickedIndex), pickedIndex];
  if (updatedHistory.length > maxHistory) {
    updatedHistory.splice(0, updatedHistory.length - maxHistory);
  }
  sessionSentenceHistory.set(key, updatedHistory);

  return pool[pickedIndex];
}

export function resetSentenceSessionHistory(): void {
  sessionSentenceHistory.clear();
}
