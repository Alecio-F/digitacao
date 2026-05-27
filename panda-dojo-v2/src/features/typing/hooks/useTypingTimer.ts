import { useCallback, useEffect, useRef, useState } from 'react';
import { KEYS } from '@/constants';
import { getStorage } from '@/services/storage/storageService';
import type { SessionPhase } from '../types';

const PRACTICE_OPTIONS = [0.25, 0.5, 1, 2, 3, 5, 10, 15];
export { PRACTICE_OPTIONS };

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface TimerState {
  phase: SessionPhase;
  timeRemaining: number;
  totalSeconds: number;
  pauseUsed: boolean;
  ppm: number;
  cpm: number;
}

interface UseTypingTimerOptions {
  wordsCompleted: number;
  totalCharsTyped: number;
  onFinish: () => void;
}

export function useTypingTimer({ wordsCompleted, totalCharsTyped, onFinish }: UseTypingTimerOptions) {
  const storedDuration = getStorage<string>(KEYS.tempoPratica, '1');
  const [duration, setDuration] = useState(() => parseFloat(storedDuration) || 1);

  const [timer, setTimer] = useState<TimerState>(() => ({
    phase: 'idle',
    timeRemaining: Math.round((parseFloat(storedDuration) || 1) * 60),
    totalSeconds: Math.round((parseFloat(storedDuration) || 1) * 60),
    pauseUsed: false,
    ppm: 0,
    cpm: 0,
  }));

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setTimer((prev) => {
      if (prev.timeRemaining <= 1) {
        return { ...prev, timeRemaining: 0, phase: 'finished' };
      }
      const remaining = prev.timeRemaining - 1;
      const elapsed = prev.totalSeconds - remaining;
      const ppm = elapsed > 0 ? Math.round((wordsCompleted / elapsed) * 60) : 0;
      const cpm = elapsed > 0 ? Math.round((totalCharsTyped / elapsed) * 60) : 0;
      return { ...prev, timeRemaining: remaining, ppm, cpm };
    });
  }, [wordsCompleted, totalCharsTyped]);

  // Watch for phase transition to 'finished'
  useEffect(() => {
    if (timer.phase === 'finished') {
      clearTick();
      onFinishRef.current();
    }
  }, [timer.phase, clearTick]);

  const start = useCallback(() => {
    setTimer((prev) => {
      if (prev.phase !== 'idle') return prev;
      const totalSeconds = Math.round(duration * 60);
      return { ...prev, phase: 'running', timeRemaining: totalSeconds, totalSeconds };
    });
  }, [duration]);

  const togglePause = useCallback(() => {
    setTimer((prev) => {
      if (prev.phase === 'running') {
        clearTick();
        return { ...prev, phase: 'paused', pauseUsed: true };
      }
      if (prev.phase === 'paused') {
        return { ...prev, phase: 'running' };
      }
      return prev;
    });
  }, [clearTick]);

  const reset = useCallback(() => {
    clearTick();
    setTimer({
      phase: 'idle',
      timeRemaining: Math.round(duration * 60),
      totalSeconds: Math.round(duration * 60),
      pauseUsed: false,
      ppm: 0,
      cpm: 0,
    });
  }, [duration, clearTick]);

  const changeDuration = useCallback((newDuration: number) => {
    setDuration(newDuration);
    localStorage.setItem(KEYS.tempoPratica, String(newDuration));
    setTimer((prev) => {
      if (prev.phase !== 'idle') return prev;
      const totalSeconds = Math.round(newDuration * 60);
      return { ...prev, timeRemaining: totalSeconds, totalSeconds };
    });
  }, []);

  // Run the interval when phase is 'running'
  useEffect(() => {
    if (timer.phase === 'running') {
      intervalRef.current = setInterval(tick, 1000);
      return clearTick;
    }
    return undefined;
  }, [timer.phase, tick, clearTick]);

  // Keep ppm/cpm updated on every render when running
  const progressPercent =
    timer.totalSeconds > 0
      ? Math.round((timer.timeRemaining / timer.totalSeconds) * 100)
      : 100;

  return {
    timer,
    duration,
    start,
    togglePause,
    reset,
    changeDuration,
    progressPercent,
    formattedTime: formatTime(timer.timeRemaining),
  };
}
