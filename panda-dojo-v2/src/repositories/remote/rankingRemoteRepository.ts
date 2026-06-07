import { supabase } from '@/services/supabase/supabaseClient';
import type { RemoteRankingEntry } from '@/services/supabase/types';
import type { RankingCategory, RankingMetric, RankingPeriod } from '@/features/ranking/rankingTypes';
import {
  disabledResult,
  errorResult,
  type RemoteRepositoryResult,
} from './remoteRepositoryResult';

const ONLINE_RANKING_VIEWS = {
  general: 'online_typing_ranking_best',
  speed: 'online_typing_ranking_best_speed',
  accuracy: 'online_typing_ranking_best_accuracy',
  combo: 'online_typing_ranking_best_combo',
  phases: 'online_typing_ranking_best_by_phase',
  texts: 'online_typing_ranking_best_by_text',
  daily: 'online_daily_challenge_ranking',
  arcade: 'online_arcade_ranking_best',
  curiosityErrors: 'online_curiosity_ranking_most_errors',
  curiosityChaos: 'online_curiosity_ranking_chaos',
} as const;

export interface OnlineTypingRankingOptions {
  category: RankingCategory;
  metric: RankingMetric;
  period: RankingPeriod;
  limit?: number;
  mode?: string | null;
  lessonId?: string | null;
  practiceTextId?: string | null;
  minimumAccuracy?: number;
}

interface FallbackTypingResultRow {
  id: string;
  user_id: string;
  mode: string;
  lesson_id: string | null;
  practice_text_id: string | null;
  daily_challenge_id: string | null;
  duration_seconds: number;
  ppm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  max_combo: number;
  ranking_score: number;
  valid_for_ranking: boolean;
  completed_at: string;
  profiles?: {
    username: string | null;
    display_name: string | null;
    title: string | null;
  } | null;
}

