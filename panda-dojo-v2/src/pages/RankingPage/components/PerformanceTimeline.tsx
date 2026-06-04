import { Card } from '@/components/ui';
import { parsePrecision } from '@/features/gamification/logic/xpCalculator';
import type { LocalRanking } from '@/features/ranking/hooks/useLocalRanking';
import styles from '../RankingPage.module.css';

interface Props {
  ranking: LocalRanking;
}

export function PerformanceTimeline({ ranking }: Props) {
  const { recentResults, bestPpm } = ranking;
  const scaleMax = Math.max(bestPpm, ...recentResults.map((item) => Number(item.ppm) || 0), 1);

  return (
    <Card as="section" className={styles.panel} aria-labelledby="timeline-title">
      <header className={styles.panelHeader}>
        <span className={styles.eyebrow}>Evolução recente</span>
        <h2 id="timeline-title" className={styles.panelTitle}>Últimos elegíveis</h2>
      </header>

      {recentResults.length === 0 ? (
        <p className={styles.emptyText}>
          Seus últimos treinos elegíveis para ranking aparecerão aqui.
        </p>
      ) : (
        <ul className={styles.timeline}>
          {recentResults.map((item, index) => {
            const ppm = Number(item.ppm) || 0;
            const percent = Math.max(6, Math.round((ppm / scaleMax) * 100));
            return (
              <li key={`${item.data ?? 'treino'}-${index}`} className={styles.timelineRow}>
                <div className={styles.timelineMeta}>
                  <span className={styles.timelineDate}>{item.data ?? '-'}</span>
                  <span className={styles.timelinePrecision}>
                    {item.precisao ?? `${parsePrecision(item.precisao)}%`}
                  </span>
                </div>
                <div className={styles.timelineBarTrack}>
                  <div className={styles.timelineBarFill} style={{ width: `${percent}%` }} />
                </div>
                <strong className={styles.timelinePpm}>{ppm} PPM</strong>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
