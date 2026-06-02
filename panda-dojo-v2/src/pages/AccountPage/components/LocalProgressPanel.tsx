import { Card, ProgressBar } from '@/components/ui';
import type { LocalProfile } from '@/features/profile/hooks/useLocalProfile';
import styles from '../AccountPage.module.css';

interface Props {
  profile: LocalProfile;
}

function formatLastTraining(value: string): string {
  if (!value) return 'Ainda não treinou';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function LocalProgressPanel({ profile }: Props) {
  return (
    <Card as="article" className={styles.panel} aria-labelledby="progress-title">
      <header className={styles.panelHeader}>
        <span className={styles.eyebrow}>Progresso</span>
        <h2 id="progress-title" className={styles.panelTitle}>Nível e títulos</h2>
      </header>

      <dl className={styles.dataList}>
        <div className={styles.dataRow}>
          <dt>Nível atual</dt>
          <dd>{profile.level}</dd>
        </div>
        <div className={styles.dataRow}>
          <dt>XP total</dt>
          <dd>{profile.xp}</dd>
        </div>
        <div className={styles.dataRow}>
          <dt>Título atual</dt>
          <dd>{profile.title}</dd>
        </div>
        <div className={styles.dataRow}>
          <dt>Próximo título</dt>
          <dd>{profile.nextTitle}</dd>
        </div>
        <div className={styles.dataRow}>
          <dt>Sequência diária</dt>
          <dd>{profile.dailyStreak} {profile.dailyStreak === 1 ? 'dia' : 'dias'}</dd>
        </div>
        <div className={styles.dataRow}>
          <dt>Último treino</dt>
          <dd>{formatLastTraining(profile.lastTrainingDate)}</dd>
        </div>
      </dl>

      <div className={styles.panelProgress}>
        <ProgressBar
          value={profile.progressPercent}
          tone="special"
          showValue
          label={`Rumo a ${profile.nextTitle}`}
        />
        <p className={styles.mutedText}>
          {profile.currentLevelXp}/{profile.requiredForLevel} XP até o próximo nível.
        </p>
      </div>
    </Card>
  );
}
