import { Chip } from '@/components/ui';
import type { DailyMission } from '@/features/missions/types';
import styles from './Panels.module.css';

interface Props {
  missions: DailyMission[];
}

export function DailyMissionList({ missions }: Props) {
  return (
    <section className={styles.panel} aria-label="Missões diárias">
      <h2 className={styles.panelTitle}>Missões de hoje</h2>
      <div className={styles.missionList}>
        {missions.slice(0, 3).map((m) => (
          <article key={m.id} className={[styles.missionItem, m.completed ? styles.missionDone : ''].filter(Boolean).join(' ')}>
            <div className={styles.missionMeta}>
              <strong>{m.title}</strong>
              <span>{m.completed ? 'Concluída' : m.description}</span>
            </div>
            <Chip variant={m.completed ? 'success' : 'muted'}>
              {m.completed ? '✓' : `+${m.rewardXp} XP`}
            </Chip>
          </article>
        ))}
      </div>
    </section>
  );
}
