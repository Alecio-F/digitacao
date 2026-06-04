import { persistence } from '@/services/persistence/types';
import { PERSISTENCE_KEYS } from '@/services/persistence/persistenceKeys';
import { getLessonById as findLessonById, LESSONS } from '@/features/lessons/data/lessons';
import type {
  Lesson,
  LessonMedal,
  LessonProgress,
  LessonProgressMap,
  LessonStatus,
} from '@/features/lessons/types';
import { readSelectionString, selectLesson as selectLessonInStore } from './trainingSelectionRepository';

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
  const progress = persistence.getItem<LessonProgressMap>(PERSISTENCE_KEYS.lessonProgress, {});
  return progress && typeof progress === 'object' && !Array.isArray(progress) ? progress : {};
}

export function saveLessonProgress(progress: LessonProgressMap): void {
  persistence.setItem(PERSISTENCE_KEYS.lessonProgress, progress);
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

export function getStartedLessons(): string[] {
  const stored = persistence.getItem<string[]>(PERSISTENCE_KEYS.startedLessons, []);
  return Array.isArray(stored) ? stored.filter((lessonId) => typeof lessonId === 'string') : [];
}

export function saveStartedLessons(lessonIds: string[]): void {
  persistence.setItem(PERSISTENCE_KEYS.startedLessons, [...new Set(lessonIds)]);
}

export function markLessonStarted(lessonId: string): void {
  saveStartedLessons([...getStartedLessons(), lessonId]);
}

/** Seleciona a fase para a Arena e registra a fase como iniciada. */
export function setSelectedLesson(lesson: Lesson): void {
  selectLessonInStore(lesson.id);
  markLessonStarted(lesson.id);
}

export function getSelectedLessonId(): string | null {
  return readSelectionString(PERSISTENCE_KEYS.selectedLessonId) || null;
}

export function clearSelectedLesson(): void {
  persistence.removeItem(PERSISTENCE_KEYS.selectedLessonId);
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

export const completeLesson = recordLessonAttempt;
