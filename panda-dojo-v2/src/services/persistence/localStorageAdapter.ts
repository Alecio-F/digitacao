import type { StorageAdapter } from './storageAdapter';

/**
 * Implementação de StorageAdapter sobre o localStorage do navegador.
 *
 * Robustez exigida pela Fase 1A:
 * - nunca deixa JSON.parse quebrar a aplicação;
 * - trata `window`/localStorage indisponível (SSR, modo privado, navegador
 *   bloqueando storage);
 * - quando o valor salvo tem tipo incompatível com o fallback (array esperado
 *   mas veio objeto, número esperado mas veio string inválida, etc.) retorna o
 *   fallback em vez de propagar dado inválido.
 */

function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const probe = '__panda_storage_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/**
 * Garante coerência de FORMA com o fallback apenas para coleções:
 * - fallback array  → valor precisa ser array (senão retorna []);
 * - fallback objeto → valor precisa ser objeto simples (senão retorna {}).
 * Para primitivos (string/number/boolean) e null mantém o comportamento
 * histórico de persistência local (retorna o valor desserializado e deixa o
 * chamador coagir), evitando quebrar dados gravados como string ("5", "dark").
 */
function matchesFallbackShape<T>(value: unknown, fallback: T): value is T {
  if (Array.isArray(fallback)) return Array.isArray(value);
  if (fallback !== null && typeof fallback === 'object') {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
  return true;
}

function getItem<T>(key: string, fallback: T): T {
  if (!isStorageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    try {
      const parsed = JSON.parse(raw) as unknown;
      return matchesFallbackShape(parsed, fallback) ? (parsed as T) : fallback;
    } catch {
      return typeof fallback === 'string' ? (raw as T) : fallback;
    }
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage cheio/bloqueado: ignora silenciosamente para não quebrar a UI.
  }
}

function removeItem(key: string): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignora falhas de remoção.
  }
}

function updateItem<T>(key: string, updater: (current: T) => T, fallback: T): T {
  const current = getItem<T>(key, fallback);
  const next = updater(current);
  setItem(key, next);
  return next;
}

export const localStorageAdapter: StorageAdapter = {
  getItem,
  setItem,
  removeItem,
  updateItem,
};
