/**
 * Contrato genérico de persistência chave→valor.
 *
 * Hoje a única implementação é o localStorageAdapter. No futuro (Fase de
 * Supabase) haverá um remoteStorageAdapter com a mesma interface, permitindo
 * trocar a fonte de dados sem alterar os repositories nem os componentes.
 *
 *   Componente → Hook/Service → Repository → StorageAdapter → (localStorage | Supabase)
 */
export interface StorageAdapter {
  /** Lê e desserializa um valor. Retorna `fallback` se ausente/ inválido. */
  getItem<T>(key: string, fallback: T): T;
  /** Serializa e grava um valor. */
  setItem<T>(key: string, value: T): void;
  /** Remove a chave. */
  removeItem(key: string): void;
  /** Lê, transforma e grava de forma atômica (do ponto de vista do chamador). */
  updateItem<T>(key: string, updater: (current: T) => T, fallback: T): T;
}
