import { useEffect, useMemo, useState } from 'react';
import { getOnlineTypingRanking } from '@/repositories/remote/rankingRemoteRepository';
import { RANKING_CATEGORY_CONFIG } from './rankingConfig';
import { filterByPeriod } from './rankingFilters';
import { mapRemoteRankingEntryToRankingEntry } from './rankingMappers';
import {
  getAccuracyRanking,
  getGeneralRanking,
  getPhaseRanking,
  getSpeedRanking,
  getTextRanking,
} from './rankingSelectors';
import type { RankingCategory, RankingEntry, RankingMetric, RankingPeriod, RankingScope } from './rankingTypes';
import { useLocalRanking } from './hooks/useLocalRanking';

export const RANKING_CATEGORY_OPTIONS: RankingCategory[] = [
  'general',
  'speed',
  'accuracy',
  'phases',
  'texts',
  'arcade',
  'daily',
];

export const RANKING_PERIOD_OPTIONS: Array<{ value: RankingPeriod; label: string }> = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
  { value: 'all', label: 'Sempre' },
];

export const RANKING_SCOPE_OPTIONS: Array<{ value: RankingScope; label: string; disabled?: boolean }> = [
  { value: 'local', label: 'Local' },
  { value: 'online', label: 'Online' },
];

export function getMetricLabel(metric: RankingMetric): string {
  const labels: Record<RankingMetric, string> = {
    ranking_score: 'Score',
    ppm: 'PPM',
    cpm: 'CPM',
    accuracy: 'Precisão',
    lowest_time: 'Menor tempo',
    combo: 'Combo',
    arcade_score: 'Score Arcade',
  };

  return labels[metric];
}

export function getModeLabel(entry: RankingEntry): string {
  const labels: Record<RankingEntry['mode'], string> = {
    all: 'Geral',
    free: 'Treino livre',
    random_words: 'Palavras Aleatórias',
    lesson: 'Fase do Mapa',
    practice_text: 'Texto para Praticar',
    daily_challenge: 'Desafio Diário',
    arcade: 'Arcade',
  };

  return labels[entry.mode] ?? 'Treino';
}

function getCategoryRanking(
  category: RankingCategory,
  metric: RankingMetric,
  entries: RankingEntry[],
): RankingEntry[] {
  if (category === 'speed') {
    return getSpeedRanking(entries, metric === 'cpm' ? 'cpm' : 'ppm', 24);
  }
  if (category === 'accuracy') return getAccuracyRanking(entries, 24);
  if (category === 'phases') return getPhaseRanking(entries, null, metric, 24);
  if (category === 'texts') return getTextRanking(entries, null, metric, 24);
  if (category === 'daily') {
    return getGeneralRanking(entries.filter((entry) => entry.mode === 'daily_challenge'), 24);
  }
  if (category === 'arcade') return [];
  return getGeneralRanking(entries, 24);
}

function getPrimaryMetricValue(entry: RankingEntry | undefined, metric: RankingMetric): string {
  if (!entry) return '--';
  if (metric === 'accuracy') return `${Math.round(entry.metricValue)}%`;
  if (metric === 'lowest_time') return `${Math.round(entry.metricValue)}s`;
  if (metric === 'combo') return `${Math.round(entry.metricValue)}x`;
  return String(Math.round(entry.metricValue));
}

function safeAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getStats(entries: RankingEntry[], fallback: ReturnType<typeof useLocalRanking>, scope: RankingScope) {
  if (scope === 'local') {
    return [
      { label: 'Melhor PPM', value: fallback.bestPpm || '--' },
      { label: 'Melhor precisão', value: fallback.bestAccuracy ? `${fallback.bestAccuracy}%` : '--' },
      { label: 'Melhor score', value: fallback.topEntries[0]?.rankingScore || '--' },
      { label: 'Treinos elegíveis', value: fallback.eligibleTrainings },
      { label: 'Média recente', value: fallback.averagePpm ? `${fallback.averagePpm} PPM` : '--' },
    ];
  }

  const bestPpm = entries.length ? Math.max(...entries.map((entry) => entry.ppm)) : 0;
  const bestAccuracy = entries.length ? Math.max(...entries.map((entry) => entry.accuracy)) : 0;
  const bestScore = entries.length ? Math.max(...entries.map((entry) => entry.rankingScore)) : 0;
  const averagePpm = safeAverage(entries.map((entry) => entry.ppm));

  return [
    { label: 'Melhor PPM', value: bestPpm || '--' },
    { label: 'Melhor precisão', value: bestAccuracy ? `${Math.round(bestAccuracy)}%` : '--' },
    { label: 'Melhor score', value: bestScore || '--' },
    { label: 'Resultados online', value: entries.length },
    { label: 'Média do mural', value: averagePpm ? `${averagePpm} PPM` : '--' },
  ];
}

