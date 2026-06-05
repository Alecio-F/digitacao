import { getProgressionTitle } from '@/features/gamification/logic/xpCalculator';
import type { HistoryItem } from '@/features/gamification/types';
import type { DailyChallengeResult } from '@/features/dailyChallenge/types';
import { normalizeTrainingResult } from '@/features/typing/logic/normalizeTrainingResult';
import { getCurrentUser } from '@/services/supabase/authService';
import { persistence } from '@/services/persistence/types';
import { PERSISTENCE_KEYS } from '@/services/persistence/persistenceKeys';
import * as arcadeScoreRepository from '@/repositories/arcadeScoreRepository';
import * as lessonProgressRepository from '@/repositories/lessonProgressRepository';
import * as profileProgressRepository from '@/repositories/profileProgressRepository';
import * as typingResultRepository from '@/repositories/typingResultRepository';
import * as arcadeScoreRemoteRepository from '@/repositories/remote/arcadeScoreRemoteRepository';
import * as lessonProgressRemoteRepository from '@/repositories/remote/lessonProgressRemoteRepository';
import * as profileRemoteRepository from '@/repositories/remote/profileRemoteRepository';
import * as typingResultRemoteRepository from '@/repositories/remote/typingResultRemoteRepository';
import * as userAchievementRemoteRepository from '@/repositories/remote/userAchievementRemoteRepository';
import {
  enqueuePendingAchievement,
  enqueuePendingArcadeScore,
  enqueuePendingLessonProgress,
  enqueuePendingTypingResult,
} from './pendingSyncService';

export interface LocalProgressSummary {
  hasProgress: boolean;
  totalResults: number;
  completedLessons: number;
  level: number;
  xp: number;
  bestPpm: number;
  arcadeScores: number;
  achievements: number;
}

export interface ImportLocalProgressResult {
  ok: boolean;
  error: string | null;
  summary: LocalProgressSummary;
  imported: {
    typingResults: number;
    lessonProgress: number;
    arcadeScores: number;
    achievements: number;
    profile: boolean;
  };
}

interface SyncStatus {
  ok: boolean;
  skipped: boolean;
  error: string | null;
}

const REMOTE_GAME_ID: Record<arcadeScoreRepository.ArcadeGameId, string> = {
  'panda-keys': 'panda-keys',
  seal: 'seal-challenge',
};

function safeNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Math.max(0, numberValue) : 0;
}

function parseStoredDate(value: string | undefined): string | null {
  if (!value) return null;

  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day), 12);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  const iso = new Date(value);
  return Number.isNaN(iso.getTime()) ? null : iso.toISOString();
}

function getHistoryCompletedAt(item: HistoryItem): string {
  return item.completedAt ?? parseStoredDate(item.data) ?? new Date().toISOString();
}

function getSyncErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function getMistakeKeys(item: HistoryItem): Record<string, number> {
  if (item.mistakeKeys && typeof item.mistakeKeys === 'object') return item.mistakeKeys;
  return {};
}

function getDailyChallengeResult(): DailyChallengeResult | null {
  const stored = persistence.getItem<DailyChallengeResult | null>(
    PERSISTENCE_KEYS.dailyChallengeResult,
    null,
  );

  if (!stored || typeof stored !== 'object') return null;
  return typeof stored.date === 'string' && typeof stored.ppm === 'number' ? stored : null;
}

function toRemoteTypingInput(item: HistoryItem): typingResultRemoteRepository.RemoteTypingResultInput {
  const normalized = normalizeTrainingResult(item);
  const durationSeconds = Math.max(0, Math.round(safeNumber(normalized.tempo) * 60));
  const accuracy = safeNumber(String(normalized.precisao ?? '0').replace('%', '').replace(',', '.'));

  return {
    mode: normalized.mode ?? (normalized.lessonId ? 'lesson' : 'random'),
    lessonId: normalized.lessonId ?? null,
    practiceTextId: normalized.practiceTextId ?? null,
    dailyChallengeId: normalized.dailyChallengeId ?? null,
    durationSeconds,
    ppm: safeNumber(normalized.ppm),
    cpm: safeNumber(normalized.cpm),
    accuracy,
    errors: safeNumber(normalized.erros),
    maxCombo: safeNumber(normalized.maxCombo ?? normalized.combo),
    mistakeKeys: getMistakeKeys(normalized),
    correctChars: safeNumber(normalized.correctChars),
    wrongChars: safeNumber(normalized.wrongChars),
    rawKeyCount: safeNumber(normalized.rawKeyCount),
    repeatedKeyCount: safeNumber(normalized.repeatedKeyCount),
    validForRanking: normalized.validForRanking !== false,
    rankingScore: safeNumber(normalized.rankingScore),
    suspiciousFlags: { ...(normalized.suspiciousFlags ?? {}) },
    rankingInvalidReasons: normalized.rankingInvalidReasons ?? [],
    completedAt: getHistoryCompletedAt(normalized),
  };
}

