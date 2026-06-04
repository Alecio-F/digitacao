import { useCallback, useEffect, useReducer } from 'react';
import { COMBO_MILESTONE, MAX_EXTRA_LETTERS } from '@/constants';
import { buildWordList } from '../utils/buildWords';
import type { Feedback, TypingState, WordData } from '../types';

type Action =
  | { type: 'KEY'; key: string; timestamp: number }
  | { type: 'REPEATED_KEY'; key: string }
  | { type: 'RESET'; lessonId: string | null; practiceText?: string | null; randomCount?: number };

const INITIAL_FEEDBACK: Feedback = {
  text: 'Foco. Digite a primeira palavra para iniciar o desafio.',
  tone: 'neutral',
};

function makeState(
  lessonId: string | null,
  practiceText?: string | null,
  randomCount?: number,
): TypingState {
  return {
    words: buildWordList(lessonId, practiceText, randomCount),
    currentWordIndex: 0,
    currentLetterIndex: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    combo: 0,
    maxCombo: 0,
    errorsByChar: {},
    feedback: INITIAL_FEEDBACK,
    wordsCompleted: 0,
    totalCharsTyped: 0,
    rawKeyCount: 0,
    repeatedKeyCount: 0,
    currentWrongStreak: 0,
    longestWrongStreak: 0,
    suspiciousInputBursts: 0,
    recentInputs: [],
  };
}

function cloneWords(words: WordData[]): WordData[] {
  return words.map((w) => ({
    ...w,
    letters: Array.isArray(w.letters) ? w.letters.map((l) => ({ ...l })) : [],
  }));
}

