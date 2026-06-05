import type { LessonProgress } from '@/features/lessons/types';
import type { RemoteArcadeScoreInput } from '@/repositories/remote/arcadeScoreRemoteRepository';
import type { RemoteTypingResultInput } from '@/repositories/remote/typingResultRemoteRepository';

export type PendingSyncItemType =
  | 'typing_result'
  | 'lesson_progress'
  | 'arcade_score'
  | 'user_achievement';

export type PendingSyncStatus = 'pending' | 'syncing' | 'failed' | 'synced';

export interface PendingSyncItem<TPayload = unknown> {
  id: string;
  type: PendingSyncItemType;
  payload: TPayload;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  lastError?: string | null;
  status: PendingSyncStatus;
  /** Chave de deduplicação simples para evitar itens repetidos na fila. */
  dedupeKey?: string;
}

// ── Payloads por tipo (dados necessários para reenviar) ─────────────────────
export interface TypingResultPayload {
  input: RemoteTypingResultInput;
}

export interface LessonProgressPayload {
  lessonId: string;
  progress: LessonProgress;
}

export interface ArcadeScorePayload {
  /** Id remoto do jogo (ex.: 'panda-keys', 'seal-challenge'). */
  gameId: string;
  input: RemoteArcadeScoreInput;
}

export interface AchievementPayload {
  achievementId: string;
}
