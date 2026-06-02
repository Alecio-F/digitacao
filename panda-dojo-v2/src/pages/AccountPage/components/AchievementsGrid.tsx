import { Card } from '@/components/ui';
import type { LocalProfile } from '@/features/profile/hooks/useLocalProfile';
import styles from '../AccountPage.module.css';

interface Props {
  profile: LocalProfile;
}

export function AchievementsGrid({ profile }: Props) {
  const achievements = profile.achievementDetails;

  return (
    <Card as="section" className={styles.panel} aria-labelledby="achievements-title">
      <header className={styles.panelHeader}>
        <span className={styles.eyebrow}>Conquistas</span>
        <h2 id="achievements-title" className={styles.panelTitle}>
          Desbloqueadas ({achievements.length})
        </h2>
      </header>

      {achievements.length === 0 ? (
        <p className={styles.emptyText}>
          Complete seu primeiro treino para desbloquear conquistas.
        </p>
      ) : (
        <ul className={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <li key={achievement.id} className={styles.achievement}>
              <span className={styles.achievementIcon} aria-hidden="true">🏅</span>
              <div className={styles.achievementBody}>
                <strong className={styles.achievementName}>{achievement.title}</strong>
                <span className={styles.achievementDesc}>{achievement.description}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
