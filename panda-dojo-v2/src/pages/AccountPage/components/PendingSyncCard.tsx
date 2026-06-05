import { useState } from 'react';
import { Badge, Button } from '@/components/ui';
import {
  flushPendingSyncQueue,
  getPendingSyncCount,
} from '@/features/backend-sync/pendingSyncService';
import styles from '../AccountPage.module.css';

interface Props {
  userId: string;
}

type SyncStatus = 'idle' | 'syncing' | 'done' | 'partial';

export function PendingSyncCard({ userId }: Props) {
  const [count, setCount] = useState(() => getPendingSyncCount());
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSync() {
    setStatus('syncing');
    setFeedback(null);

    const result = await flushPendingSyncQueue(userId, { retryExhausted: true });
    setCount(result.remaining);

    if (result.remaining === 0) {
      setStatus('done');
      setFeedback('Tudo sincronizado.');
    } else {
      setStatus('partial');
      setFeedback('Alguns itens não foram sincronizados. Tentaremos novamente depois.');
    }
  }

  // Nada pendente e nenhuma ação feita: não exibe nada.
  if (count === 0 && status === 'idle') return null;

  // Tudo sincronizado após uma ação.
  if (count === 0) {
    return (
      <div className={styles.syncNotice}>
        <span className="material-symbols-outlined" aria-hidden="true">cloud_done</span>
        <div>
          <strong>Tudo sincronizado</strong>
          <p>Não há itens aguardando envio para a nuvem.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.importCard}>
      <header className={styles.importCardHeader}>
        <div>
          <span className={styles.eyebrow}>Sincronização pendente</span>
          <h3>Itens aguardando envio</h3>
        </div>
        <Badge variant="warning">{count}</Badge>
      </header>

      <p className={styles.noticeText}>
        Há {count} {count === 1 ? 'item salvo' : 'itens salvos'} neste navegador aguardando envio
        para a nuvem. Seu progresso local continua salvo.
      </p>

      {feedback && (
        <p
          className={[
            styles.importFeedback,
            status === 'partial' ? styles.importFeedbackError : styles.importFeedbackSuccess,
          ].join(' ')}
          role="status"
        >
          {feedback}
        </p>
      )}

      <div className={styles.importActions}>
        <Button
          variant="primary"
          onClick={handleSync}
          disabled={status === 'syncing'}
          leftIcon={(
            <span className="material-symbols-outlined" aria-hidden="true">cloud_sync</span>
          )}
        >
          {status === 'syncing' ? 'Sincronizando...' : 'Sincronizar agora'}
        </Button>
      </div>
    </div>
  );
}
