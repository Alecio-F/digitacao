export type Theme = 'light' | 'dark';
export type CursorMode = 'arcade' | 'classic';

export interface Settings {
  theme: Theme;
  defaultPracticeTime: number;
  soundsEnabled: boolean;
  animationsEnabled: boolean;
  reducedEffects: boolean;
  cursorMode: CursorMode;
  keyboardVisible: boolean;
}
