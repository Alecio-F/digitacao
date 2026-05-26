import type { TrainingMode } from '@/constants/trainingModes';

export type Medal = 'gold' | 'silver' | 'bronze' | 'none';
export type LessonState = 'completed' | 'unlocked' | 'locked';

export interface Lesson {
  id: string;
  number: string;
  title: string;
  objective: string;
  focus: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  xp: number;
  requirement: string[];
  completionAccuracy: number;
  trainingMode: TrainingMode;
}

export interface LessonProgress {
  status: 'completed' | 'started';
  bestAccuracy: number;
  bestWpm: number;
  medal: Medal;
  completedAt?: string;
  lastAttemptAt: string;
}

export type LessonProgressMap = Record<string, LessonProgress>;
