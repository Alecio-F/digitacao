import { useMemo } from 'react';
import { XP_PER_LEVEL } from '@/constants';
import * as arcadeScoreRepository from '@/repositories/arcadeScoreRepository';
import * as profileProgressRepository from '@/repositories/profileProgressRepository';
import * as typingResultRepository from '@/repositories/typingResultRepository';
import { getAchievementById, getUnlockedAchievements } from '../logic/achievementChecker';
import {
  calculateLevel,
  deriveXpFromHistory,
  getNextProgressionTitle,
  getProgressionTitle,
} from '../logic/xpCalculator';
import type { DojoProfile } from '../types';

export function usePlayerProgress(): DojoProfile {
  return useMemo(() => {
    const safeHistory = typingResultRepository.getHistory();

    const storedXp = profileProgressRepository.getXp();
    const xp = storedXp > 0 ? storedXp : deriveXpFromHistory(safeHistory);

    const level = calculateLevel(xp);
    const achievements = getUnlockedAchievements(safeHistory, profileProgressRepository.getAchievements());

    const bestPpm = safeHistory.reduce((best, item) => Math.max(best, Number(item.ppm) || 0), 0);
    const lastResult = safeHistory[0] ?? null;
    const lastPrecision = lastResult ? String(lastResult.precisao ?? '0%') : '0%';

    const nextLevelXp = level * XP_PER_LEVEL;
    const previousLevelXp = (level - 1) * XP_PER_LEVEL;
    const currentLevelXp = Math.max(0, xp - previousLevelXp);
    const requiredForLevel = Math.max(1, nextLevelXp - previousLevelXp);
    const progressPercent = Math.min(100, Math.round((currentLevelXp / requiredForLevel) * 100));

    return {
      xp,
      level,
      title: getProgressionTitle(level),
      nextTitle: getNextProgressionTitle(level),
      progressPercent,
      currentLevelXp,
      requiredForLevel,
      achievements,
      achievementDetails: achievements
        .map(getAchievementById)
        .filter(Boolean) as NonNullable<ReturnType<typeof getAchievementById>>[],
      dailyStreak: profileProgressRepository.getDailyStreak(),
      lastTrainingDate: profileProgressRepository.getLastTrainingDate(),
      bestPpm,
      lastPrecision,
      lastResult,
      history: safeHistory,
      lastMistakes: profileProgressRepository.getLastMistakes(),
      gameBestScore: arcadeScoreRepository.getPandaKeysBestScore(),
    };
  }, []);
}
