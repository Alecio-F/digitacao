import { Badge, MetricCard, Panel, ProgressBar } from '@/components/ui';
import type { DojoProfile } from '@/features/gamification/types';
import styles from '../HomePage.module.css';

interface Props {
  profile: DojoProfile;
}

export function PlayerProgressPanel({ profile }: Props) {
  const hasHistory = profile.history.length > 0;

  return (
    <Panel
      as="section"
      title="Progresso do jogador"
      subtitle="Dados locais lidos do navegador."
      actions={<Badge variant="success">{profile.title}</Badge>}
      className={styles.playerProgressPanel}
    >
      <div className={styles.metricsGrid}>
        <MetricCard label="Nível" value={profile.level} tone="special" />
        <MetricCard label="XP" value={`${profile.xp} XP`} />
        <MetricCard label="Melhor PPM" value={hasHistory ? profile.bestPpm : '--'} tone="special" />
        <MetricCard label="Precisão" value={hasHistory ? profile.lastPrecision : '--'} tone="success" />
        <MetricCard label="Sequência" value={`${profile.dailyStreak} dia(s)`} />
        <MetricCard label="Panda Keys" value={profile.gameBestScore || '--'} />
      </div>

      <div className={styles.progressBlock}>
        <ProgressBar
          value={profile.progressPercent}
          label={`${profile.currentLevelXp}/${profile.requiredForLevel} XP para ${profile.nextTitle}`}
          showValue
          animated
        />
      </div>
    </Panel>
  );
}
