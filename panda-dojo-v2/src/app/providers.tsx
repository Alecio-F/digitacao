import type { ReactNode } from 'react';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { SettingsContext } from './settingsContext';

export function Providers({ children }: { children: ReactNode }) {
  const settingsApi = useSettings();
  return (
    <SettingsContext.Provider value={settingsApi}>
      {children}
    </SettingsContext.Provider>
  );
}
