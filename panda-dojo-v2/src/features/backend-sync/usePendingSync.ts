import { useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { flushPendingSyncQueue, getPendingSyncCount } from './pendingSyncService';

/**
 * Tenta reenviar a fila de pendentes quando há usuário logado e Supabase
 * configurado: ao carregar (com debounce) e quando o navegador volta a ficar
 * online. Não faz nada se a fila estiver vazia, se não houver usuário ou se o
 * Supabase não estiver configurado.
 */
export function usePendingSync(): void {
  const { user, isSupabaseEnabled } = useAuth();
  const userId = user?.id ?? null;
  const lastRunRef = useRef(0);

  useEffect(() => {
    if (!isSupabaseEnabled || !userId) return;

    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      const now = Date.now();
      if (now - lastRunRef.current < 3000) return; // debounce simples
      if (getPendingSyncCount() === 0) return;
      lastRunRef.current = now;
      void flushPendingSyncQueue(userId);
    };

    const timer = window.setTimeout(run, 1500);
    window.addEventListener('online', run);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener('online', run);
    };
  }, [userId, isSupabaseEnabled]);
}
