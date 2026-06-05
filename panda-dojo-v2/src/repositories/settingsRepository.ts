import { persistence } from '@/services/persistence/types';
import { PERSISTENCE_KEYS } from '@/services/persistence/persistenceKeys';
import type { CursorMode, Theme } from '@/features/settings/types';

/**
 * Repositório de configurações locais (tema, tempo de treino, cursor, teclado
 * virtual e toggles de experiência). Concentra a normalização que antes vivia
 * no hook useSettings, mantendo total compatibilidade com os valores já salvos.
 */

export const PRACTICE_TIME_OPTIONS = [0.25, 0.5, 1, 2, 5, 10, 15] as const;
export type PracticeTimeOption = (typeof PRACTICE_TIME_OPTIONS)[number];

function readBoolean(key: string, fallback: boolean): boolean {
  const stored = persistence.getItem<boolean | string | null>(key, null);
  if (stored === true || stored === 'true') return true;
  if (stored === false || stored === 'false') return false;
  return fallback;
}

// ── Tema ──────────────────────────────────────────────────────────────────
export function getTheme(): Theme {
  // Aceita o formato antigo (boolean) e o novo ('light' | 'dark').
  const stored = persistence.getItem<Theme | boolean | string | null>(PERSISTENCE_KEYS.theme, null);
  if (stored === 'light' || stored === false) return 'light';
  if (stored === 'dark' || stored === true) return 'dark';
  return 'dark';
}

export function setTheme(theme: Theme): void {
  persistence.setItem(PERSISTENCE_KEYS.theme, theme);
}

export function resetTheme(): void {
  persistence.removeItem(PERSISTENCE_KEYS.theme);
}

// ── Tempo de treino ───────────────────────────────────────────────────────
export function getPracticeTime(): number {
  const stored = Number(persistence.getItem<string | number>(PERSISTENCE_KEYS.practiceTime, '1'));
  return PRACTICE_TIME_OPTIONS.includes(stored as PracticeTimeOption) ? stored : 1;
}

export function setPracticeTime(value: number): number {
  const next = PRACTICE_TIME_OPTIONS.includes(value as PracticeTimeOption) ? value : 1;
  persistence.setItem(PERSISTENCE_KEYS.practiceTime, String(next));
  return next;
}

// ── Cursor da arena ───────────────────────────────────────────────────────
export function getArenaCursor(): CursorMode {
  const value = persistence.getItem<string>(PERSISTENCE_KEYS.arenaCursor, 'arcade');
  return value === 'classic' ? 'classic' : 'arcade';
}

export function setArenaCursor(cursor: CursorMode): void {
  persistence.setItem(PERSISTENCE_KEYS.arenaCursor, cursor);
}

// ── Teclado virtual ───────────────────────────────────────────────────────
export function getVirtualKeyboardEnabled(fallback = true): boolean {
  return readBoolean(PERSISTENCE_KEYS.virtualKeyboardEnabled, fallback);
}

export function setVirtualKeyboardEnabled(value: boolean): void {
  persistence.setItem(PERSISTENCE_KEYS.virtualKeyboardEnabled, value);
}

// ── Experiência (som / animações / efeitos) ───────────────────────────────
export function getSoundsEnabled(fallback = true): boolean {
  return readBoolean(PERSISTENCE_KEYS.soundsEnabled, fallback);
}

export function setSoundsEnabled(value: boolean): void {
  persistence.setItem(PERSISTENCE_KEYS.soundsEnabled, value);
}

export function getAnimationsEnabled(fallback: boolean): boolean {
  return readBoolean(PERSISTENCE_KEYS.animationsEnabled, fallback);
}

export function setAnimationsEnabled(value: boolean): void {
  persistence.setItem(PERSISTENCE_KEYS.animationsEnabled, value);
}

export function getReducedEffects(fallback: boolean): boolean {
  return readBoolean(PERSISTENCE_KEYS.reducedEffects, fallback);
}

export function setReducedEffects(value: boolean): void {
  persistence.setItem(PERSISTENCE_KEYS.reducedEffects, value);
}

export function getMotionPreferenceTouched(): boolean {
  const stored = persistence.getItem<boolean | string | null>(PERSISTENCE_KEYS.motionPreferenceTouched, null);
  if (stored === true || stored === 'true') return true;
  if (stored === false || stored === 'false') return false;

  return (
    persistence.getItem<boolean | string | null>(PERSISTENCE_KEYS.animationsEnabled, null) !== null ||
    persistence.getItem<boolean | string | null>(PERSISTENCE_KEYS.reducedEffects, null) !== null
  );
}

export function setMotionPreferenceTouched(value = true): void {
  persistence.setItem(PERSISTENCE_KEYS.motionPreferenceTouched, value);
}
