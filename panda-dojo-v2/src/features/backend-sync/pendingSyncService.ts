import { supabase } from '@/services/supabase/supabaseClient';
import type { LessonProgress } from '@/features/lessons/types';
import * as pendingSyncRepository from '@/repositories/pendingSyncRepository';
import * as arcadeScoreRemoteRepository from '@/repositories/remote/arcadeScoreRemoteRepository';
import type { RemoteArcadeScoreInput } from '@/repositories/remote/arcadeScoreRemoteRepository';
import * as lessonProgressRemoteRepository from '@/repositories/remote/lessonProgressRemoteRepository';
import * as typingResultRemoteRepository from '@/repositories/remote/typingResultRemoteRepository';
import type { RemoteTypingResultInput } from '@/repositories/remote/typingResultRemoteRepository';
import * as userAchievementRemoteRepository from '@/repositories/remote/userAchievementRemoteRepository';
import type {
  AchievementPayload,
  ArcadeScorePayload,
  LessonProgressPayload,
  PendingSyncItem,
  PendingSyncItemType,
  TypingResultPayload,
} from './pendingSyncTypes';

/** Tentativas automáticas antes de marcar o item como esgotado. */
const MAX_ATTEMPTS = 5;

let isFlushing = false;

function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `psi_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function enqueue(
  type: PendingSyncItemType,
  payload: unknown,
  dedupeKey: string,
): void {
  const now = new Date().toISOString();
  pendingSyncRepository.addPendingSyncItem({
    id: makeId(),
    type,
    payload,
    dedupeKey,
    createdAt: now,
    updatedAt: now,
    attempts: 0,
    lastError: null,
    status: 'pending',
  });
}

// ── Enfileiramento ──────────────────────────────────────────────────────────
export function enqueuePendingTypingResult(input: RemoteTypingResultInput): void {
  const payload: TypingResultPayload = { input };
  enqueue(
    'typing_result',
    payload,
    `typing:${input.completedAt}:${input.mode}:${input.ppm}:${input.accuracy}`,
  );
}

export function enqueuePendingLessonProgress(lessonId: string, progress: LessonProgress): void {
  const payload: LessonProgressPayload = { lessonId, progress };
  enqueue('lesson_progress', payload, `lesson:${lessonId}`);
}

export function enqueuePendingArcadeScore(gameId: string, input: RemoteArcadeScoreInput): void {
  const payload: ArcadeScorePayload = { gameId, input };
  enqueue('arcade_score', payload, `arcade:${gameId}:${input.score}`);
}

export function enqueuePendingAchievement(achievementId: string): void {
  const payload: AchievementPayload = { achievementId };
  enqueue('user_achievement', payload, `ach:${achievementId}`);
}

export function getPendingSyncCount(): number {
  return pendingSyncRepository.getPendingSyncCount();
}

// ── Flush ──────────────────────────────────────────────────────────────────
export interface FlushResult {
  ok: boolean;
  skipped: boolean;
  attempted: number;
  synced: number;
  failed: number;
  remaining: number;
}

interface FlushOptions {
  /** Fluxo manual: permite tentar itens que ja atingiram o limite automatico. */
  retryExhausted?: boolean;
}

async function sendItem(userId: string, item: PendingSyncItem): Promise<string | null> {
  switch (item.type) {
    case 'typing_result': {
      const { input } = item.payload as TypingResultPayload;
      const result = await typingResultRemoteRepository.saveTypingResult(userId, input);
      return result.error;
    }
    case 'lesson_progress': {
      const { lessonId, progress } = item.payload as LessonProgressPayload;
      const result = await lessonProgressRemoteRepository.upsertLessonProgress(
        userId,
        lessonId,
        progress,
      );
      return result.error;
    }
    case 'arcade_score': {
      const { gameId, input } = item.payload as ArcadeScorePayload;
      const result = await arcadeScoreRemoteRepository.saveArcadeScore(userId, gameId, input);
      return result.error;
    }
    case 'user_achievement': {
      const { achievementId } = item.payload as AchievementPayload;
      const result = await userAchievementRemoteRepository.unlockAchievement(userId, achievementId);
      return result.error;
    }
    default:
      return 'Tipo de item desconhecido.';
  }
}

/**
 * Tenta reenviar os itens pendentes da fila. Não trava o app: cada item é
 * tentado de forma independente e uma falha não impede os próximos. Itens que
 * já atingiram o limite de tentativas são ignorados.
 */
export async function flushPendingSyncQueue(
  userId: string,
  options: FlushOptions = {},
): Promise<FlushResult> {
  const baseRemaining = pendingSyncRepository.getPendingSyncCount();

  // Sem Supabase configurado ou sem usuário: não há para onde enviar.
  if (!supabase || !userId) {
    return { ok: true, skipped: true, attempted: 0, synced: 0, failed: 0, remaining: baseRemaining };
  }

  // Evita flushes concorrentes (mount + evento online ao mesmo tempo).
  if (isFlushing) {
    return { ok: true, skipped: true, attempted: 0, synced: 0, failed: 0, remaining: baseRemaining };
  }
  isFlushing = true;

  let attempted = 0;
  let synced = 0;
  let failed = 0;

  try {
    const queue = pendingSyncRepository
      .getPendingSyncQueue()
      .filter((item) => (
        item.status !== 'synced' &&
        (options.retryExhausted || item.attempts < MAX_ATTEMPTS)
      ));

    for (const item of queue) {
      attempted += 1;
      pendingSyncRepository.markPendingSyncItemSyncing(item.id);
      try {
        const error = await sendItem(userId, item);
        if (error) {
          pendingSyncRepository.markPendingSyncItemFailed(item.id, error);
          failed += 1;
        } else {
          pendingSyncRepository.removePendingSyncItem(item.id);
          synced += 1;
        }
      } catch (error) {
        pendingSyncRepository.markPendingSyncItemFailed(
          item.id,
          error instanceof Error ? error.message : 'Falha ao sincronizar item.',
        );
        failed += 1;
      }
    }
  } finally {
    isFlushing = false;
  }

  return {
    ok: failed === 0,
    skipped: false,
    attempted,
    synced,
    failed,
    remaining: pendingSyncRepository.getPendingSyncCount(),
  };
}
