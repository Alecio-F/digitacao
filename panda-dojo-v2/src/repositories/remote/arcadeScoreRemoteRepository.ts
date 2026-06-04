import { supabase } from '@/services/supabase/supabaseClient';
import type { RemoteArcadeScore } from '@/services/supabase/types';
import {
  disabledResult,
  errorResult,
  type RemoteRepositoryResult,
} from './remoteRepositoryResult';

export interface RemoteArcadeScoreInput {
  score: number;
  maxCombo?: number;
  levelReached?: number;
  playedAt?: string;
}

export async function saveArcadeScore(
  userId: string,
  gameId: string,
  score: number | RemoteArcadeScoreInput,
): Promise<RemoteRepositoryResult<RemoteArcadeScore>> {
  if (!supabase) return disabledResult();

  const input = typeof score === 'number' ? { score } : score;

  try {
    const { data, error } = await supabase
      .from('arcade_scores')
      .insert({
        user_id: userId,
        game_id: gameId,
        score: Math.max(0, Math.round(input.score) || 0),
        max_combo: Math.max(0, Math.round(input.maxCombo ?? 0) || 0),
        level_reached: Math.max(1, Math.round(input.levelReached ?? 1) || 1),
        played_at: input.playedAt ?? new Date().toISOString(),
      })
      .select('*')
      .single<RemoteArcadeScore>();

    return { data, error: error?.message ?? null };
  } catch (error) {
    return errorResult(error);
  }
}

export async function getBestArcadeScore(
  userId: string,
  gameId: string,
): Promise<RemoteRepositoryResult<RemoteArcadeScore>> {
  if (!supabase) return disabledResult();

  try {
    const { data, error } = await supabase
      .from('arcade_scores')
      .select('*')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .limit(1)
      .maybeSingle<RemoteArcadeScore>();

    return { data, error: error?.message ?? null };
  } catch (error) {
    return errorResult(error);
  }
}
