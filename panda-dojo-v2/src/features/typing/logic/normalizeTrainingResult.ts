import type { HistoryItem } from '@/features/gamification/types';
import { evaluateRankingEligibility } from './rankingEligibility';

function safeNumber(value: unknown, fallback = 0): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Math.max(0, numberValue) : fallback;
}

function parseAccuracy(value: unknown): number {
  if (typeof value === 'number') return Math.min(100, Math.max(0, value));
  if (typeof value !== 'string') return 0;
  const parsed = Number(value.replace('%', '').replace(',', '.').trim());
  return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 0;
}

function estimateCorrectChars(item: HistoryItem, durationSeconds: number): number {
  if (item.correctChars != null) return safeNumber(item.correctChars);
  if (item.cpm != null && durationSeconds > 0) {
    return Math.round((safeNumber(item.cpm) * durationSeconds) / 60);
  }
  if (item.ppm != null && durationSeconds > 0) {
    return Math.round((safeNumber(item.ppm) * 5 * durationSeconds) / 60);
  }
  return 0;
}

export function normalizeTrainingResult(item: HistoryItem): HistoryItem {
  const durationSeconds = safeNumber(item.tempo) * 60;
  const accuracy = parseAccuracy(item.precisao);
  const correctChars = estimateCorrectChars(item, durationSeconds);
  const wrongChars = item.wrongChars != null ? safeNumber(item.wrongChars) : safeNumber(item.erros);
  const totalTyped = item.totalTyped != null
    ? safeNumber(item.totalTyped)
    : correctChars + wrongChars;
  const rawKeyCount = item.rawKeyCount != null ? safeNumber(item.rawKeyCount) : totalTyped;
  const repeatedKeyCount = safeNumber(item.repeatedKeyCount);
  const longestWrongStreak = safeNumber(item.longestWrongStreak);
  const suspiciousInputBursts = safeNumber(item.suspiciousInputBursts);
  const ppm = safeNumber(item.ppm);
  const cpm = safeNumber(item.cpm);
  const maxCombo = safeNumber(item.maxCombo ?? item.combo);
  const eligibility = evaluateRankingEligibility({
    accuracy,
    durationSeconds,
    correctChars,
    wrongChars,
    totalTyped,
    rawKeyCount,
    repeatedKeyCount,
    maxCombo,
    ppm,
    cpm,
    longestWrongStreak,
    suspiciousInputBursts,
  });

  return {
    ...item,
    ppm,
    cpm,
    erros: safeNumber(item.erros),
    tempo: safeNumber(item.tempo),
    correctChars,
    wrongChars,
    totalTyped,
    rawKeyCount,
    repeatedKeyCount,
    longestWrongStreak,
    suspiciousInputBursts,
    maxCombo,
    combo: maxCombo,
    validForRanking: typeof item.validForRanking === 'boolean'
      ? item.validForRanking
      : eligibility.validForRanking,
    rankingScore: safeNumber(item.rankingScore, eligibility.score),
    rankingInvalidReasons: item.rankingInvalidReasons ?? eligibility.reasonCodes,
    suspiciousFlags: item.suspiciousFlags ?? eligibility.suspiciousFlags,
  };
}
