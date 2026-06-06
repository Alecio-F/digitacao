import type { HistoryItem } from '@/features/gamification/types';
import { normalizeTrainingResult } from '@/features/typing/logic/normalizeTrainingResult';
import type { RemoteProfile, RemoteRankingEntry, RemoteTypingResult } from '@/services/supabase/types';
import { calculateGeneralRankingScore } from './rankingScoring';
import type { RankingEntry, RankingMode } from './rankingTypes';

function safeNumber(value: unknown, fallback = 0): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Math.max(0, numberValue) : fallback;
}

function parseAccuracy(value: unknown): number {
  if (typeof value === 'number') return Math.max(0, Math.min(100, value));
  if (typeof value === 'string') {
    const parsed = Number(value.replace('%', '').replace(',', '.'));
    return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : 0;
  }
  return 0;
}

function parseLocalDate(value?: string): string | null {
  if (!value) return null;

  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), 12).toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function mapHistoryModeToRankingMode(item: HistoryItem): RankingMode {
  if (item.mode === 'lesson' || item.lessonId) return 'lesson';
  if (item.mode === 'practice-text' || item.practiceTextId) return 'practice_text';
  if (item.mode === 'daily-challenge' || item.dailyChallengeId) return 'daily_challenge';
  if (item.mode === 'random') return 'random_words';
  return 'free';
}

export function mapLocalHistoryToRankingEntry(
  item: HistoryItem,
  index = 0,
): RankingEntry {
  const normalized = normalizeTrainingResult(item);
  const mode = mapHistoryModeToRankingMode(normalized);
  const completedAt = normalized.completedAt ?? parseLocalDate(normalized.data) ?? new Date(0).toISOString();
  const maxCombo = safeNumber(normalized.maxCombo ?? normalized.combo);
  const entry: RankingEntry = {
    id: `local:${completedAt}:${mode}:${normalized.ppm}:${index}`,
    userId: 'local-user',
    username: 'local',
    displayName: 'Você',
    position: 0,
    mode,
    lessonId: normalized.lessonId ?? null,
    practiceTextId: normalized.practiceTextId ?? null,
    metricValue: 0,
    ppm: safeNumber(normalized.ppm),
    cpm: safeNumber(normalized.cpm),
    accuracy: parseAccuracy(normalized.precisao),
    errors: safeNumber(normalized.erros),
    maxCombo,
    durationSeconds: Math.round(safeNumber(normalized.tempo) * 60),
    rankingScore: safeNumber(normalized.rankingScore),
    validForRanking: normalized.validForRanking !== false,
    completedAt,
    badge: normalized.novoRecorde ? 'Recorde' : undefined,
  };

  return {
    ...entry,
    rankingScore: entry.rankingScore || calculateGeneralRankingScore(entry),
  };
}

export function mapLocalHistoryToRankingEntries(history: HistoryItem[]): RankingEntry[] {
  return history.map(mapLocalHistoryToRankingEntry);
}

function mapRemoteMode(mode: string): RankingMode {
  if (mode === 'lesson') return 'lesson';
  if (mode === 'practice-text' || mode === 'practice_text') return 'practice_text';
  if (mode === 'daily-challenge' || mode === 'daily_challenge') return 'daily_challenge';
  if (mode === 'random' || mode === 'random_words') return 'random_words';
  return 'free';
}

export function mapRemoteTypingResultToRankingEntry(
  result: RemoteTypingResult,
  profile?: Pick<RemoteProfile, 'username' | 'display_name'> | null,
): RankingEntry {
  const entry: RankingEntry = {
    id: result.id,
    userId: result.user_id,
    username: profile?.username ?? 'online',
    displayName: profile?.display_name ?? profile?.username ?? 'Panda online',
    position: 0,
    mode: mapRemoteMode(result.mode),
    lessonId: result.lesson_id,
    practiceTextId: result.practice_text_id,
    metricValue: 0,
    ppm: safeNumber(result.ppm),
    cpm: safeNumber(result.cpm),
    accuracy: parseAccuracy(result.accuracy),
    errors: safeNumber(result.errors),
    maxCombo: safeNumber(result.max_combo),
    durationSeconds: safeNumber(result.duration_seconds),
    rankingScore: safeNumber(result.ranking_score),
    validForRanking: result.valid_for_ranking !== false,
    completedAt: result.completed_at,
  };

  return {
    ...entry,
    rankingScore: entry.rankingScore || calculateGeneralRankingScore(entry),
  };
}

export function mapRemoteRankingEntryToRankingEntry(
  result: RemoteRankingEntry,
  index = 0,
): RankingEntry {
  const entry: RankingEntry = {
    id: `online:${result.id}`,
    userId: result.user_id,
    username: result.username ?? 'panda_user',
    displayName: result.display_name ?? result.username ?? 'Aprendiz do Dojo',
    avatarUrl: result.avatar_url ?? null,
    position: index + 1,
    mode: mapRemoteMode(result.mode),
    lessonId: result.lesson_id ?? null,
    practiceTextId: result.practice_text_id ?? null,
    metricValue: 0,
    ppm: safeNumber(result.ppm),
    cpm: safeNumber(result.cpm),
    accuracy: parseAccuracy(result.accuracy),
    errors: safeNumber(result.errors),
    maxCombo: safeNumber(result.max_combo),
    durationSeconds: safeNumber(result.duration_seconds),
    rankingScore: safeNumber(result.ranking_score),
    validForRanking: result.valid_for_ranking !== false,
    completedAt: result.completed_at,
    badge: result.title ?? undefined,
  };

  return {
    ...entry,
    rankingScore: entry.rankingScore || calculateGeneralRankingScore(entry),
  };
}
