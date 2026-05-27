import { useEffect, useRef, useState } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { KEYS } from '@/constants';
import { getLessonById } from '@/features/lessons/data/lessons';
import { useTypingSession } from '@/features/typing/hooks/useTypingSession';
import { useTypingTimer } from '@/features/typing/hooks/useTypingTimer';
import { getBestPpm, saveSessionResult } from '@/features/typing/utils/saveResult';
import { ResultsScreen } from './components/ResultsScreen';
import { TextDisplay } from './components/TextDisplay';
import { TimerHud } from './components/TimerHud';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import styles from './ArenaPage.module.css';

interface SavedResult {
  ppm: number;
  cpm: number;
  precision: number;
  errors: number;
  maxCombo: number;
  gainedXp: number;
  level: number;
  title: string;
  isRecord: boolean;
  topErrors: [string, number][];
}

export function ArenaPage() {
  const lessonId = localStorage.getItem(KEYS.selectedLessonId);
  const lesson = getLessonById(lessonId ?? '');

  const [savedResult, setSavedResult] = useState<SavedResult | null>(null);
  const savedRef = useRef(false);

  const { state, handleKey, reset: resetSession, precision, topErrors } = useTypingSession(lessonId);

  const {
    timer,
    duration,
    start: startTimer,
    togglePause,
    reset: resetTimer,
    changeDuration,
    progressPercent,
    formattedTime,
  } = useTypingTimer({
    wordsCompleted: state.wordsCompleted,
    totalCharsTyped: state.totalCharsTyped,
    onFinish: () => {},
  });

  // Save result when timer finishes (once)
  useEffect(() => {
    if (timer.phase !== 'finished' || savedRef.current) return;
    savedRef.current = true;

    const prevBest = getBestPpm();
    const isRecord = timer.ppm > 0 && timer.ppm > prevBest;
    const duration = timer.totalSeconds / 60;

    const output = saveSessionResult({
      ppm: timer.ppm,
      cpm: timer.cpm,
      precision,
      errors: state.totalIncorrect,
      duration,
      lessonId,
      isRecord,
      topErrors,
      maxCombo: state.maxCombo,
      pauseUsed: timer.pauseUsed,
    });

    if (isRecord) {
      document.dispatchEvent(
        new CustomEvent('dojo:record', { detail: { ppm: timer.ppm, cpm: timer.cpm } }),
      );
    }

    setSavedResult({
      ppm: timer.ppm,
      cpm: timer.cpm,
      precision,
      errors: state.totalIncorrect,
      maxCombo: state.maxCombo,
      gainedXp: output.gainedXp,
      level: output.level,
      title: output.title,
      isRecord,
      topErrors,
    });
  }, [timer.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTypingKey(key: string) {
    if (savedResult) return;
    if (timer.phase === 'paused') return;
    if (timer.phase === 'idle') startTimer();
    handleKey(key);
  }

  function handleRestart() {
    savedRef.current = false;
    setSavedResult(null);
    resetSession();
    resetTimer();
  }

  const expectedChar =
    state.words[state.currentWordIndex]?.letters[state.currentLetterIndex]?.char ?? '';

  return (
    <PageShell title={lesson ? `Type Arena · ${lesson.title}` : 'Type Arena'}>
      <div className={styles.page}>
        {savedResult ? (
          <ResultsScreen
            ppm={savedResult.ppm}
            cpm={savedResult.cpm}
            precision={savedResult.precision}
            errors={savedResult.errors}
            maxCombo={savedResult.maxCombo}
            gainedXp={savedResult.gainedXp}
            level={savedResult.level}
            title={savedResult.title}
            isRecord={savedResult.isRecord}
            topErrors={savedResult.topErrors}
            onRestart={handleRestart}
          />
        ) : (
          <>
            {lesson && (
              <div className={styles.lessonBanner}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '1.1rem', color: 'var(--dojo-primary)' }}
                >
                  school
                </span>
                <span>
                  Lição ativa:{' '}
                  <span className={styles.lessonBannerTitle}>{lesson.title}</span>
                  {' · '}
                  {lesson.objective}
                </span>
              </div>
            )}

            <TimerHud
              formattedTime={formattedTime}
              progressPercent={progressPercent}
              ppm={timer.ppm}
              cpm={timer.cpm}
              precision={precision}
              errors={state.totalIncorrect}
              combo={state.combo}
              duration={duration}
              isIdle={timer.phase === 'idle'}
              onDurationChange={changeDuration}
            />

            <div className={styles.controls}>
              {timer.phase !== 'idle' && (
                <button
                  className={styles.iconBtn}
                  onClick={togglePause}
                  aria-label={timer.phase === 'paused' ? 'Retomar' : 'Pausar'}
                >
                  <span className="material-symbols-outlined">
                    {timer.phase === 'paused' ? 'play_circle' : 'pause_circle'}
                  </span>
                </button>
              )}
              <button className={styles.iconBtn} onClick={handleRestart} aria-label="Reiniciar">
                <span className="material-symbols-outlined">restart_alt</span>
              </button>
            </div>

            {timer.phase === 'paused' ? (
              <div className={styles.pauseOverlay}>
                ⏸ Treino pausado — clique em retomar para continuar
              </div>
            ) : (
              <TextDisplay
                words={state.words}
                currentWordIndex={state.currentWordIndex}
                currentLetterIndex={state.currentLetterIndex}
                feedback={state.feedback}
                disabled={timer.phase === 'finished'}
                onKey={handleTypingKey}
              />
            )}

            <VirtualKeyboard activeKey={timer.phase === 'running' ? expectedChar : ''} />
          </>
        )}
      </div>
    </PageShell>
  );
}