function getPeriodStart(period: RankingPeriod): string | null {
  if (period === 'all') return null;

  const now = new Date();
  if (period === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  }

  const days = period === 'week' ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

function getOrderColumns(category: RankingCategory, metric: RankingMetric) {
  if (category === 'curiosities') {
    if (metric === 'chaos') {
      return [
        { column: 'ranking_score', ascending: false },
        { column: 'errors', ascending: false },
        { column: 'completed_at', ascending: true },
      ];
    }
    return [
      { column: 'errors', ascending: false },
      { column: 'duration_seconds', ascending: false },
      { column: 'completed_at', ascending: true },
    ];
  }

  if (category === 'arcade') {
    if (metric === 'combo') {
      return [
        { column: 'max_combo', ascending: false },
        { column: 'ranking_score', ascending: false },
      ];
    }
    return [
      { column: 'ranking_score', ascending: false },
      { column: 'max_combo', ascending: false },
    ];
  }

  if (category === 'speed') {
    return [
      { column: metric === 'cpm' ? 'cpm' : 'ppm', ascending: false },
      { column: 'accuracy', ascending: false },
    ];
  }

  if (category === 'accuracy') {
    return [
      { column: 'accuracy', ascending: false },
      { column: 'ppm', ascending: false },
      { column: 'errors', ascending: true },
    ];
  }

  if (metric === 'combo') {
    return [
      { column: 'max_combo', ascending: false },
      { column: 'accuracy', ascending: false },
      { column: 'ppm', ascending: false },
    ];
  }

  if (metric === 'lowest_time') {
    return [
      { column: 'duration_seconds', ascending: true },
      { column: 'ppm', ascending: false },
    ];
  }

  if (metric === 'ppm' || metric === 'cpm' || metric === 'accuracy') {
    return [
      { column: metric, ascending: false },
      { column: 'ranking_score', ascending: false },
    ];
  }

  return [
    { column: 'ranking_score', ascending: false },
    { column: 'ppm', ascending: false },
    { column: 'accuracy', ascending: false },
  ];
}

function getCategoryMinimumAccuracy(options: OnlineTypingRankingOptions): number | null {
  if (typeof options.minimumAccuracy === 'number') return options.minimumAccuracy;
  if (options.category === 'accuracy' || options.metric === 'accuracy') return 95;
  return options.category === 'speed' ? 90 : null;
}

function shouldSkipRemoteCategory(category: RankingCategory): boolean {
  const withoutViews = new Set<RankingCategory>([]);
  return withoutViews.has(category);
}

function getOnlineRankingViewName(options: OnlineTypingRankingOptions): string {
  if (options.category === 'arcade') {
    return ONLINE_RANKING_VIEWS.arcade;
  }

  if (options.category === 'curiosities') {
    return options.metric === 'chaos'
      ? ONLINE_RANKING_VIEWS.curiosityChaos
      : ONLINE_RANKING_VIEWS.curiosityErrors;
  }

  if (options.category === 'daily') {
    return ONLINE_RANKING_VIEWS.daily;
  }

  if (options.category === 'phases') {
    return ONLINE_RANKING_VIEWS.phases;
  }

  if (options.category === 'texts') {
    return ONLINE_RANKING_VIEWS.texts;
  }

  if (options.metric === 'combo') {
    return ONLINE_RANKING_VIEWS.combo;
  }

  if (options.category === 'speed' || options.metric === 'ppm' || options.metric === 'cpm') {
    return ONLINE_RANKING_VIEWS.speed;
  }

  if (options.category === 'accuracy' || options.metric === 'accuracy') {
    return ONLINE_RANKING_VIEWS.accuracy;
  }

  return ONLINE_RANKING_VIEWS.general;
}

function mapFallbackRow(row: FallbackTypingResultRow): RemoteRankingEntry {
  return {
    id: row.id,
    user_id: row.user_id,
    display_name: row.profiles?.display_name ?? null,
    username: row.profiles?.username ?? null,
    title: row.profiles?.title ?? null,
    mode: row.mode,
    lesson_id: row.lesson_id,
    practice_text_id: row.practice_text_id,
    daily_challenge_id: row.daily_challenge_id,
    duration_seconds: row.duration_seconds,
    ppm: row.ppm,
    cpm: row.cpm,
    accuracy: row.accuracy,
    errors: row.errors,
    max_combo: row.max_combo,
    ranking_score: row.ranking_score,
    valid_for_ranking: row.valid_for_ranking,
    completed_at: row.completed_at,
    created_at: row.completed_at,
  };
}

function normalizeError(message: string | null): string | null {
  if (!message) return null;
  if (message.includes('online_typing_ranking') || message.includes('online_curiosity_ranking')) {
    return 'A view online do ranking selecionado ainda nao foi aplicada no Supabase.';
  }
  if (message.toLowerCase().includes('permission') || message.toLowerCase().includes('policy')) {
    return 'O Dojo nao tem permissao para ler o mural online ainda. Revise a view ou as policies de ranking.';
  }
  return message;
}

function dedupeOrderedResultsByUser(entries: RemoteRankingEntry[]): RemoteRankingEntry[] {
  const bestByUser = new Map<string, RemoteRankingEntry>();

  for (const entry of entries) {
    if (!bestByUser.has(entry.user_id)) bestByUser.set(entry.user_id, entry);
  }

  return Array.from(bestByUser.values());
}


async function queryRankingView(
  options: OnlineTypingRankingOptions,
): Promise<RemoteRepositoryResult<RemoteRankingEntry[]>> {
  if (!supabase) return disabledResult();
  const viewName = getOnlineRankingViewName(options);

  let query = supabase
    .from(viewName)
    .select('*');

  if (options.category !== 'curiosities') {
    query = query.eq('valid_for_ranking', true);
  }

  const periodStart = getPeriodStart(options.period);
  if (periodStart) query = query.gte('completed_at', periodStart);

  const minAccuracy = getCategoryMinimumAccuracy(options);
  if (minAccuracy !== null) query = query.gte('accuracy', minAccuracy);

  if (options.category === 'arcade') query = query.eq('mode', 'arcade');
  if (options.category === 'curiosities') query = query.neq('mode', 'arcade');
  if (options.category === 'phases') query = query.eq('mode', 'lesson');
  if (options.category === 'texts') query = query.in('mode', ['practice_text', 'free']);
  if (options.mode) query = query.eq('mode', options.mode);
  if (options.lessonId) query = query.eq('lesson_id', options.lessonId);
  if (options.practiceTextId) query = query.eq('practice_text_id', options.practiceTextId);

  for (const order of getOrderColumns(options.category, options.metric)) {
    query = query.order(order.column, { ascending: order.ascending });
  }

  const { data, error } = await query
    .limit(Math.max(1, Math.min(100, Math.round(options.limit ?? 24))))
    .returns<RemoteRankingEntry[]>();

  const raw = data ?? [];
  const result = options.category === 'phases' || options.category === 'texts' || options.category === 'daily'
    ? dedupeOrderedResultsByUser(raw)
    : raw;

  return { data: result, error: normalizeError(error?.message ?? null) };
}

async function queryTypingResultsFallback(
  options: OnlineTypingRankingOptions,
): Promise<RemoteRepositoryResult<RemoteRankingEntry[]>> {
  if (!supabase) return disabledResult();
  if (options.category === 'arcade' || options.category === 'curiosities') {
    return { data: [], error: null };
  }

  let query = supabase
    .from('typing_results')
    .select(`
      id,
      user_id,
      mode,
      lesson_id,
      practice_text_id,
      daily_challenge_id,
      duration_seconds,
      ppm,
      cpm,
      accuracy,
      errors,
      max_combo,
      ranking_score,
      valid_for_ranking,
      completed_at,
      profiles (
        username,
        display_name,
        title
      )
    `)
    .eq('valid_for_ranking', true);

  const periodStart = getPeriodStart(options.period);
  if (periodStart) query = query.gte('completed_at', periodStart);

  const minAccuracy = getCategoryMinimumAccuracy(options);
  if (minAccuracy !== null) query = query.gte('accuracy', minAccuracy);

  if (options.category === 'phases') query = query.eq('mode', 'lesson');
  if (options.category === 'texts') query = query.in('mode', ['practice_text', 'free']);
  if (options.category === 'daily') query = query.eq('mode', 'daily-challenge');

  for (const order of getOrderColumns(options.category, options.metric)) {
    query = query.order(order.column, { ascending: order.ascending });
  }

  const { data, error } = await query
    .limit(Math.max(1, Math.min(100, Math.round(options.limit ?? 24))))
    .returns<FallbackTypingResultRow[]>();

  const rows = data?.map(mapFallbackRow) ?? [];
  const deduped = dedupeOrderedResultsByUser(rows);

  return {
    data: deduped,
    error: normalizeError(error?.message ?? null),
  };
}

export async function getOnlineTypingRanking(
  options: OnlineTypingRankingOptions,
): Promise<RemoteRepositoryResult<RemoteRankingEntry[]>> {
  if (!supabase) return disabledResult();
  if (shouldSkipRemoteCategory(options.category)) return { data: [], error: null };

  try {
    const viewResult = await queryRankingView(options);
    if (!viewResult.error) return viewResult;

    const fallbackResult = await queryTypingResultsFallback(options);
    if (!fallbackResult.error) return fallbackResult;

    return { data: null, error: viewResult.error || fallbackResult.error };
  } catch (error) {
    return errorResult(error);
  }
}
