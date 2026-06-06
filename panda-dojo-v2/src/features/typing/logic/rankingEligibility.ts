import type {
  RankingEligibility,
  RankingInvalidReasonCode,
  RankingInvalidReason,
  SuspiciousFlags,
} from '../types';

export interface RankingEligibilityInput {
  accuracy: number;
  durationSeconds: number;
  correctChars: number;
  wrongChars: number;
  totalTyped: number;
  rawKeyCount: number;
  repeatedKeyCount: number;
  maxCombo: number;
  ppm: number;
  cpm: number;
  longestWrongStreak?: number;
  suspiciousInputBursts?: number;
}

export const RANKING_VALIDATION_LIMITS = {
  minAccuracy: 90,
  minDurationSeconds: 15,
  minCorrectChars: 50,
  maxRepeatedKeyRatio: 0.18,
  maxWrongToCorrectRatio: 1,
  maxLongWrongStreak: 20,
  maxBursts: 5,
  maxPpm: 220,
} as const;

function isValidNumber(value: number | undefined): boolean {
  return Number.isFinite(value);
}

function safeNumber(value: number | undefined, fallback = 0): number {
  return isValidNumber(value) ? Math.max(0, Number(value)) : fallback;
}

function addReason(
  reasons: RankingInvalidReason[],
  reason: RankingInvalidReason,
): void {
  if (!reasons.includes(reason)) reasons.push(reason);
}

export function calculateCpm(correctChars: number, elapsedSeconds: number): number {
  const minutes = Math.max(safeNumber(elapsedSeconds) / 60, 1 / 60);
  return Math.max(0, Math.round(safeNumber(correctChars) / minutes));
}

export function calculatePpm(correctChars: number, elapsedSeconds: number): number {
  const minutes = Math.max(safeNumber(elapsedSeconds) / 60, 1 / 60);
  return Math.max(0, Math.round((safeNumber(correctChars) / 5) / minutes));
}

export function evaluateRankingEligibility(
  input: RankingEligibilityInput,
): RankingEligibility {
  const rawAccuracy = input.accuracy;
  const missingRequiredData = (
    !isValidNumber(input.accuracy) ||
    !isValidNumber(input.durationSeconds) ||
    !isValidNumber(input.correctChars) ||
    !isValidNumber(input.wrongChars) ||
    !isValidNumber(input.totalTyped) ||
    !isValidNumber(input.rawKeyCount) ||
    !isValidNumber(input.ppm) ||
    !isValidNumber(input.cpm)
  );
  const accuracy = Math.min(100, safeNumber(rawAccuracy));
  const durationSeconds = safeNumber(input.durationSeconds);
  const correctChars = safeNumber(input.correctChars);
  const wrongChars = safeNumber(input.wrongChars);
  const totalTyped = safeNumber(input.totalTyped);
  const rawKeyCount = safeNumber(input.rawKeyCount);
  const repeatedKeyCount = safeNumber(input.repeatedKeyCount);
  const maxCombo = safeNumber(input.maxCombo);
  const ppm = safeNumber(input.ppm);
  const longestWrongStreak = safeNumber(input.longestWrongStreak);
  const suspiciousInputBursts = safeNumber(input.suspiciousInputBursts);
  const repeatedRatio = rawKeyCount > 0 ? repeatedKeyCount / rawKeyCount : 0;
  const wrongToCorrectRatio = correctChars > 0 ? wrongChars / correctChars : wrongChars;
  const reasons: RankingInvalidReason[] = [];

  if (missingRequiredData || Number(rawAccuracy) > 100) {
    addReason(reasons, 'unknown');
  }
  if (accuracy < RANKING_VALIDATION_LIMITS.minAccuracy) {
    addReason(reasons, 'accuracy_too_low');
  }
  if (durationSeconds < RANKING_VALIDATION_LIMITS.minDurationSeconds) {
    addReason(reasons, 'duration_too_short');
  }
  if (correctChars < RANKING_VALIDATION_LIMITS.minCorrectChars) {
    addReason(reasons, 'not_enough_correct_chars');
  }
  if (wrongToCorrectRatio > RANKING_VALIDATION_LIMITS.maxWrongToCorrectRatio) {
    addReason(reasons, 'too_many_errors');
  }
  if (repeatedRatio > RANKING_VALIDATION_LIMITS.maxRepeatedKeyRatio) {
    addReason(reasons, 'repeated_key_abuse');
  }
  if (longestWrongStreak > RANKING_VALIDATION_LIMITS.maxLongWrongStreak) {
    addReason(reasons, 'random_typing_pattern');
  }
  if (suspiciousInputBursts > RANKING_VALIDATION_LIMITS.maxBursts) {
    addReason(reasons, 'input_burst_suspicious');
  }
  if (totalTyped > 0 && correctChars === 0 && wrongChars > 0) {
    addReason(reasons, 'random_typing_pattern');
  }
  if (ppm <= 0 || ppm > RANKING_VALIDATION_LIMITS.maxPpm) {
    addReason(reasons, 'unknown');
  }

  const suspiciousFlags: SuspiciousFlags = {
    repeatedKeyAbuse: reasons.includes('repeated_key_abuse'),
    inputBurstSuspicious: reasons.includes('input_burst_suspicious'),
    randomTypingPattern: reasons.includes('random_typing_pattern'),
    tooManyErrors: reasons.includes('too_many_errors'),
  };

  const score = Math.max(0, Math.round(ppm * (accuracy / 100) + maxCombo * 0.15));
  const invalidReason = getPrimaryInvalidReason(reasons);

  return {
    validForRanking: reasons.length === 0,
    invalidReason,
    reasonCodes: reasons,
    score: Number.isFinite(score) ? score : 0,
    suspiciousFlags,
  };
}

function getPrimaryInvalidReason(
  reasons: RankingInvalidReason[],
): RankingInvalidReasonCode | null {
  if (reasons.length === 0) return null;
  if (reasons.includes('accuracy_too_low')) return 'low_accuracy';
  if (reasons.includes('duration_too_short')) return 'too_short';
  if (reasons.includes('not_enough_correct_chars')) return 'too_few_chars';
  if (reasons.includes('repeated_key_abuse')) return 'suspicious_repetition';
  if (
    reasons.includes('input_burst_suspicious') ||
    reasons.includes('random_typing_pattern') ||
    reasons.includes('too_many_errors') ||
    reasons.includes('completed_too_fast')
  ) {
    return 'invalid_input_pattern';
  }
  return 'missing_required_data';
}

export const validateRankingEligibility = evaluateRankingEligibility;
