import { Badge, MetricCard, ProgressBar } from '@/components/ui';
import type { DojoProfile } from '@/features/gamification/types';
import styles from './Panels.module.css';

interface Props {
  profile: DojoProfile;
}

export function PlayerProgressPanel({ profile }: Props) {
  const hasHistory = profile.history.length > 0;

  return (
    <section className={styles.panel} aria-label="Progresso do jogador">
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Seu progresso</h2>
        <Badge variant="success">{profile.title}</Badge>
      </div>

      <div className={styles.metrics}>
        <MetricCard label="Nível" value={profile.level} highlight />
        <MetricCard label="XP Total" value={`${profile.xp} XP`} />
        <MetricCard label="Melhor PPM" value={hasHistory ? profile.bestPpm : '--'} highlight />
        <MetricCard label="Precisão" value={hasHistory ? profile.lastPrecision : '--'} />
        <MetricCard label="Sequência" value={`${profile.dailyStreak} dia(s)`} />
      </div>

      <div className={styles.xpSection}>
        <p className={styles.xpLabel}>
          {hasHistory
            ? `${profile.currentLevelXp}/${profile.requiredForLevel} XP para ${profile.nextTitle}`
            : 'Faça seu primeiro treino para começar sua jornada.'}
        </p>
        <ProgressBar
          value={profile.progressPercent}
          aria-label={`Progresso de XP: ${profile.progressPercent}%`}
          animated
        />
      </div>
    </section>
  );
}
