import { useCallback, useEffect, useRef, useState } from 'react';
import type { SessionPhase } from '../types';

const DEFAULT_TOTAL_SECONDS = 30;

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
  /** Duração configurada do treino, em segundos. Vem do tempo padrão das settings. */
  durationSeconds?: number;
}

export function useTypingTimer({
  wordsCompleted,
  totalCharsTyped,
  onFinish,
  durationSeconds = DEFAULT_TOTAL_SECONDS,
}: UseTypingTimerOptions) {
  const initialSeconds = durationSeconds > 0 ? Math.round(durationSeconds) : DEFAULT_TOTAL_SECONDS;

  const [timer, setTimer] = useState<TimerState>(() => ({
    phase: 'idle',
    timeRemaining: initialSeconds,
    totalSeconds: initialSeconds,
    pauseUsed: false,
    ppm: 0,
    cpm: 0,
  }));

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFinishRef = useRef(onFinish);
  const statsRef = useRef({ wordsCompleted, totalCharsTyped });
  const durationRef = useRef(initialSeconds);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Mantém a duração configurada disponível para start()/reset() (somente ref,
  // sem re-render). A tela ociosa usa um valor derivado (ver abaixo).
  useEffect(() => {
    durationRef.current = initialSeconds;
  }, [initialSeconds]);

  useEffect(() => {
    statsRef.current = { wordsCompleted, totalCharsTyped };
  }, [wordsCompleted, totalCharsTyped]);

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setTimer((prev) => {
      const { wordsCompleted: currentWords, totalCharsTyped: currentChars } = statsRef.current;
      if (prev.timeRemaining <= 1) {
        const ppm = prev.totalSeconds > 0 ? Math.round((currentWords / prev.totalSeconds) * 60) : 0;
        const cpm = prev.totalSeconds > 0 ? Math.round((currentChars / prev.totalSeconds) * 60) : 0;
        return { ...prev, timeRemaining: 0, phase: 'finished', ppm, cpm };
      }
      const remaining = prev.timeRemaining - 1;
      const elapsed = prev.totalSeconds - remaining;
      const ppm = elapsed > 0 ? Math.round((currentWords / elapsed) * 60) : 0;
      const cpm = elapsed > 0 ? Math.round((currentChars / elapsed) * 60) : 0;
      return { ...prev, timeRemaining: remaining, ppm, cpm };
    });
  }, []);

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
      return {
        ...prev,
        phase: 'running',
        timeRemaining: durationRef.current,
        totalSeconds: durationRef.current,
      };
    });
  }, []);

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
      timeRemaining: durationRef.current,
      totalSeconds: durationRef.current,
      pauseUsed: false,
      ppm: 0,
      cpm: 0,
    });
  }, [clearTick]);

  // Run the interval when phase is 'running'
  useEffect(() => {
    if (timer.phase === 'running') {
      intervalRef.current = setInterval(tick, 1000);
      return clearTick;
    }
    return undefined;
  }, [timer.phase, tick, clearTick]);

  // Enquanto ocioso, exibe a duração configurada atual (derivada, sem setState),
  // para que mudar o tempo padrão no SettingsDrawer reflita na hora.
  const displayRemaining = timer.phase === 'idle' ? initialSeconds : timer.timeRemaining;
  const displayTotal = timer.phase === 'idle' ? initialSeconds : timer.totalSeconds;
  const progressPercent =
    displayTotal > 0 ? Math.round((displayRemaining / displayTotal) * 100) : 100;

  return {
    timer,
    start,
    togglePause,
    reset,
    progressPercent,
    formattedTime: formatTime(displayRemaining),
  };
}
