import { MetricCard } from '@/components/ui';
import type { LocalProfile } from '@/features/profile/hooks/useLocalProfile';
import styles from '../AccountPage.module.css';

interface Props {
  profile: LocalProfile;
}

export function StatsOverview({ profile }: Props) {
  return (
    <section className="dojo-section" aria-labelledby="stats-title">
      <header className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Resumo</span>
        <h2 id="stats-title" className={styles.sectionTitle}>Suas estatísticas</h2>
      </header>

      <div className={styles.statsGrid}>
        <MetricCard label="Melhor PPM" value={profile.bestPpm || '--'} tone="special" />
        <MetricCard
          label="Melhor precisão"
          value={profile.bestAccuracy ? `${profile.bestAccuracy}%` : '--'}
          tone="success"
        />
        <MetricCard label="Total de treinos" value={profile.totalTrainings} />
        <MetricCard label="Recorde Panda Keys" value={profile.pandaKeysBestScore || '--'} tone="warning" />
        <MetricCard
          label="Fases concluídas"
          value={`${profile.completedLessonsCount}/${profile.totalLessonsCount}`}
        />
        <MetricCard label="Conquistas" value={profile.achievementsCount} tone="special" />
      </div>
    </section>
  );
}
