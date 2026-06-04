import { useMemo } from 'react';
import {
  getDailyMissions,
  getMissionDate,
  saveDailyMissions,
  setMissionDate,
} from '@/repositories/dailyMissionRepository';
import { generateDailyMissions } from '../data/missionTemplates';
import type { DailyMission } from '../types';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getOrResetMissions(): DailyMission[] {
  const today = getTodayKey();
  const storedDate = getMissionDate();

  if (storedDate !== today) {
    const fresh = generateDailyMissions();
    saveDailyMissions(fresh);
    setMissionDate(today);
    return fresh;
  }

  const stored = getDailyMissions();
  if (Array.isArray(stored) && stored.length) return stored;

  const fresh = generateDailyMissions();
  saveDailyMissions(fresh);
  return fresh;
}

export function useDailyMissions(): DailyMission[] {
  return useMemo(() => getOrResetMissions(), []);
}
