import { KEYS } from '@/constants';
import { getStorage, setStorage } from '@/services/storage/storageService';
import { getLessonById as findLessonById, LESSONS } from '../data/lessons';
import type {
  Lesson,
  LessonMedal,
  LessonProgress,
  LessonProgressMap,
  LessonStatus,
} from '../types';

interface LessonAttemptResult {
  lesson: Lesson;
  completed: boolean;
  completedNow: boolean;
  medal: LessonMedal;
  nextLesson: Lesson | null;
}

const MEDAL_RANK: Record<LessonMedal, number> = {
  none: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
};

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

function getBestMedal(current: LessonMedal, next: LessonMedal): LessonMedal {
  return MEDAL_RANK[next] > MEDAL_RANK[current] ? next : current;
}

export function recordLessonAttempt(
  lessonId: string,
  result: { accuracy: number; ppm: number },
): LessonAttemptResult | null {
  const lesson = findLessonById(lessonId);
  if (!lesson) return null;

  const progress = getLessonProgress();
  const previous = progress[lessonId];
  const alreadyCompleted = previous?.status === 'completed';
  const reachedCompletion = result.accuracy >= 85;
  const completed = alreadyCompleted || reachedCompletion;
  const medal = getBestMedal(previous?.medal ?? 'none', getMedalByAccuracy(result.accuracy));

  const nextEntry: LessonProgress = {
    status: completed ? 'completed' : 'started',
    bestAccuracy: Math.max(previous?.bestAccuracy ?? 0, result.accuracy),
    bestPpm: Math.max(previous?.bestPpm ?? 0, result.ppm),
    medal,
    completedAt: alreadyCompleted
      ? previous.completedAt
      : reachedCompletion
      ? new Date().toISOString()
      : previous?.completedAt,
    attempts: (previous?.attempts ?? 0) + 1,
  };

  progress[lessonId] = nextEntry;
  saveLessonProgress(progress);

  return {
    lesson,
    completed,
    completedNow: reachedCompletion && !alreadyCompleted,
    medal,
    nextLesson: getNextRecommendedLesson(progress),
  };
}
