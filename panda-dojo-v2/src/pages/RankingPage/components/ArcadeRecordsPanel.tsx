import { Link } from 'react-router';
import { Card } from '@/components/ui';
import type { LocalRanking } from '@/features/ranking/hooks/useLocalRanking';
import styles from '../RankingPage.module.css';

interface Props {
  ranking: LocalRanking;
}

export function ArcadeRecordsPanel({ ranking }: Props) {
  const { pandaKeysBestScore, sealBestScore } = ranking;
  const hasRecords = pandaKeysBestScore > 0 || sealBestScore > 0;

  return (
    <Card as="section" className={styles.panel} aria-labelledby="arcade-records-title">
      <header className={styles.panelHeader}>
        <span className={styles.eyebrow}>Arcade</span>
        <h2 id="arcade-records-title" className={styles.panelTitle}>Recordes de minigames</h2>
      </header>

      {hasRecords ? (
        <ul className={styles.recordsList}>
          <li className={styles.recordRow}>
            <div className={styles.recordInfo}>
              <span className={styles.recordIcon} aria-hidden="true">🎹</span>
              <span className={styles.recordName}>Panda Keys</span>
            </div>
            <strong className={styles.recordValue}>{pandaKeysBestScore || '--'}</strong>
          </li>
          <li className={styles.recordRow}>
            <div className={styles.recordInfo}>
              <span className={styles.recordIcon} aria-hidden="true">🏯</span>
              <span className={styles.recordName}>Selos do Teclado</span>
            </div>
            <strong className={styles.recordValue}>{sealBestScore || '--'}</strong>
          </li>
        </ul>
      ) : (
        <p className={styles.emptyText}>
          Jogue no Arcade para registrar seu primeiro recorde.
        </p>
      )}

      <Link className={styles.ctaSecondary} to="/arcade">
        Ir para Arcade
      </Link>
    </Card>
  );
}
