import { useMemo } from 'react';
import { usePlayerProgress } from '@/features/gamification/hooks/usePlayerProgress';
import { parsePrecision } from '@/features/gamification/logic/xpCalculator';
import type { HistoryItem } from '@/features/gamification/types';
import { normalizeTrainingResult } from '@/features/typing/logic/normalizeTrainingResult';
import * as arcadeScoreRepository from '@/repositories/arcadeScoreRepository';
import * as typingResultRepository from '@/repositories/typingResultRepository';

const TOP_LIMIT = 10;
const RECENT_LIMIT = 5;

/**
 * Itens de histórico podem (em versões futuras) trazer combo. O tipo base não
 * declara o campo, então o lemos de forma opcional e segura.
 */
export interface RankingResult extends HistoryItem {
  combo?: number;
}

function getCombo(item: RankingResult): number {
  return Number(item.maxCombo ?? item.combo) || 0;
}

function safeAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round(total / values.length);
}

/**
 * Ranking local do jogador: melhores marcas, médias e listas ordenadas
 * derivadas do histórico salvo neste navegador. Compõe usePlayerProgress sem
 * duplicar a leitura de XP/nível/recordes.
 */
export function useLocalRanking() {
  const profile = usePlayerProgress();

  return useMemo(() => {
    // Fonte de dados via repository (histórico bruto); a normalização e as
    // regras de ranking permanecem aqui, inalteradas.
    const rawHistory = typingResultRepository.getHistory() as RankingResult[];
    const history = rawHistory.map((item) => normalizeTrainingResult(item) as RankingResult);
    const validResults = history.filter((item) => item.validForRanking);

    const ppmValues = validResults.map((item) => Number(item.ppm) || 0);
    const cpmValues = validResults.map((item) => Number(item.cpm) || 0);
    const accuracyValues = validResults.map((item) => parsePrecision(item.precisao));
    const comboValues = validResults.map(getCombo);

    const topResults = [...validResults]
      .sort((a, b) => {
        const scoreDiff = (Number(b.rankingScore) || 0) - (Number(a.rankingScore) || 0);
        if (scoreDiff !== 0) return scoreDiff;
        return (Number(b.ppm) || 0) - (Number(a.ppm) || 0);
      })
      .slice(0, TOP_LIMIT);
    const bestPpm = ppmValues.length ? Math.max(...ppmValues) : 0;

    return {
      bestPpm,
      bestCpm: cpmValues.length ? Math.max(...cpmValues) : 0,
      bestAccuracy: accuracyValues.length ? Math.round(Math.max(...accuracyValues)) : 0,
      bestCombo: comboValues.length ? Math.max(...comboValues) : 0,
      totalTrainings: history.length,
      eligibleTrainings: validResults.length,
      averageAccuracy: safeAverage(accuracyValues),
      averagePpm: safeAverage(ppmValues),
      recentResults: validResults.slice(0, RECENT_LIMIT),
      topResults,
      allResults: history,
      validResults,
      pandaKeysBestScore: profile.gameBestScore,
      sealBestScore: arcadeScoreRepository.getSealBestScore(),
      level: profile.level,
      xp: profile.xp,
    };
  }, [profile.gameBestScore, profile.level, profile.xp]);
}

export type LocalRanking = ReturnType<typeof useLocalRanking>;
