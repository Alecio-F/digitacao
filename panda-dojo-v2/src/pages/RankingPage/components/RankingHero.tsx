import { Link } from 'react-router';
import type { RankingViewModel } from '@/features/ranking/useRankingViewModel';
import styles from '../RankingPage.module.css';

interface Props {
  viewModel: RankingViewModel;
}

export function RankingHero({ viewModel }: Props) {
  const { ranking, selectedConfig, currentMetricLabel, currentMetricValue } = viewModel;

  return (
    <section className={styles.hero} aria-labelledby="ranking-title">
      <div className={styles.heroContent}>
        <span className={styles.heroBadge}>Panda Dojo Arcade</span>
        <h1 id="ranking-title" className={styles.heroTitle}>
          Ranking do Dojo
        </h1>
        <p className={styles.heroLead}>
          Velocidade impressiona, mas precisão conquista respeito.
        </p>
        <p className={styles.heroText}>
          Compare seus melhores resultados, descubra sua posição e suba no mural dos
          digitadores mais afiados.
        </p>

        <div className={styles.heroActions}>
          <Link className={styles.ctaPrimary} to="/arena">
            Treinar na Type Arena
          </Link>
          <Link className={styles.ctaSecondary} to="/mapa">
            Ver Mapa do Dojo
          </Link>
        </div>
      </div>

      <div className={styles.heroMetrics} aria-label="Resumo do ranking selecionado">
        <article className={styles.heroMetricCard}>
          <span>{currentMetricLabel}</span>
          <strong>{currentMetricValue}</strong>
          <small>métrica atual</small>
        </article>
        <article className={styles.heroMetricCard}>
          <span>Sua melhor marca</span>
          <strong>{ranking.bestPpm || '--'}</strong>
          <small>PPM local</small>
        </article>
        <article className={styles.heroMetricCard}>
          <span>Treinos elegíveis</span>
          <strong>{ranking.eligibleTrainings}</strong>
          <small>de {ranking.totalTrainings} treinos</small>
        </article>
        <article className={styles.heroMetricCard}>
          <span>Categoria atual</span>
          <strong>{selectedConfig.title}</strong>
          <small>{selectedConfig.status === 'soon' ? 'em preparação' : 'ativa'}</small>
        </article>
      </div>
    </section>
  );
}
