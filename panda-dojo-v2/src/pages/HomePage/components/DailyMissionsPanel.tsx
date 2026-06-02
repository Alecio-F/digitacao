import { Chip, Panel, ProgressBar } from '@/components/ui';
import type { DailyMission } from '@/features/missions/types';
import styles from '../HomePage.module.css';

const FALLBACK_MISSIONS: DailyMission[] = [
  {
    id: 'complete-training',
    title: 'Completar 1 treino',
    description: 'Finalize uma rodada na Type Arena.',
    rewardXp: 30,
    target: 1,
    progress: 0,
    completed: false,
    rewarded: false,
  },
  {
    id: 'accuracy-90',
    title: 'Atingir 90% de precisão',
    description: 'Complete um treino com boa precisão.',
    rewardXp: 50,
    target: 1,
    progress: 0,
    completed: false,
    rewarded: false,
  },
  {
    id: 'play-panda-keys',
    title: 'Jogar Panda Keys',
    description: 'Entre no Arcade e jogue uma partida.',
    rewardXp: 40,
    target: 1,
    progress: 0,
    completed: false,
    rewarded: false,
  },
];

interface Props {
  missions: DailyMission[];
}

export function DailyMissionsPanel({ missions }: Props) {
  const visibleMissions = (missions.length ? missions : FALLBACK_MISSIONS).slice(0, 3);

  return (
    <Panel as="section" title="Missões de hoje" subtitle="Objetivos locais para manter rotina.">
      <div className={styles.missionList}>
        {visibleMissions.map((mission) => {
          const progress = mission.target > 0
            ? Math.min(100, Math.round((mission.progress / mission.target) * 100))
            : 0;

          return (
            <article key={mission.id} className={styles.missionItem}>
              <div className={styles.missionTop}>
                <div>
                  <strong>{mission.title}</strong>
                  <span>{mission.completed ? 'Concluída' : mission.description}</span>
                </div>
                <Chip variant={mission.completed ? 'green' : 'purple'}>
                  {mission.completed ? 'OK' : `+${mission.rewardXp} XP`}
                </Chip>
              </div>
              <ProgressBar
                value={mission.completed ? 100 : progress}
                size="sm"
                tone={mission.completed ? 'success' : 'default'}
                aria-label={`Progresso da missão ${mission.title}`}
              />
            </article>
          );
        })}
      </div>
    </Panel>
  );
}
