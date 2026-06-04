import { supabase } from '@/services/supabase/supabaseClient';
import type { RemoteProfile } from '@/services/supabase/types';
import {
  disabledResult,
  errorResult,
  type RemoteRepositoryResult,
} from './remoteRepositoryResult';

interface ProfileProgressMergeInput {
  xp: number;
  level: number;
  title: string;
  dailyStreak: number;
  lastTrainingDate: string;
}

export async function getProfile(userId: string): Promise<RemoteRepositoryResult<RemoteProfile>> {
  if (!supabase) return disabledResult();

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle<RemoteProfile>();

    return { data, error: error?.message ?? null };
  } catch (error) {
    return errorResult(error);
  }
}

export async function updateProfile(
  userId: string,
  data: Partial<Pick<RemoteProfile, 'username' | 'display_name' | 'avatar_url'>>,
): Promise<RemoteRepositoryResult<RemoteProfile>> {
  if (!supabase) return disabledResult();

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select('*')
      .single<RemoteProfile>();

    return { data: profile, error: error?.message ?? null };
  } catch (error) {
    return errorResult(error);
  }
}

export async function ensureProfile(userId: string): Promise<RemoteRepositoryResult<RemoteProfile>> {
  if (!supabase) return disabledResult();

  const existing = await getProfile(userId);
  if (existing.data || existing.error) return existing;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: userId })
      .select('*')
      .single<RemoteProfile>();

    return { data, error: error?.message ?? null };
  } catch (error) {
    return errorResult(error);
  }
}

export async function mergeProfileProgress(
  userId: string,
  local: ProfileProgressMergeInput,
): Promise<RemoteRepositoryResult<RemoteProfile>> {
  if (!supabase) return disabledResult();

  const existing = await ensureProfile(userId);
  if (existing.error) return existing;

  const remote = existing.data;
  const remoteTrainingDate = remote?.last_training_date ?? '';
  const nextTrainingDate = [remoteTrainingDate, local.lastTrainingDate]
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        xp: Math.max(remote?.xp ?? 0, local.xp),
        level: Math.max(remote?.level ?? 1, local.level),
        title: local.xp >= (remote?.xp ?? 0) ? local.title : remote?.title ?? local.title,
        daily_streak: Math.max(remote?.daily_streak ?? 0, local.dailyStreak),
        last_training_date: nextTrainingDate || null,
      })
      .eq('id', userId)
      .select('*')
      .single<RemoteProfile>();

    return { data, error: error?.message ?? null };
  } catch (error) {
    return errorResult(error);
  }
}
