import { Link } from 'react-router';
import type { RankingViewModel } from '@/features/ranking/useRankingViewModel';
import styles from '../RankingPage.module.css';

interface Props {
  viewModel: RankingViewModel;
}

const PERIOD_LABELS = {
  today: 'Hoje',
  week: 'Semana',
  month: 'Mês',
  all: 'Sempre',
} as const;

export function RankingHero({ viewModel }: Props) {
  const { bestEntry, entries, period, scope, selectedConfig } = viewModel;
  const scopeLabel = scope === 'online' ? 'Online' : 'Local';
  const periodLabel = PERIOD_LABELS[period];
  const leaderPpm = bestEntry?.ppm ? Math.round(bestEntry.ppm) : '--';

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
          Veja o mural competitivo do Dojo, compare os melhores resultados e dispute
          posição com os digitadores mais afiados.
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
          <span>PPM</span>
          <strong>{leaderPpm}</strong>
          <small>líder do mural</small>
        </article>
        <article className={styles.heroMetricCard}>
          <span>Escopo atual</span>
          <strong>{scopeLabel}</strong>
          <small>mural selecionado</small>
        </article>
        <article className={styles.heroMetricCard}>
          <span>Resultados</span>
          <strong>{entries.length || '--'}</strong>
          <small>participantes filtrados</small>
        </article>
        <article className={styles.heroMetricCard}>
          <span>{periodLabel}</span>
          <strong>{selectedConfig.title}</strong>
          <small>{selectedConfig.status === 'soon' ? 'em preparação' : 'categoria ativa'}</small>
        </article>
      </div>
    </section>
  );
}
