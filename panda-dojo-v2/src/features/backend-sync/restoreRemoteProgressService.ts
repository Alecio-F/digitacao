import { getProgressionTitle } from '@/features/gamification/logic/xpCalculator';
import type { HistoryItem } from '@/features/gamification/types';
import type { LessonMedal, LessonProgress, LessonProgressMap } from '@/features/lessons/types';
import type { RankingInvalidReason } from '@/features/typing/types';
import type {
  RemoteArcadeScore,
  RemoteProfile,
  RemoteTypingResult,
} from '@/services/supabase/types';
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
import { markLocalProgressImported } from './syncLocalProgressService';

export interface RemoteProgressSummary {
  hasRemoteProgress: boolean;
  profile: {
    level: number;
    xp: number;
    title: string;
    dailyStreak: number;
  };
  totalResults: number;
  completedLessons: number;
  arcadeScores: number;
  achievements: number;
  bestPpm: number;
}

export interface RemoteProgressSummaryResult {
  ok: boolean;
  error: string | null;
  summary: RemoteProgressSummary;
}

export interface RestoreProgressResult {
  ok: boolean;
  error: string | null;
  restored: {
    typingResults: number;
    lessonProgress: number;
    arcadeScores: number;
    achievements: number;
    profile: boolean;
  };
}

// Mapeamento dos ids de jogo: remoto -> local.
const LOCAL_GAME_ID: Record<string, arcadeScoreRepository.ArcadeGameId> = {
  'panda-keys': 'panda-keys',
  'seal-challenge': 'seal',
};

const MEDAL_RANK: Record<LessonMedal, number> = {
  none: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
};

function safeNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Math.max(0, numberValue) : 0;
}

const EMPTY_SUMMARY: RemoteProgressSummary = {
  hasRemoteProgress: false,
  profile: { level: 1, xp: 0, title: getProgressionTitle(1), dailyStreak: 0 },
  totalResults: 0,
  completedLessons: 0,
  arcadeScores: 0,
  achievements: 0,
  bestPpm: 0,
};

// ── Flags ───────────────────────────────────────────────────────────────────
export function hasCompletedRestore(): boolean {
  const stored = persistence.getItem<boolean | string>(PERSISTENCE_KEYS.cloudRestoreCompleted, false);
  return stored === true || stored === 'true';
}

export function markRestoreCompleted(): void {
  persistence.setItem(PERSISTENCE_KEYS.cloudRestoreCompleted, true);
}

// ── Mapeamento remoto -> local ──────────────────────────────────────────────
function fromRemoteTypingResult(row: RemoteTypingResult): HistoryItem {
  const completedAt = row.completed_at ?? new Date().toISOString();
  return {
    ppm: safeNumber(row.ppm),
    cpm: safeNumber(row.cpm),
    precisao: `${Math.round(safeNumber(row.accuracy))}%`,
    erros: safeNumber(row.errors),
    tempo: safeNumber(row.duration_seconds) / 60,
    lessonId: row.lesson_id ?? undefined,
    mode: (row.mode as HistoryItem['mode']) ?? 'random',
    practiceTextId: row.practice_text_id ?? undefined,
    dailyChallengeId: row.daily_challenge_id ?? undefined,
    data: new Date(completedAt).toLocaleDateString('pt-BR'),
    completedAt,
    combo: safeNumber(row.max_combo),
    maxCombo: safeNumber(row.max_combo),
    mistakeKeys: row.mistake_keys ?? {},
    correctChars: safeNumber(row.correct_chars),
    wrongChars: safeNumber(row.wrong_chars),
    rawKeyCount: safeNumber(row.raw_key_count),
    repeatedKeyCount: safeNumber(row.repeated_key_count),
    validForRanking: row.valid_for_ranking !== false,
    rankingScore: safeNumber(row.ranking_score),
    rankingInvalidReasons: (row.ranking_invalid_reasons ?? []) as RankingInvalidReason[],
    // suspiciousFlags é informativo (share/diagnóstico); o ranking usa
    // validForRanking/rankingScore, que já são preservados acima.
  };
}

function historyKey(item: HistoryItem): string {
  return `${item.completedAt ?? item.data ?? ''}|${item.ppm}|${item.mode ?? ''}|${item.lessonId ?? ''}`;
}

