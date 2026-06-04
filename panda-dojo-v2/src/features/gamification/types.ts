export interface Achievement {
  id: string;
  title: string;
  description: string;
}

export interface HistoryItem {
  ppm: number;
  cpm?: number;
  precisao: string;
  erros?: number;
  tempo?: number;
  lessonId?: string | null;
  mode?: 'random' | 'lesson' | 'practice-text';
  practiceTextId?: string | null;
  practiceTextTitle?: string | null;
  novoRecorde?: boolean;
  data?: string;
}

export interface DojoProfile {
  xp: number;
  level: number;
  title: string;
  nextTitle: string;
  progressPercent: number;
  currentLevelXp: number;
  requiredForLevel: number;
  achievements: string[];
  achievementDetails: Achievement[];
  dailyStreak: number;
  lastTrainingDate: string;
  bestPpm: number;
  lastPrecision: string;
  lastResult: HistoryItem | null;
  history: HistoryItem[];
  lastMistakes: [string, number][];
  gameBestScore: number;
}
