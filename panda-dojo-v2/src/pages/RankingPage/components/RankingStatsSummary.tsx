import type { RankingScope } from '@/features/ranking/rankingTypes';
import styles from '../RankingPage.module.css';

interface StatItem {
  label: string;
  value: string | number;
}

interface Props {
  stats: StatItem[];
  scope: RankingScope;
}

export function RankingStatsSummary({ stats, scope }: Props) {
  const title = scope === 'online' ? 'Resumo do mural selecionado' : 'Seu desempenho no Dojo';
  const eyebrow = scope === 'online' ? 'Leitura secundária' : 'Resumo pessoal';

  return (
    <section className={styles.statsSection} aria-labelledby="ranking-stats-title">
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 id="ranking-stats-title">{title}</h2>
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
