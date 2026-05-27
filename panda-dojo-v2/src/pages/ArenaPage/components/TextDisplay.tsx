import { useEffect, useRef } from 'react';
import type { Feedback, WordData } from '@/features/typing/types';
import styles from './TextDisplay.module.css';

interface TextDisplayProps {
  words: WordData[];
  currentWordIndex: number;
  currentLetterIndex: number;
  feedback: Feedback;
  disabled?: boolean;
  onKey: (key: string) => void;
}

export function TextDisplay({
  words,
  currentWordIndex,
  currentLetterIndex,
  feedback,
  disabled,
  onKey,
}: TextDisplayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const currentWordRef = useRef<HTMLSpanElement>(null);

  // Focus input on mount and whenever enabled
  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  // Scroll current word into view
  useEffect(() => {
    currentWordRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [currentWordIndex]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (
      e.key === 'Backspace' ||
      e.key === ' ' ||
      (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey)
    ) {
      e.preventDefault();
      onKey(e.key);
    }
  }

  const feedbackClass = {
    neutral: styles.feedbackNeutral,
    success: styles.feedbackSuccess,
    danger: styles.feedbackDanger,
  }[feedback.tone];

  return (
    <div>
      <div
        className={styles.wrapper}
        onClick={() => inputRef.current?.focus()}
        role="textbox"
        aria-label="Área de digitação"
        aria-readonly={disabled}
      >
        <input
          ref={inputRef}
          className={styles.input}
          aria-hidden="true"
          tabIndex={0}
          readOnly
          onKeyDown={handleKeyDown}
        />
        <div className={styles.words}>
          {words.map((word, wi) => (
            <span
              key={wi}
              ref={wi === currentWordIndex ? currentWordRef : undefined}
              className={[
                styles.word,
                wi === currentWordIndex ? styles.wordCurrent : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {word.letters.map((letter, li) => {
                const isCurrent =
                  wi === currentWordIndex &&
                  li === currentLetterIndex &&
                  !letter.isExtra;
                const cls = [
                  styles.letter,
                  isCurrent ? styles.letterCurrent : '',
                  letter.status === 'correct' ? styles.letterCorrect : '',
                  letter.status === 'incorrect' && !letter.isExtra
                    ? styles.letterIncorrect
                    : '',
                  letter.isExtra ? styles.letterExtra : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <span key={li} className={cls}>
                    {letter.char}
                  </span>
                );
              })}
            </span>
          ))}
        </div>
      </div>
      <p className={[styles.feedback, feedbackClass].join(' ')}>{feedback.text}</p>
    </div>
  );
}
