import { ProgressBar } from '@/components/ui';
import { usePlayerProgress } from '@/features/gamification/hooks/usePlayerProgress';
import styles from './PlayerCard.module.css';

export function PlayerCard() {
  const profile = usePlayerProgress();

  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <span className={styles.title}>{profile.title}</span>
        <span className={styles.level}>Nível {profile.level}</span>
      </div>
      <ProgressBar
        value={profile.progressPercent}
        aria-label="Progresso de XP"
      />
      <div className={styles.row}>
        <span className={styles.xpLabel}>{profile.xp} XP</span>
        <span className={styles.level}>{profile.currentLevelXp} / {profile.requiredForLevel} XP</span>
      </div>
    </div>
  );
}
