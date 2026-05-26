import { useCallback, useState } from 'react';
import { KEYS } from '@/constants';
import { getStorage, setStorage } from '@/services/storage/storageService';
import { getLessonById, LESSONS } from '../data/lessons';
import type { Lesson, LessonProgressMap, LessonState, Medal } from '../types';

export function useLessonProgress() {
  const [progress] = useState<LessonProgressMap>(() =>
    getStorage<LessonProgressMap>(KEYS.lessonProgress, {}),
  );

  const isUnlocked = useCallback(
    (lessonId: string): boolean => {
      const lesson = getLessonById(lessonId);
      if (!lesson) return false;
      return lesson.requirement.every((id) => progress[id]?.status === 'completed');
    },
    [progress],
  );

  const getLessonState = useCallback(
    (lesson: Lesson): LessonState => {
      if (progress[lesson.id]?.status === 'completed') return 'completed';
      return isUnlocked(lesson.id) ? 'unlocked' : 'locked';
    },
    [progress, isUnlocked],
  );

  const getNextRecommended = useCallback((): Lesson => {
    return (
      LESSONS.find((l) => isUnlocked(l.id) && progress[l.id]?.status !== 'completed') ?? LESSONS[0]
    );
  }, [progress, isUnlocked]);

  const startLesson = useCallback(
    (lessonId: string): boolean => {
      const lesson = getLessonById(lessonId);
      if (!lesson || !isUnlocked(lessonId)) return false;

      localStorage.setItem(KEYS.selectedLessonId, lessonId);
      localStorage.setItem(KEYS.selectedTrainingMode, lesson.trainingMode);

      const started = new Set<string>(getStorage<string[]>(KEYS.startedLessons, []));
      started.add(lessonId);
      setStorage(KEYS.startedLessons, [...started]);

      if (started.size >= 3) {
        const achievements = getStorage<string[]>(KEYS.achievements, []);
        if (!achievements.includes('map-explorer')) {
          setStorage(KEYS.achievements, [...achievements, 'map-explorer']);
        }
      }

      return true;
    },
    [isUnlocked],
  );

  const getMedal = useCallback((lessonId: string): Medal => {
    return progress[lessonId]?.medal ?? 'none';
  }, [progress]);

  return { progress, isUnlocked, getLessonState, getNextRecommended, startLesson, getMedal };
}
