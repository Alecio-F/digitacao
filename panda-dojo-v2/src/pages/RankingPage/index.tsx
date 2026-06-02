import { PageShell } from '@/components/layout/PageShell';
import { useLocalRanking } from '@/features/ranking/hooks/useLocalRanking';
import { ArcadeRecordsPanel } from './components/ArcadeRecordsPanel';
import { BestStatsPanel } from './components/BestStatsPanel';
import { GlobalRankingNotice } from './components/GlobalRankingNotice';
import { LocalLeaderboard } from './components/LocalLeaderboard';
import { PerformanceTimeline } from './components/PerformanceTimeline';
import { RankingHero } from './components/RankingHero';
import styles from './RankingPage.module.css';

export function RankingPage() {
  const ranking = useLocalRanking();

  return (
    <PageShell title="Ranking">
      <div className={styles.page}>
        <RankingHero ranking={ranking} />
        <BestStatsPanel ranking={ranking} />

        <section className="dojo-section">
          <LocalLeaderboard ranking={ranking} />
        </section>

        <section className="dojo-section">
          <div className={styles.twoColumn}>
            <PerformanceTimeline ranking={ranking} />
            <ArcadeRecordsPanel ranking={ranking} />
          </div>
        </section>

        <section className="dojo-section">
          <GlobalRankingNotice />
        </section>
      </div>
    </PageShell>
  );
}
