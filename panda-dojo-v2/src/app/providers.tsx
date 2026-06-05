import type { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/AuthContext';
import { PendingSyncRunner } from '@/features/backend-sync/PendingSyncRunner';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { SettingsContext } from './settingsContext';

export function Providers({ children }: { children: ReactNode }) {
  const settingsApi = useSettings();
  return (
    <SettingsContext.Provider value={settingsApi}>
      <AuthProvider>
        <PendingSyncRunner />
        {children}
      </AuthProvider>
    </SettingsContext.Provider>
  );
}
