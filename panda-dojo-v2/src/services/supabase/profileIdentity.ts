import type { User } from '@supabase/supabase-js';
import type { RemoteProfile } from './types';

export const DEFAULT_DISPLAY_NAME = 'Aprendiz do Dojo';
export const DEFAULT_USERNAME = 'panda_user';

interface ProfileIdentitySource {
  id?: string | null;
  email?: string | null;
  displayName?: string | null;
  userMetadata?: Record<string, unknown> | null;
}

export interface ProfileIdentityFallbacks {
  displayName: string;
  username: string;
  uniqueUsername: string;
}

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function metadataDisplayName(metadata: Record<string, unknown> | null | undefined): string {
  return cleanText(metadata?.['display_name']) || cleanText(metadata?.['name']);
}

function emailLocalPart(email: string | null | undefined): string {
  return cleanText(email).split('@')[0] ?? '';
}

export function sanitizeUsername(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase();
}

export function getUserDisplayName(user: User | null): string {
  if (!user) return DEFAULT_DISPLAY_NAME;

  return (
    metadataDisplayName(user.user_metadata) ||
    emailLocalPart(user.email) ||
    DEFAULT_DISPLAY_NAME
  );
}

export function getUserUsername(user: User | null): string {
  if (!user) return DEFAULT_USERNAME;

  const base = sanitizeUsername(emailLocalPart(user.email));
  return base || getUniqueFallbackUsername(user.id, DEFAULT_USERNAME);
}

export function getUniqueFallbackUsername(userId: string | null | undefined, base: string): string {
  const safeBase = sanitizeUsername(base) || DEFAULT_USERNAME;
  const suffix = cleanText(userId).replace(/-/g, '').slice(0, 8);
  return suffix ? `${safeBase.slice(0, 22)}_${suffix}` : safeBase;
}

export function buildProfileIdentityFallbacks(
  source: ProfileIdentitySource,
): ProfileIdentityFallbacks {
  const displayName = (
    cleanText(source.displayName) ||
    metadataDisplayName(source.userMetadata) ||
    emailLocalPart(source.email) ||
    DEFAULT_DISPLAY_NAME
  );
  const username = sanitizeUsername(emailLocalPart(source.email)) || DEFAULT_USERNAME;

  return {
    displayName,
    username,
    uniqueUsername: getUniqueFallbackUsername(source.id, username),
  };
}

export function getProfileDisplayName(
  profile: Pick<RemoteProfile, 'display_name'> | null,
  user: User | null,
): string {
  return cleanText(profile?.display_name) || getUserDisplayName(user);
}

export function getProfileUsername(
  profile: Pick<RemoteProfile, 'username'> | null,
  user: User | null,
): string {
  return cleanText(profile?.username) || getUserUsername(user);
}
