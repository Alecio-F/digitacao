import {
  calculateLevel,
  getProgressionTitle,
} from '@/features/gamification/logic/xpCalculator';
import type { HistoryItem } from '@/features/gamification/types';
import {
  syncLessonProgressToSupabase,
  syncProfileProgressToSupabase,
  syncTypingResultToSupabase,
} from '@/features/backend-sync/syncLocalProgressService';
import type { LessonMedal } from '@/features/lessons/types';
import { completeLesson } from '@/repositories/lessonProgressRepository';
import * as profileProgressRepository from '@/repositories/profileProgressRepository';
import * as typingResultRepository from '@/repositories/typingResultRepository';
import { evaluateRankingEligibility } from '../logic/rankingEligibility';
import { normalizeTrainingResult } from '../logic/normalizeTrainingResult';
import type { RankingEligibility } from '../types';
import { getMasterPandaRecommendation } from './masterPandaRecommendation';

interface SaveResultPayload {
  ppm: number;
  cpm: number;
  precision: number;
  errors: number;
  duration: number;
  lessonId: string | null;
  mode?: 'random' | 'lesson' | 'practice-text' | 'daily-challenge';
  practiceTextId?: string | null;
  practiceTextTitle?: string | null;
  dailyChallengeId?: string | null;
  isRecord: boolean;
  topErrors: [string, number][];
  maxCombo: number;
  pauseUsed: boolean;
  correctChars: number;
  wrongChars: number;
  totalTyped: number;
  rawKeyCount: number;
  repeatedKeyCount: number;
  longestWrongStreak: number;
  suspiciousInputBursts: number;
}

interface SaveResultOutput {
  gainedXp: number;
  xp: number;
  level: number;
  title: string;
  isRecord: boolean;
  lessonCompleted: boolean;
  lessonCompletedNow: boolean;
  lessonMedal: LessonMedal | null;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
  rankingEligibility: RankingEligibility;
}

export function saveSessionResult(payload: SaveResultPayload): SaveResultOutput {
  const {
    ppm,
    cpm,
    precision,
    errors,
    duration,
    lessonId,
    mode,
    practiceTextId,
    practiceTextTitle,
    dailyChallengeId,
    isRecord,
    topErrors,
    maxCombo,
    pauseUsed,
    correctChars,
    wrongChars,
    totalTyped,
    rawKeyCount,
    repeatedKeyCount,
    longestWrongStreak,
    suspiciousInputBursts,
  } = payload;
  const durationSeconds = Math.max(0, Math.round(duration * 60));
  const rankingEligibility = evaluateRankingEligibility({
    accuracy: precision,
    durationSeconds,
    correctChars,
    wrongChars,
    totalTyped,
    rawKeyCount,
    repeatedKeyCount,
    maxCombo,
    ppm,
    cpm,
    longestWrongStreak,
    suspiciousInputBursts,
  });
  const validRecord = isRecord && rankingEligibility.validForRanking;

  // 1. Save history (via typingResultRepository)
  const newEntry: HistoryItem = {
    ppm,
    cpm,
    precisao: `${precision}%`,
    erros: errors,
    tempo: duration,
    lessonId: lessonId ?? undefined,
    mode,
    practiceTextId: practiceTextId ?? undefined,
    practiceTextTitle: practiceTextTitle ?? undefined,
    dailyChallengeId: dailyChallengeId ?? undefined,
    novoRecorde: validRecord,
    data: new Date().toLocaleDateString('pt-BR'),
    completedAt: new Date().toISOString(),
    combo: maxCombo,
    maxCombo,
    mistakeKeys: Object.fromEntries(topErrors),
    correctChars,
    wrongChars,
    totalTyped,
    rawKeyCount,
    repeatedKeyCount,
    longestWrongStreak,
    suspiciousInputBursts,
    validForRanking: rankingEligibility.validForRanking,
    rankingScore: rankingEligibility.score,
    rankingInvalidReason: rankingEligibility.invalidReason,
    rankingInvalidReasons: rankingEligibility.reasonCodes,
    suspiciousFlags: rankingEligibility.suspiciousFlags,
  };
  const updatedHistory = typingResultRepository.saveResult(newEntry);

  // 2. Save top errors
  if (topErrors.length > 0) {
    profileProgressRepository.setLastMistakes(topErrors);
  }

  // 3. Compute XP
  const currentXp = profileProgressRepository.getXp();
  let gainedXp = 50;
  if (precision >= 95) gainedXp += 60;
  else if (precision >= 90) gainedXp += 30;
  if (validRecord) gainedXp += 80;
  if (!pauseUsed) gainedXp += 20;
  if (maxCombo > 0) gainedXp += 10;

  const lessonAttempt = lessonId
    ? completeLesson(lessonId, { accuracy: precision, ppm })
    : null;

  if (lessonAttempt?.completedNow) {
    gainedXp += lessonAttempt.lesson.xpReward;
  }

  const xp = currentXp + gainedXp;
  const level = calculateLevel(xp);

  // 4. Unlock achievements
  const achievements = new Set(profileProgressRepository.getAchievements());
  const historyCount = updatedHistory.length;
  if (historyCount >= 1) achievements.add('first-training');
  if (historyCount >= 3) achievements.add('three-trainings');
  if (historyCount >= 7) achievements.add('seven-trainings');
  if (precision >= 90) achievements.add('precision-90');
  if (precision >= 95) achievements.add('precision-95');
  if (validRecord) achievements.add('new-record');
  if (maxCombo >= 24) achievements.add('strong-combo');

  // 5. Daily streak
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = profileProgressRepository.getLastTrainingDate();
  let streakUpdate: { dailyStreak: number; lastTrainingDate: string } | null = null;
  if (lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);
    const streak = lastDate === yKey ? profileProgressRepository.getDailyStreak() + 1 : 1;
    streakUpdate = { dailyStreak: streak, lastTrainingDate: today };
    achievements.add('daily-routine');
  }

  // 6. Persist (via profileProgressRepository)
  profileProgressRepository.updateProfileProgress({
    xp,
    level,
    achievements: [...achievements],
    ...(streakUpdate ?? {}),
  });

  void syncTypingResultToSupabase(newEntry);
  if (lessonId) void syncLessonProgressToSupabase(lessonId);
  void syncProfileProgressToSupabase();

  return {
    gainedXp,
    xp,
    level,
    title: getProgressionTitle(level),
    isRecord: validRecord,
    lessonCompleted: lessonAttempt?.completed ?? false,
    lessonCompletedNow: lessonAttempt?.completedNow ?? false,
    lessonMedal: lessonAttempt?.medal ?? null,
    nextLessonId: lessonAttempt?.nextLesson?.id ?? null,
    nextLessonTitle: lessonAttempt?.nextLesson?.title ?? null,
    rankingEligibility,
  };
}

export function getBestPpm(): number {
  return typingResultRepository
    .getHistory()
    .map(normalizeTrainingResult)
    .filter((item) => item.validForRanking)
    .reduce((best, item) => Math.max(best, Number(item.ppm) || 0), 0);
}

export function getPrecisionFromResult(precision: number): string {
  return `${precision}%`;
}

export function getResultRecommendation(
  precision: number,
  ppm: number,
  topErrors: [string, number][],
): { text: string; href: string | null; linkText: string | null } {
  const errors = topErrors.reduce((total, [, count]) => total + count, 0);

  return getMasterPandaRecommendation({
    accuracy: precision,
    ppm,
    errors,
    maxCombo: 0,
    topErrors,
    validForRanking: true,
    seedHint: `legacy-${precision}-${ppm}-${errors}`,
  });
}
