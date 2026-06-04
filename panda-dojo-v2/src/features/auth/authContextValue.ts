import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { RemoteProfile } from '@/services/supabase/types';

export interface AuthActionResult {
  ok: boolean;
  error: string | null;
}

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: RemoteProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isSupabaseEnabled: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthActionResult>;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
