import type { DailyMission } from '../types';

export const MISSION_TEMPLATES: Omit<DailyMission, 'progress' | 'completed' | 'rewarded'>[] = [
  { id: 'quick-training', title: 'Treino rápido',  description: 'Complete 1 treino na Type Arena',               rewardXp: 30, target: 1 },
  { id: 'precision-90',  title: 'Precisão',        description: 'Faça um treino com pelo menos 90% de precisão', rewardXp: 50, target: 1 },
  { id: 'arcade-play',   title: 'Arcade',          description: 'Jogue Panda Keys uma vez',                      rewardXp: 40, target: 1 },
  { id: 'dojo-map',      title: 'Mapa do Dojo',    description: 'Inicie uma fase do Mapa do Dojo',               rewardXp: 30, target: 1 },
  { id: 'match-best-ppm',title: 'Evolução',        description: 'Bata ou iguale seu melhor PPM',                 rewardXp: 80, target: 1 },
];

export function generateDailyMissions(): DailyMission[] {
  return MISSION_TEMPLATES.map((t) => ({ ...t, progress: 0, completed: false, rewarded: false }));
}
