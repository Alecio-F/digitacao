import { useCallback, useEffect, useMemo, useState } from 'react';
import { KEYS } from '@/constants';
import { getStorage, removeStorage, setStorage } from '@/services/storage/storageService';
import type { CursorMode, Settings, Theme } from '../types';

const PRACTICE_TIME_OPTIONS = [0.25, 0.5, 1, 2, 5, 10, 15] as const;

function canUseBrowserApis() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function getPrefersReducedMotion() {
  if (!canUseBrowserApis()) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function readTheme(): Theme {
  const stored = getStorage<Theme | boolean | string | null>(KEYS.tema, null);
  if (stored === 'light' || stored === false) return 'light';
  if (stored === 'dark' || stored === true) return 'dark';
  return 'dark';
}

function readPracticeTime() {
  const stored = Number(getStorage<string | number>(KEYS.tempoPratica, '1'));
  return PRACTICE_TIME_OPTIONS.includes(stored as (typeof PRACTICE_TIME_OPTIONS)[number])
    ? stored
    : 1;
}

function readBoolean(key: string, fallback: boolean) {
  const stored = getStorage<boolean | string | null>(key, null);
  if (stored === true || stored === 'true') return true;
  if (stored === false || stored === 'false') return false;
  return fallback;
}

function readCursorMode(): CursorMode {
  const value = getStorage<string>(KEYS.cursorMode, 'arcade');
  return value === 'classic' ? 'classic' : 'arcade';
}

function applySettingsToDocument(settings: Settings) {
  if (!canUseBrowserApis()) return;
  const root = document.documentElement;

  root.dataset.theme = settings.theme;
  root.dataset.animations = settings.animationsEnabled ? 'on' : 'off';
  root.dataset.reducedEffects = settings.reducedEffects ? 'true' : 'false';

  root.classList.toggle('dark', settings.theme === 'dark');
  root.classList.toggle('darkTheme', settings.theme === 'dark');
}

export function useSettings() {
  const initialSettings = useMemo<Settings>(() => {
    const prefersReducedMotion = getPrefersReducedMotion();
    return {
      theme: readTheme(),
      defaultPracticeTime: readPracticeTime(),
      soundsEnabled: readBoolean(KEYS.soundsEnabled, true),
      animationsEnabled: readBoolean(KEYS.animationsEnabled, !prefersReducedMotion),
      reducedEffects: readBoolean(KEYS.reducedEffects, prefersReducedMotion),
      cursorMode: readCursorMode(),
    };
  }, []);

  const [settings, setSettings] = useState<Settings>(initialSettings);

  useEffect(() => {
    applySettingsToDocument(settings);
  }, [settings]);

  const setTheme = useCallback((theme: Theme) => {
    setStorage(KEYS.tema, theme);
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => {
      const theme: Theme = prev.theme === 'dark' ? 'light' : 'dark';
      setStorage(KEYS.tema, theme);
      return { ...prev, theme };
    });
  }, []);

  const setDefaultPracticeTime = useCallback((value: number) => {
    const next = PRACTICE_TIME_OPTIONS.includes(value as (typeof PRACTICE_TIME_OPTIONS)[number])
      ? value
      : 1;
    setStorage(KEYS.tempoPratica, String(next));
    setSettings((prev) => ({ ...prev, defaultPracticeTime: next }));
  }, []);

  const setSoundsEnabled = useCallback((value: boolean) => {
    setStorage(KEYS.soundsEnabled, value);
    setSettings((prev) => ({ ...prev, soundsEnabled: value }));
  }, []);

  const setAnimationsEnabled = useCallback((value: boolean) => {
    setStorage(KEYS.animationsEnabled, value);
    setSettings((prev) => ({ ...prev, animationsEnabled: value }));
  }, []);

  const setReducedEffects = useCallback((value: boolean) => {
    setStorage(KEYS.reducedEffects, value);
    setSettings((prev) => ({ ...prev, reducedEffects: value }));
  }, []);

  const setCursorMode = useCallback((value: CursorMode) => {
    setStorage(KEYS.cursorMode, value);
    setSettings((prev) => ({ ...prev, cursorMode: value }));
  }, []);

  const resetTheme = useCallback(() => {
    removeStorage(KEYS.tema);
    setSettings((prev) => ({ ...prev, theme: 'dark' }));
  }, []);

  return {
    settings,
    theme: settings.theme,
    defaultPracticeTime: settings.defaultPracticeTime,
    soundsEnabled: settings.soundsEnabled,
    animationsEnabled: settings.animationsEnabled,
    reducedEffects: settings.reducedEffects,
    cursorMode: settings.cursorMode,
    setTheme,
    toggleTheme,
    resetTheme,
    setDefaultPracticeTime,
    setSoundsEnabled,
    setAnimationsEnabled,
    setReducedEffects,
    setCursorMode,
  };
}
