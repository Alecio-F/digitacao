import { supabase } from '@/services/supabase/supabaseClient';
import {
  disabledResult,
  errorResult,
  type RemoteRepositoryResult,
} from './remoteRepositoryResult';

export interface DailyChallengeResultInput {
  challengeDate: string;
  challengeId: string;
  ppm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  maxCombo: number;
  durationSeconds: number;
  validForRanking: boolean;
  rankingScore: number;
  rankingInvalidReason: string | null;
  rankingInvalidReasons: string[];
  suspiciousFlags: Record<string, unknown>;
  completedAt: string;
}

function toRow(userId: string, input: DailyChallengeResultInput) {
  return {
    user_id: userId,
    challenge_date: input.challengeDate,
    challenge_id: input.challengeId,
    ppm: Math.max(0, Math.round(input.ppm) || 0),
    cpm: Math.max(0, Math.round(input.cpm) || 0),
    accuracy: Math.min(100, Math.max(0, Number(input.accuracy) || 0)),
    errors: Math.max(0, Math.round(input.errors) || 0),
    max_combo: Math.max(0, Math.round(input.maxCombo) || 0),
    duration_seconds: Math.max(0, Math.round(input.durationSeconds) || 0),
    valid_for_ranking: input.validForRanking,
    ranking_score: Math.max(0, Number(input.rankingScore) || 0),
    ranking_invalid_reason: input.validForRanking ? null : input.rankingInvalidReason,
    ranking_invalid_reasons: input.rankingInvalidReasons,
    suspicious_flags: input.suspiciousFlags,
    completed_at: input.completedAt,
  };
}

/**
 * Salva o resultado do Desafio Diario em public.daily_challenge_results.
 * Usa upsert com onConflict (user_id, challenge_date): mantem o resultado
 * existente se ele tiver ranking_score maior ou igual ao novo.
 */
export async function saveDailyChallengeResult(
  userId: string,
  input: DailyChallengeResultInput,
): Promise<RemoteRepositoryResult<null>> {
  if (!supabase) return disabledResult();

  try {
    const { data: existing } = await supabase
      .from('daily_challenge_results')
      .select('ranking_score')
      .eq('user_id', userId)
      .eq('challenge_date', input.challengeDate)
      .maybeSingle();

    const existingScore = Number((existing as { ranking_score?: number } | null)?.ranking_score ?? 0);
    const newScore = Math.max(0, Number(input.rankingScore) || 0);

    if (existing && existingScore >= newScore) {
      return { data: null, error: null };
    }

    const { error } = await supabase
      .from('daily_challenge_results')
      .upsert(toRow(userId, input), { onConflict: 'user_id,challenge_date' });

    return { data: null, error: error?.message ?? null };
  } catch (error) {
    return errorResult(error);
  }
}
