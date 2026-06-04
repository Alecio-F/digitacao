import { DAILY_TEXTS } from '../data/dailyTexts';
import type { DailyChallenge } from '../types';

// Marco zero da contagem de desafios (#1 = 01/01/2024).
const EPOCH_UTC = Date.UTC(2024, 0, 1);
const DAY_MS = 24 * 60 * 60 * 1000;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Chave determinística do dia (data local) no formato YYYY-MM-DD. */
export function getDayKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Hash estável (FNV-1a) para transformar a chave do dia em um índice. */
function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Número sequencial do desafio: dias decorridos desde a epoch (mínimo 1). */
export function getChallengeNumber(date: Date = new Date()): number {
  const localMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.max(1, Math.floor((localMidnight - EPOCH_UTC) / DAY_MS) + 1);
}

/**
 * Retorna o desafio do dia. Mesmo dia → mesmo texto para todos, sem backend e
 * sem random puro: o índice vem do hash da data.
 */
export function getDailyChallenge(date: Date = new Date()): DailyChallenge {
  const dayKey = getDayKey(date);
  const index = hashString(dayKey) % DAILY_TEXTS.length;
  const text = DAILY_TEXTS[index];
  return {
    text,
    dayKey,
    challengeNumber: getChallengeNumber(date),
    challengeId: text.id,
  };
}
