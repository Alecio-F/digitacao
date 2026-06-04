import { persistence } from '@/services/persistence/types';
import { PERSISTENCE_KEYS } from '@/services/persistence/persistenceKeys';

/**
 * Repositório do progresso do jogador (XP, nível, sequência diária, conquistas).
 * XP e nível são armazenados como string (compatível com o formato já gravado).
 */

export interface ProfileProgress {
  xp: number;
  level: number;
  achievements: string[];
  dailyStreak: number;
  lastTrainingDate: string;
}

const LOCAL_PROGRESS_KEYS = [
  PERSISTENCE_KEYS.xp,
  PERSISTENCE_KEYS.level,
  PERSISTENCE_KEYS.achievements,
  PERSISTENCE_KEYS.dailyStreak,
  PERSISTENCE_KEYS.lastTrainingDate,
  PERSISTENCE_KEYS.lastMistakes,
  PERSISTENCE_KEYS.history,
  PERSISTENCE_KEYS.lessonProgress,
  PERSISTENCE_KEYS.pandaKeysBestScore,
  PERSISTENCE_KEYS.pandaSealBestScore,
  PERSISTENCE_KEYS.dailyMissions,
  PERSISTENCE_KEYS.missionDate,
  PERSISTENCE_KEYS.recommendations,
  PERSISTENCE_KEYS.startedLessons,
  PERSISTENCE_KEYS.xpAwards,
] as const;

export function getXp(): number {
  return Number(persistence.getItem<string>(PERSISTENCE_KEYS.xp, '0')) || 0;
}

export function setXp(xp: number): void {
  persistence.setItem(PERSISTENCE_KEYS.xp, String(xp));
}

export function getLevel(): number {
  return Number(persistence.getItem<string>(PERSISTENCE_KEYS.level, '1')) || 1;
}

export function setLevel(level: number): void {
  persistence.setItem(PERSISTENCE_KEYS.level, String(level));
}

export function getAchievements(): string[] {
  const stored = persistence.getItem<string[]>(PERSISTENCE_KEYS.achievements, []);
  return Array.isArray(stored) ? stored : [];
}

export function getDailyStreak(): number {
  return Number(persistence.getItem<string>(PERSISTENCE_KEYS.dailyStreak, '0')) || 0;
}

export function getLastTrainingDate(): string {
  return persistence.getItem<string>(PERSISTENCE_KEYS.lastTrainingDate, '');
}

export function getLastMistakes(): [string, number][] {
  const stored = persistence.getItem<[string, number][]>(PERSISTENCE_KEYS.lastMistakes, []);
  return Array.isArray(stored) ? stored : [];
}

export function setLastMistakes(mistakes: [string, number][]): void {
  persistence.setItem(PERSISTENCE_KEYS.lastMistakes, mistakes);
}

export function clearLastMistakes(): void {
  persistence.removeItem(PERSISTENCE_KEYS.lastMistakes);
}

export function getProfileProgress(): ProfileProgress {
  return {
    xp: getXp(),
    level: getLevel(),
    achievements: getAchievements(),
    dailyStreak: getDailyStreak(),
    lastTrainingDate: getLastTrainingDate(),
  };
}

export function updateProfileProgress(data: Partial<ProfileProgress>): void {
  if (data.xp !== undefined) setXp(data.xp);
  if (data.level !== undefined) setLevel(data.level);
  if (data.achievements !== undefined) {
    persistence.setItem(PERSISTENCE_KEYS.achievements, data.achievements);
  }
  if (data.dailyStreak !== undefined) {
    persistence.setItem(PERSISTENCE_KEYS.dailyStreak, String(data.dailyStreak));
  }
  if (data.lastTrainingDate !== undefined) {
    persistence.setItem(PERSISTENCE_KEYS.lastTrainingDate, data.lastTrainingDate);
  }
}

export function clearLocalProgress(): void {
  for (const key of LOCAL_PROGRESS_KEYS) {
    persistence.removeItem(key);
  }
}

export function exportLocalProgress(): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};
  for (const key of LOCAL_PROGRESS_KEYS) {
    const value = persistence.getItem<unknown>(key, null);
    if (value !== null) snapshot[key] = value;
  }
  return snapshot;
}
