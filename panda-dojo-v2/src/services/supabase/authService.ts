import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { buildProfileIdentityFallbacks } from './profileIdentity';

export interface AuthServiceResult<T> {
  data: T | null;
  error: string | null;
}

export type AuthStateCallback = (event: AuthChangeEvent, session: Session | null) => void;

const NOT_CONFIGURED_MESSAGE = 'Supabase não está configurado. Use o modo local ou configure as variáveis de ambiente.';

function disabledResult<T>(): AuthServiceResult<T> {
  return { data: null, error: NOT_CONFIGURED_MESSAGE };
}

function getAuthClient() {
  return isSupabaseConfigured ? supabase : null;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthServiceResult<{ user: User | null; session: Session | null }>> {
  const client = getAuthClient();
  if (!client) return disabledResult();
  const identity = buildProfileIdentityFallbacks({
    email,
    displayName,
  });

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: identity.displayName,
        username: identity.username,
      },
    },
  });

  return {
    data: { user: data.user, session: data.session },
    error: error?.message ?? null,
  };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthServiceResult<{ user: User | null; session: Session | null }>> {
  const client = getAuthClient();
  if (!client) return disabledResult();

  const { data, error } = await client.auth.signInWithPassword({ email, password });

  return {
    data: { user: data.user, session: data.session },
    error: error?.message ?? null,
  };
}

export async function signOut(): Promise<AuthServiceResult<true>> {
  const client = getAuthClient();
  if (!client) return disabledResult();

  const { error } = await client.auth.signOut();
  return { data: error ? null : true, error: error?.message ?? null };
}

export async function getSession(): Promise<AuthServiceResult<Session>> {
  const client = getAuthClient();
  if (!client) return disabledResult();

  const { data, error } = await client.auth.getSession();
  return { data: data.session, error: error?.message ?? null };
}

export async function getCurrentUser(): Promise<AuthServiceResult<User>> {
  const client = getAuthClient();
  if (!client) return disabledResult();

  const { data, error } = await client.auth.getUser();
  return { data: data.user, error: error?.message ?? null };
}

export function onAuthStateChange(callback: AuthStateCallback): { unsubscribe: () => void } {
  const client = getAuthClient();
  if (!client) return { unsubscribe: () => undefined };

  const { data } = client.auth.onAuthStateChange(callback);
  return { unsubscribe: () => data.subscription.unsubscribe() };
}
