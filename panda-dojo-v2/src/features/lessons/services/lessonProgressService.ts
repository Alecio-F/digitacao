import type { Lesson } from '../types';
import {
  clearSelectedLesson,
  completeLesson,
  getLessonById,
  getLessonProgress,
  getLessonStatus,
  getMedalByAccuracy,
  getNextRecommendedLesson,
  getSelectedLessonId,
  getStartedLessons,
  isLessonCompleted,
  isLessonUnlocked,
  markLessonStarted,
  saveLessonProgress,
  saveStartedLessons,
  setSelectedLesson,
} from '@/repositories/lessonProgressRepository';

export {
  clearSelectedLesson,
  completeLesson,
  getLessonById,
  getLessonProgress,
  getLessonStatus,
  getMedalByAccuracy,
  getNextRecommendedLesson,
  getSelectedLessonId,
  getStartedLessons,
  isLessonCompleted,
  isLessonUnlocked,
  markLessonStarted,
  saveLessonProgress,
  saveStartedLessons,
};

export const recordLessonAttempt = completeLesson;

export function selectLesson(lesson: Lesson): void {
  setSelectedLesson(lesson);
}
