import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSettingsContext } from '@/app/settingsContext';
import { PageShell } from '@/components/layout/PageShell';
import { KEYS } from '@/constants';
import { getLessonById } from '@/features/lessons/data/lessons';
import { selectLesson } from '@/features/lessons/services/lessonProgressService';
import type { LessonMedal } from '@/features/lessons/types';
import { getNextPracticeText, getPracticeTextById } from '@/features/practiceTexts/data/practiceTexts';
import { DailyChallengeModal } from '@/features/dailyChallenge/components/DailyChallengeModal';
import { getDailyChallenge } from '@/features/dailyChallenge/utils/getDailyChallenge';
import { generateDailyShareText, getDailyMedal } from '@/features/dailyChallenge/utils/shareDailyResult';
import {
  dismissToday,
  getTodayResult,
  saveTodayResult,
  selectDailyChallenge,
  wasDismissedToday,
} from '@/repositories/dailyChallengeRepository';
import { useTypingSession } from '@/features/typing/hooks/useTypingSession';
import { useTypingTimer } from '@/features/typing/hooks/useTypingTimer';
import {
  getRandomWordCountByDuration,
  normalizeTrainingMode,
} from '@/features/typing/logic/wordGenerator';
import {
  readSelectionString,
  selectPracticeText,
  selectRandomWords,
} from '@/repositories/trainingSelectionRepository';
import type { RankingEligibility, WordData } from '@/features/typing/types';
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
  isDailyChallenge: boolean;
  isRandomWords: boolean;
  dailyShareText: string | null;
  rankingEligibility: RankingEligibility;
}

const PHASE_LABEL: Record<string, string> = {
  idle: 'Foco',
  running: 'Digitando',
  paused: 'Pausado',
  finished: 'Concluído',
};

// Leitura da seleção de treino centralizada no repositório (tolerante a
// valores crus legados e a JSON novo).
function readStoredString(key: string): string {
  return readSelectionString(key);
}

function countCompletedWords(words: WordData[]): number {
  return words.filter((word) => {
    const letters = Array.isArray(word.letters)
      ? word.letters.filter((letter) => !letter.isExtra)
      : [];

    return letters.length > 0 && letters.every((letter) => letter.status !== 'pending');
  }).length;
}

function isTextCompleted(
  words: WordData[],
  currentWordIndex: number,
  currentLetterIndex: number,
): boolean {
  if (!Array.isArray(words) || words.length === 0) return false;

  const lastWordIndex = words.length - 1;
  const lastWord = words[lastWordIndex];
  const letters = Array.isArray(lastWord?.letters)
    ? lastWord.letters.filter((letter) => !letter.isExtra)
    : [];

  if (letters.length === 0) return false;
  if (currentWordIndex < lastWordIndex) return false;
  if (currentLetterIndex < letters.length) return false;

  return letters.every((letter) => letter.status !== 'pending');
}

