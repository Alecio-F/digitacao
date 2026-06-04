export type LetterStatus = 'pending' | 'correct' | 'incorrect';
export type FeedbackTone = 'neutral' | 'success' | 'danger';
export type SessionPhase = 'idle' | 'running' | 'paused' | 'finished';
export type FinishReason = 'time-ended' | 'text-completed' | 'manual-reset';
export type RankingInvalidReason =
  | 'accuracy_too_low'
  | 'duration_too_short'
  | 'not_enough_correct_chars'
  | 'too_many_errors'
  | 'repeated_key_abuse'
  | 'input_burst_suspicious'
  | 'random_typing_pattern'
  | 'completed_too_fast'
  | 'unknown';

export interface SuspiciousFlags {
  repeatedKeyAbuse: boolean;
  inputBurstSuspicious: boolean;
  randomTypingPattern: boolean;
  tooManyErrors: boolean;
}

export interface RankingEligibility {
  validForRanking: boolean;
  reasonCodes: RankingInvalidReason[];
  score: number;
  suspiciousFlags: SuspiciousFlags;
}

export interface LetterData {
  char: string;
  status: LetterStatus;
  isExtra?: boolean;
}

export interface WordData {
  text: string;
  letters: LetterData[];
}

export interface Feedback {
  text: string;
  tone: FeedbackTone;
}

export interface TypingState {
  words: WordData[];
  currentWordIndex: number;
  currentLetterIndex: number;
  totalCorrect: number;
  totalIncorrect: number;
  combo: number;
  maxCombo: number;
  errorsByChar: Record<string, number>;
  feedback: Feedback;
  wordsCompleted: number;
  totalCharsTyped: number;
  rawKeyCount: number;
  repeatedKeyCount: number;
  currentWrongStreak: number;
  longestWrongStreak: number;
  suspiciousInputBursts: number;
  recentInputs: Array<{ timestamp: number; correct: boolean }>;
}

export interface SessionResult {
  ppm: number;
  cpm: number;
  precision: number;
  errors: number;
  duration: number;
  maxCombo: number;
  topErrors: [string, number][];
  isRecord: boolean;
}
