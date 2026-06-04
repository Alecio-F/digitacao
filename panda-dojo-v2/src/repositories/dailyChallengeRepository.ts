import { persistence } from '@/services/persistence/types';
import { PERSISTENCE_KEYS } from '@/services/persistence/persistenceKeys';
import { selectDailyChallenge as selectDailyChallengeInStore } from './trainingSelectionRepository';
import type { DailyChallenge, DailyChallengeResult } from '@/features/dailyChallenge/types';

/**
 * Repositório do Desafio Diário: resultado do dia, dispensa e seleção para a Arena.
 */

function isValidResult(value: unknown): value is DailyChallengeResult {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as DailyChallengeResult).date === 'string' &&
    typeof (value as DailyChallengeResult).ppm === 'number'
  );
}

export function getTodayResult(dateKey: string): DailyChallengeResult | null {
  const stored = persistence.getItem<DailyChallengeResult | null>(
    PERSISTENCE_KEYS.dailyChallengeResult,
    null,
  );
  if (!isValidResult(stored)) return null;
  return stored.date === dateKey ? stored : null;
}

/** Salva o resultado do dia mantendo o melhor PPM/precisão. */
export function saveTodayResult(result: DailyChallengeResult): DailyChallengeResult {
  const existing = persistence.getItem<DailyChallengeResult | null>(
    PERSISTENCE_KEYS.dailyChallengeResult,
    null,
  );
  const sameDay = isValidResult(existing) && existing.date === result.date;
  const isBetter =
    !sameDay ||
    result.ppm > existing.ppm ||
    result.accuracy > existing.accuracy;

  const toStore: DailyChallengeResult = isBetter ? result : (existing as DailyChallengeResult);
  persistence.setItem(PERSISTENCE_KEYS.dailyChallengeResult, toStore);
  persistence.setItem(PERSISTENCE_KEYS.dailyChallengeDate, result.date);
  return toStore;
}

export function hasCompletedToday(dateKey: string): boolean {
  return getTodayResult(dateKey) !== null;
}

export function getDismissedDate(): string {
  return persistence.getItem<string>(PERSISTENCE_KEYS.dailyChallengeDismissedDate, '');
}

export function wasDismissedToday(dateKey: string): boolean {
  return getDismissedDate() === dateKey;
}

export function dismissToday(dateKey: string): void {
  persistence.setItem(PERSISTENCE_KEYS.dailyChallengeDismissedDate, dateKey);
}

export function setSelectedDailyChallenge(challengeId: string): void {
  persistence.setItem(PERSISTENCE_KEYS.selectedDailyChallengeId, challengeId);
}

export function selectDailyChallenge(challenge: DailyChallenge): void {
  selectDailyChallengeInStore({
    id: challenge.challengeId,
    title: challenge.text.title,
    text: challenge.text.text,
  });
}
