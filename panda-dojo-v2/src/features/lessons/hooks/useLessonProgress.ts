import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { LESSONS } from '../data/lessons';
import {
  getLessonProgress,
  getLessonStatus,
  getNextRecommendedLesson,
  isLessonUnlocked,
  selectLesson,
} from '../services/lessonProgressService';
import type { Lesson, LessonProgressMap } from '../types';

export function useLessonProgress() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<LessonProgressMap>(() => getLessonProgress());

  const recommendedLesson = useMemo(() => getNextRecommendedLesson(progress), [progress]);

  const refreshProgress = useCallback(() => {
    setProgress(getLessonProgress());
  }, []);

  const getStatus = useCallback(
    (lesson: Lesson) => getLessonStatus(lesson, progress),
    [progress],
  );

  const startLesson = useCallback(
    (lesson: Lesson) => {
      if (!isLessonUnlocked(lesson, progress) && progress[lesson.id]?.status !== 'completed') {
        return false;
      }

      selectLesson(lesson);
      navigate('/arena');
      return true;
    },
    [navigate, progress],
  );

  return {
    lessons: LESSONS,
    progress,
    recommendedLesson,
    getStatus,
    startLesson,
    refreshProgress,
  };
}
