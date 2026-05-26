export type Theme = 'light' | 'dark';

export interface Settings {
  theme: Theme;
  practiceTime: number;
  sounds: boolean;
  animations: boolean;
  reducedEffects: boolean;
}
