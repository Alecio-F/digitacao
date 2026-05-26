import { useMemo } from 'react';
import { KEYS } from '@/constants';
import { getStorage, setStorage } from '@/services/storage/storageService';
import { generateDailyMissions } from '../data/missionTemplates';
import type { DailyMission } from '../types';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getOrResetMissions(): DailyMission[] {
  const today = getTodayKey();
  const storedDate = getStorage<string>(KEYS.missionDate, '');

  if (storedDate !== today) {
    const fresh = generateDailyMissions();
    setStorage(KEYS.dailyMissions, fresh);
    setStorage(KEYS.missionDate, today);
    return fresh;
  }

  const stored = getStorage<DailyMission[]>(KEYS.dailyMissions, []);
  if (Array.isArray(stored) && stored.length) return stored;

  const fresh = generateDailyMissions();
  setStorage(KEYS.dailyMissions, fresh);
  return fresh;
}

export function useDailyMissions(): DailyMission[] {
  return useMemo(() => getOrResetMissions(), []);
}
