import { getModeLabel } from '@/features/ranking/useRankingViewModel';
import type { RankingEntry, RankingMetric } from '@/features/ranking/rankingTypes';
import { formatDate } from '@/utils/format';
import styles from '../RankingPage.module.css';

interface Props {
  entries: RankingEntry[];
  metric: RankingMetric;
  metricLabel: string;
}

function formatMetric(entry: RankingEntry, metric: RankingMetric): string {
  if (metric === 'accuracy') return `${Math.round(entry.metricValue)}%`;
  if (metric === 'lowest_time') return `${Math.round(entry.metricValue)}s`;
  if (metric === 'combo') return `${Math.round(entry.metricValue)}x`;
  return String(Math.round(entry.metricValue));
}

function podiumClass(position: number): string {
  if (position === 1) return styles.podiumFirst;
  if (position === 2) return styles.podiumSecond;
  return styles.podiumThird;
}

export function RankingPodium({ entries, metric, metricLabel }: Props) {
  const ordered = [...entries].sort((a, b) => {
    const order = [2, 1, 3];
    return order.indexOf(a.position) - order.indexOf(b.position);
  });

  return (
    <section className={styles.podiumSection} aria-labelledby="ranking-podium-title">
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Top 3</span>
        <h2 id="ranking-podium-title">Pódio do Dojo</h2>
      </div>

      <div className={styles.podiumGrid}>
        {ordered.map((entry) => (
          <article
            key={entry.id}
            className={`${styles.podiumCard} ${podiumClass(entry.position)}`}
            aria-label={`${entry.position}º lugar, ${entry.displayName}`}
          >
            <span className={styles.podiumPosition}>{entry.position}º</span>
            <div className={styles.podiumMedal} aria-hidden="true" />
            <h3>{entry.displayName}</h3>
            <p>{entry.position === 1 ? 'Mestre do Dojo' : getModeLabel(entry)}</p>
            <strong>{formatMetric(entry, metric)}</strong>
            <span className={styles.podiumMetricLabel}>{metricLabel}</span>
            <dl className={styles.podiumMeta}>
              <div>
                <dt>PPM</dt>
                <dd>{entry.ppm}</dd>
              </div>
              <div>
                <dt>Precisão</dt>
                <dd>{Math.round(entry.accuracy)}%</dd>
              </div>
              <div>
                <dt>Combo</dt>
                <dd>{entry.maxCombo}x</dd>
              </div>
            </dl>
            <time dateTime={entry.completedAt}>{formatDate(entry.completedAt)}</time>
          </article>
        ))}
      </div>
    </section>
  );
}
