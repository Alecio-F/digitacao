import { supabase } from '@/services/supabase/supabaseClient';
import type { RemoteUserAchievement } from '@/services/supabase/types';
import {
  disabledResult,
  errorResult,
  type RemoteRepositoryResult,
} from './remoteRepositoryResult';

export async function getUserAchievements(
  userId: string,
): Promise<RemoteRepositoryResult<RemoteUserAchievement[]>> {
  if (!supabase) return disabledResult();

  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })
      .returns<RemoteUserAchievement[]>();

    return { data: data ?? [], error: error?.message ?? null };
  } catch (error) {
    return errorResult(error);
  }
}

export async function unlockAchievement(
  userId: string,
  achievementId: string,
): Promise<RemoteRepositoryResult<RemoteUserAchievement>> {
  if (!supabase) return disabledResult();

  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .upsert(
        {
          user_id: userId,
          achievement_id: achievementId,
        },
        { onConflict: 'user_id,achievement_id' },
      )
      .select('*')
      .single<RemoteUserAchievement>();

    return { data, error: error?.message ?? null };
  } catch (error) {
    return errorResult(error);
  }
}
