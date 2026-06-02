import { useEffect, useRef, useState } from 'react';
import { useSettingsContext } from '@/app/settingsContext';
import { PageShell } from '@/components/layout/PageShell';
import { KEYS } from '@/constants';
import { getLessonById } from '@/features/lessons/data/lessons';
import { useTypingSession } from '@/features/typing/hooks/useTypingSession';
import { useTypingTimer } from '@/features/typing/hooks/useTypingTimer';
import { getBestPpm, saveSessionResult } from '@/features/typing/utils/saveResult';
import { ResultsScreen } from './components/ResultsScreen';
import { TextDisplay } from './components/TextDisplay';
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
  duration: string;
}

const PHASE_LABEL: Record<string, string> = {
  idle: 'Foco',
  running: 'Digitando',
  paused: 'Pausado',
  finished: 'Concluido',
};

export function ArenaPage() {
  const lessonId = localStorage.getItem(KEYS.selectedLessonId);
  const lesson = getLessonById(lessonId ?? '');
  const { settings } = useSettingsContext();

  const [savedResult, setSavedResult] = useState<SavedResult | null>(null);
  const savedRef = useRef(false);

  const { state, handleKey, reset: resetSession, precision, topErrors } = useTypingSession(lessonId);

  const {
    timer,
    start: startTimer,
    togglePause,
    reset: resetTimer,
    progressPercent,
    formattedTime,
  } = useTypingTimer({
    wordsCompleted: state.wordsCompleted,
    totalCharsTyped: state.totalCharsTyped,
    durationSeconds: Math.round(settings.defaultPracticeTime * 60),
    onFinish: () => {},
  });

  useEffect(() => {
    if (timer.phase !== 'finished' || savedRef.current) return;
    savedRef.current = true;

    const prevBest = getBestPpm();
    const isRecord = timer.ppm > 0 && timer.ppm > prevBest;
    const dur = timer.totalSeconds / 60;

    const output = saveSessionResult({
      ppm: timer.ppm,
      cpm: timer.cpm,
      precision,
      errors: state.totalIncorrect,
      duration: dur,
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

    const totalSec = timer.totalSeconds;
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');

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
      duration: `${mm}:${ss}`,
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
  const arenaTitle = lesson ? `Type Arena · ${lesson.title}` : 'Type Arena';
  const modeLabel = lesson?.title ?? PHASE_LABEL[timer.phase] ?? timer.phase;
  const feedbackText =
    timer.phase === 'idle'
      ? 'Foco. Digite a primeira palavra para iniciar o desafio.'
      : PHASE_LABEL[timer.phase] ?? timer.phase;

  return (
    <PageShell title={arenaTitle}>
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
            duration={savedResult.duration}
            onRestart={handleRestart}
          />
        ) : (
          <div className={styles.arenaCard}>
            <div className={styles.cardBar}>
              <div className={styles.cardBarLeft}>
                <span className={styles.mentorLabel}>{arenaTitle}</span>
                <span className={styles.phaseChip}>{modeLabel}</span>
              </div>

              <div className={styles.cardBarRight}>
                <div className={styles.inlineMetrics}>
                  <div className={styles.inlineMetric}>
                    <span>TEMPO</span>
                    <strong>{formattedTime}</strong>
                  </div>
                  <div className={styles.inlineMetric}>
                    <span>PPM</span>
                    <strong>{timer.ppm}</strong>
                  </div>
                  <div className={styles.inlineMetric}>
                    <span>CPM</span>
                    <strong>{timer.cpm}</strong>
                  </div>
                  <div className={styles.inlineMetric}>
                    <span>PRECISAO</span>
                    <strong>{precision}%</strong>
                  </div>
                  <div className={styles.inlineMetric}>
                    <span>ERROS</span>
                    <strong>{state.totalIncorrect}</strong>
                  </div>
                  <div className={styles.inlineMetric}>
                    <span>COMBO</span>
                    <strong>{state.combo}x</strong>
                  </div>
                </div>

                <div className={styles.controls}>
                  <button
                    className={styles.iconBtn}
                    onClick={togglePause}
                    disabled={timer.phase === 'idle'}
                    aria-label={timer.phase === 'paused' ? 'Retomar' : 'Pausar'}
                  >
                    <span className="material-symbols-outlined">
                      {timer.phase === 'paused' ? 'play_circle' : 'pause_circle'}
                    </span>
                  </button>
                  <button
                    className={styles.iconBtn}
                    onClick={handleRestart}
                    aria-label="Reiniciar"
                  >
                    <span className="material-symbols-outlined">restart_alt</span>
                  </button>
                </div>
              </div>
            </div>

            <div
              className={styles.progressLine}
              role="progressbar"
              aria-label="Tempo restante do treino"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
              aria-valuetext={`${formattedTime} restantes`}
            >
              <div className={styles.progressLineFill} style={{ width: `${progressPercent}%` }} />
            </div>

            <div className={styles.feedbackBar}>
              <span>
                <strong>Mestre Panda</strong> {PHASE_LABEL[timer.phase] ?? timer.phase}
              </span>
              <span>{feedbackText}</span>
            </div>

            {timer.phase === 'paused' ? (
              <div className={styles.pauseOverlay}>
                Treino pausado. Clique em retomar para continuar.
              </div>
            ) : (
              <TextDisplay
                words={state.words}
                currentWordIndex={state.currentWordIndex}
                currentLetterIndex={state.currentLetterIndex}
                feedback={state.feedback}
                disabled={timer.phase === 'finished'}
                cursorMode={settings.cursorMode}
                onKey={handleTypingKey}
              />
            )}

            <div className={styles.keyDeck}>
              <div className={styles.keyDeckHeader}>
                <span className={styles.keyDeckLabel}>Dojo Key Deck</span>
                <div className={styles.keyDeckDots}>
                  <span style={{ background: '#00a8cc' }} />
                  <span style={{ background: '#7c5cff' }} />
                  <span style={{ background: '#d99a17' }} />
                </div>
              </div>
              <VirtualKeyboard activeKey={timer.phase === 'running' ? expectedChar : ''} />
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
