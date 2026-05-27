import { useCallback, useReducer } from 'react';
import { COMBO_MILESTONE, MAX_EXTRA_LETTERS } from '@/constants';
import { buildWordList } from '../utils/buildWords';
import type { Feedback, TypingState, WordData } from '../types';

type Action =
  | { type: 'KEY'; key: string }
  | { type: 'RESET'; lessonId: string | null };

const INITIAL_FEEDBACK: Feedback = {
  text: 'Foco. Digite a primeira palavra para iniciar o desafio.',
  tone: 'neutral',
};

function makeState(lessonId: string | null): TypingState {
  return {
    words: buildWordList(lessonId),
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
  };
}

function cloneWords(words: WordData[]): WordData[] {
  return words.map((w) => ({ ...w, letters: w.letters.map((l) => ({ ...l })) }));
}

function registerError(
  errorsByChar: Record<string, number>,
  char: string,
): Record<string, number> {
  return { ...errorsByChar, [char]: (errorsByChar[char] ?? 0) + 1 };
}

function reducer(state: TypingState, action: Action): TypingState {
  if (action.type === 'RESET') {
    return makeState(action.lessonId);
  }

  const { key } = action;
  const isLetter = key.length === 1 && key !== ' ';
  const isSpace = key === ' ';
  const isBackspace = key === 'Backspace';

  if (!isLetter && !isSpace && !isBackspace) return state;

  const words = cloneWords(state.words);
  let { currentWordIndex, currentLetterIndex, totalCorrect, totalIncorrect, combo, maxCombo } =
    state;
  let errorsByChar = state.errorsByChar;
  let feedback: Feedback = state.feedback;
  let { wordsCompleted, totalCharsTyped } = state;

  const word = words[currentWordIndex];
  if (!word) return state;

  // ── Letter key ────────────────────────────────────────────────────────────
  if (isLetter) {
    totalCharsTyped++;

    if (currentLetterIndex < word.letters.length) {
      const letter = word.letters[currentLetterIndex];
      if (key === letter.char) {
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
      totalIncorrect++;
      combo = 0;
      errorsByChar = registerError(errorsByChar, ' ');
      feedback = { text: 'Quase. Respire e continue.', tone: 'danger' };
      document.dispatchEvent(new CustomEvent('dojo:typing-error', { detail: { key, expected: ' ' } }));
    }
  }

  // ── Space ─────────────────────────────────────────────────────────────────
  if (isSpace) {
    totalCharsTyped++;

    if (currentLetterIndex < word.letters.length) {
      // Word not finished — penalise
      const letter = word.letters[currentLetterIndex];
      if (letter.status === 'pending') letter.status = 'incorrect';
      totalIncorrect++;
      combo = 0;
      errorsByChar = registerError(errorsByChar, letter.char);
      currentLetterIndex++;
      feedback = { text: 'Finalize a palavra antes de avançar.', tone: 'danger' };
      document.dispatchEvent(new CustomEvent('dojo:typing-error', { detail: { key: ' ', expected: letter.char } }));
    } else {
      // Move to next word
      if (currentWordIndex + 1 < words.length) {
        currentWordIndex++;
        currentLetterIndex = 0;
        wordsCompleted++;
      }
    }
  }

  // ── Backspace ─────────────────────────────────────────────────────────────
  if (isBackspace) {
    // Case 1: remove last extra letter
    const lastExtraIdx = word.letters.map((l, i) => ({ l, i })).reverse().find(({ l }) => l.isExtra)?.i;
    if (lastExtraIdx !== undefined) {
      word.letters.splice(lastExtraIdx, 1);
      totalIncorrect--;
      // currentLetterIndex stays at word.letters.length (now one less)
    }
    // Case 2: cursor at first letter → go to previous word
    else if (currentLetterIndex === 0) {
      if (currentWordIndex > 0) {
        currentWordIndex--;
        currentLetterIndex = words[currentWordIndex].letters.length;
      }
    }
    // Cases 3 & 4: undo previous letter
    else {
      const prevIdx = currentLetterIndex - 1;
      const prev = word.letters[prevIdx];
      if (prev.status === 'correct') totalCorrect--;
      else if (prev.status === 'incorrect') totalIncorrect--;
      prev.status = 'pending';
      currentLetterIndex--;
    }
  }

  return {
    ...state,
    words,
    currentWordIndex,
    currentLetterIndex,
    totalCorrect,
    totalIncorrect,
    combo,
    maxCombo,
    errorsByChar,
    feedback,
    wordsCompleted,
    totalCharsTyped,
  };
}

export function useTypingSession(lessonId: string | null) {
  const [state, dispatch] = useReducer(reducer, null, () => makeState(lessonId));

  const handleKey = useCallback((key: string) => {
    dispatch({ type: 'KEY', key });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET', lessonId });
  }, [lessonId]);

  const precision =
    state.totalCorrect + state.totalIncorrect > 0
      ? Math.round((state.totalCorrect / (state.totalCorrect + state.totalIncorrect)) * 100)
      : 100;

  const topErrors: [string, number][] = Object.entries(state.errorsByChar)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return { state, handleKey, reset, precision, topErrors };
}
