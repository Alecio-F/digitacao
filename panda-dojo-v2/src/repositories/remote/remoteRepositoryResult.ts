export interface RemoteRepositoryResult<T> {
  data: T | null;
  error: string | null;
}

export const NOT_CONFIGURED_MESSAGE = 'Supabase não está configurado.';

export function disabledResult<T>(): RemoteRepositoryResult<T> {
  return { data: null, error: NOT_CONFIGURED_MESSAGE };
}

export function errorResult<T>(error: unknown): RemoteRepositoryResult<T> {
  return {
    data: null,
    error: error instanceof Error ? error.message : 'Não foi possível concluir a operação remota.',
  };
}