function registerError(
  errorsByChar: Record<string, number>,
  char: string,
): Record<string, number> {
  return { ...errorsByChar, [char]: (errorsByChar[char] ?? 0) + 1 };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeStateValues(
  words: WordData[],
  currentWordIndex: number,
  currentLetterIndex: number,
) {
  const safeWordIndex = words.length > 0
    ? clamp(Number.isFinite(currentWordIndex) ? currentWordIndex : 0, 0, words.length - 1)
    : 0;
  const word = words[safeWordIndex];
  const maxLetterIndex = word?.letters?.length ?? 0;
  const safeLetterIndex = clamp(
    Number.isFinite(currentLetterIndex) ? currentLetterIndex : 0,
    0,
    maxLetterIndex,
  );

  return { currentWordIndex: safeWordIndex, currentLetterIndex: safeLetterIndex };
}

function reducer(state: TypingState, action: Action): TypingState {
  if (action.type === 'RESET') {
    return makeState(action.lessonId, action.practiceText, action.randomCount);
  }

  if (action.type === 'REPEATED_KEY') {
    return {
      ...state,
      repeatedKeyCount: Math.max(0, state.repeatedKeyCount + 1),
    };
  }

  const { key } = action;
  const isLetter = key.length === 1 && key !== ' ';
  const isSpace = key === ' ';
  const isBackspace = key === 'Backspace';

  if (!isLetter && !isSpace && !isBackspace) return state;

  const words = cloneWords(Array.isArray(state.words) ? state.words : []);
  let { currentWordIndex, currentLetterIndex, totalCorrect, totalIncorrect, combo, maxCombo } =
    state;
  let errorsByChar = state.errorsByChar;
  let feedback: Feedback = state.feedback;
  let { wordsCompleted, totalCharsTyped } = state;
  let rawKeyCount = state.rawKeyCount;
  let currentWrongStreak = state.currentWrongStreak;
  let longestWrongStreak = state.longestWrongStreak;
  let suspiciousInputBursts = state.suspiciousInputBursts;
  let recentInputs = Array.isArray(state.recentInputs) ? [...state.recentInputs] : [];
  let inputWasCorrect: boolean | null = null;

  ({ currentWordIndex, currentLetterIndex } = normalizeStateValues(
    words,
    currentWordIndex,
    currentLetterIndex,
  ));

  const word = words[currentWordIndex];
  if (!word) return state;

  // ── Letter key ────────────────────────────────────────────────────────────
  if (isLetter) {
    rawKeyCount++;
    totalCharsTyped++;

    if (currentLetterIndex < word.letters.length) {
      const letter = word.letters[currentLetterIndex];
      if (!letter) return state;
      if (key === letter.char) {
        inputWasCorrect = true;
        letter.status = 'correct';
        totalCorrect++;
        combo++;
        if (combo > maxCombo) maxCombo = combo;

        if (combo > 0 && combo % COMBO_MILESTONE === 0) {
          feedback = {
            text: combo >= COMBO_MILESTONE * 2 ? 'Combo ativo!' : 'Boa sequência! Mantenha o ritmo.',
            tone: 'success',
          };
        }

        document.dispatchEvent(new CustomEvent('dojo:typing-success', { detail: { key, combo } }));
      } else {
        inputWasCorrect = false;
        letter.status = 'incorrect';
        totalIncorrect++;
        combo = 0;
        errorsByChar = registerError(errorsByChar, letter.char);
        feedback = { text: 'Quase. Respire e continue.', tone: 'danger' };
        document.dispatchEvent(new CustomEvent('dojo:typing-error', { detail: { key, expected: letter.char } }));
      }
      currentLetterIndex++;
    } else {
      // Extra letter beyond word end
      const extras = word.letters.filter((l) => l.isExtra);
      if (extras.length >= MAX_EXTRA_LETTERS) return state;
      word.letters.push({ char: key, status: 'incorrect', isExtra: true });
      inputWasCorrect = false;
      totalIncorrect++;
      combo = 0;
      errorsByChar = registerError(errorsByChar, ' ');
      feedback = { text: 'Quase. Respire e continue.', tone: 'danger' };
      document.dispatchEvent(new CustomEvent('dojo:typing-error', { detail: { key, expected: ' ' } }));
    }
  }

  // ── Space ─────────────────────────────────────────────────────────────────
  if (isSpace) {
    rawKeyCount++;
    totalCharsTyped++;

    if (currentLetterIndex < word.letters.length) {
      // Word not finished — penalise
      const letter = word.letters[currentLetterIndex];
      if (!letter) return state;
      if (letter.status === 'pending') letter.status = 'incorrect';
      inputWasCorrect = false;
      totalIncorrect++;
      combo = 0;
      errorsByChar = registerError(errorsByChar, letter.char);
      currentLetterIndex++;
      feedback = { text: 'Finalize a palavra antes de avançar.', tone: 'danger' };
      document.dispatchEvent(new CustomEvent('dojo:typing-error', { detail: { key: ' ', expected: letter.char } }));
    } else {
      // Move to next word
      if (currentWordIndex + 1 < words.length) {
        inputWasCorrect = true;
        currentWordIndex++;
        currentLetterIndex = 0;
        wordsCompleted++;
      }
    }
  }

  // ── Backspace ─────────────────────────────────────────────────────────────
  if (isBackspace) {
    if (currentWordIndex <= 0 && currentLetterIndex <= 0) {
      return {
        ...state,
        currentWordIndex: 0,
        currentLetterIndex: 0,
        totalCorrect: Math.max(0, totalCorrect),
        totalIncorrect: Math.max(0, totalIncorrect),
        totalCharsTyped: Math.max(0, totalCharsTyped),
      };
    }

    // Case 1: remove last extra letter
    const lastExtraIdx = word.letters.map((l, i) => ({ l, i })).reverse().find(({ l }) => l.isExtra)?.i;
    if (lastExtraIdx !== undefined) {
      word.letters.splice(lastExtraIdx, 1);
      totalIncorrect = Math.max(0, totalIncorrect - 1);
      currentLetterIndex = Math.min(currentLetterIndex, word.letters.length);
    }
    // Case 2: cursor at first letter → go to previous word
    else if (currentLetterIndex === 0) {
      if (currentWordIndex > 0) {
        currentWordIndex = Math.max(0, currentWordIndex - 1);
        currentLetterIndex = words[currentWordIndex]?.letters?.length ?? 0;
      }
    }
    // Cases 3 & 4: undo previous letter
    else {
      const prevIdx = currentLetterIndex - 1;
      const prev = word.letters[prevIdx];
      if (!prev) {
        currentLetterIndex = clamp(currentLetterIndex, 0, word.letters.length);
        return {
          ...state,
          words,
          currentWordIndex,
          currentLetterIndex,
          totalCorrect: Math.max(0, totalCorrect),
          totalIncorrect: Math.max(0, totalIncorrect),
          totalCharsTyped: Math.max(0, totalCharsTyped),
        };
      }
      if (prev.status === 'correct') totalCorrect = Math.max(0, totalCorrect - 1);
      else if (prev.status === 'incorrect') totalIncorrect = Math.max(0, totalIncorrect - 1);
      prev.status = 'pending';
      currentLetterIndex = Math.max(0, currentLetterIndex - 1);
    }
  }

  if (inputWasCorrect !== null) {
    if (inputWasCorrect) {
      currentWrongStreak = 0;
    } else {
      currentWrongStreak++;
      longestWrongStreak = Math.max(longestWrongStreak, currentWrongStreak);
    }

    const timestamp = Number.isFinite(action.timestamp) ? action.timestamp : Date.now();
    recentInputs = [...recentInputs, { timestamp, correct: inputWasCorrect }]
      .filter((item) => timestamp - item.timestamp <= 700)
      .slice(-20);

    if (recentInputs.length >= 12) {
      const wrongCount = recentInputs.filter((item) => !item.correct).length;
      if (wrongCount / recentInputs.length >= 0.65) {
        suspiciousInputBursts++;
        recentInputs = [];
      }
    }
  }

  ({ currentWordIndex, currentLetterIndex } = normalizeStateValues(
    words,
    currentWordIndex,
    currentLetterIndex,
  ));

  return {
    ...state,
    words,
    currentWordIndex,
    currentLetterIndex,
    totalCorrect: Math.max(0, totalCorrect),
    totalIncorrect: Math.max(0, totalIncorrect),
    combo,
    maxCombo,
    errorsByChar,
    feedback,
    wordsCompleted: Math.max(0, wordsCompleted),
    totalCharsTyped: Math.max(0, totalCharsTyped),
    rawKeyCount: Math.max(0, rawKeyCount),
    repeatedKeyCount: Math.max(0, state.repeatedKeyCount),
    currentWrongStreak: Math.max(0, currentWrongStreak),
    longestWrongStreak: Math.max(0, longestWrongStreak),
    suspiciousInputBursts: Math.max(0, suspiciousInputBursts),
    recentInputs,
  };
}

export function useTypingSession(
  lessonId: string | null,
  practiceText?: string | null,
  randomCount?: number,
) {
  const [state, dispatch] = useReducer(reducer, null, () =>
    makeState(lessonId, practiceText, randomCount),
  );

  useEffect(() => {
    dispatch({ type: 'RESET', lessonId, practiceText, randomCount });
  }, [lessonId, practiceText, randomCount]);

  const handleKey = useCallback((key: string) => {
    dispatch({ type: 'KEY', key, timestamp: Date.now() });
  }, []);

  const registerRepeatedKey = useCallback((key: string) => {
    dispatch({ type: 'REPEATED_KEY', key });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET', lessonId, practiceText, randomCount });
  }, [lessonId, practiceText, randomCount]);

  const precision =
    state.totalCorrect + state.totalIncorrect > 0
      ? Math.round((state.totalCorrect / (state.totalCorrect + state.totalIncorrect)) * 100)
      : 100;

  const topErrors: [string, number][] = Object.entries(state.errorsByChar)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return { state, handleKey, registerRepeatedKey, reset, precision, topErrors };
}
