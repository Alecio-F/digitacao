import { Badge } from '@/components/ui';
import type { Lesson, LessonState, Medal } from '@/features/lessons/types';
import styles from './LessonCard.module.css';

const MEDAL_LABEL: Record<Medal, string> = {
  gold: 'Ouro',
  silver: 'Prata',
  bronze: 'Bronze',
  none: '',
};

const DIFF_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  Fácil: 'success',
  Médio: 'warning',
  Difícil: 'danger',
};

interface LessonCardProps {
  lesson: Lesson;
  state: LessonState;
  medal: Medal;
  recommended: boolean;
  onStart: (lessonId: string) => void;
}

export function LessonCard({ lesson, state, medal, recommended, onStart }: LessonCardProps) {
  const ctaText =
    state === 'completed' ? 'Praticar novamente' : state === 'locked' ? 'Bloqueada' : 'Iniciar lição';

  const cardClass = [
    styles.card,
    recommended ? styles.recommended : '',
    state === 'locked' ? styles.locked : '',
  ]
    .filter(Boolean)
    .join(' ');

  const ctaClass = [styles.cta, state === 'completed' ? styles.ctaCompleted : '']
    .filter(Boolean)
    .join(' ');

  return (
    <article className={cardClass}>
      <div className={styles.head}>
        <span className={styles.number}>{lesson.number}</span>
        <div className={styles.chips}>
          <Badge variant={DIFF_VARIANT[lesson.difficulty] ?? 'muted'}>{lesson.difficulty}</Badge>
          <span className={styles.xpChip}>+{lesson.xp} XP</span>
          {recommended && <Badge variant="success">Recomendado</Badge>}
          {medal !== 'none' && <Badge variant="warning">{MEDAL_LABEL[medal]}</Badge>}
        </div>
      </div>
      <h3 className={styles.title}>{lesson.title}</h3>
      <p className={styles.objective}>{lesson.objective}</p>
      <p className={styles.focus}>{lesson.focus}</p>
      <button
        className={ctaClass}
        type="button"
        disabled={state === 'locked'}
        onClick={() => onStart(lesson.id)}
      >
        {ctaText}
      </button>
    </article>
  );
}
