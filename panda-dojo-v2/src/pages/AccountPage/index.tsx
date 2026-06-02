import { PageShell } from '@/components/layout/PageShell';
import { useLocalProfile } from '@/features/profile/hooks/useLocalProfile';
import { AchievementsGrid } from './components/AchievementsGrid';
import { FutureAccountNotice } from './components/FutureAccountNotice';
import { LocalDataActions } from './components/LocalDataActions';
import { LocalProgressPanel } from './components/LocalProgressPanel';
import { MapProgressPanel } from './components/MapProgressPanel';
import { ProfileHero } from './components/ProfileHero';
import { RecentHistoryPanel } from './components/RecentHistoryPanel';
import { StatsOverview } from './components/StatsOverview';
import styles from './AccountPage.module.css';

export function AccountPage() {
  const profile = useLocalProfile();

  return (
    <PageShell title="Conta">
      <div className={styles.page}>
        <ProfileHero profile={profile} />
        <StatsOverview profile={profile} />

        <section className="dojo-section">
          <div className={styles.twoColumn}>
            <LocalProgressPanel profile={profile} />
            <MapProgressPanel profile={profile} />
          </div>
        </section>

        <section className="dojo-section">
          <RecentHistoryPanel profile={profile} />
        </section>

        <section className="dojo-section">
          <AchievementsGrid profile={profile} />
        </section>

        <section className="dojo-section">
          <div className={styles.twoColumn}>
            <FutureAccountNotice />
            <LocalDataActions profile={profile} />
          </div>
        </section>
      </div>
    </PageShell>
  );
}