function toDailyHistoryItem(result: DailyChallengeResult): HistoryItem {
  return {
    ppm: result.ppm,
    cpm: result.cpm,
    precisao: `${result.accuracy}%`,
    erros: result.errors,
    tempo: result.durationSeconds / 60,
    mode: 'daily-challenge',
    dailyChallengeId: result.challengeId,
    data: parseStoredDate(result.completedAt)
      ? new Date(result.completedAt).toLocaleDateString('pt-BR')
      : result.date,
    completedAt: result.completedAt,
    maxCombo: result.maxCombo,
    combo: result.maxCombo,
    validForRanking: result.validForRanking ?? true,
    rankingScore: result.rankingScore ?? 0,
    rankingInvalidReasons: result.rankingInvalidReasons ?? [],
    suspiciousFlags: result.suspiciousFlags,
  };
}

async function getAuthenticatedUserId(): Promise<string | null> {
  const result = await getCurrentUser();
  return result.data?.id ?? null;
}

function buildSummary(): LocalProgressSummary {
  const history = typingResultRepository.getHistory();
  const normalizedHistory = history.map(normalizeTrainingResult);
  const lessonProgress = lessonProgressRepository.getLessonProgress();
  const profile = profileProgressRepository.getProfileProgress();
  const pandaKeysScore = arcadeScoreRepository.getPandaKeysBestScore();
  const sealScore = arcadeScoreRepository.getSealBestScore();
  const achievements = profileProgressRepository.getAchievements();
  const dailyResult = getDailyChallengeResult();
  const completedLessons = Object.values(lessonProgress)
    .filter((entry) => entry.status === 'completed').length;
  const arcadeScores = [pandaKeysScore, sealScore].filter((score) => score > 0).length;
  const bestPpm = normalizedHistory.reduce(
    (best, item) => Math.max(best, safeNumber(item.ppm)),
    0,
  );

  return {
    hasProgress: (
      history.length > 0 ||
      profile.xp > 0 ||
      profile.level > 1 ||
      completedLessons > 0 ||
      arcadeScores > 0 ||
      achievements.length > 0 ||
      Boolean(dailyResult)
    ),
    totalResults: history.length,
    completedLessons,
    level: profile.level,
    xp: profile.xp,
    bestPpm,
    arcadeScores,
    achievements: achievements.length,
  };
}

function emptyImportResult(summary: LocalProgressSummary): ImportLocalProgressResult {
  return {
    ok: true,
    error: null,
    summary,
    imported: {
      typingResults: 0,
      lessonProgress: 0,
      arcadeScores: 0,
      achievements: 0,
      profile: false,
    },
  };
}

function failedImportResult(
  summary: LocalProgressSummary,
  error: string,
  imported: ImportLocalProgressResult['imported'],
): ImportLocalProgressResult {
  return { ok: false, error, summary, imported };
}

export function hasImportedLocalProgress(): boolean {
  const stored = persistence.getItem<boolean | string>(
    PERSISTENCE_KEYS.cloudSyncImported,
    false,
  );
  return stored === true || stored === 'true';
}

export function markLocalProgressImported(): void {
  persistence.setItem(PERSISTENCE_KEYS.cloudSyncImported, true);
}

export function getLocalProgressSummary(): LocalProgressSummary {
  return buildSummary();
}

export function hasLocalProgress(): boolean {
  return getLocalProgressSummary().hasProgress;
}

export async function importLocalProgressToSupabase(
  userId: string,
): Promise<ImportLocalProgressResult> {
  const summary = getLocalProgressSummary();
  const imported = emptyImportResult(summary).imported;
  if (!summary.hasProgress) {
    markLocalProgressImported();
    return emptyImportResult(summary);
  }

  const profile = profileProgressRepository.getProfileProgress();
  const profileResult = await profileRemoteRepository.mergeProfileProgress(userId, {
    xp: profile.xp,
    level: profile.level,
    title: getProgressionTitle(profile.level),
    dailyStreak: profile.dailyStreak,
    lastTrainingDate: profile.lastTrainingDate,
  });
  if (profileResult.error) {
    return failedImportResult(summary, profileResult.error, imported);
  }
  imported.profile = true;

  const history = typingResultRepository.getHistory().map(normalizeTrainingResult).reverse();
  for (const item of history) {
    const result = await typingResultRemoteRepository.saveTypingResult(
      userId,
      toRemoteTypingInput(item),
    );
    if (result.error) return failedImportResult(summary, result.error, imported);
    imported.typingResults += 1;
  }

  const dailyResult = getDailyChallengeResult();
  const dailyAlreadyInHistory = dailyResult
    ? history.some((item) => item.dailyChallengeId === dailyResult.challengeId)
    : true;
  if (dailyResult && !dailyAlreadyInHistory) {
    const result = await typingResultRemoteRepository.saveTypingResult(
      userId,
      toRemoteTypingInput(toDailyHistoryItem(dailyResult)),
    );
    if (result.error) return failedImportResult(summary, result.error, imported);
    imported.typingResults += 1;
  }

  const lessonProgress = lessonProgressRepository.getLessonProgress();
  for (const [lessonId, progress] of Object.entries(lessonProgress)) {
    const result = await lessonProgressRemoteRepository.upsertLessonProgress(
      userId,
      lessonId,
      progress,
    );
    if (result.error) return failedImportResult(summary, result.error, imported);
    imported.lessonProgress += 1;
  }

  const pandaKeysScore = arcadeScoreRepository.getPandaKeysBestScore();
  if (pandaKeysScore > 0) {
    const result = await arcadeScoreRemoteRepository.saveArcadeScore(
      userId,
      REMOTE_GAME_ID['panda-keys'],
      pandaKeysScore,
    );
    if (result.error) return failedImportResult(summary, result.error, imported);
    imported.arcadeScores += 1;
  }

  const sealScore = arcadeScoreRepository.getSealBestScore();
  if (sealScore > 0) {
    const result = await arcadeScoreRemoteRepository.saveArcadeScore(
      userId,
      REMOTE_GAME_ID.seal,
      sealScore,
    );
    if (result.error) return failedImportResult(summary, result.error, imported);
    imported.arcadeScores += 1;
  }

  for (const achievementId of profileProgressRepository.getAchievements()) {
    const result = await userAchievementRemoteRepository.unlockAchievement(userId, achievementId);
    if (result.error) return failedImportResult(summary, result.error, imported);
    imported.achievements += 1;
  }

  markLocalProgressImported();
  return { ok: true, error: null, summary, imported };
}

