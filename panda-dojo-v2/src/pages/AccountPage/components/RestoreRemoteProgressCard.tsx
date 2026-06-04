import { useEffect, useMemo, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { hasLocalProgress } from '@/features/backend-sync/syncLocalProgressService';
import {
  getRemoteProgressSummary,
  hasCompletedRestore,
  restoreRemoteProgressToLocal,
  type RemoteProgressSummary,
} from '@/features/backend-sync/restoreRemoteProgressService';
import styles from '../AccountPage.module.css';

interface Props {
  userId: string;
}

type RestoreStatus = 'checking' | 'idle' | 'restoring' | 'success' | 'error' | 'dismissed';

function SummaryMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <span>
      <strong>{label}</strong>
      {value}
    </span>
  );
}

export function RestoreRemoteProgressCard({ userId }: Props) {
  const [summary, setSummary] = useState<RemoteProgressSummary | null>(null);
  const [status, setStatus] = useState<RestoreStatus>('checking');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [alreadyRestored, setAlreadyRestored] = useState(() => hasCompletedRestore());
  const localHasProgress = useMemo(() => hasLocalProgress(), []);

  useEffect(() => {
    let active = true;

    getRemoteProgressSummary(userId).then((result) => {
      if (!active) return;
      if (!result.ok) {
        setStatus('error');
        setFeedback('Não foi possível verificar o progresso da nuvem agora.');
        return;
      }
      setSummary(result.summary);
      setStatus('idle');
    });

    return () => {
      active = false;
    };
  }, [userId]);

  const metrics = useMemo(() => {
    if (!summary) return [];
    return [
      { label: 'Nível', value: summary.profile.level },
      { label: 'XP', value: summary.profile.xp },
      { label: 'Treinos', value: summary.totalResults },
      { label: 'Fases', value: summary.completedLessons },
      { label: 'Melhor PPM', value: summary.bestPpm },
      { label: 'Recordes', value: summary.arcadeScores },
    ];
  }, [summary]);

  async function handleRestore() {
    setStatus('restoring');
    setFeedback(null);

    const result = await restoreRemoteProgressToLocal(userId);
    if (!result.ok) {
      setStatus('error');
      setFeedback('Não foi possível restaurar agora. Tente novamente em instantes.');
      return;
    }

    setAlreadyRestored(true);
    setStatus('success');
    setFeedback('Progresso restaurado. Atualizando a tela...');
    // Os dados locais foram reconstruídos; recarrega para refletir em toda a UI.
    window.setTimeout(() => window.location.reload(), 1200);
  }

  // Verificando ainda.
  if (status === 'checking') {
    return (
      <div className={styles.syncNotice}>
        <span className="material-symbols-outlined" aria-hidden="true">cloud_sync</span>
        <div>
          <strong>Verificando progresso na nuvem</strong>
          <p>Procurando treinos, fases e recordes salvos na sua conta online.</p>
        </div>
      </div>
    );
  }

  // Erro ao verificar (não bloqueia o app).
  if (status === 'error' && !summary) {
    return (
      <div className={styles.syncNotice}>
        <span className="material-symbols-outlined" aria-hidden="true">cloud_off</span>
        <div>
          <strong>Progresso da nuvem indisponível</strong>
          <p>{feedback ?? 'Tente novamente em instantes. Seu progresso local continua salvo.'}</p>
        </div>
      </div>
    );
  }

  // Sem progresso remoto: nada a restaurar.
  if (!summary || !summary.hasRemoteProgress) {
    if (status === 'success') return null;
    return null;
  }

  // Já restaurado nesta sessão/navegador: aviso compacto (permite restaurar de novo).
  if (alreadyRestored && status !== 'restoring' && status !== 'success') {
    return (
      <div className={styles.syncNotice}>
        <span className="material-symbols-outlined" aria-hidden="true">cloud_done</span>
        <div>
          <strong>Progresso da nuvem restaurado</strong>
          <p>Este navegador já recuperou seu progresso online.</p>
        </div>
      </div>
    );
  }

  if (status === 'dismissed') {
    return (
      <div className={styles.syncNotice}>
        <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
        <div>
          <strong>Restauração adiada</strong>
          <p>Você pode restaurar seu progresso da nuvem quando quiser.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.importCard}>
      <header className={styles.importCardHeader}>
        <div>
          <span className={styles.eyebrow}>Sync da nuvem</span>
          <h3>Restaurar progresso da nuvem</h3>
        </div>
        <Badge variant="info">Online</Badge>
      </header>

      <p className={styles.noticeText}>
        Encontramos progresso salvo na sua conta online. Você pode restaurar seus treinos, fases,
        XP e recordes neste navegador.
      </p>

      {localHasProgress && (
        <p className={styles.noticeText}>
          Você também tem progresso neste navegador. Restaurar mantém o melhor dos dois — nada é
          apagado.
        </p>
      )}

      <div className={styles.importSummaryGrid}>
        {metrics.map((item) => (
          <SummaryMetric key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      {feedback && (
        <p
          className={[
            styles.importFeedback,
            status === 'error' ? styles.importFeedbackError : styles.importFeedbackSuccess,
          ].join(' ')}
          role="status"
        >
          {feedback}
        </p>
      )}

      <div className={styles.importActions}>
        <Button
          variant="primary"
          onClick={handleRestore}
          disabled={status === 'restoring'}
          leftIcon={(
            <span className="material-symbols-outlined" aria-hidden="true">cloud_download</span>
          )}
        >
          {status === 'restoring' ? 'Restaurando...' : 'Restaurar progresso'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setStatus('dismissed')}
          disabled={status === 'restoring'}
        >
          Agora não
        </Button>
      </div>
    </div>
  );
}
