import { ProgressBar } from '@/components/ui';
import { usePlayerProgress } from '../hooks/usePlayerProgress';
import styles from './PlayerStatus.module.css';

export function PlayerStatus() {
  const profile = usePlayerProgress();

  return (
    <div
      className={styles.status}
      aria-label={`Status do jogador: nível ${profile.level}, ${profile.xp} XP`}
    >
      <div className={styles.top}>
        <span className={styles.level}>Nv. {String(profile.level).padStart(2, '0')}</span>
        <span className={styles.percent}>{profile.progressPercent}%</span>
      </div>
      <strong className={styles.xp}>{profile.xp} XP</strong>
      <ProgressBar
        value={profile.progressPercent}
        aria-label="Progresso de XP do jogador"
        animated
        className={styles.bar}
      />
    </div>
  );
}
