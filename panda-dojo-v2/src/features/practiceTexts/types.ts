export type PracticeTextDifficulty = 'Fácil' | 'Médio' | 'Difícil';

export interface PracticeText {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: PracticeTextDifficulty;
  estimatedMinutes: number;
  text: string;
  source?: string;
}
