import { createContext, useContext, type ReactNode } from 'react';
import { useSettings } from '@/features/settings/hooks/useSettings';
import type { Settings } from '@/features/settings/types';

interface SettingsContextValue {
  settings: Settings;
  toggleTheme: () => void;
  setPracticeTime: (minutes: number) => void;
  setSounds: (v: boolean) => void;
  setAnimations: (v: boolean) => void;
  setReducedEffects: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettingsContext must be used inside Providers');
  return ctx;
}

export function Providers({ children }: { children: ReactNode }) {
  const settingsApi = useSettings();
  return (
    <SettingsContext.Provider value={settingsApi}>
      {children}
    </SettingsContext.Provider>
  );
}