function getInsight(entries: RankingEntry[], averageAccuracy: number, averagePpm: number): string {
  if (entries.length === 0) {
    return 'Nenhum nome no mural ainda. O Mestre Panda está apontando para a Arena com um olhar perigosamente competitivo.';
  }

  const leader = entries[0];
  if (averageAccuracy > 0 && averageAccuracy < 90) {
    return 'Ranking não perdoa tecla chutada. Respire, mire nas teclas e faça o Dojo parar de franzir a testa.';
  }

  if (averageAccuracy >= 95 && averagePpm < 45) {
    return 'Sua precisão está elegante. Agora avise seus dedos que eles têm permissão para acelerar.';
  }

  if (leader.position === 1 && leader.accuracy >= 95) {
    return 'Boa rodada. O Mestre Panda fingiu que não ficou impressionado, mas o bambu sagrado balançou.';
  }

  if (averagePpm >= 60) {
    return 'Você digitou rápido. O texto ainda está tentando entender o que aconteceu.';
  }

  return 'Você já entrou no mural. Agora falta convencer o teclado de que isso não foi sorte.';
}

export function useRankingViewModel() {
  const ranking = useLocalRanking();
  const [category, setCategory] = useState<RankingCategory>('general');
  const [period, setPeriod] = useState<RankingPeriod>('all');
  const [scope, setScope] = useState<RankingScope>('local');
  const [metric, setMetric] = useState<RankingMetric>(RANKING_CATEGORY_CONFIG.general.defaultMetric);
  const [onlineEntries, setOnlineEntries] = useState<RankingEntry[]>([]);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [isOnlineLoading, setIsOnlineLoading] = useState(false);

  const selectedConfig = RANKING_CATEGORY_CONFIG[category];
  const selectedMetric = selectedConfig.availableMetrics.includes(metric)
    ? metric
    : selectedConfig.defaultMetric;

  const localEntries = useMemo(() => {
    const periodEntries = filterByPeriod(ranking.rankingEntries, period);
    return getCategoryRanking(category, selectedMetric, periodEntries);
  }, [category, period, ranking.rankingEntries, selectedMetric]);

  useEffect(() => {
    let active = true;

    async function loadOnlineRanking() {
      setIsOnlineLoading(true);
      setOnlineError(null);

      try {
        const result = await getOnlineTypingRanking({
          category,
          metric: selectedMetric,
          period,
          limit: 24,
        });

        if (!active) return;
        if (result.error) {
          setOnlineEntries([]);
          setOnlineError(result.error);
        } else {
          setOnlineEntries((result.data ?? []).map(mapRemoteRankingEntryToRankingEntry));
          setOnlineError(null);
        }
      } catch (error: unknown) {
        if (!active) return;
        setOnlineEntries([]);
        setOnlineError(error instanceof Error ? error.message : 'O Dojo não conseguiu carregar o ranking online agora.');
      } finally {
        if (active) setIsOnlineLoading(false);
      }
    }

    if (scope === 'online' && selectedConfig.status !== 'soon') {
      void loadOnlineRanking();
    }

    return () => {
      active = false;
    };
  }, [category, period, scope, selectedConfig.status, selectedMetric]);

  const shouldUseOnline = scope === 'online' && selectedConfig.status !== 'soon';
  const entries = shouldUseOnline ? onlineEntries : localEntries;
  const podiumEntries = entries.slice(0, 3);
  const listEntries = entries.slice(3);
  const bestEntry = entries[0];
  const averageAccuracy = scope === 'online'
    ? safeAverage(entries.map((entry) => entry.accuracy))
    : ranking.averageAccuracy;
  const averagePpm = scope === 'online'
    ? safeAverage(entries.map((entry) => entry.ppm))
    : ranking.averagePpm;

  function changeCategory(value: RankingCategory) {
    setCategory(value);
    setMetric(RANKING_CATEGORY_CONFIG[value].defaultMetric);
  }

  return {
    ranking,
    category,
    period,
    scope,
    metric: selectedMetric,
    selectedConfig,
    entries,
    podiumEntries,
    listEntries,
    bestEntry,
    stats: getStats(entries, ranking, scope),
    currentMetricLabel: getMetricLabel(selectedMetric),
    currentMetricValue: getPrimaryMetricValue(bestEntry, selectedMetric),
    insight: getInsight(entries, averageAccuracy, averagePpm),
    isPreparedOnly: selectedConfig.status === 'soon',
    isOnlineLoading: shouldUseOnline ? isOnlineLoading : false,
    onlineError: shouldUseOnline ? onlineError : null,
    setCategory: changeCategory,
    setPeriod,
    setScope,
    setMetric,
  };
}

export type RankingViewModel = ReturnType<typeof useRankingViewModel>;
