import { useMemo } from 'react';
import { KEYS, XP_PER_LEVEL } from '@/constants';
import { getStorage } from '@/services/storage/storageService';
import { getAchievementById, getUnlockedAchievements } from '../logic/achievementChecker';
import {
  calculateLevel,
  deriveXpFromHistory,
  getNextProgressionTitle,
  getProgressionTitle,
} from '../logic/xpCalculator';
import type { DojoProfile, HistoryItem } from '../types';

export function usePlayerProgress(): DojoProfile {
  return useMemo(() => {
    const history = getStorage<HistoryItem[]>(KEYS.historico, []);
    const safeHistory = Array.isArray(history) ? history : [];

    const storedXp = Number(getStorage<string>(KEYS.xp, '0'));
    const xp = Number.isFinite(storedXp) && storedXp > 0 ? storedXp : deriveXpFromHistory(safeHistory);

    const level = calculateLevel(xp);
    const storedAchievements = getStorage<string[]>(KEYS.achievements, []);
    const achievements = getUnlockedAchievements(safeHistory, Array.isArray(storedAchievements) ? storedAchievements : []);

    const bestPpm = safeHistory.reduce((best, item) => Math.max(best, Number(item.ppm) || 0), 0);
    const lastResult = safeHistory[0] ?? null;
    const lastPrecision = lastResult ? String(lastResult.precisao ?? '0%') : '0%';

    const nextLevelXp = level * XP_PER_LEVEL;
    const previousLevelXp = (level - 1) * XP_PER_LEVEL;
    const currentLevelXp = Math.max(0, xp - previousLevelXp);
    const requiredForLevel = Math.max(1, nextLevelXp - previousLevelXp);
    const progressPercent = Math.min(100, Math.round((currentLevelXp / requiredForLevel) * 100));

    const lastMistakes = getStorage<[string, number][]>(KEYS.lastMistakes, []);

    return {
      xp,
      level,
      title: getProgressionTitle(level),
      nextTitle: getNextProgressionTitle(level),
      progressPercent,
      currentLevelXp,
      requiredForLevel,
      achievements,
      achievementDetails: achievements.map(getAchievementById).filter(Boolean) as NonNullable<ReturnType<typeof getAchievementById>>[],
      dailyStreak: Number(getStorage<string>(KEYS.dailyStreak, '0')) || 0,
      lastTrainingDate: getStorage<string>(KEYS.lastTrainingDate, ''),
      bestPpm,
      lastPrecision,
      lastResult,
      history: safeHistory,
      lastMistakes: Array.isArray(lastMistakes) ? lastMistakes : [],
      gameBestScore: Number(getStorage<string>(KEYS.gameBestScore, '0')) || 0,
    };
  }, []);
}
