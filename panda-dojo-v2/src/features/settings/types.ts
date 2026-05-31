export type Theme = 'light' | 'dark';
export type CursorMode = 'arcade' | 'classic';

export interface Settings {
  theme: Theme;
  practiceTime: number;
  sounds: boolean;
  animations: boolean;
  reducedEffects: boolean;
  cursorMode: CursorMode;
}
