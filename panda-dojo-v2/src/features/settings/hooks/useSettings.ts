import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getArenaCursor,
  getAnimationsEnabled,
  getPracticeTime,
  getReducedEffects,
  getSoundsEnabled,
  getTheme,
  getVirtualKeyboardEnabled,
  resetTheme as resetThemeInStore,
  setAnimationsEnabled as setAnimationsEnabledInStore,
  setArenaCursor,
  setPracticeTime,
  setReducedEffects as setReducedEffectsInStore,
  setSoundsEnabled as setSoundsEnabledInStore,
  setTheme as setThemeInStore,
  setVirtualKeyboardEnabled,
} from '@/repositories/settingsRepository';
import type { CursorMode, Settings, Theme } from '../types';

function canUseBrowserApis() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function getPrefersReducedMotion() {
  if (!canUseBrowserApis()) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      theme: getTheme(),
      defaultPracticeTime: getPracticeTime(),
      soundsEnabled: getSoundsEnabled(true),
      animationsEnabled: getAnimationsEnabled(!prefersReducedMotion),
      reducedEffects: getReducedEffects(prefersReducedMotion),
      cursorMode: getArenaCursor(),
      keyboardVisible: getVirtualKeyboardEnabled(true),
    };
  }, []);

  const [settings, setSettings] = useState<Settings>(initialSettings);

  useEffect(() => {
    applySettingsToDocument(settings);
  }, [settings]);

  const setTheme = useCallback((theme: Theme) => {
    setThemeInStore(theme);
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => {
      const theme: Theme = prev.theme === 'dark' ? 'light' : 'dark';
      setThemeInStore(theme);
      return { ...prev, theme };
    });
  }, []);

  const setDefaultPracticeTime = useCallback((value: number) => {
    const next = setPracticeTime(value);
    setSettings((prev) => ({ ...prev, defaultPracticeTime: next }));
  }, []);

  const setSoundsEnabled = useCallback((value: boolean) => {
    setSoundsEnabledInStore(value);
    setSettings((prev) => ({ ...prev, soundsEnabled: value }));
  }, []);

  const setAnimationsEnabled = useCallback((value: boolean) => {
    setAnimationsEnabledInStore(value);
    setSettings((prev) => ({ ...prev, animationsEnabled: value }));
  }, []);

  const setReducedEffects = useCallback((value: boolean) => {
    setReducedEffectsInStore(value);
    setSettings((prev) => ({ ...prev, reducedEffects: value }));
  }, []);

  const setCursorMode = useCallback((value: CursorMode) => {
    setArenaCursor(value);
    setSettings((prev) => ({ ...prev, cursorMode: value }));
  }, []);

  const setKeyboardVisible = useCallback((value: boolean) => {
    setVirtualKeyboardEnabled(value);
    setSettings((prev) => ({ ...prev, keyboardVisible: value }));
  }, []);

  const resetTheme = useCallback(() => {
    resetThemeInStore();
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
    keyboardVisible: settings.keyboardVisible,
    setTheme,
    toggleTheme,
    resetTheme,
    setDefaultPracticeTime,
    setSoundsEnabled,
    setAnimationsEnabled,
    setReducedEffects,
    setCursorMode,
    setKeyboardVisible,
  };
}
