import { Link } from 'react-router';
import { ProgressBar } from '@/components/ui';
import type { LocalProfile } from '@/features/profile/hooks/useLocalProfile';
import styles from '../AccountPage.module.css';

interface Props {
  profile: LocalProfile;
}

export function ProfileHero({ profile }: Props) {
  return (
    <section className={`dojo-section ${styles.hero}`}>
      <div className={styles.heroCard}>
        <div className={styles.heroAvatar}>
          <img src="/mentor-panda.png" alt="" width={108} height={108} />
          <span className={styles.heroLevelBadge}>Nv {profile.level}</span>
        </div>

        <div className={styles.heroInfo}>
          <span className={styles.eyebrow}>Perfil local</span>
          <h1 className={styles.heroTitle}>Seu progresso no Dojo.</h1>
          <p className={styles.heroSubtitle}>
            Esses dados estão salvos neste navegador. A conta online chegará em uma próxima versão.
          </p>

          <div className={styles.heroMeta}>
            <span className={styles.heroChip}>{profile.title}</span>
            <span className={styles.heroChipMuted}>{profile.xp} XP</span>
            <span className={styles.heroChipMuted}>
              🔥 {profile.dailyStreak} {profile.dailyStreak === 1 ? 'dia' : 'dias'} de sequência
            </span>
          </div>

          <div className={styles.heroProgress}>
            <ProgressBar
              value={profile.progressPercent}
              tone="special"
              size="lg"
              aria-label={`Progresso para ${profile.nextTitle}`}
            />
            <p className={styles.heroProgressHint}>
              {profile.currentLevelXp}/{profile.requiredForLevel} XP para {profile.nextTitle}.
            </p>
          </div>

          <div className={styles.heroActions}>
            <Link className={styles.ctaPrimary} to="/arena">
              Ir para Arena
            </Link>
            <Link className={styles.ctaSecondary} to="/mapa">
              Abrir Mapa
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
