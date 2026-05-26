import { LESSONS } from '@/features/lessons/data/lessons';
import { useLessonProgress } from '@/features/lessons/hooks/useLessonProgress';
import type { LessonState } from '@/features/lessons/types';
import { LessonCard } from './LessonCard';
import styles from './LessonTrail.module.css';

interface LessonTrailProps {
  onStart: (lessonId: string) => void;
}

const NODE_ICON: Record<LessonState, string> = {
  completed: 'check_circle',
  unlocked: 'play_arrow',
  locked: 'lock',
};

const NODE_CLASS: Record<LessonState, string> = {
  completed: styles.nodeCompleted,
  unlocked: styles.nodeCurrent,
  locked: styles.nodeLocked,
};

export function LessonTrail({ onStart }: LessonTrailProps) {
  const { getLessonState, getMedal, getNextRecommended } = useLessonProgress();
  const recommended = getNextRecommended();

  return (
    <ol className={styles.trail} aria-label="Trilha de lições">
      {LESSONS.map((lesson, index) => {
        const state = getLessonState(lesson);
        const medal = getMedal(lesson.id);
        const isRecommended = recommended.id === lesson.id;
        const side: 'left' | 'right' = index % 2 === 0 ? 'left' : 'right';

        const card = (
          <div className={side === 'left' ? styles.cardLeft : styles.cardRight}>
            <LessonCard
              lesson={lesson}
              state={state}
              medal={medal}
              recommended={isRecommended}
              onStart={onStart}
            />
          </div>
        );

        return (
          <li key={lesson.id} className={styles.step} role="listitem">
            {side === 'left' ? (
              <>
                {card}
                <div className={[styles.node, NODE_CLASS[state]].join(' ')} aria-hidden="true">
                  <span className={`${styles.nodeIcon} material-symbols-outlined`}>
                    {NODE_ICON[state]}
                  </span>
                </div>
                <div className={styles.spacer} />
              </>
            ) : (
              <>
                <div className={styles.spacer} />
                <div className={[styles.node, NODE_CLASS[state]].join(' ')} aria-hidden="true">
                  <span className={`${styles.nodeIcon} material-symbols-outlined`}>
                    {NODE_ICON[state]}
                  </span>
                </div>
                {card}
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}
