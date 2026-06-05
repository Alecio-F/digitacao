import type { RankingEntry, RankingMode, RankingPeriod } from './rankingTypes';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getPeriodStart(period: RankingPeriod, now = new Date()): Date | null {
  if (period === 'all') return null;
  const today = startOfLocalDay(now);
  if (period === 'today') return today;
  if (period === 'week') return new Date(today.getTime() - 6 * DAY_MS);
  if (period === 'month') return new Date(today.getFullYear(), today.getMonth(), 1);
  return null;
}

function getCompletedDate(entry: RankingEntry): Date | null {
  const date = new Date(entry.completedAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function filterByPeriod(
  results: RankingEntry[],
  period: RankingPeriod,
  now = new Date(),
): RankingEntry[] {
  const start = getPeriodStart(period, now);
  if (!start) return results;

  return results.filter((entry) => {
    const completedAt = getCompletedDate(entry);
    return completedAt ? completedAt >= start : false;
  });
}

export function filterByMode(results: RankingEntry[], mode: RankingMode): RankingEntry[] {
  if (mode === 'all') return results;
  return results.filter((entry) => entry.mode === mode);
}

export function filterByLesson(results: RankingEntry[], lessonId?: string | null): RankingEntry[] {
  if (!lessonId) return results;
  return results.filter((entry) => entry.lessonId === lessonId);
}

export function filterByPracticeText(
  results: RankingEntry[],
  practiceTextId?: string | null,
): RankingEntry[] {
  if (!practiceTextId) return results;
  return results.filter((entry) => entry.practiceTextId === practiceTextId);
}

export function filterEligibleResults(results: RankingEntry[]): RankingEntry[] {
  return results.filter((entry) => entry.validForRanking);
}

export function filterByMinimumAccuracy(results: RankingEntry[], minAccuracy = 0): RankingEntry[] {
  return results.filter((entry) => entry.accuracy >= minAccuracy);
}
