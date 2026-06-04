import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSettingsContext } from '@/app/settingsContext';
import { PageShell } from '@/components/layout/PageShell';
import { KEYS } from '@/constants';
import { getLessonById } from '@/features/lessons/data/lessons';
import { selectLesson } from '@/features/lessons/services/lessonProgressService';
import type { LessonMedal } from '@/features/lessons/types';
import { getPracticeTextById } from '@/features/practiceTexts/data/practiceTexts';
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
  lessonCompleted: boolean;
  lessonCompletedNow: boolean;
  lessonMedal: LessonMedal | null;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
  isPracticeText: boolean;
}

const PHASE_LABEL: Record<string, string> = {
  idle: 'Foco',
  running: 'Digitando',
  paused: 'Pausado',
  finished: 'Concluído',
};

function readStoredString(key: string): string {
  const raw = localStorage.getItem(key);
  if (raw === null) return '';

  try {
    const parsed = JSON.parse(raw) as unknown;
    return typeof parsed === 'string' ? parsed : raw;
  } catch {
    return raw;
  }
}

export function ArenaPage() {
  const navigate = useNavigate();
  const [selectedTrainingMode] = useState<string>(() => readStoredString(KEYS.selectedTrainingMode));
  const [selectedPracticeText] = useState<string>(() => readStoredString(KEYS.selectedPracticeText));
  const [selectedPracticeTextId] = useState<string>(() => readStoredString(KEYS.selectedPracticeTextId));
  const isPracticeTextMode =
    selectedTrainingMode === 'practice-text' && selectedPracticeText.trim().length > 0;
  const [lessonId, setLessonId] = useState<string | null>(() => {
    if (isPracticeTextMode) return null;
    return readStoredString(KEYS.selectedLessonId) || null;
  });

  const lesson = getLessonById(lessonId ?? '');
  const practiceTextMeta = getPracticeTextById(selectedPracticeTextId);
  const practiceTextTitle =
    practiceTextMeta?.title ?? readStoredString(KEYS.selectedPracticeTextTitle) ?? 'Texto livre';
  const { settings } = useSettingsContext();

  const [savedResult, setSavedResult] = useState<SavedResult | null>(null);
  const [isArenaFocused, setIsArenaFocused] = useState(false);
  const savedRef = useRef(false);

  const { state, handleKey, reset: resetSession, precision, topErrors } = useTypingSession(
    isPracticeTextMode ? null : lessonId,
    isPracticeTextMode ? selectedPracticeText : null,
  );

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
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsArenaFocused(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (timer.phase !== 'finished' || savedRef.current) return;
    savedRef.current = true;
    setIsArenaFocused(false);

    const prevBest = getBestPpm();
    const isRecord = timer.ppm > 0 && timer.ppm > prevBest;
    const dur = timer.totalSeconds / 60;

    const output = saveSessionResult({
      ppm: timer.ppm,
      cpm: timer.cpm,
      precision,
      errors: state.totalIncorrect,
      duration: dur,
      lessonId: isPracticeTextMode ? null : lessonId,
      mode: isPracticeTextMode ? 'practice-text' : lessonId ? 'lesson' : 'random',
      practiceTextId: isPracticeTextMode ? selectedPracticeTextId : null,
      practiceTextTitle: isPracticeTextMode ? practiceTextTitle : null,
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
      lessonCompleted: output.lessonCompleted,
      lessonCompletedNow: output.lessonCompletedNow,
      lessonMedal: output.lessonMedal,
      nextLessonId: output.nextLessonId,
      nextLessonTitle: output.nextLessonTitle,
      isPracticeText: isPracticeTextMode,
    });
  }, [timer.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTypingKey(key: string) {
    if (savedResult) return;
    if (timer.phase === 'paused' || timer.phase === 'finished') return;
    if (timer.phase === 'idle') startTimer();
    setIsArenaFocused(true);
    handleKey(key);
  }

  function handleRestart() {
    savedRef.current = false;
    setSavedResult(null);
    setIsArenaFocused(false);
    resetSession();
    resetTimer();
  }

  function handleNext() {
    savedRef.current = false;
    setSavedResult(null);
    setIsArenaFocused(false);

    if (savedResult?.nextLessonId) {
      const nextLesson = getLessonById(savedResult.nextLessonId);
      if (nextLesson) {
        selectLesson(nextLesson);
        setLessonId(nextLesson.id);
      }
    } else if (savedResult?.isPracticeText) {
      navigate('/mapa');
    } else {
      resetSession();
    }

    resetTimer();
  }

  const expectedChar =
    state.words[state.currentWordIndex]?.letters[state.currentLetterIndex]?.char ?? '';
  const cleanArenaTitle = isPracticeTextMode
    ? `Type Arena · ${practiceTextTitle}`
    : lesson
    ? `Type Arena · ${lesson.title}`
    : 'Type Arena';
  const modeLabel = isPracticeTextMode
    ? practiceTextTitle
    : lesson?.title ?? PHASE_LABEL[timer.phase] ?? timer.phase;
  const feedbackText =
    timer.phase === 'idle'
      ? 'O treino começa na primeira tecla.'
      : PHASE_LABEL[timer.phase] ?? timer.phase;
  const cardClassName = [
    styles.arenaCard,
    settings.keyboardVisible ? styles.keyboardEnabledCard : styles.keyboardDisabledCard,
    isArenaFocused ? styles.focusMode : '',
  ]
    .filter(Boolean)
    .join(' ');
  const pageClassName = [
    styles.page,
    isArenaFocused ? styles.pageFocused : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <PageShell title={cleanArenaTitle} className={styles.focusShell}>
      <div className={pageClassName}>
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
            lessonCompleted={savedResult.lessonCompleted}
            lessonCompletedNow={savedResult.lessonCompletedNow}
            lessonMedal={savedResult.lessonMedal}
            nextLessonTitle={savedResult.nextLessonTitle}
            nextActionLabel={
              savedResult.isPracticeText
                ? 'Escolher outro texto'
                : savedResult.nextLessonTitle
                ? 'Próxima fase'
                : 'Próximo texto'
            }
            onRestart={handleRestart}
            onNext={handleNext}
          />
        ) : (
          <div className={cardClassName}>
            <div className={styles.cardBar}>
              <div className={styles.cardBarLeft}>
                <span className={styles.mentorLabel}>{cleanArenaTitle}</span>
                <span className={styles.phaseChip}>
                  {isPracticeTextMode ? 'Texto livre' : modeLabel}
                </span>
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
                    <span>PRECISÃO</span>
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
                keyboardVisible={settings.keyboardVisible}
                showStartOverlay={timer.phase === 'idle' && !isArenaFocused}
                onFocusMode={() => setIsArenaFocused(true)}
                onKey={handleTypingKey}
              />
            )}

            {!settings.keyboardVisible && (
              <aside className={styles.keyboardOffPanel} aria-label="Dica do Mestre Panda">
                <div>
                  <span>Dica do Mestre Panda</span>
                  <strong>Priorize precisão antes de velocidade.</strong>
                </div>
                <p>
                  Você pode reativar o teclado visual nas configurações. Meta da fase: 85% de
                  precisão.
                </p>
              </aside>
            )}

            {settings.keyboardVisible && (
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
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
