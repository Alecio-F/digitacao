export type RankingCategory =
  | 'general'
  | 'speed'
  | 'accuracy'
  | 'phases'
  | 'texts'
  | 'arcade'
  | 'daily';

export type RankingMetric =
  | 'ranking_score'
  | 'ppm'
  | 'cpm'
  | 'accuracy'
  | 'lowest_time'
  | 'combo'
  | 'arcade_score';

export type RankingScope = 'local' | 'online';
export type RankingPeriod = 'today' | 'week' | 'month' | 'all';

export type RankingMode =
  | 'all'
  | 'free'
  | 'random_words'
  | 'lesson'
  | 'practice_text'
  | 'daily_challenge'
  | 'arcade';

export interface RankingEntry {
  id: string;
  userId?: string;
  username: string;
  displayName: string;
  position: number;
  mode: RankingMode;
  lessonId?: string | null;
  practiceTextId?: string | null;
  metricValue: number;
  ppm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  maxCombo: number;
  durationSeconds: number;
  rankingScore: number;
  validForRanking: boolean;
  completedAt: string;
  badge?: string;
  medal?: 'bronze' | 'silver' | 'gold' | 'none';
}

export interface RankingCategoryConfig {
  id: RankingCategory;
  title: string;
  description: string;
  defaultMetric: RankingMetric;
  availableMetrics: RankingMetric[];
  requiresEligibleResult: boolean;
  minimumAccuracy?: number;
  supportedModes: RankingMode[];
  status?: 'ready' | 'soon';
}