function completedAtMs(item: HistoryItem): number {
  const parsed = Date.parse(item.completedAt ?? '');
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mergeLessonProgress(
  local: LessonProgress | undefined,
  remote: LessonProgress,
): LessonProgress {
  const completed = local?.status === 'completed' || remote.status === 'completed';
  const localMedal = local?.medal ?? 'none';
  const medal = MEDAL_RANK[remote.medal] > MEDAL_RANK[localMedal] ? remote.medal : localMedal;
  return {
    status: completed ? 'completed' : 'started',
    bestAccuracy: Math.max(local?.bestAccuracy ?? 0, remote.bestAccuracy),
    bestPpm: Math.max(local?.bestPpm ?? 0, remote.bestPpm),
    medal,
    attempts: Math.max(local?.attempts ?? 0, remote.attempts),
    completedAt: local?.completedAt ?? remote.completedAt,
  };
}

// ── Resumo remoto ───────────────────────────────────────────────────────────
function buildRemoteSummary(
  profile: RemoteProfile | null,
  results: RemoteTypingResult[],
  lessons: LessonProgressMap,
  arcade: RemoteArcadeScore[],
  achievementsCount: number,
): RemoteProgressSummary {
  const completedLessons = Object.values(lessons).filter((e) => e.status === 'completed').length;
  const arcadeGameIds = new Set(arcade.filter((s) => safeNumber(s.score) > 0).map((s) => s.game_id));
  const bestPpm = results.reduce((best, r) => Math.max(best, safeNumber(r.ppm)), 0);
  const level = Math.max(1, safeNumber(profile?.level) || 1);
  const xp = safeNumber(profile?.xp);

  return {
    hasRemoteProgress:
      results.length > 0 ||
      completedLessons > 0 ||
      arcadeGameIds.size > 0 ||
      achievementsCount > 0 ||
      xp > 0 ||
      level > 1,
    profile: {
      level,
      xp,
      title: profile?.title?.trim() || getProgressionTitle(level),
      dailyStreak: safeNumber(profile?.daily_streak),
    },
    totalResults: results.length,
    completedLessons,
    arcadeScores: arcadeGameIds.size,
    achievements: achievementsCount,
    bestPpm,
  };
}

export async function getRemoteProgressSummary(
  userId: string,
): Promise<RemoteProgressSummaryResult> {
  try {
    const [profileRes, resultsRes, lessonsRes, arcadeRes, achievementsRes] = await Promise.all([
      profileRemoteRepository.getProfile(userId),
      typingResultRemoteRepository.getUserTypingResults(userId, 200),
      lessonProgressRemoteRepository.getLessonProgress(userId),
      arcadeScoreRemoteRepository.getArcadeScores(userId),
      userAchievementRemoteRepository.getUserAchievements(userId),
    ]);

    const firstError =
      profileRes.error ??
      resultsRes.error ??
      lessonsRes.error ??
      arcadeRes.error ??
      achievementsRes.error;
    if (firstError) {
      return { ok: false, error: firstError, summary: EMPTY_SUMMARY };
    }

    const summary = buildRemoteSummary(
      profileRes.data,
      resultsRes.data ?? [],
      lessonsRes.data ?? {},
      arcadeRes.data ?? [],
      (achievementsRes.data ?? []).length,
    );

    return { ok: true, error: null, summary };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Falha ao buscar progresso remoto.',
      summary: EMPTY_SUMMARY,
    };
  }
}

export async function hasRemoteProgress(userId: string): Promise<boolean> {
  const result = await getRemoteProgressSummary(userId);
  return result.ok && result.summary.hasRemoteProgress;
}

// ── Restauração ─────────────────────────────────────────────────────────────
const FAILED_RESTORE: RestoreProgressResult['restored'] = {
  typingResults: 0,
  lessonProgress: 0,
  arcadeScores: 0,
  achievements: 0,
  profile: false,
};

/**
 * Reconstrói o progresso local a partir do Supabase.
 *
 * Regras (sem merge complexo, sem perda de dados):
 * - histórico: une local + remoto sem duplicar, ordena por data e mantém o limite local;
 * - perfil/fases/recordes: mantém sempre o MELHOR entre local e remoto (nunca reduz);
 * - conquistas: união (sem duplicar);
 * - não apaga localStorage.
 */