export async function syncTypingResultToSupabase(result: HistoryItem): Promise<SyncStatus> {
  let input: typingResultRemoteRepository.RemoteTypingResultInput | null = null;

  try {
    input = toRemoteTypingInput(result);
    const userId = await getAuthenticatedUserId();
    if (!userId) return { ok: true, skipped: true, error: null };

    const remoteResult = await typingResultRemoteRepository.saveTypingResult(userId, input);
    if (remoteResult.error) enqueuePendingTypingResult(input);

    return {
      ok: !remoteResult.error,
      skipped: false,
      error: remoteResult.error,
    };
  } catch (error) {
    if (input) enqueuePendingTypingResult(input);
    return {
      ok: false,
      skipped: false,
      error: getSyncErrorMessage(error, 'Falha ao sincronizar resultado.'),
    };
  }
}

export async function syncProfileProgressToSupabase(): Promise<SyncStatus> {
  let pendingAchievements: string[] = [];

  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return { ok: true, skipped: true, error: null };

    const profile = profileProgressRepository.getProfileProgress();
    pendingAchievements = profile.achievements;
    const profileResult = await profileRemoteRepository.mergeProfileProgress(userId, {
      xp: profile.xp,
      level: profile.level,
      title: getProgressionTitle(profile.level),
      dailyStreak: profile.dailyStreak,
      lastTrainingDate: profile.lastTrainingDate,
    });
    if (profileResult.error) {
      pendingAchievements.forEach(enqueuePendingAchievement);
      return { ok: false, skipped: false, error: profileResult.error };
    }

    for (const achievementId of profile.achievements) {
      const achievementResult = await userAchievementRemoteRepository.unlockAchievement(
        userId,
        achievementId,
      );
      if (achievementResult.error) enqueuePendingAchievement(achievementId);
    }

    return { ok: true, skipped: false, error: null };
  } catch (error) {
    pendingAchievements.forEach(enqueuePendingAchievement);
    return {
      ok: false,
      skipped: false,
      error: getSyncErrorMessage(error, 'Falha ao sincronizar perfil.'),
    };
  }
}

export async function syncLessonProgressToSupabase(lessonId: string): Promise<SyncStatus> {
  const progress = lessonProgressRepository.getLessonProgress()[lessonId];
  if (!progress) return { ok: true, skipped: true, error: null };

  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return { ok: true, skipped: true, error: null };

    const result = await lessonProgressRemoteRepository.upsertLessonProgress(
      userId,
      lessonId,
      progress,
    );
    if (result.error) enqueuePendingLessonProgress(lessonId, progress);

    return {
      ok: !result.error,
      skipped: false,
      error: result.error,
    };
  } catch (error) {
    enqueuePendingLessonProgress(lessonId, progress);
    return {
      ok: false,
      skipped: false,
      error: getSyncErrorMessage(error, 'Falha ao sincronizar fase.'),
    };
  }
}

export async function syncArcadeScoreToSupabase(
  gameId: arcadeScoreRepository.ArcadeGameId,
  score: number,
  metadata: { maxCombo?: number; levelReached?: number } = {},
): Promise<SyncStatus> {
  if (score <= 0) return { ok: true, skipped: true, error: null };

  const remoteGameId = REMOTE_GAME_ID[gameId];
  const input = {
    score,
    maxCombo: metadata.maxCombo,
    levelReached: metadata.levelReached,
  };

  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return { ok: true, skipped: true, error: null };

    const result = await arcadeScoreRemoteRepository.saveArcadeScore(userId, remoteGameId, input);
    if (result.error) enqueuePendingArcadeScore(remoteGameId, input);

    return {
      ok: !result.error,
      skipped: false,
      error: result.error,
    };
  } catch (error) {
    enqueuePendingArcadeScore(remoteGameId, input);
    return {
      ok: false,
      skipped: false,
      error: getSyncErrorMessage(error, 'Falha ao sincronizar recorde.'),
    };
  }
}
