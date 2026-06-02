export type LessonDifficulty = 'Fácil' | 'Médio' | 'Difícil';

export type LessonStatus =
  | 'locked'
  | 'unlocked'
  | 'current'
  | 'completed'
  | 'recommended';

export type LessonMedal = 'none' | 'bronze' | 'silver' | 'gold';

export interface Lesson {
  id: string;
  phase: number;
  title: string;
  description: string;
  difficulty: LessonDifficulty;
  xpReward: number;
  requiredLessonIds: string[];
  focus: string[];
}

export interface LessonProgress {
  status: 'started' | 'completed';
  bestAccuracy: number;
  bestPpm: number;
  medal: LessonMedal;
  completedAt?: string;
  attempts: number;
}

export type LessonProgressMap = Record<string, LessonProgress>;
