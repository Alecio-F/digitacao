import type { RankingInvalidReason, SuspiciousFlags } from '@/features/typing/types';

export type DailyChallengeDifficulty = 'Fácil' | 'Médio' | 'Difícil';

export interface DailyChallengeText {
  id: string;
  title: string;
  text: string;
  difficulty: DailyChallengeDifficulty;
}

/** Desafio resolvido para um dia especifico. */
export interface DailyChallenge {
  text: DailyChallengeText;
  /** Chave do dia no formato YYYY-MM-DD (data local). */
  dayKey: string;
  /** Numero sequencial do desafio (incrementa 1 por dia). */
  challengeNumber: number;
  /** Igual ao id do texto sorteado para o dia. */
  challengeId: string;
}

/** Resultado oficial do dia salvo localmente. */
export interface DailyChallengeResult {
  date: string;
  challengeId: string;
  challengeNumber: number;
  ppm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  maxCombo: number;
  durationSeconds: number;
  completedAt: string;
  shareText: string;
  medal?: string | null;
  validForRanking?: boolean;
  rankingScore?: number;
  rankingInvalidReasons?: RankingInvalidReason[];
  suspiciousFlags?: SuspiciousFlags;
}
