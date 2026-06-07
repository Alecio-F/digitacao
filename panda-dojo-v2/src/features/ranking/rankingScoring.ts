import type { RankingEntry } from './rankingTypes';

export type RankingScoreInput = Pick<
  RankingEntry,
  'ppm' | 'cpm' | 'accuracy' | 'errors' | 'maxCombo' | 'durationSeconds' | 'validForRanking'
>;

function safeNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export function isRankingEligible(result: Pick<RankingEntry, 'validForRanking'>): boolean {
  return result.validForRanking !== false;
}

export function calculateGeneralRankingScore(result: RankingScoreInput): number {
  if (!isRankingEligible(result)) return 0;

  const ppm = Math.max(0, safeNumber(result.ppm));
  const accuracy = Math.max(0, Math.min(100, safeNumber(result.accuracy)));
  const combo = Math.max(0, safeNumber(result.maxCombo));
  const errors = Math.max(0, safeNumber(result.errors));

  // Fórmula inicial ajustável: premia velocidade, precisão e combo, mas pune
  // erro alto. Precisão abaixo de 90% derruba fortemente o resultado competitivo.
  let score = ppm * 1.4 + accuracy * 2 + combo * 0.4 - errors * 1.5;
  if (accuracy < 90) score *= 0.45;

  return Math.max(0, Math.round(score));
}

export function getSpeedScore(result: RankingEntry, metric: 'ppm' | 'cpm' = 'ppm'): number {
  return Math.max(0, safeNumber(result[metric]));
}

export function getAccuracyScore(result: RankingEntry): number {
  return Math.max(0, Math.min(100, safeNumber(result.accuracy)));
}

export function getLowestTimeScore(result: RankingEntry): number {
  const duration = Math.max(0, safeNumber(result.durationSeconds));
  return duration > 0 ? duration : Number.POSITIVE_INFINITY;
}

export function getMetricValue(result: RankingEntry, metric: string): number {
  if (metric === 'ranking_score') return Math.max(0, safeNumber(result.rankingScore));
  if (metric === 'ppm') return getSpeedScore(result, 'ppm');
  if (metric === 'cpm') return getSpeedScore(result, 'cpm');
  if (metric === 'accuracy') return getAccuracyScore(result);
  if (metric === 'lowest_time') return getLowestTimeScore(result);
  if (metric === 'combo') return Math.max(0, safeNumber(result.maxCombo));
  if (metric === 'arcade_score') return Math.max(0, safeNumber(result.rankingScore));
  return Math.max(0, safeNumber(result.metricValue));
}
