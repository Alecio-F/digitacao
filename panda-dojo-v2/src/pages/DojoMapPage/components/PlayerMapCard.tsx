import { Badge, MetricCard, Panel, ProgressBar } from '@/components/ui';
import { usePlayerProgress } from '@/features/gamification/hooks/usePlayerProgress';
import { LESSONS } from '@/features/lessons/data/lessons';
import type { LessonProgressMap } from '@/features/lessons/types';
import styles from '../DojoMapPage.module.css';

interface Props {
  progress: LessonProgressMap;
}

export function PlayerMapCard({ progress }: Props) {
  const profile = usePlayerProgress();
  const completed = LESSONS.filter((lesson) => progress[lesson.id]?.status === 'completed');
  const medals = completed.filter((lesson) => progress[lesson.id]?.medal !== 'none').length;
  const progressPercent = Math.round((completed.length / LESSONS.length) * 100);
  const nextLesson = LESSONS.find((lesson) => progress[lesson.id]?.status !== 'completed');

  return (
    <Panel
      as="section"
      title="Seu mapa"
      subtitle="Progresso local salvo neste navegador."
      actions={<Badge variant="success">{profile.title}</Badge>}
      className={styles.playerMapCard}
    >
      <div className={styles.playerMetrics}>
        <MetricCard label="Nível" value={profile.level} compact tone="special" />
        <MetricCard label="XP" value={`${profile.xp} XP`} compact />
        <MetricCard label="Fases" value={`${completed.length}/${LESSONS.length}`} compact tone="success" />
        <MetricCard label="Medalhas" value={medals} compact />
      </div>
      <ProgressBar
        label="Progresso das fases"
        value={progressPercent}
        showValue
        tone="success"
        animated
      />
      <p className={styles.nextLessonText}>
        Próxima fase: <strong>{nextLesson?.title ?? 'Arena livre'}</strong>
      </p>
    </Panel>
  );
}
