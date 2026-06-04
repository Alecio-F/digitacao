export interface RemoteProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  title: string;
  daily_streak: number;
  last_training_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface RemoteTypingResult {
  id: string;
  user_id: string;
  mode: string;
  lesson_id: string | null;
  practice_text_id: string | null;
  daily_challenge_id: string | null;
  duration_seconds: number;
  ppm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  max_combo: number;
  mistake_keys: Record<string, number>;
  correct_chars: number;
  wrong_chars: number;
  raw_key_count: number;
  repeated_key_count: number;
  valid_for_ranking: boolean;
  ranking_score: number;
  suspicious_flags: Record<string, unknown>;
  ranking_invalid_reasons: string[];
  completed_at: string;
}

export interface RemoteLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'started' | 'completed';
  best_accuracy: number;
  best_ppm: number;
  medal: 'none' | 'bronze' | 'silver' | 'gold';
  attempts: number;
  completed_at: string | null;
  updated_at: string;
}

export interface RemoteArcadeScore {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  max_combo: number;
  level_reached: number;
  played_at: string;
}

export interface RemoteUserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}
