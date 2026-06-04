import { MetricCard } from '@/components/ui';
import type { LocalRanking } from '@/features/ranking/hooks/useLocalRanking';
import styles from '../RankingPage.module.css';

interface Props {
  ranking: LocalRanking;
}

export function BestStatsPanel({ ranking }: Props) {
  return (
    <section className="dojo-section" aria-labelledby="best-stats-title">
      <header className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Recordes pessoais</span>
        <h2 id="best-stats-title" className={styles.sectionTitle}>Suas melhores marcas</h2>
      </header>

      <div className={styles.statsGrid}>
        <MetricCard label="Melhor PPM" value={ranking.bestPpm || '--'} highlight />
        <MetricCard label="Melhor CPM" value={ranking.bestCpm || '--'} tone="special" />
        <MetricCard
          label="Melhor precisão"
          value={ranking.bestAccuracy ? `${ranking.bestAccuracy}%` : '--'}
          tone="success"
        />
        <MetricCard label="Melhor combo" value={ranking.bestCombo || '--'} tone="warning" />
        <MetricCard label="Treinos elegíveis" value={ranking.eligibleTrainings} />
        <MetricCard
          label="Média de precisão"
          value={ranking.averageAccuracy ? `${ranking.averageAccuracy}%` : '--'}
        />
      </div>
    </section>
  );
}
