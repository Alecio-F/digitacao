import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  getCurrentUser,
  getSession,
  onAuthStateChange,
  signInWithEmail,
  signOut as signOutService,
  signUpWithEmail,
} from '@/services/supabase/authService';
import { isSupabaseConfigured } from '@/services/supabase/supabaseClient';
import type { RemoteProfile } from '@/services/supabase/types';
import { ensureProfileWithIdentity } from '@/repositories/remote/profileRemoteRepository';
import { AuthContext, type AuthActionResult, type AuthContextValue } from './authContextValue';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<RemoteProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!isSupabaseConfigured || !currentUser) {
      setProfile(null);
      return;
    }

    const result = await ensureProfileWithIdentity(currentUser.id, {
      id: currentUser.id,
      email: currentUser.email,
      userMetadata: currentUser.user_metadata,
    });
    setProfile(result.data);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(user);
  }, [loadProfile, user]);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!isSupabaseConfigured) {
        if (active) setLoading(false);
        return;
      }

      const result = await getSession();
      if (!active) return;

      let nextSession = result.data;
      let nextUser = nextSession?.user ?? null;
      if (nextSession) {
        const userResult = await getCurrentUser();
        nextUser = userResult.data;
        if (userResult.error || !nextUser) {
          nextSession = null;
        }
      }
      setSession(nextSession);
      setUser(nextUser);
      await loadProfile(nextUser);
      if (active) setLoading(false);
    }

    void bootstrap();

    const subscription = onAuthStateChange((_event, nextSession) => {
      if (!nextSession) {
        setSession(null);
        setUser(null);
        void loadProfile(null);
        return;
      }

      void (async () => {
        const userResult = await getCurrentUser();
        const nextUser = userResult.data;
        if (userResult.error || !nextUser) {
          setSession(null);
          setUser(null);
          void loadProfile(null);
          return;
        }

        setSession(nextSession);
        setUser(nextUser);
        void loadProfile(nextUser);
      })();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    displayName?: string,
  ): Promise<AuthActionResult> => {
    const result = await signUpWithEmail(email, password, displayName);
    if (result.error) return { ok: false, error: result.error };

    const nextUser = result.data?.user ?? null;
    const nextSession = result.data?.session ?? null;
    setUser(nextUser);
    setSession(nextSession);
    await loadProfile(nextUser);
    return { ok: true, error: null };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthActionResult> => {
    const result = await signInWithEmail(email, password);
    if (result.error) return { ok: false, error: result.error };

    const nextUser = result.data?.user ?? null;
    const nextSession = result.data?.session ?? null;
    setUser(nextUser);
    setSession(nextSession);
    await loadProfile(nextUser);
    return { ok: true, error: null };
  }, [loadProfile]);

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    const result = await signOutService();
    if (result.error) return { ok: false, error: result.error };

    setUser(null);
    setSession(null);
    setProfile(null);
    return { ok: true, error: null };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    profile,
    loading,
    isAuthenticated: Boolean(user),
    isSupabaseEnabled: isSupabaseConfigured,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }), [loading, profile, refreshProfile, session, signIn, signOut, signUp, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
