export type Theme = 'light' | 'dark';
export type CursorMode = 'arcade' | 'classic';
export type ArenaFontSize = 'compact' | 'default' | 'large';

export interface Settings {
  theme: Theme;
  defaultPracticeTime: number;
  soundsEnabled: boolean;
  animationsEnabled: boolean;
  reducedEffects: boolean;
  motionPreferenceTouched: boolean;
  cursorMode: CursorMode;
  arenaFontSize: ArenaFontSize;
  keyboardVisible: boolean;
}
