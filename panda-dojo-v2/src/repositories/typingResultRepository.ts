import { MAX_HISTORY } from '@/constants';
import { persistence } from '@/services/persistence/types';
import { PERSISTENCE_KEYS } from '@/services/persistence/persistenceKeys';
import type { HistoryItem } from '@/features/gamification/types';

/**
 * Repositório do histórico de resultados da Type Arena.
 *
 * Hoje grava em localStorage (chave `historico`). No futuro, uma implementação
 * supabaseTypingResultRepository terá a mesma assinatura para sincronizar os
 * resultados na nuvem.
 */

export function getHistory(): HistoryItem[] {
  const history = persistence.getItem<HistoryItem[]>(PERSISTENCE_KEYS.history, []);
  return Array.isArray(history) ? history : [];
}

/** Adiciona um resultado no topo do histórico e mantém o limite (MAX_HISTORY). */
export function saveResult(result: HistoryItem): HistoryItem[] {
  const updated = [result, ...getHistory()].slice(0, MAX_HISTORY);
  persistence.setItem(PERSISTENCE_KEYS.history, updated);
  return updated;
}

export function getRecentResults(limit = MAX_HISTORY): HistoryItem[] {
  return getHistory().slice(0, Math.max(0, limit));
}

/** Resultados válidos para ranking local (descarta os marcados como inválidos). */
export function getRankingEligibleResults(): HistoryItem[] {
  return getHistory().filter((item) => item.validForRanking !== false);
}

export function clearHistory(): void {
  persistence.removeItem(PERSISTENCE_KEYS.history);
}
