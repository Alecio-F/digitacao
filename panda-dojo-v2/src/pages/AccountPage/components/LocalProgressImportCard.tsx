import { useMemo, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import {
  getLocalProgressSummary,
  hasImportedLocalProgress,
  importLocalProgressToSupabase,
  type LocalProgressSummary,
} from '@/features/backend-sync/syncLocalProgressService';
import styles from '../AccountPage.module.css';

interface Props {
  userId: string;
  onImported?: () => Promise<void> | void;
}

type ImportStatus = 'idle' | 'importing' | 'success' | 'error' | 'dismissed';

function SummaryMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <span>
      <strong>{label}</strong>
      {value}
    </span>
  );
}

function getSummarySnapshot(): LocalProgressSummary {
  return getLocalProgressSummary();
}

function getImportErrorFeedback(error: string | null): string {
  const normalized = error?.toLowerCase() ?? '';
  if (
    normalized.includes('sess') ||
    normalized.includes('jwt') ||
    normalized.includes('auth') ||
    normalized.includes('401')
  ) {
    return 'Sua sessão online expirou. Entre novamente e tente importar o progresso local.';
  }

  return 'Não foi possível importar agora. Seu progresso local continua salvo.';
}

export function LocalProgressImportCard({ userId, onImported }: Props) {
  const [summary, setSummary] = useState<LocalProgressSummary>(() => getSummarySnapshot());
  const [alreadyImported, setAlreadyImported] = useState(() => hasImportedLocalProgress());
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);
  const canImport = summary.hasProgress && !alreadyImported && status !== 'dismissed';
  const metrics = useMemo(() => ([
    { label: 'Nível', value: summary.level },
    { label: 'XP', value: summary.xp },
    { label: 'Treinos', value: summary.totalResults },
    { label: 'Fases', value: summary.completedLessons },
    { label: 'Melhor PPM', value: summary.bestPpm },
    { label: 'Recordes', value: summary.arcadeScores },
  ]), [summary]);

  async function handleImport() {
    setStatus('importing');
    setFeedback(null);

    const result = await importLocalProgressToSupabase(userId);
    setSummary(result.summary);

    if (!result.ok) {
      setStatus('error');
      setFeedback(getImportErrorFeedback(result.error));
      return;
    }

    setAlreadyImported(true);
    setStatus('success');
    setFeedback('Progresso importado com sucesso.');
    await onImported?.();
  }

  if (!summary.hasProgress) {
    return (
      <div className={styles.syncNotice}>
        <span className="material-symbols-outlined" aria-hidden="true">cloud_done</span>
        <div>
          <strong>Conta online pronta</strong>
          <p>Quando você treinar logado, os novos resultados serão salvos localmente e enviados para a nuvem.</p>
        </div>
      </div>
    );
  }

  if (!canImport) {
    const importedNow = status === 'success';
    const message = importedNow
      ? 'Progresso importado com sucesso.'
      : alreadyImported
      ? 'Progresso já importado.'
      : 'Importação adiada nesta sessão. Seu progresso local continua salvo neste navegador.';
    const title = importedNow
      ? 'Progresso importado com sucesso'
      : alreadyImported
      ? 'Progresso já importado'
      : 'Importação adiada';

    return (
      <div className={styles.syncNotice}>
        <span className="material-symbols-outlined" aria-hidden="true">
          {alreadyImported ? 'cloud_done' : 'schedule'}
        </span>
        <div>
          <strong>{title}</strong>
          <p>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.importCard}>
      <header className={styles.importCardHeader}>
        <div>
          <span className={styles.eyebrow}>Sync local-first</span>
          <h3>Importar progresso local</h3>
        </div>
        <Badge variant="info">Manual</Badge>
      </header>

      <p className={styles.noticeText}>
        Encontramos progresso salvo neste navegador. Você pode importar seus treinos, fases,
        XP e recordes para sua conta online.
      </p>

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
          onClick={handleImport}
          disabled={status === 'importing'}
          leftIcon={(
            <span className="material-symbols-outlined" aria-hidden="true">
              cloud_upload
            </span>
          )}
        >
          {status === 'importing' ? 'Importando...' : 'Importar progresso'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setStatus('dismissed')}
          disabled={status === 'importing'}
        >
          Agora não
        </Button>
      </div>
    </div>
  );
}
