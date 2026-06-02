import { KEYS } from '@/constants';
import { getStorage, setStorage } from '@/services/storage/storageService';
import { getLessonById as findLessonById, LESSONS } from '../data/lessons';
import type {
  Lesson,
  LessonMedal,
  LessonProgressMap,
  LessonStatus,
} from '../types';

export function getLessonProgress(): LessonProgressMap {
  const progress = getStorage<LessonProgressMap>(KEYS.lessonProgress, {});
  return progress && typeof progress === 'object' && !Array.isArray(progress) ? progress : {};
}

export function saveLessonProgress(progress: LessonProgressMap): void {
  setStorage(KEYS.lessonProgress, progress);
}

export function getLessonById(id: string): Lesson | undefined {
  return findLessonById(id);
}

export function isLessonCompleted(lessonId: string, progress: LessonProgressMap): boolean {
  return progress[lessonId]?.status === 'completed';
}

export function isLessonUnlocked(lesson: Lesson, progress: LessonProgressMap): boolean {
  return lesson.requiredLessonIds.every((lessonId) => isLessonCompleted(lessonId, progress));
}

export function getNextRecommendedLesson(progress: LessonProgressMap): Lesson | null {
  return LESSONS.find((lesson) => {
    return isLessonUnlocked(lesson, progress) && !isLessonCompleted(lesson.id, progress);
  }) ?? null;
}

export function getLessonStatus(lesson: Lesson, progress: LessonProgressMap): LessonStatus {
  if (isLessonCompleted(lesson.id, progress)) return 'completed';

  const unlocked = isLessonUnlocked(lesson, progress);
  if (!unlocked) return 'locked';

  const recommended = getNextRecommendedLesson(progress);
  if (recommended?.id === lesson.id) return lesson.phase === 1 ? 'current' : 'recommended';

  return 'unlocked';
}

export function selectLesson(lesson: Lesson): void {
  localStorage.setItem(KEYS.selectedLessonId, lesson.id);
  localStorage.setItem(KEYS.selectedTrainingMode, lesson.id);

  const started = new Set<string>(getStorage<string[]>(KEYS.startedLessons, []));
  started.add(lesson.id);
  setStorage(KEYS.startedLessons, [...started]);
}

export function getMedalByAccuracy(accuracy: number): LessonMedal {
  if (accuracy >= 97) return 'gold';
  if (accuracy >= 92) return 'silver';
  if (accuracy >= 85) return 'bronze';
  return 'none';
}
