import {
  dismissToday,
  getTodayResult,
  selectDailyChallenge,
  wasDismissedToday,
} from '@/repositories/dailyChallengeRepository';
import { getDailyChallenge, getDayKey } from './getDailyChallenge';
import type { DailyChallenge, DailyChallengeResult } from '../types';

const RESET_LABEL = 'Reinicia amanhã';
const REWARD_XP = 120;

export function getTodayKey(date: Date = new Date()): string {
  return getDayKey(date);
}

export function formatDailyDisplayDate(dayKey: string): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  if (!year || !month || !day) return dayKey;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

export function getShortDailyDisplayDate(dayKey: string): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  if (!year || !month || !day) return dayKey;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(year, month - 1, day));
}

export function getDailyResetLabel(date: Date = new Date()): string {
  const nextMidnight = new Date(date);
  nextMidnight.setHours(24, 0, 0, 0);
  const diffMs = Math.max(0, nextMidnight.getTime() - date.getTime());
  const totalMinutes = Math.ceil(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0 && minutes <= 0) return RESET_LABEL;
  return `Novo desafio em ${hours}h ${String(minutes).padStart(2, '0')}m`;
}

export function getDailyChallengeResult(dayKey: string): DailyChallengeResult | null {
  return getTodayResult(dayKey);
}

export function hasCompletedDailyChallenge(dayKey: string): boolean {
  return getDailyChallengeResult(dayKey) !== null;
}

export function dismissDailyChallengeForToday(dayKey: string): void {
  dismissToday(dayKey);
}

export function wasDailyChallengeDismissedToday(dayKey: string): boolean {
  return wasDismissedToday(dayKey);
}

export function startDailyChallenge(challenge: DailyChallenge = getDailyChallenge()): void {
  selectDailyChallenge(challenge);
}

export function getDailyChallengeRewardXp(): number {
  return REWARD_XP;
}
