import { Link } from 'react-router';
import type { LocalRanking } from '@/features/ranking/hooks/useLocalRanking';
import styles from '../RankingPage.module.css';

interface Props {
  ranking: LocalRanking;
}

export function RankingHero({ ranking }: Props) {
  return (
    <section className={`dojo-section ${styles.hero}`}>
      <div className={styles.heroCard}>
        <div className={styles.heroInfo}>
          <span className={styles.eyebrow}>Ranking do Dojo</span>
          <h1 className={styles.heroTitle}>Compare sua evolução.</h1>
          <p className={styles.heroSubtitle}>
            Veja seus melhores resultados locais e acompanhe sua progressão até o ranking global
            chegar.
          </p>

          <div className={styles.heroActions}>
            <Link className={styles.ctaPrimary} to="/arena">
              Treinar na Arena
            </Link>
            <Link className={styles.ctaSecondary} to="/arcade">
              Jogar Arcade
            </Link>
          </div>
        </div>

        <div className={styles.heroHighlight} aria-hidden={ranking.bestPpm === 0}>
          <span className={styles.heroHighlightLabel}>Melhor PPM</span>
          <strong className={styles.heroHighlightValue}>{ranking.bestPpm || '--'}</strong>
          <span className={styles.heroHighlightHint}>
            {ranking.totalTrainings} {ranking.totalTrainings === 1 ? 'treino' : 'treinos'} registrados
          </span>
        </div>
      </div>
    </section>
  );
}
