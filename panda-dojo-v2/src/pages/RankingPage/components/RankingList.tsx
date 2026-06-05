import type { RankingEntry, RankingMetric } from '@/features/ranking/rankingTypes';
import { RankingListItem } from './RankingListItem';
import styles from '../RankingPage.module.css';

interface Props {
  entries: RankingEntry[];
  fallbackEntries: RankingEntry[];
  metric: RankingMetric;
  metricLabel: string;
}

export function RankingList({ entries, fallbackEntries, metric, metricLabel }: Props) {
  const visibleEntries = entries.length > 0 ? entries : fallbackEntries.slice(0, 3);
  const title = entries.length > 0 ? 'Lista completa' : 'Resultados no pódio';

  return (
    <section className={styles.listSection} aria-labelledby="ranking-list-title">
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Placar completo</span>
        <h2 id="ranking-list-title">{title}</h2>
      </div>

      <div className={styles.listStack}>
        {visibleEntries.map((entry) => (
          <RankingListItem
            key={entry.id}
            entry={entry}
            metric={metric}
            metricLabel={metricLabel}
          />
        ))}
      </div>
    </section>
  );
}
