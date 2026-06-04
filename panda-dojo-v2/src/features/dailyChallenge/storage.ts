import {
  getTodayResult,
  saveTodayResult,
} from '@/repositories/dailyChallengeRepository';
import type { DailyChallengeResult } from './types';

/** @deprecated Use dailyChallengeRepository.getTodayResult. */
export function getDailyChallengeResult(dayKey: string): DailyChallengeResult | null {
  return getTodayResult(dayKey);
}

/** @deprecated Use dailyChallengeRepository.saveTodayResult. */
export function saveDailyChallengeResult(result: DailyChallengeResult): DailyChallengeResult {
  return saveTodayResult(result);
}
