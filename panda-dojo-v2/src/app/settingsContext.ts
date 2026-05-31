import { createContext, useContext } from 'react';
import type { CursorMode, Settings } from '@/features/settings/types';

export interface SettingsContextValue {
  settings: Settings;
  toggleTheme: () => void;
  setPracticeTime: (minutes: number) => void;
  setSounds: (v: boolean) => void;
  setAnimations: (v: boolean) => void;
  setReducedEffects: (v: boolean) => void;
  setCursorMode: (v: CursorMode) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettingsContext must be used inside Providers');
  return ctx;
}
