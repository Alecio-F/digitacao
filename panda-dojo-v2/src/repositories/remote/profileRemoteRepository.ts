import { supabase } from '@/services/supabase/supabaseClient';
import type { RemoteProfile } from '@/services/supabase/types';
import {
  buildProfileIdentityFallbacks,
  getUniqueFallbackUsername,
} from '@/services/supabase/profileIdentity';
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

interface ProfileIdentityInput {
  id?: string | null;
  email?: string | null;
  displayName?: string | null;
  userMetadata?: Record<string, unknown> | null;
}

type ProfileUpdateInput = Partial<Pick<
  RemoteProfile,
  | 'username'
  | 'display_name'
  | 'avatar_url'
  | 'level'
  | 'xp'
  | 'title'
  | 'daily_streak'
  | 'last_training_date'
>>;

function hasText(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function isDuplicateUsernameError(error: string | null | undefined): boolean {
  return Boolean(
    error &&
    (
      error.toLowerCase().includes('duplicate') ||
      error.includes('profiles_username_key')
    ),
  );
}

function getProfileRepairPatch(
  profile: RemoteProfile,
  identity: ProfileIdentityInput | undefined,
): ProfileUpdateInput {
  const fallback = buildProfileIdentityFallbacks({
    id: identity?.id ?? profile.id,
    email: identity?.email,
    displayName: identity?.displayName,
    userMetadata: identity?.userMetadata,
  });
  const patch: ProfileUpdateInput = {};

  if (!hasText(profile.display_name)) patch.display_name = fallback.displayName;
  if (!hasText(profile.username)) patch.username = fallback.username;
  if (!Number.isFinite(profile.level) || profile.level < 1) patch.level = 1;
  if (!Number.isFinite(profile.xp) || profile.xp < 0) patch.xp = 0;
  if (!hasText(profile.title)) patch.title = 'Filhote de Panda';

  return patch;
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
  data: ProfileUpdateInput,
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
  return ensureProfileWithIdentity(userId);
}

export async function ensureProfileWithIdentity(
  userId: string,
  identity?: ProfileIdentityInput,
): Promise<RemoteRepositoryResult<RemoteProfile>> {
  if (!supabase) return disabledResult();
  const fallback = buildProfileIdentityFallbacks({
    id: identity?.id ?? userId,
    email: identity?.email,
    displayName: identity?.displayName,
    userMetadata: identity?.userMetadata,
  });

  const existing = await getProfile(userId);
  if (existing.error) return existing;
  if (existing.data) {
    const patch = getProfileRepairPatch(existing.data, identity);
    if (Object.keys(patch).length === 0) return existing;

    const repaired = await updateProfile(userId, patch);
    if (!isDuplicateUsernameError(repaired.error)) return repaired.error ? existing : repaired;

    const fallbackUsername = getUniqueFallbackUsername(userId, fallback.username);
    const retried = await updateProfile(userId, { ...patch, username: fallbackUsername });
    return retried.error ? existing : retried;
  }

  try {
    const baseInsert = {
      id: userId,
      username: fallback.username,
      display_name: fallback.displayName,
      level: 1,
      xp: 0,
      title: 'Filhote de Panda',
    };
    const firstAttempt = await supabase
      .from('profiles')
      .insert(baseInsert)
      .select('*')
      .single<RemoteProfile>();

    if (!isDuplicateUsernameError(firstAttempt.error?.message)) {
      return {
        data: firstAttempt.data,
        error: firstAttempt.error?.message ?? null,
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({ ...baseInsert, username: fallback.uniqueUsername })
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
