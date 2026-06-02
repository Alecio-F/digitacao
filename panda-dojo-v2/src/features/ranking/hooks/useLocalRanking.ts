import { useMemo } from 'react';
import { KEYS } from '@/constants';
import { usePlayerProgress } from '@/features/gamification/hooks/usePlayerProgress';
import { parsePrecision } from '@/features/gamification/logic/xpCalculator';
import type { HistoryItem } from '@/features/gamification/types';
import { getStorage } from '@/services/storage/storageService';

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
  return Number(item.combo) || 0;
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
    const history = (profile.history as RankingResult[]) ?? [];

    const ppmValues = history.map((item) => Number(item.ppm) || 0);
    const cpmValues = history.map((item) => Number(item.cpm) || 0);
    const accuracyValues = history.map((item) => parsePrecision(item.precisao));
    const comboValues = history.map(getCombo);

    const topResults = [...history]
      .sort((a, b) => (Number(b.ppm) || 0) - (Number(a.ppm) || 0))
      .slice(0, TOP_LIMIT);

    return {
      bestPpm: profile.bestPpm,
      bestCpm: cpmValues.length ? Math.max(...cpmValues) : 0,
      bestAccuracy: accuracyValues.length ? Math.round(Math.max(...accuracyValues)) : 0,
      bestCombo: comboValues.length ? Math.max(...comboValues) : 0,
      totalTrainings: history.length,
      averageAccuracy: safeAverage(accuracyValues),
      averagePpm: safeAverage(ppmValues),
      recentResults: history.slice(0, RECENT_LIMIT),
      topResults,
      pandaKeysBestScore: profile.gameBestScore,
      sealBestScore: Number(getStorage<string>(KEYS.sealBestScore, '0')) || 0,
      level: profile.level,
      xp: profile.xp,
    };
  }, [profile.history, profile.bestPpm, profile.gameBestScore, profile.level, profile.xp]);
}

export type LocalRanking = ReturnType<typeof useLocalRanking>;
