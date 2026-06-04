import { useCallback, useEffect, useRef, useState } from 'react';
import { calculateCpm, calculatePpm } from '../logic/rankingEligibility';
import type { FinishReason, SessionPhase } from '../types';

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
  finishReason: FinishReason | null;
}

interface UseTypingTimerOptions {
  wordsCompleted: number;
  correctChars: number;
  onFinish: () => void;
  /** Duração configurada do treino, em segundos. Vem do tempo padrão das settings. */
  durationSeconds?: number;
}

export function useTypingTimer({
  wordsCompleted,
  correctChars,
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
    finishReason: null,
  }));

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFinishRef = useRef(onFinish);
  const statsRef = useRef({ wordsCompleted, correctChars });
  const durationRef = useRef(initialSeconds);
  const runningStartedAtRef = useRef<number | null>(null);
  const elapsedBeforePauseRef = useRef(0);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Mantém a duração configurada disponível para start()/reset() (somente ref,
  // sem re-render). A tela ociosa usa um valor derivado (ver abaixo).
  useEffect(() => {
    durationRef.current = initialSeconds;
  }, [initialSeconds]);

  useEffect(() => {
    statsRef.current = { wordsCompleted, correctChars };
  }, [wordsCompleted, correctChars]);

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const getElapsedSeconds = useCallback((totalSeconds: number) => {
    const runningElapsed =
      runningStartedAtRef.current === null
        ? elapsedBeforePauseRef.current
        : elapsedBeforePauseRef.current +
          Math.floor((Date.now() - runningStartedAtRef.current) / 1000);

    return Math.min(totalSeconds, Math.max(0, runningElapsed));
  }, []);

  const tick = useCallback(() => {
    setTimer((prev) => {
      const { correctChars: currentCorrectChars } = statsRef.current;
      const elapsed = getElapsedSeconds(prev.totalSeconds);
      const remaining = Math.max(0, prev.totalSeconds - elapsed);

      if (remaining <= 0) {
        const ppm = calculatePpm(currentCorrectChars, prev.totalSeconds);
        const cpm = calculateCpm(currentCorrectChars, prev.totalSeconds);
        return { ...prev, timeRemaining: 0, phase: 'finished', ppm, cpm, finishReason: 'time-ended' };
      }
      const ppm = elapsed > 0 ? calculatePpm(currentCorrectChars, elapsed) : 0;
      const cpm = elapsed > 0 ? calculateCpm(currentCorrectChars, elapsed) : 0;
      return { ...prev, timeRemaining: remaining, ppm, cpm };
    });
  }, [getElapsedSeconds]);

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
      runningStartedAtRef.current = Date.now();
      elapsedBeforePauseRef.current = 0;
      return {
        ...prev,
        phase: 'running',
        timeRemaining: durationRef.current,
        totalSeconds: durationRef.current,
        finishReason: null,
      };
    });
  }, []);

  const togglePause = useCallback(() => {
    setTimer((prev) => {
      if (prev.phase === 'running') {
        if (runningStartedAtRef.current !== null) {
          elapsedBeforePauseRef.current += Math.floor(
            (Date.now() - runningStartedAtRef.current) / 1000,
          );
          runningStartedAtRef.current = null;
        }
        clearTick();
        return { ...prev, phase: 'paused', pauseUsed: true };
      }
      if (prev.phase === 'paused') {
        runningStartedAtRef.current = Date.now();
        return { ...prev, phase: 'running' };
      }
      return prev;
    });
  }, [clearTick]);

  const reset = useCallback(() => {
    clearTick();
    runningStartedAtRef.current = null;
    elapsedBeforePauseRef.current = 0;
    setTimer({
      phase: 'idle',
      timeRemaining: durationRef.current,
      totalSeconds: durationRef.current,
      pauseUsed: false,
      ppm: 0,
      cpm: 0,
      finishReason: null,
    });
  }, [clearTick]);

  const finish = useCallback((reason: FinishReason = 'text-completed') => {
    clearTick();
    setTimer((prev) => {
      if (prev.phase === 'finished') return prev;

      const { correctChars: currentCorrectChars } = statsRef.current;
      const elapsed = Math.max(1, getElapsedSeconds(prev.totalSeconds));
      const ppm = calculatePpm(currentCorrectChars, elapsed);
      const cpm = calculateCpm(currentCorrectChars, elapsed);

      runningStartedAtRef.current = null;
      elapsedBeforePauseRef.current = elapsed;

      return {
        ...prev,
        phase: 'finished',
        timeRemaining: 0,
        totalSeconds: elapsed,
        ppm,
        cpm,
        finishReason: reason,
      };
    });
  }, [clearTick, getElapsedSeconds]);

  // Run the interval when phase is 'running'
  useEffect(() => {
    if (timer.phase === 'running') {
      if (intervalRef.current === null) {
        intervalRef.current = setInterval(tick, 250);
      }
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
    finish,
    progressPercent,
    formattedTime: formatTime(displayRemaining),
  };
}
