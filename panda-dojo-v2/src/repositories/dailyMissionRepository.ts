import { persistence } from '@/services/persistence/types';
import { PERSISTENCE_KEYS } from '@/services/persistence/persistenceKeys';
import type { DailyMission } from '@/features/missions/types';

export function getDailyMissions(): DailyMission[] {
  const stored = persistence.getItem<DailyMission[]>(PERSISTENCE_KEYS.dailyMissions, []);
  return Array.isArray(stored) ? stored : [];
}

export function saveDailyMissions(missions: DailyMission[]): void {
  persistence.setItem(PERSISTENCE_KEYS.dailyMissions, missions);
}

export function clearDailyMissions(): void {
  persistence.removeItem(PERSISTENCE_KEYS.dailyMissions);
}

export function getMissionDate(): string {
  return persistence.getItem<string>(PERSISTENCE_KEYS.missionDate, '');
}

export function setMissionDate(dateKey: string): void {
  persistence.setItem(PERSISTENCE_KEYS.missionDate, dateKey);
}
