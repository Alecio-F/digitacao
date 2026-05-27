export type LetterStatus = 'pending' | 'correct' | 'incorrect';
export type FeedbackTone = 'neutral' | 'success' | 'danger';
export type SessionPhase = 'idle' | 'running' | 'paused' | 'finished';

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
