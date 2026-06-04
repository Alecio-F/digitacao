import { useCallback, useMemo, useState } from 'react';
import { usePlayerProgress } from '@/features/gamification/hooks/usePlayerProgress';
import { parsePrecision } from '@/features/gamification/logic/xpCalculator';
import { LESSONS } from '@/features/lessons/data/lessons';
import {
  getLessonProgress,
  getNextRecommendedLesson,
} from '@/features/lessons/services/lessonProgressService';
import type { LessonProgressMap } from '@/features/lessons/types';
import { getSealBestScore } from '@/repositories/arcadeScoreRepository';
import {
  clearLocalProgress as clearProgressInStore,
  exportLocalProgress,
} from '@/repositories/profileProgressRepository';

const RECENT_HISTORY_LIMIT = 10;

export interface MedalCounts {
  bronze: number;
  silver: number;
  gold: number;
}

/**
 * Perfil local do jogador. Compõe usePlayerProgress com progresso de fases,
 * recordes e métricas derivadas sem acessar storage diretamente.
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

    return {
      bestAccuracy: Math.round(bestAccuracy),
      totalTrainings: history.length,
      recentHistory: history.slice(0, RECENT_HISTORY_LIMIT),
      completedLessonsCount,
      totalLessonsCount: LESSONS.length,
      medals,
      nextLesson: getNextRecommendedLesson(lessonProgress),
      sealBestScore: getSealBestScore(),
    };
  }, [profile.history, lessonProgress]);

  /** Remove apenas as chaves de progresso; preferências do usuário permanecem. */
  const clearLocalProgress = useCallback(() => {
    clearProgressInStore();
  }, []);

  /** Snapshot dos dados locais de progresso para exportação em JSON. */
  const exportData = useCallback(() => {
    return exportLocalProgress();
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
