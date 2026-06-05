import styles from '../RankingPage.module.css';

interface StatItem {
  label: string;
  value: string | number;
}

interface Props {
  stats: StatItem[];
}

export function RankingStatsSummary({ stats }: Props) {
  return (
    <section className={styles.statsSection} aria-labelledby="ranking-stats-title">
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Resumo competitivo</span>
        <h2 id="ranking-stats-title">Seus números no Dojo</h2>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <article key={stat.label} className={styles.statCard}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