export async function restoreRemoteProgressToLocal(
  userId: string,
): Promise<RestoreProgressResult> {
  try {
    const [profileRes, resultsRes, lessonsRes, arcadeRes, achievementsRes] = await Promise.all([
      profileRemoteRepository.getProfile(userId),
      typingResultRemoteRepository.getUserTypingResults(userId, 200),
      lessonProgressRemoteRepository.getLessonProgress(userId),
      arcadeScoreRemoteRepository.getArcadeScores(userId),
      userAchievementRemoteRepository.getUserAchievements(userId),
    ]);

    const firstError =
      profileRes.error ??
      resultsRes.error ??
      lessonsRes.error ??
      arcadeRes.error ??
      achievementsRes.error;
    if (firstError) {
      return { ok: false, error: firstError, restored: FAILED_RESTORE };
    }

    const restored = { ...FAILED_RESTORE };

    // 1. Histórico (une local + remoto, sem duplicar)
    const remoteHistory = (resultsRes.data ?? []).map(fromRemoteTypingResult);
    const localHistory = typingResultRepository.getHistory();
    const seen = new Set(localHistory.map(historyKey));
    const merged = [...localHistory];
    for (const item of remoteHistory) {
      const key = historyKey(item);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
    merged.sort((a, b) => completedAtMs(b) - completedAtMs(a));
    typingResultRepository.setHistory(merged);
    restored.typingResults = remoteHistory.length;

    // 2. Perfil (mantém o maior)
    const remoteProfile = profileRes.data;
    const localProfile = profileProgressRepository.getProfileProgress();
    const lastTrainingDate =
      [localProfile.lastTrainingDate, remoteProfile?.last_training_date ?? '']
        .filter(Boolean)
        .sort()
        .at(-1) ?? '';
    profileProgressRepository.updateProfileProgress({
      xp: Math.max(localProfile.xp, safeNumber(remoteProfile?.xp)),
      level: Math.max(localProfile.level, Math.max(1, safeNumber(remoteProfile?.level) || 1)),
      dailyStreak: Math.max(localProfile.dailyStreak, safeNumber(remoteProfile?.daily_streak)),
      lastTrainingDate,
    });
    restored.profile = true;

    // 3. Fases do Mapa (mantém o melhor)
    const remoteLessons = lessonsRes.data ?? {};
    const localLessons = lessonProgressRepository.getLessonProgress();
    const mergedLessons: LessonProgressMap = { ...localLessons };
    for (const [lessonId, remote] of Object.entries(remoteLessons)) {
      mergedLessons[lessonId] = mergeLessonProgress(localLessons[lessonId], remote);
      restored.lessonProgress += 1;
    }
    lessonProgressRepository.saveLessonProgress(mergedLessons);

    // 4. Recordes do Arcade (best-of, nunca reduz)
    const bestByGame = new Map<string, number>();
    for (const score of arcadeRes.data ?? []) {
      const current = bestByGame.get(score.game_id) ?? 0;
      bestByGame.set(score.game_id, Math.max(current, safeNumber(score.score)));
    }
    for (const [remoteGameId, score] of bestByGame) {
      const localGameId = LOCAL_GAME_ID[remoteGameId];
      if (!localGameId || score <= 0) continue;
      arcadeScoreRepository.saveScore(localGameId, score);
      restored.arcadeScores += 1;
    }

    // 5. Conquistas (união)
    const remoteAchievements = achievementsRes.data ?? [];
    if (remoteAchievements.length > 0) {
      const localAch = new Set(profileProgressRepository.getAchievements());
      for (const entry of remoteAchievements) localAch.add(entry.achievement_id);
      profileProgressRepository.updateProfileProgress({ achievements: [...localAch] });
      restored.achievements = remoteAchievements.length;
    }

    // 6. Flags: restaurado e já em sincronia com a nuvem.
    markRestoreCompleted();
    markLocalProgressImported();

    return { ok: true, error: null, restored };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Falha ao restaurar progresso.',
      restored: FAILED_RESTORE,
    };
  }
}
