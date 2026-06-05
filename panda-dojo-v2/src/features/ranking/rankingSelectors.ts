import { DEFAULT_RANKING_LIMIT } from './rankingConfig';
import {
  filterByLesson,
  filterByMinimumAccuracy,
  filterByMode,
  filterByPracticeText,
  filterEligibleResults,
} from './rankingFilters';
import { getMetricValue } from './rankingScoring';
import type { RankingEntry, RankingMetric, RankingMode } from './rankingTypes';

function dedupeResults(results: RankingEntry[]): RankingEntry[] {
  const seen = new Set<string>();
  return results.filter((entry) => {
    const key = [
      entry.userId ?? entry.username,
      entry.completedAt,
      entry.mode,
      entry.lessonId ?? '',
      entry.practiceTextId ?? '',
      entry.ppm,
      entry.accuracy,
    ].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function withPositions(results: RankingEntry[], metric: RankingMetric): RankingEntry[] {
  return results.map((entry, index) => ({
    ...entry,
    position: index + 1,
    metricValue: getMetricValue(entry, metric),
  }));
}

function limitResults(results: RankingEntry[], limit?: number): RankingEntry[] {
  return typeof limit === 'number' ? results.slice(0, Math.max(1, limit)) : results;
}

function compareMetricDesc(metric: RankingMetric) {
  return (a: RankingEntry, b: RankingEntry) => {
    const metricDiff = getMetricValue(b, metric) - getMetricValue(a, metric);
    if (metricDiff !== 0) return metricDiff;
    const scoreDiff = b.rankingScore - a.rankingScore;
    if (scoreDiff !== 0) return scoreDiff;
    const ppmDiff = b.ppm - a.ppm;
    if (ppmDiff !== 0) return ppmDiff;
    return b.accuracy - a.accuracy;
  };
}

function compareLowestTime(a: RankingEntry, b: RankingEntry) {
  const timeDiff = a.durationSeconds - b.durationSeconds;
  if (timeDiff !== 0) return timeDiff;
  const ppmDiff = b.ppm - a.ppm;
  if (ppmDiff !== 0) return ppmDiff;
  return b.accuracy - a.accuracy;
}

export function getGeneralRanking(
  results: RankingEntry[],
  limit = DEFAULT_RANKING_LIMIT,
): RankingEntry[] {
  const ranked = dedupeResults(filterEligibleResults(results))
    .sort((a, b) => {
      const scoreDiff = b.rankingScore - a.rankingScore;
      if (scoreDiff !== 0) return scoreDiff;
      const ppmDiff = b.ppm - a.ppm;
      if (ppmDiff !== 0) return ppmDiff;
      return b.accuracy - a.accuracy;
    });

  return withPositions(limitResults(ranked, limit), 'ranking_score');
}

export function getSpeedRanking(
  results: RankingEntry[],
  metric: Extract<RankingMetric, 'ppm' | 'cpm'> = 'ppm',
  limit = DEFAULT_RANKING_LIMIT,
): RankingEntry[] {
  const ranked = dedupeResults(filterByMinimumAccuracy(filterEligibleResults(results), 90))
    .sort(compareMetricDesc(metric));
  return withPositions(limitResults(ranked, limit), metric);
}

export function getAccuracyRanking(
  results: RankingEntry[],
  limit = DEFAULT_RANKING_LIMIT,
): RankingEntry[] {
  const ranked = dedupeResults(filterEligibleResults(results))
    .sort((a, b) => {
      const accuracyDiff = b.accuracy - a.accuracy;
      if (accuracyDiff !== 0) return accuracyDiff;
      const ppmDiff = b.ppm - a.ppm;
      if (ppmDiff !== 0) return ppmDiff;
      const errorDiff = a.errors - b.errors;
      if (errorDiff !== 0) return errorDiff;
      return a.durationSeconds - b.durationSeconds;
    });

  return withPositions(limitResults(ranked, limit), 'accuracy');
}

export function getPhaseRanking(
  results: RankingEntry[],
  lessonId?: string | null,
  metric: RankingMetric = 'ranking_score',
  limit = DEFAULT_RANKING_LIMIT,
): RankingEntry[] {
  const base = filterByLesson(filterByMode(filterEligibleResults(results), 'lesson'), lessonId);
  const ranked = dedupeResults(base).sort(metric === 'lowest_time' ? compareLowestTime : compareMetricDesc(metric));
  return withPositions(limitResults(ranked, limit), metric);
}

export function getTextRanking(
  results: RankingEntry[],
  practiceTextId?: string | null,
  metric: RankingMetric = 'ranking_score',
  limit = DEFAULT_RANKING_LIMIT,
): RankingEntry[] {
  const textResults = results.filter((entry) => (
    entry.mode === 'practice_text' || entry.mode === 'free'
  ));
  const base = filterByPracticeText(filterEligibleResults(textResults), practiceTextId);
  const ranked = dedupeResults(base).sort(metric === 'lowest_time' ? compareLowestTime : compareMetricDesc(metric));
  return withPositions(limitResults(ranked, limit), metric);
}

export function getLowestTimeRanking(
  results: RankingEntry[],
  mode: RankingMode,
  id?: string | null,
  limit = DEFAULT_RANKING_LIMIT,
): RankingEntry[] {
  let base = filterByMode(filterEligibleResults(results), mode);
  if (mode === 'lesson') base = filterByLesson(base, id);
  if (mode === 'practice_text') base = filterByPracticeText(base, id);

  return withPositions(limitResults(dedupeResults(base).sort(compareLowestTime), limit), 'lowest_time');
}

export function getUserRankingPosition(
  results: RankingEntry[],
  userIdOrLocalId: string,
): number | null {
  const ranked = getGeneralRanking(results, results.length);
  const match = ranked.find((entry) => (
    entry.userId === userIdOrLocalId || entry.username === userIdOrLocalId
  ));
  return match?.position ?? null;
}
