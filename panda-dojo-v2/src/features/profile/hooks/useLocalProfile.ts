import { useCallback, useMemo, useState } from 'react';
import { KEYS } from '@/constants';
import { usePlayerProgress } from '@/features/gamification/hooks/usePlayerProgress';
import { parsePrecision } from '@/features/gamification/logic/xpCalculator';
import { LESSONS } from '@/features/lessons/data/lessons';
import {
  getLessonProgress,
  getNextRecommendedLesson,
} from '@/features/lessons/services/lessonProgressService';
import type { LessonProgressMap } from '@/features/lessons/types';
import { getStorage, removeStorage } from '@/services/storage/storageService';

const RECENT_HISTORY_LIMIT = 10;

/**
 * Chaves locais do PandaDigitações que representam PROGRESSO do jogador.
 * Preferências (tema, sons, cursor, tempo de treino) não entram aqui — limpar
 * progresso não deve apagar configurações do usuário.
 */
const PROGRESS_KEYS = [
  KEYS.xp,
  KEYS.level,
  KEYS.achievements,
  KEYS.dailyStreak,
  KEYS.lastTrainingDate,
  KEYS.lastMistakes,
  KEYS.historico,
  KEYS.lessonProgress,
  KEYS.gameBestScore,
  KEYS.sealBestScore,
  KEYS.dailyMissions,
  KEYS.missionDate,
  KEYS.recommendations,
  KEYS.startedLessons,
  KEYS.xpAwards,
] as const;

export interface MedalCounts {
  bronze: number;
  silver: number;
  gold: number;
}

/**
 * Perfil local do jogador. Compõe usePlayerProgress (XP, nível, conquistas,
 * histórico) com o progresso das fases e algumas métricas derivadas, sem
 * duplicar a leitura já feita pelo hook de gamificação.
 */
export function useLocalProfile() {
  const profile = usePlayerProgress();
  const [lessonProgress] = useState<LessonProgressMap>(() => getLessonProgress());

  const derived = useMemo(() => {
    const history = profile.history;
    const bestAccuracy = history.reduce(
      (best, item) => Math.max(best, parsePrecision(item.precisao)),
      0,
    );

    const entries = Object.values(lessonProgress);
    const completedLessonsCount = entries.filter((entry) => entry.status === 'completed').length;
    const medals = entries.reduce<MedalCounts>(
      (acc, entry) => {
        if (entry.medal === 'bronze') acc.bronze += 1;
        else if (entry.medal === 'silver') acc.silver += 1;
        else if (entry.medal === 'gold') acc.gold += 1;
        return acc;
      },
      { bronze: 0, silver: 0, gold: 0 },
    );

    const sealBestScore = Number(getStorage<string>(KEYS.sealBestScore, '0')) || 0;

    return {
      bestAccuracy: Math.round(bestAccuracy),
      totalTrainings: history.length,
      recentHistory: history.slice(0, RECENT_HISTORY_LIMIT),
      completedLessonsCount,
      totalLessonsCount: LESSONS.length,
      medals,
      nextLesson: getNextRecommendedLesson(lessonProgress),
      sealBestScore,
    };
  }, [profile.history, lessonProgress]);

  /** Remove apenas as chaves de progresso do PandaDigitações. */
  const clearLocalProgress = useCallback(() => {
    for (const key of PROGRESS_KEYS) removeStorage(key);
  }, []);

  /** Snapshot dos dados locais de progresso para exportação (download JSON). */
  const exportData = useCallback(() => {
    const snapshot: Record<string, unknown> = {};
    for (const key of PROGRESS_KEYS) {
      const value = getStorage<unknown>(key, null);
      if (value !== null) snapshot[key] = value;
    }
    return snapshot;
  }, []);

  return {
    ...profile,
    ...derived,
    lessonProgress,
    achievementsCount: profile.achievementDetails.length,
    pandaKeysBestScore: profile.gameBestScore,
    clearLocalProgress,
    exportData,
  };
}

export type LocalProfile = ReturnType<typeof useLocalProfile>;
