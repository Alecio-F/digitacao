import { supabase } from '@/services/supabase/supabaseClient';
import type { RemoteLessonProgress } from '@/services/supabase/types';
import type { LessonMedal, LessonProgress, LessonProgressMap } from '@/features/lessons/types';
import {
  disabledResult,
  errorResult,
  type RemoteRepositoryResult,
} from './remoteRepositoryResult';

const MEDAL_RANK: Record<LessonMedal, number> = {
  none: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
};

function getBestMedal(current: LessonMedal, next: LessonMedal): LessonMedal {
  return MEDAL_RANK[next] > MEDAL_RANK[current] ? next : current;
}

function fromRemoteMap(rows: RemoteLessonProgress[]): LessonProgressMap {
  return rows.reduce<LessonProgressMap>((progress, row) => {
    progress[row.lesson_id] = {
      status: row.status,
      bestAccuracy: Number(row.best_accuracy) || 0,
      bestPpm: Number(row.best_ppm) || 0,
      medal: row.medal,
      attempts: Number(row.attempts) || 0,
      completedAt: row.completed_at ?? undefined,
    };
    return progress;
  }, {});
}

export async function getLessonProgress(
  userId: string,
): Promise<RemoteRepositoryResult<LessonProgressMap>> {
  if (!supabase) return disabledResult();

  try {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .returns<RemoteLessonProgress[]>();

    return { data: fromRemoteMap(data ?? []), error: error?.message ?? null };
  } catch (error) {
    return errorResult(error);
  }
}

export async function upsertLessonProgress(
  userId: string,
  lessonId: string,
  progress: LessonProgress,
): Promise<RemoteRepositoryResult<RemoteLessonProgress>> {
  if (!supabase) return disabledResult();

  try {
    const { data: existing, error: readError } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle<RemoteLessonProgress>();

    if (readError) return { data: null, error: readError.message };

    const existingMedal = existing?.medal ?? 'none';
    const mergedCompletedAt = existing?.completed_at ?? progress.completedAt ?? null;
    const row = {
      user_id: userId,
      lesson_id: lessonId,
      status: existing?.status === 'completed' || progress.status === 'completed'
        ? 'completed'
        : 'started',
      best_accuracy: Math.max(Number(existing?.best_accuracy) || 0, progress.bestAccuracy),
      best_ppm: Math.max(Number(existing?.best_ppm) || 0, progress.bestPpm),
      medal: getBestMedal(existingMedal, progress.medal),
      attempts: Math.max(Number(existing?.attempts) || 0, progress.attempts),
      completed_at: mergedCompletedAt,
    };

    const { data, error } = await supabase
      .from('lesson_progress')
      .upsert(row, { onConflict: 'user_id,lesson_id' })
      .select('*')
      .single<RemoteLessonProgress>();

    return { data, error: error?.message ?? null };
  } catch (error) {
    return errorResult(error);
  }
}

export async function completeLesson(
  userId: string,
  lessonId: string,
  result: { accuracy: number; ppm: number; medal: LessonMedal; completedAt?: string },
): Promise<RemoteRepositoryResult<RemoteLessonProgress>> {
  return upsertLessonProgress(userId, lessonId, {
    status: result.accuracy >= 85 ? 'completed' : 'started',
    bestAccuracy: result.accuracy,
    bestPpm: result.ppm,
    medal: result.medal,
    attempts: 1,
    completedAt: result.completedAt,
  });
}
