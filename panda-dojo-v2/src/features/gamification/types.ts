import type { RankingInvalidReason, SuspiciousFlags } from '@/features/typing/types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

export interface HistoryItem {
  ppm: number;
  cpm?: number;
  precisao: string;
  erros?: number;
  tempo?: number;
  lessonId?: string | null;
  mode?: 'random' | 'lesson' | 'practice-text' | 'daily-challenge';
  practiceTextId?: string | null;
  practiceTextTitle?: string | null;
  dailyChallengeId?: string | null;
  novoRecorde?: boolean;
  data?: string;
  completedAt?: string;
  combo?: number;
  maxCombo?: number;
  mistakeKeys?: Record<string, number>;
  correctChars?: number;
  wrongChars?: number;
  totalTyped?: number;
  rawKeyCount?: number;
  repeatedKeyCount?: number;
  longestWrongStreak?: number;
  suspiciousInputBursts?: number;
  validForRanking?: boolean;
  rankingScore?: number;
  rankingInvalidReasons?: RankingInvalidReason[];
  suspiciousFlags?: SuspiciousFlags;
}

export interface DojoProfile {
  xp: number;
  level: number;
  title: string;
  nextTitle: string;
  progressPercent: number;
  currentLevelXp: number;
  requiredForLevel: number;
  achievements: string[];
  achievementDetails: Achievement[];
  dailyStreak: number;
  lastTrainingDate: string;
  bestPpm: number;
  lastPrecision: string;
  lastResult: HistoryItem | null;
  history: HistoryItem[];
  lastMistakes: [string, number][];
  gameBestScore: number;
}