export function ArenaPage() {
  const navigate = useNavigate();
  const dailyChallenge = useMemo(() => getDailyChallenge(), []);
  const dailyChallengeResult = getTodayResult(dailyChallenge.dayKey);
  const [selectedTrainingMode, setSelectedTrainingMode] = useState<string>(() =>
    normalizeTrainingMode(readStoredString(KEYS.selectedTrainingMode)),
  );
  const [selectedPracticeText, setSelectedPracticeText] = useState<string>(() =>
    readStoredString(KEYS.selectedPracticeText),
  );
  const [selectedPracticeTextId, setSelectedPracticeTextId] = useState<string>(() =>
    readStoredString(KEYS.selectedPracticeTextId),
  );
  const isPracticeTextMode =
    selectedTrainingMode === 'practice-text' && selectedPracticeText.trim().length > 0;
  const isDailyChallengeMode =
    selectedTrainingMode === 'daily-challenge' && selectedPracticeText.trim().length > 0;
  // Ambos carregam um texto fixo na Arena (reutilizam a mesma infraestrutura).
  const isTextMode = isPracticeTextMode || isDailyChallengeMode;
  const [lessonId, setLessonId] = useState<string | null>(() => {
    if (isTextMode) return null;
    return readStoredString(KEYS.selectedLessonId) || null;
  });

  const lesson = getLessonById(lessonId ?? '');
  const practiceTextMeta = getPracticeTextById(selectedPracticeTextId);
  const practiceTextTitle =
    practiceTextMeta?.title ?? readStoredString(KEYS.selectedPracticeTextTitle) ?? 'Texto livre';
  const { settings } = useSettingsContext();

  // Palavras Aleatórias: sem texto fixo e sem fase. É também o fallback padrão
  // ao abrir /arena sem modo selecionado.
  const isRandomWordsMode = !isTextMode && lessonId === null;
  const durationSeconds = Math.round(settings.defaultPracticeTime * 60);
  const randomWordCount = getRandomWordCountByDuration(durationSeconds);

  const [savedResult, setSavedResult] = useState<SavedResult | null>(null);
  const [isArenaFocused, setIsArenaFocused] = useState(false);
  const [showDailyPrompt, setShowDailyPrompt] = useState(() => (
    selectedTrainingMode !== 'daily-challenge' &&
    dailyChallengeResult === null &&
    !wasDismissedToday(dailyChallenge.dayKey)
  ));
  const savedRef = useRef(false);
  const textCompletionRef = useRef(false);

  const {
    state,
    handleKey,
    registerRepeatedKey,
    reset: resetSession,
    precision,
    topErrors,
  } = useTypingSession(
    isTextMode ? null : lessonId,
    isTextMode ? selectedPracticeText : null,
    isRandomWordsMode ? randomWordCount : undefined,
  );
  const completedWordsForStats = Math.max(state.wordsCompleted, countCompletedWords(state.words));

  const {
    timer,
    start: startTimer,
    togglePause,
    reset: resetTimer,
    finish: finishTimer,
    progressPercent,
    formattedTime,
  } = useTypingTimer({
    wordsCompleted: completedWordsForStats,
    correctChars: state.totalCorrect,
    durationSeconds,
    onFinish: () => {},
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsArenaFocused(false);
      if (showDailyPrompt) {
        dismissToday(dailyChallenge.dayKey);
        setShowDailyPrompt(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dailyChallenge.dayKey, showDailyPrompt]);

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
      lessonId: isTextMode ? null : lessonId,
      mode: isDailyChallengeMode
        ? 'daily-challenge'
        : isPracticeTextMode
        ? 'practice-text'
        : lessonId
        ? 'lesson'
        : 'random',
      practiceTextId: isPracticeTextMode ? selectedPracticeTextId : null,
      practiceTextTitle: isPracticeTextMode ? practiceTextTitle : null,
      isRecord,
      topErrors,
      maxCombo: state.maxCombo,
      pauseUsed: timer.pauseUsed,
      correctChars: state.totalCorrect,
      wrongChars: state.totalIncorrect,
      totalTyped: state.totalCorrect + state.totalIncorrect,
      rawKeyCount: state.rawKeyCount,
      repeatedKeyCount: state.repeatedKeyCount,
      longestWrongStreak: state.longestWrongStreak,
      suspiciousInputBursts: state.suspiciousInputBursts,
    });

    if (output.isRecord) {
      document.dispatchEvent(
        new CustomEvent('dojo:record', { detail: { ppm: timer.ppm, cpm: timer.cpm } }),
      );
    }

    const totalSec = timer.totalSeconds;
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');

    let dailyShareText: string | null = null;
    if (isDailyChallengeMode) {
      const daily = getDailyChallenge();
      const dailyMedal = getDailyMedal(precision, timer.ppm);
      dailyShareText = generateDailyShareText({
        date: daily.dayKey,
        challengeId: daily.challengeId,
        challengeNumber: daily.challengeNumber,
        ppm: timer.ppm,
        cpm: timer.cpm,
        accuracy: precision,
        errors: state.totalIncorrect,
        maxCombo: state.maxCombo,
        durationSeconds: totalSec,
        medal: dailyMedal,
        validForRanking: output.rankingEligibility.validForRanking,
        rankingInvalidReasons: output.rankingEligibility.reasonCodes,
        suspiciousFlags: output.rankingEligibility.suspiciousFlags,
      });
      saveTodayResult({
        date: daily.dayKey,
        challengeId: daily.challengeId,
        challengeNumber: daily.challengeNumber,
        ppm: timer.ppm,
        cpm: timer.cpm,
        accuracy: precision,
        errors: state.totalIncorrect,
        maxCombo: state.maxCombo,
        durationSeconds: totalSec,
        completedAt: new Date().toISOString(),
        shareText: dailyShareText,
        medal: dailyMedal,
        validForRanking: output.rankingEligibility.validForRanking,
        rankingScore: output.rankingEligibility.score,
        rankingInvalidReasons: output.rankingEligibility.reasonCodes,
        suspiciousFlags: output.rankingEligibility.suspiciousFlags,
      });
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
      isRecord: output.isRecord,
      topErrors,
      duration: `${mm}:${ss}`,
      lessonCompleted: output.lessonCompleted,
      lessonCompletedNow: output.lessonCompletedNow,
      lessonMedal: output.lessonMedal,
      nextLessonId: output.nextLessonId,
      nextLessonTitle: output.nextLessonTitle,
      isPracticeText: isPracticeTextMode,
      isDailyChallenge: isDailyChallengeMode,
      isRandomWords: isRandomWordsMode,
      dailyShareText,
      rankingEligibility: output.rankingEligibility,
    });
  }, [timer.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isTextMode || savedResult || textCompletionRef.current) return;
    if (timer.phase !== 'running') return;
    if (!isTextCompleted(state.words, state.currentWordIndex, state.currentLetterIndex)) return;

    textCompletionRef.current = true;
    finishTimer('text-completed');
  }, [
    finishTimer,
    isTextMode,
    savedResult,
    state.currentLetterIndex,
    state.currentWordIndex,
    state.words,
    timer.phase,
  ]);

  function handleTypingKey(key: string) {
    if (savedResult) return;
    if (textCompletionRef.current) return;
    if (timer.phase === 'paused' || timer.phase === 'finished') return;
    if (timer.phase === 'idle') startTimer();
    setIsArenaFocused(true);
    handleKey(key);
  }

  function handleRestart() {
    savedRef.current = false;
    textCompletionRef.current = false;
    setSavedResult(null);
    setIsArenaFocused(false);
    resetSession();
    resetTimer();
  }

  function handleNext() {
    savedRef.current = false;
    textCompletionRef.current = false;
    setSavedResult(null);
    setIsArenaFocused(false);

    if (savedResult?.nextLessonId) {
      const nextLesson = getLessonById(savedResult.nextLessonId);
      if (nextLesson) {
        selectLesson(nextLesson);
        setLessonId(nextLesson.id);
      }
    } else if (savedResult?.isDailyChallenge) {
      navigate('/');
    } else if (savedResult?.isPracticeText) {
      const nextText = getNextPracticeText(selectedPracticeTextId);
      selectPracticeText({ id: nextText.id, title: nextText.title, text: nextText.text });
      setSelectedPracticeTextId(nextText.id);
      setSelectedPracticeText(nextText.text);
    } else {
      resetSession();
    }

    resetTimer();
  }

  function handleUseRandomWords() {
    selectRandomWords();

    setSelectedTrainingMode('random-words');
    setLessonId(null);
    setSelectedPracticeText('');
    setSelectedPracticeTextId('');

    savedRef.current = false;
    textCompletionRef.current = false;
    setSavedResult(null);
    setIsArenaFocused(false);
    resetTimer();
  }

  function handleStartDailyChallenge() {
    selectDailyChallenge(dailyChallenge);
    setSelectedTrainingMode('daily-challenge');
    setSelectedPracticeText(dailyChallenge.text.text);
    setSelectedPracticeTextId('');
    setLessonId(null);
    setShowDailyPrompt(false);

    savedRef.current = false;
    textCompletionRef.current = false;
    setSavedResult(null);
    setIsArenaFocused(false);
    resetTimer();
  }

  function handleDismissDailyChallenge() {
    setShowDailyPrompt(false);
  }

  const showRandomWordsHint =
    !savedResult && !isArenaFocused && timer.phase === 'idle' && !isRandomWordsMode;

  const expectedChar =
    state.words[state.currentWordIndex]?.letters[state.currentLetterIndex]?.char ?? '';
  const cleanArenaTitle = isDailyChallengeMode
    ? `Type Arena · Desafio Diário`
    : isTextMode
    ? `Type Arena · ${practiceTextTitle}`
    : lesson
    ? `Type Arena · ${lesson.title}`
    : isRandomWordsMode
    ? 'Type Arena · Palavras Aleatórias'
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
    <>
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
              savedResult.isDailyChallenge
                ? 'Ir para o Início'
                : savedResult.isRandomWords
                ? 'Nova sequência'
                : savedResult.isPracticeText
                ? 'Próximo texto'
                : savedResult.nextLessonTitle
                ? 'Próxima fase'
                : 'Próximo texto'
            }
            restartActionLabel={savedResult.isPracticeText ? 'Fazer novamente' : undefined}
            isDailyChallenge={savedResult.isDailyChallenge}
            dailyShareText={savedResult.dailyShareText}
            rankingEligibility={savedResult.rankingEligibility}
            onRestart={handleRestart}
            onNext={handleNext}
          />
        ) : (
          <div className={cardClassName}>
            <div className={styles.cardBar}>
              <div className={styles.cardBarLeft}>
                <span className={styles.mentorLabel}>{cleanArenaTitle}</span>
                <span className={styles.phaseChip}>
                  {isDailyChallengeMode
                    ? 'Desafio Diário'
                    : isPracticeTextMode
                    ? 'Texto livre'
                    : isRandomWordsMode
                    ? 'Palavras Aleatórias'
                    : modeLabel}
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

            {showRandomWordsHint && (
              <div className={styles.modeHint}>
                <div className={styles.modeHintText}>
                  <strong>Palavras Aleatórias</strong>
                  <span>Treine palavras soltas para ganhar velocidade e ritmo.</span>
                </div>
                <button
                  type="button"
                  className={styles.modeHintBtn}
                  onClick={handleUseRandomWords}
                >
                  Usar palavras aleatórias
                </button>
              </div>
            )}

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
                onRepeatedKey={registerRepeatedKey}
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
      {showDailyPrompt && (
        <DailyChallengeModal
          challenge={dailyChallenge}
          onStart={handleStartDailyChallenge}
          onDismiss={handleDismissDailyChallenge}
        />
      )}
    </>
  );
}
