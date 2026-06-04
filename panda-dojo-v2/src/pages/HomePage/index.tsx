import { PageShell } from '@/components/layout/PageShell';
import { usePlayerProgress } from '@/features/gamification/hooks/usePlayerProgress';
import { useDailyMissions } from '@/features/missions/hooks/useDailyMissions';
import { useRecommendations } from '@/features/recommendations/hooks/useRecommendations';
import { AchievementsPreview } from './components/AchievementsPreview';
import { DailyChallengeBanner } from './components/DailyChallengeBanner';
import { DailyMissionsPanel } from './components/DailyMissionsPanel';
import { HomeHero } from './components/HomeHero';
import { LocalRankingPanel } from './components/LocalRankingPanel';
import { PlayerProgressPanel } from './components/PlayerProgressPanel';
import { QuickAccessGrid } from './components/QuickAccessGrid';
import { RecommendationsPanel } from './components/RecommendationsPanel';
import styles from './HomePage.module.css';

export function HomePage() {
  const profile = usePlayerProgress();
  const missions = useDailyMissions();
  const recommendations = useRecommendations();

  return (
    <PageShell title="Início" className={styles.homePage}>
      <div className={styles.container}>
        <HomeHero profile={profile} />
        <DailyChallengeBanner />
        <QuickAccessGrid />

        <section className={styles.homeGrid} aria-label="Painéis da Home">
          <div className={styles.mainColumn}>
            <PlayerProgressPanel profile={profile} />
            <DailyMissionsPanel missions={missions} />
          </div>

          <aside className={styles.sideColumn}>
            <RecommendationsPanel recommendations={recommendations} />
            <LocalRankingPanel profile={profile} />
            <AchievementsPreview
              achievements={profile.achievementDetails}
              mistakes={profile.lastMistakes}
            />
          </aside>
        </section>
      </div>
    </PageShell>
  );
}
