import { Link } from 'react-router';
import { Card, ProgressBar } from '@/components/ui';
import type { LocalProfile } from '@/features/profile/hooks/useLocalProfile';
import styles from '../AccountPage.module.css';

interface Props {
  profile: LocalProfile;
}

export function MapProgressPanel({ profile }: Props) {
  const { completedLessonsCount, totalLessonsCount, medals, nextLesson } = profile;
  const hasProgress = completedLessonsCount > 0;

  return (
    <Card as="article" className={styles.panel} aria-labelledby="map-title">
      <header className={styles.panelHeader}>
        <span className={styles.eyebrow}>Mapa do Dojo</span>
        <h2 id="map-title" className={styles.panelTitle}>Progresso das fases</h2>
      </header>

      {hasProgress ? (
        <>
          <div className={styles.panelProgress}>
            <ProgressBar
              value={completedLessonsCount}
              max={totalLessonsCount}
              tone="success"
              showValue
              label={`${completedLessonsCount} de ${totalLessonsCount} fases`}
            />
          </div>

          <ul className={styles.medalRow} aria-label="Medalhas conquistadas">
            <li className={styles.medal}>
              <span className={styles.medalIcon} aria-hidden="true">🥇</span>
              <span>Ouro: <strong>{medals.gold}</strong></span>
            </li>
            <li className={styles.medal}>
              <span className={styles.medalIcon} aria-hidden="true">🥈</span>
              <span>Prata: <strong>{medals.silver}</strong></span>
            </li>
            <li className={styles.medal}>
              <span className={styles.medalIcon} aria-hidden="true">🥉</span>
              <span>Bronze: <strong>{medals.bronze}</strong></span>
            </li>
          </ul>

          {nextLesson && (
            <p className={styles.mutedText}>
              Próxima fase sugerida: <strong>{nextLesson.title}</strong>
            </p>
          )}
        </>
      ) : (
        <p className={styles.emptyText}>Comece pela Fase 01 no Mapa do Dojo.</p>
      )}

      <Link className={styles.ctaSecondary} to="/mapa">
        Abrir Mapa
      </Link>
    </Card>
  );
}
