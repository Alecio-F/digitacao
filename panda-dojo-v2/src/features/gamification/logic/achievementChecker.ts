import type { Achievement, HistoryItem } from '../types';
import { parsePrecision } from './xpCalculator';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-training',    title: 'Primeiro Passo',      description: 'Concluiu o primeiro treino no Dojo.' },
  { id: 'precision-90',      title: 'Foco de Bambu',       description: 'Alcançou 90% ou mais de precisão.' },
  { id: 'precision-95',      title: 'Toque Preciso',       description: 'Alcançou 95% ou mais de precisão.' },
  { id: 'new-record',        title: 'Recorde do Dojo',     description: 'Bateu um novo recorde pessoal.' },
  { id: 'three-trainings',   title: 'Rotina de Aprendiz',  description: 'Registrou pelo menos 3 treinos.' },
  { id: 'seven-trainings',   title: 'Disciplina Arcade',   description: 'Registrou pelo menos 7 treinos.' },
  { id: 'master-asdf',       title: 'Mestre ASDF',         description: 'Concluiu Teclas Base com medalha de ouro.' },
  { id: 'daily-routine',     title: 'Rotina do Dojo',      description: 'Completou uma missão diária.' },
  { id: 'map-explorer',      title: 'Explorador do Mapa',  description: 'Iniciou 3 fases diferentes do Mapa do Dojo.' },
  { id: 'arcade-first',      title: 'Arcade Inicial',      description: 'Jogou Panda Keys pela primeira vez.' },
  { id: 'strong-combo',      title: 'Combo Forte',         description: 'Alcançou um combo alto em treino.' },
];

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

interface CheckOptions {
  precision?: number;
  novoRecorde?: boolean;
  combo?: number;
}

export function getUnlockedAchievements(
  history: HistoryItem[],
  stored: string[],
  current: CheckOptions = {},
): string[] {
  const unlocked = new Set(stored);
  const bestPrecision = Math.max(
    0,
    ...history.map((item) => parsePrecision(item.precisao)),
    current.precision ?? 0,
  );

  if (history.length > 0) unlocked.add('first-training');
  if (history.length >= 3) unlocked.add('three-trainings');
  if (history.length >= 7) unlocked.add('seven-trainings');
  if (bestPrecision >= 90) unlocked.add('precision-90');
  if (bestPrecision >= 95) unlocked.add('precision-95');
  if (current.novoRecorde) unlocked.add('new-record');
  if ((current.combo ?? 0) >= 24) unlocked.add('strong-combo');

  return [...unlocked].filter((id) => getAchievementById(id));
}
