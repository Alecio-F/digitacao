import { useEffect, useRef } from 'react';
import type { CursorMode } from '@/features/settings/types';
import type { Feedback, WordData } from '@/features/typing/types';
import styles from './TextDisplay.module.css';

interface TextDisplayProps {
  words: WordData[];
  currentWordIndex: number;
  currentLetterIndex: number;
  feedback: Feedback;
  disabled?: boolean;
  cursorMode: CursorMode;
  keyboardVisible: boolean;
  showStartOverlay: boolean;
  onFocusMode: () => void;
  onKey: (key: string) => void;
  onRepeatedKey: (key: string) => void;
}

const CURSOR_ANCHOR_RATIO = 0.45;
const CURSOR_UPPER_RATIO = 0.28;
const CURSOR_LOWER_RATIO = 0.54;

function prefersInstantScroll(): boolean {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    window.matchMedia('(max-width: 760px)').matches
  );
}

export function TextDisplay({
  words,
  currentWordIndex,
  currentLetterIndex,
  feedback,
  disabled,
  cursorMode,
  keyboardVisible,
  showStartOverlay,
  onFocusMode,
  onKey,
  onRepeatedKey,
}: TextDisplayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const currentAnchorRef = useRef<HTMLSpanElement>(null);
  const safeWords = Array.isArray(words)
    ? words.filter((word) => word && Array.isArray(word.letters))
    : [];

  // Focus input on mount and whenever enabled
  useEffect(() => {
    if (!disabled && !showStartOverlay) inputRef.current?.focus();
  }, [disabled, showStartOverlay]);

  // Keep the current character in a comfortable reading zone and reveal upcoming lines.
  useEffect(() => {
    const viewport = viewportRef.current;
    const current = currentAnchorRef.current;
    if (!viewport || !current) return;

    const frame = window.requestAnimationFrame(() => {
      const viewportRect = viewport.getBoundingClientRect();
      const currentRect = current.getBoundingClientRect();
      if (viewportRect.height <= 0 || currentRect.height <= 0) return;

      const anchorY = viewportRect.top + viewportRect.height * CURSOR_ANCHOR_RATIO;
      const upperLimit = viewportRect.top + viewportRect.height * CURSOR_UPPER_RATIO;
      const lowerLimit = viewportRect.top + viewportRect.height * CURSOR_LOWER_RATIO;
      const isPastLowerLimit = currentRect.top > lowerLimit;
      const isBeforeUpperLimit = currentRect.top < upperLimit && viewport.scrollTop > 0;

      if (!isPastLowerLimit && !isBeforeUpperLimit) return;

      const nextScrollTop = Math.max(
        0,
        viewport.scrollTop + currentRect.top - anchorY,
      );

      viewport.scrollTo({
        top: nextScrollTop,
        behavior: prefersInstantScroll() ? 'auto' : 'smooth',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentWordIndex, currentLetterIndex, safeWords.length]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    const isTypingKey =
      e.key === ' ' ||
      (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey);

    if (e.repeat && isTypingKey) {
      e.preventDefault();
      onFocusMode();
      onRepeatedKey(e.key);
      return;
    }

    if (
      e.key === 'Backspace' ||
      isTypingKey
    ) {
      e.preventDefault();
      onFocusMode();
      onKey(e.key);
    }
  }

  function handleInput(e: React.FormEvent<HTMLInputElement>) {
    if (disabled) return;
    const value = e.currentTarget.value;
    if (!value) return;

    onFocusMode();
    for (const char of value) {
      onKey(char === '\n' ? ' ' : char);
    }

    e.currentTarget.value = '';
  }

  function focusTypingArea() {
    onFocusMode();
    inputRef.current?.focus();
  }

  const feedbackClass = {
    neutral: styles.feedbackNeutral,
    success: styles.feedbackSuccess,
    danger: styles.feedbackDanger,
  }[feedback.tone];

  return (
    <div>
      <div
        className={[
          styles.wrapper,
          cursorMode === 'classic' ? styles.cursorClassic : styles.cursorArcade,
          keyboardVisible ? styles.keyboardEnabled : styles.keyboardDisabled,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={focusTypingArea}
        onFocusCapture={(event) => {
          if (event.target === inputRef.current) onFocusMode();
        }}
        role="textbox"
        aria-label="Área de digitação"
        aria-readonly={disabled}
      >
        <input
          ref={inputRef}
          className={styles.input}
          aria-label="Entrada de digitação"
          tabIndex={0}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
        />
        {showStartOverlay && (
          <button
            type="button"
            className={styles.startOverlay}
            aria-label="Começar treino de digitação"
            onClick={(event) => {
              event.stopPropagation();
              focusTypingArea();
            }}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              keyboard
            </span>
            <strong>
              <span className={styles.desktopCopy}>Clique aqui para começar a digitar</span>
              <span className={styles.mobileCopy}>Toque aqui para abrir o teclado</span>
            </strong>
            <small>O treino começa na primeira tecla.</small>
          </button>
        )}
        <div ref={viewportRef} className={styles.viewport}>
          <div className={styles.words}>
            {safeWords.length === 0 && (
              <span className={styles.loadingText}>Carregando texto da Arena...</span>
            )}
            {safeWords.map((word, wi) => (
              <span
                key={wi}
                className={[
                  styles.word,
                  wi === currentWordIndex ? styles.wordCurrent : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {word.letters.map((letter, li) => {
                  const status = letter?.status ?? 'pending';
                  const value = letter?.char ?? '';
                  const isExtra = Boolean(letter?.isExtra);
                  const isCurrent =
                    wi === currentWordIndex &&
                    li === currentLetterIndex &&
                    !isExtra;
                  const cls = [
                    styles.letter,
                    isCurrent ? styles.letterCurrent : '',
                    status === 'correct' ? styles.letterCorrect : '',
                    status === 'incorrect' && !isExtra
                      ? styles.letterIncorrect
                      : '',
                    isExtra ? styles.letterExtra : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <span key={li} ref={isCurrent ? currentAnchorRef : undefined} className={cls}>
                      {value}
                    </span>
                  );
                })}
                {wi === currentWordIndex && currentLetterIndex >= (word.letters?.length ?? 0) && (
                  <span
                    ref={currentAnchorRef}
                    className={[styles.letter, styles.letterCurrent, styles.letterEnd].join(' ')}
                  >
                    &nbsp;
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className={[styles.feedback, feedbackClass].join(' ')}>{feedback.text}</p>
    </div>
  );
}
