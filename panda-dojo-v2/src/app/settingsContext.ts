import { createContext, useContext } from 'react';
import type { CursorMode, Settings, Theme } from '@/features/settings/types';

export interface SettingsContextValue {
  settings: Settings;
  theme: Theme;
  defaultPracticeTime: number;
  soundsEnabled: boolean;
  animationsEnabled: boolean;
  reducedEffects: boolean;
  cursorMode: CursorMode;
  keyboardVisible: boolean;
  setTheme: (v: Theme) => void;
  toggleTheme: () => void;
  resetTheme: () => void;
  setDefaultPracticeTime: (v: number) => void;
  setSoundsEnabled: (v: boolean) => void;
  setAnimationsEnabled: (v: boolean) => void;
  setReducedEffects: (v: boolean) => void;
  setCursorMode: (v: CursorMode) => void;
  setKeyboardVisible: (v: boolean) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettingsContext must be used inside Providers');
  return ctx;
}
