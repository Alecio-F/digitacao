import { XP_PER_LEVEL } from '@/constants';
import type { HistoryItem } from '../types';

export function parsePrecision(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  return Number(String(value ?? '0').replace('%', '').replace(',', '.')) || 0;
}

export function calculateLevel(xp: number): number {
  return Math.max(1, Math.floor((Number(xp) || 0) / XP_PER_LEVEL) + 1);
}

export function deriveXpFromHistory(history: HistoryItem[]): number {
  return history.reduce((total, item, index) => {
    const precision = parsePrecision(item.precisao);
    let xp = 50;
    if (precision >= 95) xp += 60;
    else if (precision >= 90) xp += 30;
    if (index === 0 && Number(item.ppm || 0) > 0) xp += 20;
    return total + xp;
  }, 0);
}

export function getProgressionTitle(level: number): string {
  if (level >= 50) return 'Lenda do Dojo';
  if (level >= 30) return 'Guardião do Teclado';
  if (level >= 20) return 'Mestre das Teclas';
  if (level >= 10) return 'Panda Ágil';
  if (level >= 5) return 'Aprendiz do Dojo';
  return 'Filhote de Panda';
}

export function getNextProgressionTitle(level: number): string {
  if (level < 5) return 'Aprendiz do Dojo';
  if (level < 10) return 'Panda Ágil';
  if (level < 20) return 'Mestre das Teclas';
  if (level < 30) return 'Guardião do Teclado';
  return 'Lenda do Dojo';
}
