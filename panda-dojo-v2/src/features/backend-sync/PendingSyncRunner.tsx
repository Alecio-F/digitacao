import { usePendingSync } from './usePendingSync';

/**
 * Componente sem UI: roda o flush automático da fila de pendentes. Deve ficar
 * dentro do AuthProvider (usa useAuth).
 */
export function PendingSyncRunner() {
  usePendingSync();
  return null;
}
