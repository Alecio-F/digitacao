import { getModeLabel } from '@/features/ranking/useRankingViewModel';
import type { RankingEntry, RankingMetric } from '@/features/ranking/rankingTypes';
import { UserAvatar } from '@/components/user/UserAvatar';
import { formatDate } from '@/utils/format';
import styles from '../RankingPage.module.css';

interface Props {
  entry: RankingEntry;
  metric: RankingMetric;
  metricLabel: string;
}

function formatMetricValue(entry: RankingEntry, metric: RankingMetric): string {
  if (metric === 'accuracy') return `${Math.round(entry.metricValue)}%`;
  if (metric === 'lowest_time') return `${Math.round(entry.metricValue)}s`;
  if (metric === 'combo') return `${Math.round(entry.metricValue)}x`;
  return String(Math.round(entry.metricValue));
}

export function RankingListItem({ entry, metric, metricLabel }: Props) {
  return (
    <article className={styles.listItem}>
      <div className={styles.listRank} aria-label={`${entry.position}º lugar`}>
        #{entry.position}
      </div>

      <div className={styles.listMain}>
        <UserAvatar
          avatarUrl={entry.avatarUrl}
          displayName={entry.displayName}
          username={entry.username}
          size="sm"
        />
        <div className={styles.listMainText}>
          <h3>{entry.displayName}</h3>
          <p>
            {getModeLabel(entry)} · <time dateTime={entry.completedAt}>{formatDate(entry.completedAt)}</time>
          </p>
        </div>
      </div>

      <div className={styles.listMetric}>
        <span>{metricLabel}</span>
        <strong>{formatMetricValue(entry, metric)}</strong>
      </div>

      <dl className={styles.listStats}>
        <div>
          <dt>PPM</dt>
          <dd>{entry.ppm}</dd>
        </div>
        <div>
          <dt>CPM</dt>
          <dd>{entry.cpm}</dd>
        </div>
        <div>
          <dt>Precisão</dt>
          <dd>{Math.round(entry.accuracy)}%</dd>
        </div>
        <div>
          <dt>Erros</dt>
          <dd>{entry.errors}</dd>
        </div>
        <div>
          <dt>Combo</dt>
          <dd>{entry.maxCombo}x</dd>
        </div>
      </dl>

      <span className={entry.validForRanking ? styles.eligibleBadge : styles.invalidBadge}>
        {entry.validForRanking ? 'Elegível' : 'Fora do placar'}
      </span>
    </article>
  );
}
