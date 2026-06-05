import { persistence } from '@/services/persistence/types';
import { PERSISTENCE_KEYS } from '@/services/persistence/persistenceKeys';
import type { PendingSyncItem } from '@/features/backend-sync/pendingSyncTypes';

/**
 * Fila local de itens que falharam ao enviar para o Supabase, para reenvio
 * posterior. Persistida via StorageAdapter (localStorage hoje), com fallback
 * seguro — nunca quebra se o conteúdo estiver inválido.
 */

const MAX_QUEUE_SIZE = 100;

function isPendingSyncItem(value: unknown): value is PendingSyncItem {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as PendingSyncItem).id === 'string' &&
    typeof (value as PendingSyncItem).type === 'string'
  );
}

export function getPendingSyncQueue(): PendingSyncItem[] {
  const stored = persistence.getItem<PendingSyncItem[]>(PERSISTENCE_KEYS.pendingSyncQueue, []);
  return Array.isArray(stored) ? stored.filter(isPendingSyncItem) : [];
}

export function setPendingSyncQueue(items: PendingSyncItem[]): void {
  // Mantém os mais recentes quando passa do limite (descarta os mais antigos).
  const safe = Array.isArray(items) ? items.slice(-MAX_QUEUE_SIZE) : [];
  persistence.setItem(PERSISTENCE_KEYS.pendingSyncQueue, safe);
}

/**
 * Adiciona um item à fila. Se houver dedupeKey, substitui um item ainda não
 * sincronizado com a mesma chave (evita duplicação simples).
 */
export function addPendingSyncItem(item: PendingSyncItem): void {
  const queue = getPendingSyncQueue();

  if (item.dedupeKey) {
    const existingIndex = queue.findIndex(
      (entry) => entry.dedupeKey === item.dedupeKey && entry.status !== 'synced',
    );
    if (existingIndex >= 0) {
      const previous = queue[existingIndex];
      queue[existingIndex] = {
        ...item,
        attempts: previous.attempts,
        createdAt: previous.createdAt,
        updatedAt: new Date().toISOString(),
      };
      setPendingSyncQueue(queue);
      return;
    }
  }

  queue.push(item);
  setPendingSyncQueue(queue);
}

export function removePendingSyncItem(id: string): void {
  setPendingSyncQueue(getPendingSyncQueue().filter((item) => item.id !== id));
}

function patchItem(id: string, patch: Partial<PendingSyncItem>): void {
  const queue = getPendingSyncQueue().map((item) =>
    item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
  );
  setPendingSyncQueue(queue);
}

export function markPendingSyncItemSyncing(id: string): void {
  patchItem(id, { status: 'syncing' });
}

export function markPendingSyncItemFailed(id: string, error: string | null): void {
  const queue = getPendingSyncQueue().map((item) =>
    item.id === id
      ? {
          ...item,
          status: 'failed' as const,
          attempts: item.attempts + 1,
          lastError: error ? error.slice(0, 200) : 'Falha ao sincronizar.',
          updatedAt: new Date().toISOString(),
        }
      : item,
  );
  setPendingSyncQueue(queue);
}

export function markPendingSyncItemSynced(id: string): void {
  patchItem(id, { status: 'synced', lastError: null });
}

export function clearSyncedItems(): void {
  setPendingSyncQueue(getPendingSyncQueue().filter((item) => item.status !== 'synced'));
}

/** Quantidade de itens ainda não sincronizados (pendentes, falhos ou em envio). */
export function getPendingSyncCount(): number {
  return getPendingSyncQueue().filter((item) => item.status !== 'synced').length;
}

export function clearPendingSyncQueue(): void {
  persistence.removeItem(PERSISTENCE_KEYS.pendingSyncQueue);
}
