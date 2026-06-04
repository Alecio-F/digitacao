import { supabase } from '@/services/supabase/supabaseClient';
import type { RemoteTypingResult } from '@/services/supabase/types';
import {
  disabledResult,
  errorResult,
  type RemoteRepositoryResult,
} from './remoteRepositoryResult';

export interface RemoteTypingResultInput {
  mode: string;
  lessonId?: string | null;
  practiceTextId?: string | null;
  dailyChallengeId?: string | null;
  durationSeconds: number;
  ppm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  maxCombo: number;
  mistakeKeys: Record<string, number>;
  correctChars: number;
  wrongChars: number;
  rawKeyCount: number;
  repeatedKeyCount: number;
  validForRanking: boolean;
  rankingScore: number;
  suspiciousFlags: Record<string, unknown>;
  rankingInvalidReasons: string[];
  completedAt: string;
}

function toRow(userId: string, result: RemoteTypingResultInput) {
  return {
    user_id: userId,
    mode: result.mode,
    lesson_id: result.lessonId ?? null,
    practice_text_id: result.practiceTextId ?? null,
    daily_challenge_id: result.dailyChallengeId ?? null,
    duration_seconds: Math.max(0, Math.round(result.durationSeconds) || 0),
    ppm: Math.max(0, Math.round(result.ppm) || 0),
    cpm: Math.max(0, Math.round(result.cpm) || 0),
    accuracy: Math.min(100, Math.max(0, Number(result.accuracy) || 0)),
    errors: Math.max(0, Math.round(result.errors) || 0),
    max_combo: Math.max(0, Math.round(result.maxCombo) || 0),
    mistake_keys: result.mistakeKeys,
    correct_chars: Math.max(0, Math.round(result.correctChars) || 0),
    wrong_chars: Math.max(0, Math.round(result.wrongChars) || 0),
    raw_key_count: Math.max(0, Math.round(result.rawKeyCount) || 0),
    repeated_key_count: Math.max(0, Math.round(result.repeatedKeyCount) || 0),
    valid_for_ranking: result.validForRanking,
    ranking_score: Math.max(0, Number(result.rankingScore) || 0),
    suspicious_flags: result.suspiciousFlags,
    ranking_invalid_reasons: result.rankingInvalidReasons,
    completed_at: result.completedAt,
  };
}

export async function saveTypingResult(
  userId: string,
  result: RemoteTypingResultInput,
): Promise<RemoteRepositoryResult<RemoteTypingResult>> {
  if (!supabase) return disabledResult();

  try {
    const { data, error } = await supabase
      .from('typing_results')
      .insert(toRow(userId, result))
      .select('*')
      .single<RemoteTypingResult>();

    return { data, error: error?.message ?? null };
  } catch (error) {
    return errorResult(error);
  }
}

export async function getUserTypingResults(
  userId: string,
  limit = 50,
): Promise<RemoteRepositoryResult<RemoteTypingResult[]>> {
  if (!supabase) return disabledResult();

  try {
    const { data, error } = await supabase
      .from('typing_results')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(Math.max(1, Math.min(200, Math.round(limit) || 50)))
      .returns<RemoteTypingResult[]>();

    return { data: data ?? [], error: error?.message ?? null };
  } catch (error) {
    return errorResult(error);
  }
}

export async function getRankingEligibleResults(
  userId: string,
  limit = 200,
): Promise<RemoteRepositoryResult<RemoteTypingResult[]>> {
  if (!supabase) return disabledResult();

  try {
    const { data, error } = await supabase
      .from('typing_results')
      .select('*')
      .eq('user_id', userId)
      .eq('valid_for_ranking', true)
      .order('ranking_score', { ascending: false })
      .order('ppm', { ascending: false })
      .limit(Math.max(1, Math.min(200, Math.round(limit) || 200)))
      .returns<RemoteTypingResult[]>();

    return { data: data ?? [], error: error?.message ?? null };
  } catch (error) {
    return errorResult(error);
  }
}

export async function getBestTypingResult(
  userId: string,
): Promise<RemoteRepositoryResult<RemoteTypingResult>> {
  if (!supabase) return disabledResult();

  try {
    const { data, error } = await supabase
      .from('typing_results')
      .select('*')
      .eq('user_id', userId)
      .eq('valid_for_ranking', true)
      .order('ranking_score', { ascending: false })
      .order('ppm', { ascending: false })
      .limit(1)
      .maybeSingle<RemoteTypingResult>();

    return { data, error: error?.message ?? null };
  } catch (error) {
    return errorResult(error);
  }
}
