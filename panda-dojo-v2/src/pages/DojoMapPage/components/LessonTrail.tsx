import type { Lesson, LessonProgressMap, LessonStatus } from '@/features/lessons/types';
import { TrailStep } from './TrailStep';
import styles from '../DojoMapPage.module.css';

interface LessonTrailProps {
  lessons: Lesson[];
  progress: LessonProgressMap;
  getStatus: (lesson: Lesson) => LessonStatus;
  onStart: (lesson: Lesson) => void;
}

export function LessonTrail({ lessons, progress, getStatus, onStart }: LessonTrailProps) {
  return (
    <section className={styles.lessonTrailSection} aria-labelledby="lesson-trail-title">
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Trilha de fases</span>
        <h2 id="lesson-trail-title">Caminho principal do Dojo</h2>
      </div>
      <ol className={styles.lessonTrail} aria-label="Trilha de lições">
        {lessons.map((lesson, index) => (
          <TrailStep
            key={lesson.id}
            lesson={lesson}
            status={getStatus(lesson)}
            progress={progress[lesson.id]}
            side={index % 2 === 0 ? 'left' : 'right'}
            onStart={onStart}
          />
        ))}
      </ol>
    </section>
  );
}
