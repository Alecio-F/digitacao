import type { Lesson, LessonProgress, LessonStatus } from '@/features/lessons/types';
import { LessonCard } from './LessonCard';
import styles from '../DojoMapPage.module.css';

interface Props {
  lesson: Lesson;
  status: LessonStatus;
  progress?: LessonProgress;
  side: 'left' | 'right';
  onStart: (lesson: Lesson) => void;
}

const NODE_ICON: Record<LessonStatus, string> = {
  locked: 'lock',
  unlocked: 'play_arrow',
  current: 'flag',
  recommended: 'stars',
  completed: 'check_circle',
};

export function TrailStep({ lesson, status, progress, side, onStart }: Props) {
  const card = (
    <div className={styles.trailCardWrap}>
      <LessonCard lesson={lesson} status={status} progress={progress} onStart={onStart} />
    </div>
  );

  return (
    <li className={[styles.trailStep, styles[`trailStep${side}`]].join(' ')}>
      {side === 'left' ? card : <span className={styles.trailSpacer} aria-hidden="true" />}
      <div className={[styles.trailNode, styles[`trailNode${status}`]].join(' ')} aria-hidden="true">
        <span className="material-symbols-outlined">{NODE_ICON[status]}</span>
      </div>
      {side === 'right' ? card : <span className={styles.trailSpacer} aria-hidden="true" />}
    </li>
  );
}
