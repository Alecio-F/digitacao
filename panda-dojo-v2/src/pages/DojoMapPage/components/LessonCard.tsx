import { Badge, Button, Card, Chip } from '@/components/ui';
import type { Lesson, LessonMedal, LessonProgress, LessonStatus } from '@/features/lessons/types';
import { LessonStatusBadge } from './LessonStatusBadge';
import styles from '../DojoMapPage.module.css';

interface LessonCardProps {
  lesson: Lesson;
  status: LessonStatus;
  progress?: LessonProgress;
  onStart: (lesson: Lesson) => void;
}

const DIFFICULTY_VARIANT: Record<Lesson['difficulty'], 'success' | 'warning' | 'danger'> = {
  Fácil: 'success',
  Médio: 'warning',
  Difícil: 'danger',
};

function getCtaText(status: LessonStatus) {
  if (status === 'locked') return 'Bloqueada';
  if (status === 'completed') return 'Treinar novamente';
  return 'Iniciar fase';
}

export function LessonCard({ lesson, status, progress, onStart }: LessonCardProps) {
  const locked = status === 'locked';
  const medal: LessonMedal = progress?.medal ?? 'none';

  return (
    <Card
      as="article"
      variant={locked ? 'locked' : 'interactive'}
      className={[
        styles.lessonCard,
        styles[`lessonCard${status[0].toUpperCase()}${status.slice(1)}`],
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.lessonHeader}>
        <span className={styles.lessonPhase}>Fase {String(lesson.phase).padStart(2, '0')}</span>
        <div className={styles.lessonBadges}>
          <Badge variant={DIFFICULTY_VARIANT[lesson.difficulty]}>{lesson.difficulty}</Badge>
          <LessonStatusBadge status={status} medal={medal} />
        </div>
      </div>

      <h3>{lesson.title}</h3>
      <p>{lesson.description}</p>

      <div className={styles.lessonMeta}>
        <Chip variant="purple">+{lesson.xpReward} XP</Chip>
        {progress && (
          <Chip variant="green">
            {progress.bestAccuracy}% · {progress.bestPpm} PPM
          </Chip>
        )}
      </div>

      <div className={styles.lessonFocusList} aria-label={`Foco da ${lesson.title}`}>
        {lesson.focus.slice(0, 10).map((item) => (
          <kbd key={item}>{item}</kbd>
        ))}
      </div>

      <div className={styles.lessonActions}>
        <Button
          variant={status === 'completed' ? 'ghost' : 'primary'}
          size="sm"
          disabled={locked}
          onClick={() => onStart(lesson)}
        >
          {getCtaText(status)}
        </Button>
      </div>
    </Card>
  );
}
