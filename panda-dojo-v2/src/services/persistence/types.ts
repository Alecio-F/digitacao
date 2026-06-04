/**
 * Tipos compartilhados da camada de persistência.
 *
 * Esta camada isola COMO os dados são lidos/gravados (adapter) de O QUE é
 * lido/gravado (repositories). Hoje só existe o localStorageAdapter; a interface
 * StorageAdapter foi pensada para que um `remoteStorageAdapter` (Supabase)
 * possa substituí-lo sem mudanças nos repositories.
 */
export type { StorageAdapter } from './storageAdapter';
export { localStorageAdapter } from './localStorageAdapter';
export { PERSISTENCE_KEYS } from './persistenceKeys';
export type { PersistenceKey, PersistenceKeyName } from './persistenceKeys';

/** Adapter ativo da aplicação. Trocar aqui no futuro para apontar ao Supabase. */
export { localStorageAdapter as persistence } from './localStorageAdapter';
