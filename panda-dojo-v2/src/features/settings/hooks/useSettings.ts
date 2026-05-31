import { useCallback, useEffect, useState } from 'react';
import { KEYS } from '@/constants';
import { getStorage, removeStorage, setStorage } from '@/services/storage/storageService';
import type { CursorMode, Settings, Theme } from '../types';

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function readTheme(): Theme {
  return getStorage<string | null>(KEYS.tema, null) !== null ? 'dark' : 'light';
}

function readPracticeTime(): number {
  return parseFloat(getStorage<string>(KEYS.tempoPratica, '1')) || 1;
}

function readCursorMode(): CursorMode {
  const value = getStorage<string>(KEYS.cursorMode, 'arcade');
  return value === 'classic' ? 'classic' : 'arcade';
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => ({
    theme: readTheme(),
    practiceTime: readPracticeTime(),
    sounds: true,
    animations: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    reducedEffects: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    cursorMode: readCursorMode(),
  }));

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => {
      const next: Theme = prev.theme === 'dark' ? 'light' : 'dark';
      if (next === 'dark') {
        setStorage(KEYS.tema, 'true');
      } else {
        removeStorage(KEYS.tema);
      }
      return { ...prev, theme: next };
    });
  }, []);

  const setPracticeTime = useCallback((minutes: number) => {
    setStorage(KEYS.tempoPratica, String(minutes));
    setSettings((prev) => ({ ...prev, practiceTime: minutes }));
  }, []);

  const setSounds = useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, sounds: value }));
  }, []);

  const setAnimations = useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, animations: value }));
  }, []);

  const setReducedEffects = useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, reducedEffects: value }));
  }, []);

  const setCursorMode = useCallback((value: CursorMode) => {
    setStorage(KEYS.cursorMode, value);
    setSettings((prev) => ({ ...prev, cursorMode: value }));
  }, []);

  return {
    settings,
    toggleTheme,
    setPracticeTime,
    setSounds,
    setAnimations,
    setReducedEffects,
    setCursorMode,
  };
}
